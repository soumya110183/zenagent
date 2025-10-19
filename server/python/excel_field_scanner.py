#!/usr/bin/env python3
"""
Excel Field Scanner for Demographic Data Detection
Scans source code files for exact matches of table.field combinations from Excel
"""

import sys
import json
import re
from pathlib import Path
from typing import List, Dict, Any, Tuple
import openpyxl

class ExcelFieldScanner:
    def __init__(self, excel_path: str):
        """Initialize scanner with Excel file path"""
        self.excel_path = excel_path
        self.field_mappings = []
        
    def parse_excel(self) -> List[Dict[str, str]]:
        """Parse Excel file and extract table name and field name columns"""
        try:
            # Read Excel file with openpyxl
            workbook = openpyxl.load_workbook(self.excel_path, read_only=True, data_only=True)
            sheet = workbook.active
            
            # Get header row (first row)
            headers = []
            for cell in sheet[1]:
                headers.append(cell.value if cell.value else "")
            
            # Find table and field columns (case-insensitive)
            table_col_idx = None
            field_col_idx = None
            
            # First try exact match
            for idx, header in enumerate(headers):
                header_lower = str(header).lower().strip()
                if header_lower == 'table_name':
                    table_col_idx = idx
                if header_lower == 'field_name':
                    field_col_idx = idx
            
            # If not found, try contains match
            if table_col_idx is None or field_col_idx is None:
                for idx, header in enumerate(headers):
                    header_lower = str(header).lower().strip()
                    if 'table' in header_lower and table_col_idx is None:
                        table_col_idx = idx
                    if 'field' in header_lower and field_col_idx is None:
                        field_col_idx = idx
                    
            if table_col_idx is None or field_col_idx is None:
                raise ValueError("Excel must have columns containing 'table' and 'field' in their names")
            
            # Extract mappings (skip header row)
            mappings = []
            for row in sheet.iter_rows(min_row=2, values_only=True):
                if len(row) > max(table_col_idx, field_col_idx):
                    table_name = str(row[table_col_idx]).strip() if row[table_col_idx] else ""
                    field_name = str(row[field_col_idx]).strip() if row[field_col_idx] else ""
                    
                    if table_name and field_name and table_name != "None" and field_name != "None":
                        mappings.append({
                            "tableName": table_name,
                            "fieldName": field_name,
                            "combined": f"{table_name}.{field_name}"
                        })
            
            workbook.close()
            self.field_mappings = mappings
            return mappings
            
        except Exception as e:
            raise Exception(f"Error parsing Excel file: {str(e)}")
    
    def scan_source_files(self, source_files: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Scan source files for 100% matches of table.field combinations
        
        Args:
            source_files: List of {relativePath, content} dictionaries
            
        Returns:
            Dictionary containing scan results with matches
        """
        results = {
            "totalFields": len(self.field_mappings),
            "matchedFields": 0,
            "matches": [],
            "unmatchedFields": []
        }
        
        # Track which fields have been matched
        matched_fields = set()
        
        for mapping in self.field_mappings:
            table_name = mapping["tableName"]
            field_name = mapping["fieldName"]
            combined = mapping["combined"]
            
            field_matches = []
            
            # Scan each source file
            for source_file in source_files:
                file_path = source_file["relativePath"]
                content = source_file["content"]
                
                # Find exact matches with various patterns
                matches_found = self._find_field_matches(
                    content, 
                    table_name, 
                    field_name,
                    file_path
                )
                
                if matches_found:
                    field_matches.extend(matches_found)
            
            if field_matches:
                matched_fields.add(combined)
                results["matches"].append({
                    "tableName": table_name,
                    "fieldName": field_name,
                    "combined": combined,
                    "matchCount": len(field_matches),
                    "locations": field_matches
                })
            else:
                results["unmatchedFields"].append({
                    "tableName": table_name,
                    "fieldName": field_name,
                    "combined": combined
                })
        
        results["matchedFields"] = len(matched_fields)
        return results
    
    def _find_field_matches(self, content: str, table_name: str, field_name: str, file_path: str) -> List[Dict[str, Any]]:
        """Find all matches of a field in content with context"""
        matches = []
        lines = content.split('\n')
        
        # Create various pattern variations for matching
        patterns = [
            # Java/Python: table.field
            rf'\b{re.escape(table_name)}\.{re.escape(field_name)}\b',
            # SQL: table.field or "table"."field"
            rf'["\']?{re.escape(table_name)}["\']?\.[\"\']?{re.escape(field_name)}[\"\']?\b',
            # SQL: SELECT field FROM table
            rf'SELECT\s+.*?\b{re.escape(field_name)}\b.*?FROM\s+.*?\b{re.escape(table_name)}\b',
            # JPA @Column(name="field") in table entity
            rf'@Column\s*\(\s*name\s*=\s*["\']{ re.escape(field_name)}["\']',
            # Field reference in queries
            rf'"{re.escape(field_name)}".*?"{re.escape(table_name)}"',
            rf'{re.escape(table_name)}.*?{re.escape(field_name)}',
            # Standalone field name matches (like regex scan)
            # Match field as variable name: private String firstName;
            rf'\b(private|public|protected|var|let|const|@Column)\s+\w+\s+{re.escape(field_name)}\b',
            # Match field in camelCase/snake_case: firstName, first_name
            rf'\b{re.escape(field_name)}\s*[:=]',
            # Match field as property: this.firstName, self.firstName
            rf'\b(this|self)\.{re.escape(field_name)}\b',
            # Match field in getter/setter: getFirstName, setFirstName
            rf'\b(get|set){re.escape(field_name[0].upper() + field_name[1:])}\b',
        ]
        
        for line_num, line in enumerate(lines, 1):
            for pattern in patterns:
                if re.search(pattern, line, re.IGNORECASE):
                    # Get context (surrounding lines)
                    start_line = max(0, line_num - 2)
                    end_line = min(len(lines), line_num + 2)
                    context = '\n'.join(lines[start_line:end_line])
                    
                    matches.append({
                        "filePath": file_path,
                        "lineNumber": line_num,
                        "line": line.strip(),
                        "context": context,
                        "matchType": "exact"
                    })
                    break  # Only count once per line
        
        return matches

def main():
    """Main entry point for CLI usage"""
    if len(sys.argv) < 3:
        print(json.dumps({
            "error": "Usage: python excel_field_scanner.py <excel_file> <source_files_json_path>"
        }))
        sys.exit(1)
    
    excel_path = sys.argv[1]
    source_files_path = sys.argv[2]
    
    try:
        # Read source files from JSON file
        with open(source_files_path, 'r', encoding='utf-8') as f:
            source_files = json.load(f)
        
        # Initialize scanner
        scanner = ExcelFieldScanner(excel_path)
        
        # Parse Excel file
        mappings = scanner.parse_excel()
        
        # Scan source files
        results = scanner.scan_source_files(source_files)
        
        # Output results as JSON
        output = {
            "success": True,
            "mappings": mappings,
            "results": results
        }
        
        print(json.dumps(output, indent=2))
        
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
