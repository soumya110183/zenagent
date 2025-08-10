#!/usr/bin/env python3
"""
ZenVector CLI Interface - Command line interface for ZenVector Agent
Handles method calls from Node.js backend
"""

import sys
import json
from zenVectorService import ZenVectorAgent

def main():
    """Main CLI interface for ZenVector Agent"""
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        
        if not input_data.strip():
            print(json.dumps({"error": "No input data provided"}))
            return
        
        # Parse the input JSON
        try:
            request = json.loads(input_data)
        except json.JSONDecodeError as e:
            print(json.dumps({"error": f"Invalid JSON: {str(e)}"}))
            return
        
        method = request.get('method')
        data = request.get('data', {})
        
        # Initialize ZenVector agent
        agent = ZenVectorAgent()
        
        # Route to appropriate method
        if method == 'add_code_to_vector_db':
            result = agent.add_code_to_vector_db(
                data.get('project_id', ''), 
                data.get('code_data', {})
            )
        elif method == 'find_similar_code':
            result = agent.find_similar_code(
                data.get('query_code', ''),
                data.get('project_id'),
                data.get('top_k', 5)
            )
        elif method == 'semantic_search':
            result = agent.semantic_search(
                data.get('query', ''),
                data.get('search_type', 'all'),
                data.get('top_k', 10)
            )
        elif method == 'analyze_demographic_patterns':
            result = agent.analyze_demographic_patterns(
                data.get('demographic_data', [])
            )
        elif method == 'search_demographic_data':
            result = agent.search_demographic_data(
                data.get('query', ''),
                data.get('top_k', 10)
            )
        elif method == 'get_agent_statistics':
            result = agent.get_agent_statistics()
        else:
            result = {"error": f"Unknown method: {method}"}
        
        # Return result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": f"ZenVector CLI error: {str(e)}"}))

if __name__ == "__main__":
    main()