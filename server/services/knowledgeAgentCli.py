#!/usr/bin/env python3
"""
Knowledge Agent CLI Interface - Command line interface for Knowledge Agent
Handles method calls from Node.js backend
"""

import sys
import json
from knowledgeAgent import KnowledgeAgent

def main():
    """Main CLI interface for Knowledge Agent"""
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
        
        # Initialize Knowledge agent
        agent = KnowledgeAgent()
        
        # Route to appropriate method
        if method == 'scrape_confluence_pages':
            result = agent.scrape_confluence_pages(
                data.get('base_url', ''),
                data.get('credentials', {}),
                data.get('max_depth', 3)
            )
        elif method == 'process_pdf_with_doclinq':
            result = agent.process_pdf_with_doclinq(
                data.get('pdf_path', ''),
                data.get('doclinq_config', {})
            )
        elif method == 'chat_query':
            result = agent.chat_query(
                data.get('query', ''),
                data.get('context_limit', 5)
            )
        elif method == 'get_agent_statistics':
            result = agent.get_agent_statistics()
        else:
            result = {"error": f"Unknown method: {method}"}
        
        # Return result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"error": f"Knowledge Agent CLI error: {str(e)}"}))

if __name__ == "__main__":
    main()