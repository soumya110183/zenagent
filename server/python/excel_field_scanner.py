#!/usr/bin/env python3
"""
Excel Field Scanner for Demographic Data Detection
Scans source code files for exact matches of table.field combinations from Excel
"""

import sys
import json
import re
import pandas as pd
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
            # Read Excel file with pandas
            df = pd.read_excel(self.excel_path, engine='openpyxl')
            
            # Ensure we have the required columns (case-insensitive)
            columns = [col.lower().strip() for col in df.columns]
            
            # Find table and field columns (exact or contains match)
            table_col = None
            field_col = None
            
            # First try exact match
            for col in df.columns:
                if col.strip().lower() == 'table_name':
                    table_col = col
                if col.strip().lower() == 'field_name':
                    field_col = col
            
            # If not found, try contains match
            if not table_col or not field_col:
                for col in df.columns:
                    col_lower = col.lower().strip()
                    if 'table' in col_lower and not table_col:
                        table_col = col
                    if 'field' in col_lower and not field_col:
                        field_col = col
                    
            if not table_col or not field_col:
                raise ValueError("Excel must have columns containing 'table' and 'field' in their names")
            
            # Extract mappings
            mappings = []
            for _, row in df.iterrows():
                table_name = str(row[table_col]).strip() if pd.notna(row[table_col]) else ""
                field_name = str(row[field_col]).strip() if pd.notna(row[field_col]) else ""
                
                if table_name and field_name:
                    mappings.append({
                        "tableName": table_name,
                        "fieldName": field_name,
                        "combined": f"{table_name}.{field_name}"
                    })
            
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
            "error": "Usage: python excel_field_scanner.py <excel_file> <source_files_json>"
        }))
        sys.exit(1)
    
    excel_path = sys.argv[1]
    source_files_json = sys.argv[2]
    
    try:
        # Parse source files JSON
        source_files = json.loads(source_files_json)
        
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
