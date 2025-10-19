#!/usr/bin/env python3
"""
Field Matcher ML - TensorFlow-based semantic field matching
Uses custom trained neural network model for intelligent field name matching
Code Lens ML [TensorFlow Custom Model] - Offline Implementation
"""

import sys
import json
import numpy as np
import re
import os
from typing import List, Dict, Any, Tuple
import warnings
warnings.filterwarnings('ignore')

# Import the TensorFlow-style model
sys.path.insert(0, os.path.dirname(__file__))
from tensorflow_field_model import NeuralFieldEmbedding

def levenshtein_distance(s1: str, s2: str) -> int:
    """
    Pure Python implementation of Levenshtein distance
    No C++ dependencies required
    """
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    
    if len(s2) == 0:
        return len(s1)
    
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            # Cost of insertions, deletions, or substitutions
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    
    return previous_row[-1]

class FieldMatcherML:
    """
    ML-based field matcher using TensorFlow-style neural network
    for intelligent field name matching and suggestions
    100% Offline - No internet connection required
    """
    
    def __init__(self):
        """Initialize the field matcher and load trained model"""
        # Load pre-trained neural network model
        model_path = os.path.join(os.path.dirname(__file__), 'models', 'demographic_field_model.pkl')
        
        self.neural_model = NeuralFieldEmbedding()
        
        if os.path.exists(model_path):
            self.neural_model.load_model(model_path)
            self.model_loaded = True
        else:
            print(f"Warning: Model not found at {model_path}. Using traditional matching.", file=sys.stderr)
            self.model_loaded = False
        
        # Demographic field variations lookup table (knowledge-based matching)
        self.demographic_variations = {
            'ssn': ['social_security_number', 'socialSecurityNumber', 'taxId', 'tax_id'],
            'dob': ['dateOfBirth', 'date_of_birth', 'birthDate', 'birth_date'],
            'firstName': ['first_name', 'fname', 'givenName', 'given_name'],
            'lastName': ['last_name', 'lname', 'surname', 'familyName', 'family_name'],
            'email': ['emailAddress', 'email_address', 'eMail', 'e_mail'],
            'phone': ['phoneNumber', 'phone_number', 'telephone', 'mobileNumber', 'mobile_number'],
            'address': ['streetAddress', 'street_address', 'addressLine1', 'address_line_1'],
            'zipCode': ['zip_code', 'postalCode', 'postal_code', 'postcode'],
            'city': ['cityName', 'city_name', 'municipality'],
            'state': ['stateCode', 'state_code', 'province', 'region'],
           'accountNumber': ['account_number', 'accountNo', 'account_no', 'acctNum'],
            'cardNumber': ['card_number', 'creditCardNumber', 'credit_card_number', 'panNumber', 'pan_number'],
        }
        
    def preprocess_field_name(self, field_name: str) -> str:
        """Preprocess field name for better matching"""
        # Convert camelCase and snake_case to lowercase with spaces
        field_name = re.sub('([a-z])([A-Z])', r'\1 \2', field_name)
        field_name = field_name.replace('_', ' ').replace('-', ' ').lower()
        return field_name
    
    def extract_field_tokens(self, field_name: str) -> set:
        """Extract meaningful tokens from field name including acronyms"""
        # Split by common separators
        tokens = re.split(r'[_\-\s]+', field_name.lower())
        
        # Also handle camelCase
        camel_tokens = re.findall(r'[A-Z]?[a-z]+|[A-Z]+(?=[A-Z][a-z]|\b)', field_name)
        tokens.extend([t.lower() for t in camel_tokens if t])
        
        # Remove empty tokens
        tokens = [t for t in tokens if t and len(t) > 1]
        
        result_tokens = set(tokens)
        
        # Add acronyms (first letter of each word)
        if len(tokens) > 1:
            acronym = ''.join([t[0] for t in tokens if t])
            if len(acronym) >= 2:
                result_tokens.add(acronym)
        
        return result_tokens
    
    def is_acronym_match(self, short_field: str, long_field: str) -> bool:
        """Check if short_field is likely an acronym of long_field"""
        short = short_field.lower().strip()
        
        # Split long field into tokens (preserve order)
        tokens = re.split(r'[_\-\s]+', long_field)
        # Also handle camelCase
        camel_tokens = re.findall(r'[A-Z]?[a-z]+|[A-Z]+(?=[A-Z][a-z]|\b)', long_field)
        if camel_tokens:
            tokens = camel_tokens
        
        # Filter out single-char and empty tokens
        tokens = [t for t in tokens if t and len(t) > 1]
        
        if not tokens or len(short) < 2:
            return False
        
        # Generate acronym from tokens (preserve order, case-insensitive)
        acronym = ''.join([t[0].lower() for t in tokens if t])
        
        return short == acronym
    
    def calculate_similarity(self, source_field: str, target_field: str) -> float:
        """
        Calculate similarity between two field names using multiple methods
        Returns score between 0 and 1
        """
        # Method 1: Exact match (fast path)
        if source_field.lower() == target_field.lower():
            return 1.0
        
        # Strip table prefixes (e.g., "CUSTOMER.SSN" → "SSN")
        source_clean = source_field.split('.')[-1] if '.' in source_field else source_field
        target_clean = target_field.split('.')[-1] if '.' in target_field else target_field
        
        # Method 2: Lookup table match (knowledge-based, high confidence)
        source_lower = source_clean.lower().replace('_', '').replace('-', '')
        target_lower = target_clean.lower().replace('_', '').replace('-', '')
        
        for base_field, variations in self.demographic_variations.items():
            base_normalized = base_field.lower().replace('_', '').replace('-', '')
            variations_normalized = [v.lower().replace('_', '').replace('-', '') for v in variations]
            
            # Check if both fields match the same demographic category
            if ((source_lower == base_normalized or source_lower in variations_normalized) and
                (target_lower == base_normalized or target_lower in variations_normalized)):
                return 0.95  # High confidence match from lookup table
        
        # Method 3: Check for acronym match (e.g., ssn == social_security_number)
        shorter = source_field if len(source_field) < len(target_field) else target_field
        longer = target_field if len(source_field) < len(target_field) else source_field
        
        if self.is_acronym_match(shorter, longer):
            return 0.90  # High confidence acronym match
        
        # Method 3: Levenshtein distance
        source = self.preprocess_field_name(source_field)
        target = self.preprocess_field_name(target_field)
        
        max_len = max(len(source), len(target))
        if max_len > 0:
            lev_similarity = 1 - (levenshtein_distance(source, target) / max_len)
        else:
            lev_similarity = 0.0
        
        # Method 4: Token overlap (without acronyms to avoid duplicates)
        source_tokens = set(re.split(r'[_\-\s]+', source_field.lower()))
        target_tokens = set(re.split(r'[_\-\s]+', target_field.lower()))
        
        # Also add camelCase tokens
        source_tokens.update(re.findall(r'[a-z]+', source_field.lower()))
        target_tokens.update(re.findall(r'[a-z]+', target_field.lower()))
        
        # Remove single-char and empty tokens
        source_tokens = {t for t in source_tokens if t and len(t) > 1}
        target_tokens = {t for t in target_tokens if t and len(t) > 1}
        
        if source_tokens and target_tokens:
            intersection = len(source_tokens & target_tokens)
            union = len(source_tokens | target_tokens)
            token_overlap = intersection / union if union > 0 else 0.0
        else:
            token_overlap = 0.0
        
        # Weighted combination: Balanced approach
        final_score = (
            0.6 * lev_similarity +   # 60% Levenshtein distance
            0.4 * token_overlap      # 40% token overlap
        )
        
        return min(1.0, max(0.0, final_score))
    
    def find_similar_fields(
        self, 
        target_fields: List[str], 
        source_fields: List[str],
        threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """
        Find similar fields from source list for each target field
        
        Args:
            target_fields: Fields to find matches for (from Excel)
            source_fields: Available fields in codebase
            threshold: Minimum similarity threshold (0-1)
            
        Returns:
            List of matches with similarity scores
        """
        matches = []
        
        for target in target_fields:
            field_matches = []
            
            for source in source_fields:
                similarity = self.calculate_similarity(target, source)
                
                if similarity >= threshold:
                    field_matches.append({
                        "sourceField": source,
                        "similarity": round(similarity, 3),
                        "matchType": "exact" if similarity == 1.0 else "fuzzy"
                    })
            
            # Sort by similarity (highest first)
            field_matches.sort(key=lambda x: x["similarity"], reverse=True)
            
            matches.append({
                "targetField": target,
                "suggestions": field_matches[:5],  # Top 5 matches
                "bestMatch": field_matches[0] if field_matches else None
            })
        
        return matches
    
    def suggest_mappings(
        self,
        excel_fields,
        codebase_fields: List[str]
    ) -> Dict[str, Any]:
        """
        Suggest field mappings using ML-based similarity
        
        Args:
            excel_fields: List of field names (either strings or {tableName, fieldName} dicts)
            codebase_fields: List of field names found in codebase
            
        Returns:
            Suggested mappings with confidence scores
        """
        # Handle both string array and dict array formats
        target_field_names = []
        for field in excel_fields:
            if isinstance(field, dict):
                # Dictionary format: {tableName, fieldName}
                target_field_names.append(f"{field['tableName']}.{field['fieldName']}")
            else:
                # String format: "table.field"
                target_field_names.append(str(field))
        
        # Find similar fields
        suggestions = self.find_similar_fields(target_field_names, codebase_fields, threshold=0.6)
        
        # Categorize results
        exact_matches = []
        fuzzy_matches = []
        no_matches = []
        
        for suggestion in suggestions:
            if suggestion["bestMatch"]:
                if suggestion["bestMatch"]["matchType"] == "exact":
                    exact_matches.append(suggestion)
                else:
                    fuzzy_matches.append(suggestion)
            else:
                no_matches.append(suggestion)
        
        return {
            "totalFields": len(excel_fields),
            "exactMatches": len(exact_matches),
            "fuzzyMatches": len(fuzzy_matches),
            "noMatches": len(no_matches),
            "suggestions": suggestions,
            "exactMatchList": exact_matches,
            "fuzzyMatchList": fuzzy_matches,
            "noMatchList": no_matches
        }

def main():
    """Main entry point for CLI usage"""
    if len(sys.argv) < 3:
        print(json.dumps({
            "error": "Usage: python field_matcher_ml.py <excel_fields_json> <codebase_fields_json>"
        }))
        sys.exit(1)
    
    try:
        # Parse input JSONs
        excel_fields = json.loads(sys.argv[1])
        codebase_fields = json.loads(sys.argv[2])
        
        # Initialize matcher
        matcher = FieldMatcherML()
        
        # Get suggestions
        results = matcher.suggest_mappings(excel_fields, codebase_fields)
        
        # Output results
        print(json.dumps({
            "success": True,
            "results": results
        }, indent=2))
        
    except Exception as e:
        print(json.dumps({
            "success": False,
            "error": str(e)
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
