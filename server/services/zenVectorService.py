#!/usr/bin/env python3
"""
ZenVector Agent - Advanced AI Agent with Vector Database Integration
Provides code similarity analysis, semantic search, and demographic data insights
Using ChromaDB for persistent vector storage
"""

import json
import os
import sys
import uuid
import subprocess
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import logging

# Try to import ChromaDB and dependencies
try:
    import chromadb
    from chromadb.config import Settings
    CHROMADB_AVAILABLE = True
except ImportError:
    print("ChromaDB not available, installing...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "chromadb", "sentence-transformers", "--user"])
        import chromadb
        from chromadb.config import Settings
        CHROMADB_AVAILABLE = True
    except:
        CHROMADB_AVAILABLE = False

# Try to import sentence transformers
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False

# Advanced AI/ML Libraries Integration for ZenVector
try:
    from transformers import pipeline, AutoTokenizer, AutoModel
    import torch
    HUGGINGFACE_AVAILABLE = True
except ImportError:
    print("Installing HuggingFace Transformers...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "transformers", "torch", "accelerate", "--user"])
        from transformers import pipeline, AutoTokenizer, AutoModel
        import torch
        HUGGINGFACE_AVAILABLE = True
    except:
        HUGGINGFACE_AVAILABLE = False

try:
    from langfuse import Langfuse
    from langfuse.decorators import observe, langfuse_context
    LANGFUSE_AVAILABLE = True
except ImportError:
    print("Installing Langfuse...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "langfuse", "--user"])
        from langfuse import Langfuse
        from langfuse.decorators import observe, langfuse_context
        LANGFUSE_AVAILABLE = True
    except:
        LANGFUSE_AVAILABLE = False

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    print("Installing requests...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "--user"])
        import requests
        REQUESTS_AVAILABLE = True
    except:
        REQUESTS_AVAILABLE = False

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ZenVectorAgent:
    """
    ZenVector: Advanced AI Agent for Code Intelligence with Enterprise AI Integration
    
    Features:
    - Code similarity detection using ChromaDB vector embeddings
    - Semantic search across codebases with persistent storage
    - Demographic data pattern analysis with clustering
    - Multi-modal search capabilities
    - HuggingFace model integration for advanced code analysis
    - Langfuse observability for LLM monitoring
    - SonarQube integration for code quality analysis
    - Multi-model AI pipeline for comprehensive insights
    """
    """
    ZenVector: Advanced AI Agent for Code Intelligence and Demographic Analysis
    
    Features:
    - Code similarity detection using vector embeddings
    - Semantic search across codebases
    - Demographic data pattern analysis
    - Multi-modal search capabilities
    """
    
    def __init__(self, db_path: str = "./chroma_db"):
        """Initialize ZenVector Agent with ChromaDB vector database"""
        self.db_path = db_path
        self.client = None
        self.embedding_model = None
        self.code_collection = None
        self.semantic_collection = None
        self.demographic_collection = None
        
        # Advanced AI Integration Components
        self.langfuse_client = None
        self.huggingface_pipeline = None
        self.code_analysis_pipeline = None
        self.sonarqube_client = None
        
        try:
            if CHROMADB_AVAILABLE:
                # Initialize ChromaDB persistent client
                self.client = chromadb.PersistentClient(
                    path=db_path,
                    settings=Settings(
                        anonymized_telemetry=False,
                        allow_reset=True
                    )
                )
                
                # Initialize sentence transformer for embeddings
                if SENTENCE_TRANSFORMERS_AVAILABLE:
                    self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
                
                # Create collections for different data types
                self.code_collection = self._get_or_create_collection("code_similarity")
                self.semantic_collection = self._get_or_create_collection("semantic_search")
                self.demographic_collection = self._get_or_create_collection("demographic_data")
                
                print("ZenVector Agent with ChromaDB initialized successfully")
            else:
                print("ChromaDB not available, using fallback mode")
        
        # Initialize Langfuse for LLM observability
        try:
            if LANGFUSE_AVAILABLE:
                self.langfuse_client = Langfuse()
                print("Langfuse observability initialized for ZenVector")
        except Exception as e:
            print(f"Langfuse initialization failed: {e}")
        
        # Initialize HuggingFace models for code analysis
        try:
            if HUGGINGFACE_AVAILABLE:
                # Code analysis pipeline
                self.code_analysis_pipeline = pipeline(
                    "text-classification",
                    model="microsoft/codebert-base",
                    device=0 if torch.cuda.is_available() else -1
                )
                
                # General text generation for insights
                self.huggingface_pipeline = pipeline(
                    "text-generation",
                    model="microsoft/DialoGPT-medium",
                    device=0 if torch.cuda.is_available() else -1
                )
                print("HuggingFace models initialized for ZenVector")
        except Exception as e:
            print(f"HuggingFace initialization failed: {e}")
                
        except Exception as e:
            print(f"Failed to initialize ZenVector Agent: {e}")
            self.client = None
    
    def _get_or_create_collection(self, name: str):
        """Get or create a ChromaDB collection"""
        if not self.client:
            return None
            
        try:
            return self.client.get_collection(name=name)
        except ValueError:
            # Collection doesn't exist, create it
            return self.client.create_collection(
                name=name,
                metadata={"hnsw:space": "cosine"}  # Use cosine similarity
            )
    
    @observe()
    def add_code_to_vector_db(self, project_id: str, code_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add code snippets to ChromaDB vector database for similarity analysis
        
        Args:
            project_id: Unique project identifier
            code_data: Dictionary containing classes, methods, and code content
            
        Returns:
            Dictionary with processing results
        """
        if not self.client or not self.code_collection:
            return {'status': 'error', 'message': 'ChromaDB not available'}
        """
        Add code snippets to vector database for similarity analysis
        
        Args:
            project_id: Unique project identifier
            code_data: Dictionary containing classes, methods, and code content
            
        Returns:
            Dictionary with processing results
        """
        try:
            processed_items = []
            
            for class_info in code_data.get('classes', []):
                # Process each class
                class_text = self._extract_class_features(class_info)
                class_id = f"{project_id}_{class_info['name']}"
                
                # Generate embedding using sentence transformer
                if self.embedding_model:
                    embedding = self.embedding_model.encode(class_text).tolist()
                    
                    # Store in ChromaDB vector database
                    self.code_collection.add(
                        embeddings=[embedding],
                        documents=[class_text],
                        metadatas=[{
                            'project_id': project_id,
                            'class_name': class_info['name'],
                            'type': class_info.get('type', 'unknown'),
                            'package': class_info.get('package', ''),
                            'methods_count': len(class_info.get('methods', [])),
                            'timestamp': datetime.now().isoformat()
                        }],
                        ids=[class_id]
                    )
                else:
                    # Store without embeddings (ChromaDB will use default)
                    self.code_collection.add(
                        documents=[class_text],
                        metadatas=[{
                            'project_id': project_id,
                            'class_name': class_info['name'],
                            'type': class_info.get('type', 'unknown'),
                            'package': class_info.get('package', ''),
                            'methods_count': len(class_info.get('methods', [])),
                            'timestamp': datetime.now().isoformat()
                        }],
                        ids=[class_id]
                    )
                
                # Enhance with HuggingFace code analysis
                code_insights = self._analyze_code_with_huggingface(class_text)
                
                processed_items.append({
                    'id': class_id,
                    'class_name': class_info['name'],
                    'embedding_size': len(embedding) if self.embedding_model else 'auto-generated',
                    'code_insights': code_insights
                })
            
            return {
                'status': 'success',
                'processed_items': len(processed_items),
                'items': processed_items
            }
            
        except Exception as e:
            print(f"Error adding code to ChromaDB: {e}")
            return {'status': 'error', 'message': str(e)}
    
    @observe()
    def find_similar_code(self, query_code: str, project_id: Optional[str] = None, 
                         top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Find similar code patterns using ChromaDB vector similarity search
        
        Args:
            query_code: Code snippet or description to search for
            project_id: Optional project filter
            top_k: Number of results to return
            
        Returns:
            List of similar code matches with similarity scores
        """
        if not self.client or not self.code_collection:
            return []
        """
        Find similar code patterns using vector similarity search
        
        Args:
            query_code: Code snippet or description to search for
            project_id: Optional project filter
            top_k: Number of results to return
            
        Returns:
            List of similar code matches with similarity scores
        """
        try:
            # Build filter if project_id provided
            where_filter = {"project_id": {"$eq": project_id}} if project_id else None
            
            # Search for similar code using ChromaDB
            if self.embedding_model:
                # Use custom embeddings
                query_embedding = self.embedding_model.encode(query_code).tolist()
                results = self.code_collection.query(
                    query_embeddings=[query_embedding],
                    n_results=top_k,
                    where=where_filter
                )
            else:
                # Use ChromaDB's built-in text search
                results = self.code_collection.query(
                    query_texts=[query_code],
                    n_results=top_k,
                    where=where_filter
                )
            
            # Format results
            similar_code = []
            for i, (doc, metadata, distance) in enumerate(zip(
                results['documents'][0],
                results['metadatas'][0], 
                results['distances'][0]
            )):
                similarity_score = 1 - distance  # Convert distance to similarity
                similar_code.append({
                    'rank': i + 1,
                    'class_name': metadata['class_name'],
                    'project_id': metadata['project_id'],
                    'type': metadata['type'],
                    'package': metadata['package'],
                    'similarity_score': round(similarity_score, 3),
                    'code_preview': doc[:200] + "..." if len(doc) > 200 else doc,
                    'methods_count': metadata.get('methods_count', 0)
                })
            
            return similar_code
            
        except Exception as e:
            print(f"Error finding similar code: {e}")
            return []
    
    @observe()
    def semantic_search(self, query: str, search_type: str = "all", 
                       top_k: int = 10) -> Dict[str, Any]:
        """
        Perform semantic search across code and documentation using ChromaDB
        
        Args:
            query: Natural language search query
            search_type: "code", "documentation", or "all"
            top_k: Number of results to return
            
        Returns:
            Dictionary with search results and metadata
        """
        if not self.client or not self.code_collection:
            return {'query': query, 'search_type': search_type, 'results': [], 'total_found': 0}
        """
        Perform semantic search across code and documentation
        
        Args:
            query: Natural language search query
            search_type: "code", "documentation", or "all"
            top_k: Number of results to return
            
        Returns:
            Dictionary with search results and metadata
        """
        try:
            search_results = {
                'query': query,
                'search_type': search_type,
                'results': [],
                'total_found': 0
            }
            
            if search_type in ["code", "all"]:
                # Search using ChromaDB
                if self.embedding_model:
                    query_embedding = self.embedding_model.encode(query).tolist()
                    code_results = self.code_collection.query(
                        query_embeddings=[query_embedding],
                        n_results=top_k
                    )
                else:
                    code_results = self.code_collection.query(
                        query_texts=[query],
                        n_results=top_k
                    )
                
                for doc, metadata, distance in zip(
                    code_results['documents'][0],
                    code_results['metadatas'][0],
                    code_results['distances'][0]
                ):
                    search_results['results'].append({
                        'type': 'code',
                        'title': f"{metadata['class_name']} ({metadata['type']})",
                        'content': doc[:300] + "..." if len(doc) > 300 else doc,
                        'relevance_score': round(1 - distance, 3),
                        'metadata': metadata
                    })
            
            search_results['total_found'] = len(search_results['results'])
            
            # Sort by relevance score
            search_results['results'].sort(
                key=lambda x: x['relevance_score'], 
                reverse=True
            )
            
            return search_results
            
        except Exception as e:
            print(f"Error in semantic search: {e}")
            return {'query': query, 'search_type': search_type, 'results': [], 'total_found': 0}
    
    def analyze_demographic_patterns(self, demographic_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze demographic data patterns using ChromaDB vector analysis
        
        Args:
            demographic_data: List of demographic records
            
        Returns:
            Analysis results with patterns and insights
        """
        if not self.client or not self.demographic_collection:
            return {'error': 'ChromaDB not available'}
        """
        Analyze demographic data patterns using vector analysis
        
        Args:
            demographic_data: List of demographic records
            
        Returns:
            Analysis results with patterns and insights
        """
        try:
            if not demographic_data:
                return {'error': 'No demographic data provided'}
            
            # Convert to DataFrame for analysis
            df = pd.DataFrame(demographic_data)
            
            # Generate text representations for each record
            demographic_texts = []
            for record in demographic_data:
                text = self._create_demographic_text(record)
                demographic_texts.append(text)
            
            # Store in ChromaDB demographic collection
            record_ids = [str(uuid.uuid4()) for _ in demographic_data]
            
            if self.embedding_model:
                # Generate embeddings using sentence transformer
                embeddings = self.embedding_model.encode(demographic_texts)
                self.demographic_collection.add(
                    embeddings=embeddings.tolist(),
                    documents=demographic_texts,
                    metadatas=[{
                        'record_type': 'demographic',
                        'timestamp': datetime.now().isoformat(),
                        **{k: str(v) for k, v in record.items()}
                    } for record in demographic_data],
                    ids=record_ids
                )
            else:
                # Use ChromaDB's built-in embeddings
                self.demographic_collection.add(
                    documents=demographic_texts,
                    metadatas=[{
                        'record_type': 'demographic',
                        'timestamp': datetime.now().isoformat(),
                        **{k: str(v) for k, v in record.items()}
                    } for record in demographic_data],
                    ids=record_ids
                )
            
            # Perform simple clustering analysis
            analysis_results = self._analyze_demographic_clusters(demographic_data)
            
            return {
                'status': 'success',
                'records_processed': len(demographic_data),
                'analysis': analysis_results,
                'patterns_found': len(analysis_results.get('clusters', []))
            }
            
        except Exception as e:
            print(f"Error analyzing demographic patterns: {e}")
            return {'error': str(e)}
    
    def search_demographic_data(self, query: str, top_k: int = 10) -> List[Dict[str, Any]]:
        """
        Search demographic data using natural language queries with ChromaDB
        
        Args:
            query: Natural language search query
            top_k: Number of results to return
            
        Returns:
            List of matching demographic records
        """
        if not self.client or not self.demographic_collection:
            return []
        """
        Search demographic data using natural language queries
        
        Args:
            query: Natural language search query
            top_k: Number of results to return
            
        Returns:
            List of matching demographic records
        """
        try:
            # Search using ChromaDB
            if self.embedding_model:
                query_embedding = self.embedding_model.encode(query).tolist()
                results = self.demographic_collection.query(
                    query_embeddings=[query_embedding],
                    n_results=top_k
                )
            else:
                results = self.demographic_collection.query(
                    query_texts=[query],
                    n_results=top_k
                )
            
            demographic_matches = []
            for doc, metadata, distance in zip(
                results['documents'][0],
                results['metadatas'][0],
                results['distances'][0]
            ):
                demographic_matches.append({
                    'content': doc,
                    'relevance_score': round(1 - distance, 3),
                    'metadata': {k: v for k, v in metadata.items() 
                              if not k.startswith('_')},
                    'match_type': 'demographic_data'
                })
            
            return demographic_matches
            
        except Exception as e:
            print(f"Error searching demographic data: {e}")
            return []
    
    def get_agent_statistics(self) -> Dict[str, Any]:
        """Get ZenVector agent usage statistics"""
        try:
            if not self.client:
                return {
                    'agent_name': 'ZenVector',
                    'status': 'ChromaDB not available',
                    'collections': {'code_similarity': 0, 'semantic_search': 0, 'demographic_data': 0},
                    'total_vectors': 0,
                    'capabilities': ['Code Similarity Detection', 'Semantic Code Search', 'Demographic Data Analysis'],
                    'embedding_model': 'N/A',
                    'vector_database': 'ChromaDB (unavailable)'
                }
            
            stats = {
                'agent_name': 'ZenVector',
                'status': 'Active',
                'collections': {
                    'code_similarity': self.code_collection.count() if self.code_collection else 0,
                    'semantic_search': self.semantic_collection.count() if self.semantic_collection else 0,
                    'demographic_data': self.demographic_collection.count() if self.demographic_collection else 0
                },
                'total_vectors': 0,
                'capabilities': [
                    'Code Similarity Detection',
                    'Semantic Code Search',
                    'Demographic Data Analysis',
                    'Pattern Recognition',
                    'Multi-modal Search',
                    'HuggingFace Code Analysis',
                    'SonarQube Integration',
                    'Langfuse LLM Observability',
                    'Multi-Model AI Pipeline'
                ],
                'embedding_model': 'all-MiniLM-L6-v2' if self.embedding_model else 'ChromaDB Default',
                'vector_database': 'ChromaDB Persistent',
                'database_path': self.db_path
            }
            
            stats['total_vectors'] = sum(stats['collections'].values())
            
            return stats
            
        except Exception as e:
            print(f"Error getting agent statistics: {e}")
            return {'error': str(e)}
    
    def _extract_class_features(self, class_info: Dict[str, Any]) -> str:
        """Extract textual features from class information"""
        features = []
        
        # Class name and type
        features.append(f"Class: {class_info['name']}")
        features.append(f"Type: {class_info.get('type', 'unknown')}")
        
        # Package information
        if class_info.get('package'):
            features.append(f"Package: {class_info['package']}")
        
        # Annotations
        if class_info.get('annotations'):
            features.append(f"Annotations: {', '.join(class_info['annotations'])}")
        
        # Methods
        methods = class_info.get('methods', [])
        if methods:
            method_names = [method.get('name', '') for method in methods[:5]]  # First 5 methods
            features.append(f"Methods: {', '.join(method_names)}")
        
        # Fields
        fields = class_info.get('fields', [])
        if fields:
            field_names = [field.get('name', '') for field in fields[:5]]  # First 5 fields
            features.append(f"Fields: {', '.join(field_names)}")
        
        return ' | '.join(features)
    
    def _create_demographic_text(self, record: Dict[str, Any]) -> str:
        """Create text representation of demographic record"""
        text_parts = []
        
        for key, value in record.items():
            if value is not None and str(value).strip():
                text_parts.append(f"{key}: {value}")
        
        return ' | '.join(text_parts)
    
    def _analyze_code_with_huggingface(self, code_text: str) -> Dict[str, Any]:
        """Analyze code using HuggingFace models"""
        try:
            if not self.code_analysis_pipeline:
                return {'status': 'not_available'}
            
            # Analyze code quality and patterns
            analysis_result = self.code_analysis_pipeline(code_text[:512])  # Limit text length
            
            # Generate insights if text generation pipeline is available
            insights = ""
            if self.huggingface_pipeline:
                try:
                    prompt = f"Analyze this code for patterns and quality: {code_text[:200]}..."
                    result = self.huggingface_pipeline(
                        prompt,
                        max_length=150,
                        do_sample=True,
                        temperature=0.7
                    )
                    insights = result[0]['generated_text'] if result else ""
                except:
                    insights = "Insights generation failed"
            
            return {
                'status': 'analyzed',
                'classification': analysis_result,
                'ai_insights': insights,
                'model_used': 'microsoft/codebert-base'
            }
            
        except Exception as e:
            print(f"HuggingFace code analysis failed: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def analyze_with_sonarqube(self, project_key: str, sonar_config: Dict[str, str]) -> Dict[str, Any]:
        """
        Integrate with SonarQube for comprehensive code quality analysis
        
        Args:
            project_key: SonarQube project key
            sonar_config: SonarQube configuration (URL, token)
        
        Returns:
            SonarQube analysis results with quality metrics
        """
        try:
            if not REQUESTS_AVAILABLE:
                return {'error': 'Requests library not available'}
            
            sonar_url = sonar_config.get('url', 'http://localhost:9000')
            sonar_token = sonar_config.get('token', '')
            
            if not sonar_token:
                return {'error': 'SonarQube token not provided'}
            
            # SonarQube API endpoints
            base_url = f"{sonar_url}/api"
            headers = {'Authorization': f'Bearer {sonar_token}'}
            
            # Get project measures
            measures_url = f"{base_url}/measures/component"
            measures_params = {
                'component': project_key,
                'metricKeys': 'ncloc,complexity,coverage,duplicated_lines_density,bugs,vulnerabilities,code_smells,security_hotspots,sqale_index'
            }
            
            measures_response = requests.get(measures_url, params=measures_params, headers=headers)
            
            if measures_response.status_code == 200:
                measures_data = measures_response.json()
                
                # Get issues
                issues_url = f"{base_url}/issues/search"
                issues_params = {
                    'componentKeys': project_key,
                    'severities': 'BLOCKER,CRITICAL,MAJOR',
                    'ps': 100
                }
                
                issues_response = requests.get(issues_url, params=issues_params, headers=headers)
                issues_data = issues_response.json() if issues_response.status_code == 200 else {}
                
                # Process and structure the results
                analysis_result = {
                    'status': 'success',
                    'project_key': project_key,
                    'metrics': self._process_sonar_measures(measures_data),
                    'issues': self._process_sonar_issues(issues_data),
                    'quality_gate': self._get_quality_gate_status(project_key, sonar_config),
                    'analyzed_at': datetime.now().isoformat()
                }
                
                return analysis_result
            else:
                return {
                    'error': f'SonarQube API error: {measures_response.status_code}',
                    'message': measures_response.text
                }
                
        except Exception as e:
            print(f"SonarQube analysis failed: {e}")
            return {'error': str(e)}
    
    def _process_sonar_measures(self, measures_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process SonarQube measures data"""
        measures = {}
        component = measures_data.get('component', {})
        
        for measure in component.get('measures', []):
            metric = measure.get('metric')
            value = measure.get('value')
            measures[metric] = value
        
        return {
            'lines_of_code': measures.get('ncloc', '0'),
            'complexity': measures.get('complexity', '0'),
            'coverage': f"{measures.get('coverage', '0')}%",
            'duplications': f"{measures.get('duplicated_lines_density', '0')}%",
            'bugs': measures.get('bugs', '0'),
            'vulnerabilities': measures.get('vulnerabilities', '0'),
            'code_smells': measures.get('code_smells', '0'),
            'security_hotspots': measures.get('security_hotspots', '0'),
            'technical_debt': measures.get('sqale_index', '0')
        }
    
    def _process_sonar_issues(self, issues_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process SonarQube issues data"""
        issues = issues_data.get('issues', [])
        
        issue_summary = {
            'total_issues': len(issues),
            'blocker': 0,
            'critical': 0,
            'major': 0,
            'by_type': {}
        }
        
        for issue in issues:
            severity = issue.get('severity', '').lower()
            issue_type = issue.get('type', 'unknown')
            
            if severity in issue_summary:
                issue_summary[severity] += 1
            
            if issue_type in issue_summary['by_type']:
                issue_summary['by_type'][issue_type] += 1
            else:
                issue_summary['by_type'][issue_type] = 1
        
        return issue_summary
    
    def _get_quality_gate_status(self, project_key: str, sonar_config: Dict[str, str]) -> Dict[str, Any]:
        """Get SonarQube quality gate status"""
        try:
            sonar_url = sonar_config.get('url', 'http://localhost:9000')
            sonar_token = sonar_config.get('token', '')
            
            headers = {'Authorization': f'Bearer {sonar_token}'}
            qg_url = f"{sonar_url}/api/qualitygates/project_status"
            qg_params = {'projectKey': project_key}
            
            response = requests.get(qg_url, params=qg_params, headers=headers)
            
            if response.status_code == 200:
                qg_data = response.json()
                project_status = qg_data.get('projectStatus', {})
                
                return {
                    'status': project_status.get('status', 'UNKNOWN'),
                    'conditions': project_status.get('conditions', []),
                    'period': project_status.get('periods', [])
                }
            else:
                return {'status': 'ERROR', 'message': 'Failed to get quality gate status'}
                
        except Exception as e:
            return {'status': 'ERROR', 'message': str(e)}
    
    def _analyze_demographic_clusters(self, demographic_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze demographic data clusters using simple grouping"""
        try:
            n_samples = len(demographic_data)
            
            if n_samples < 2:
                return {'clusters': [], 'analysis': 'Insufficient data for clustering'}
            
            # Simple clustering by grouping similar attributes
            clusters = []
            grouped_data = {}
            
            # Group by first key-value pair (simplified clustering)
            for i, record in enumerate(demographic_data):
                if record:
                    first_key = list(record.keys())[0] if record.keys() else 'unknown'
                    first_value = record.get(first_key, 'unknown')
                    group_key = f"{first_key}:{first_value}"
                    
                    if group_key not in grouped_data:
                        grouped_data[group_key] = []
                    grouped_data[group_key].append(record)
            
            cluster_id = 0
            for group_key, group_records in grouped_data.items():
                clusters.append({
                    'cluster_id': cluster_id,
                    'size': len(group_records),
                    'percentage': round(len(group_records) / n_samples * 100, 1),
                    'characteristics': self._describe_cluster(group_records),
                    'group_key': group_key
                })
                cluster_id += 1
            
            return {
                'clusters': clusters,
                'total_clusters': len(clusters),
                'analysis': 'Simple demographic clustering completed successfully'
            }
            
        except Exception as e:
            print(f"Error in demographic clustering: {e}")
            return {'clusters': [], 'analysis': f'Clustering failed: {str(e)}'}
    
    def _describe_cluster(self, cluster_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Describe characteristics of a demographic cluster"""
        if not cluster_data:
            return {}
            
        description = {}
        
        # Get all unique keys
        all_keys = set()
        for record in cluster_data:
            all_keys.update(record.keys())
        
        # Analyze each attribute
        for key in all_keys:
            values = [record.get(key) for record in cluster_data if record.get(key) is not None]
            
            if not values:
                continue
                
            if isinstance(values[0], (int, float)):
                # Numerical data - calculate average
                try:
                    numeric_values = [float(v) for v in values if v is not None]
                    if numeric_values:
                        description[f"avg_{key}"] = round(sum(numeric_values) / len(numeric_values), 2)
                except:
                    pass
            else:
                # Categorical data - find most common
                value_counts = {}
                for value in values:
                    str_val = str(value)
                    value_counts[str_val] = value_counts.get(str_val, 0) + 1
                
                if value_counts:
                    most_common = max(value_counts.items(), key=lambda x: x[1])
                    description[f"most_common_{key}"] = most_common[0]
        
        return description

# Initialize global ZenVector agent instance
zen_vector_agent = None

def get_zen_vector_agent():
    """Get global ZenVector agent instance"""
    global zen_vector_agent
    if zen_vector_agent is None:
        zen_vector_agent = ZenVectorAgent()
    return zen_vector_agent

if __name__ == "__main__":
    # Test the ZenVector agent
    agent = ZenVectorAgent()
    stats = agent.get_agent_statistics()
    print("ZenVector Agent initialized successfully!")
    print(f"Agent Stats: {json.dumps(stats, indent=2)}")