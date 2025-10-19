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
            print(f"Warning: Model not found at {model_path}. Using untrained model.", file=sys.stderr)
            self.model_loaded = False
        
    def preprocess_field_name(self, field_name: str) -> str:
        """Preprocess field name for better matching"""
        # Convert camelCase and snake_case to lowercase with spaces
        field_name = re.sub('([a-z])([A-Z])', r'\1 \2', field_name)
        field_name = field_name.replace('_', ' ').lower()
        return field_name
    
    def calculate_similarity(self, source_field: str, target_field: str) -> float:
        """
        Calculate similarity between two field names using neural network
        Returns score between 0 and 1
        
        Uses TensorFlow-style neural network with learned embeddings
        """
        # Method 1: Exact match (fast path)
        if source_field.lower() == target_field.lower():
            return 1.0
        
        # Method 2: Neural network similarity (primary method)
        if self.model_loaded:
            neural_sim = self.neural_model.calculate_similarity(source_field, target_field)
        else:
            neural_sim = 0.0
        
        # Method 3: Levenshtein distance (fallback/boost)
        source = self.preprocess_field_name(source_field)
        target = self.preprocess_field_name(target_field)
        
        max_len = max(len(source), len(target))
        if max_len > 0:
            lev_similarity = 1 - (levenshtein_distance(source, target) / max_len)
        else:
            lev_similarity = 0.0
        
        # Method 4: Token overlap (fallback/boost)
        source_tokens = set(source.split())
        target_tokens = set(target.split())
        if source_tokens or target_tokens:
            token_overlap = len(source_tokens & target_tokens) / len(source_tokens | target_tokens)
        else:
            token_overlap = 0.0
        
        # Weighted combination: prioritize neural network
        if self.model_loaded:
            final_score = (
                0.7 * neural_sim +      # 70% neural network
                0.2 * lev_similarity +   # 20% Levenshtein
                0.1 * token_overlap      # 10% token overlap
            )
        else:
            # Fallback if model not loaded
            final_score = (
                0.6 * lev_similarity +
                0.4 * token_overlap
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
