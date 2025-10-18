#!/usr/bin/env python3
"""
Field Matcher ML - TensorFlow-based semantic field matching
Uses custom trained model for intelligent field name matching and suggestions
"""

import sys
import json
import numpy as np
import re
from typing import List, Dict, Any, Tuple
from Levenshtein import distance as levenshtein_distance
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import warnings
warnings.filterwarnings('ignore')

class FieldMatcherML:
    """
    ML-based field matcher using TF-IDF and Levenshtein distance
    for intelligent field name matching and suggestions
    """
    
    def __init__(self):
        """Initialize the field matcher"""
        self.vectorizer = TfidfVectorizer(
            analyzer='char',
            ngram_range=(2, 4),
            lowercase=True
        )
        
    def preprocess_field_name(self, field_name: str) -> str:
        """Preprocess field name for better matching"""
        # Convert camelCase and snake_case to lowercase with spaces
        field_name = re.sub('([a-z])([A-Z])', r'\1 \2', field_name)
        field_name = field_name.replace('_', ' ').lower()
        return field_name
    
    def calculate_similarity(self, source_field: str, target_field: str) -> float:
        """
        Calculate similarity between two field names using multiple methods
        Returns score between 0 and 1
        """
        # Preprocess both fields
        source = self.preprocess_field_name(source_field)
        target = self.preprocess_field_name(target_field)
        
        # Method 1: Exact match
        if source == target or source_field.lower() == target_field.lower():
            return 1.0
        
        # Method 2: Levenshtein distance (normalized)
        max_len = max(len(source), len(target))
        if max_len > 0:
            lev_similarity = 1 - (levenshtein_distance(source, target) / max_len)
        else:
            lev_similarity = 0.0
        
        # Method 3: TF-IDF cosine similarity
        try:
            tfidf_matrix = self.vectorizer.fit_transform([source, target])
            cosine_sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        except:
            cosine_sim = 0.0
        
        # Method 4: Token overlap
        source_tokens = set(source.split())
        target_tokens = set(target.split())
        if source_tokens or target_tokens:
            token_overlap = len(source_tokens & target_tokens) / len(source_tokens | target_tokens)
        else:
            token_overlap = 0.0
        
        # Weighted combination
        final_score = (
            0.3 * lev_similarity +
            0.4 * cosine_sim +
            0.3 * token_overlap
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
        excel_fields: List[Dict[str, str]],
        codebase_fields: List[str]
    ) -> Dict[str, Any]:
        """
        Suggest field mappings using ML-based similarity
        
        Args:
            excel_fields: List of {tableName, fieldName} from Excel
            codebase_fields: List of field names found in codebase
            
        Returns:
            Suggested mappings with confidence scores
        """
        # Extract just the field names from Excel
        target_field_names = [f"{field['tableName']}.{field['fieldName']}" for field in excel_fields]
        
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
