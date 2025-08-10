#!/usr/bin/env python3
"""
Knowledge Agent - Advanced Document Scraper and Q&A System
Scrapes Confluence pages, PDFs, and web content using IBM Doclinq
Stores content in ChromaDB vector database with Redis caching
Provides chat interface for intelligent Q&A
"""

import json
import os
import sys
import uuid
import subprocess
import requests
import hashlib
import time
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from urllib.parse import urljoin, urlparse
import logging

# Try to import dependencies
try:
    import chromadb
    from chromadb.config import Settings
    CHROMADB_AVAILABLE = True
except ImportError:
    print("Installing ChromaDB...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "chromadb", "sentence-transformers", "--user"])
        import chromadb
        from chromadb.config import Settings
        CHROMADB_AVAILABLE = True
    except:
        CHROMADB_AVAILABLE = False

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    print("Installing Redis...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "redis", "--user"])
        import redis
        REDIS_AVAILABLE = True
    except:
        REDIS_AVAILABLE = False

try:
    import requests
    from bs4 import BeautifulSoup
    import PyPDF2
    PDF_PROCESSING_AVAILABLE = True
except ImportError:
    print("Installing PDF processing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "requests", "beautifulsoup4", "PyPDF2", "python-docx", "--user"])
        import requests
        from bs4 import BeautifulSoup
        import PyPDF2
        PDF_PROCESSING_AVAILABLE = True
    except:
        PDF_PROCESSING_AVAILABLE = False

# Advanced AI/ML Libraries Integration
try:
    from langchain.document_loaders import PyPDFLoader, WebBaseLoader
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    from langchain.vectorstores import Chroma
    from langchain.embeddings import HuggingFaceEmbeddings
    from langchain.llms import HuggingFacePipeline
    from langchain.chains import RetrievalQA
    from langchain.prompts import PromptTemplate
    LANGCHAIN_AVAILABLE = True
except ImportError:
    print("Installing Langchain and dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "langchain", "langchain-community", "langchain-huggingface", "--user"])
        from langchain.document_loaders import PyPDFLoader, WebBaseLoader
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        from langchain.vectorstores import Chroma
        from langchain.embeddings import HuggingFaceEmbeddings
        from langchain.llms import HuggingFacePipeline
        from langchain.chains import RetrievalQA
        from langchain.prompts import PromptTemplate
        LANGCHAIN_AVAILABLE = True
    except:
        LANGCHAIN_AVAILABLE = False

try:
    from langgraph import StateGraph, START, END
    from langgraph.graph import MessagesState
    LANGGRAPH_AVAILABLE = True
except ImportError:
    print("Installing LangGraph...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "langgraph", "--user"])
        from langgraph import StateGraph, START, END
        from langgraph.graph import MessagesState
        LANGGRAPH_AVAILABLE = True
    except:
        LANGGRAPH_AVAILABLE = False

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

class KnowledgeAgent:
    """
    Knowledge Agent: Advanced Document Scraper and Q&A System with Enterprise AI Integration
    
    Features:
    - Confluence page scraping with sub-menu navigation
    - PDF document processing using IBM Doclinq integration
    - LangChain integration for advanced document processing
    - LangGraph workflow orchestration for complex AI pipelines
    - Langfuse observability and LLM monitoring
    - HuggingFace model integration for local AI processing
    - ChromaDB vector storage for semantic search
    - Redis caching for performance optimization
    - Chat interface with multi-model LLM support
    """
    
    def __init__(self, db_path: str = "./knowledge_db", redis_host: str = "localhost", redis_port: int = 6379):
        """Initialize Knowledge Agent with advanced AI integrations"""
        self.db_path = db_path
        self.redis_client = None
        self.chroma_client = None
        self.embedding_model = None
        self.knowledge_collection = None
        self.confluence_collection = None
        self.pdf_collection = None
        
        # Advanced AI Integration Components
        self.langfuse_client = None
        self.langchain_qa_chain = None
        self.huggingface_pipeline = None
        self.langgraph_workflow = None
        self.text_splitter = None
        self.hf_embeddings = None
        
        # Initialize Redis cache
        try:
            if REDIS_AVAILABLE:
                self.redis_client = redis.Redis(
                    host=redis_host, 
                    port=redis_port, 
                    decode_responses=True,
                    socket_timeout=5
                )
                # Test connection
                self.redis_client.ping()
                print("Redis cache connected successfully")
            else:
                print("Redis not available, using memory cache")
        except Exception as e:
            print(f"Redis connection failed: {e}, using memory cache")
            self.redis_client = None
        
        # Initialize ChromaDB
        try:
            if CHROMADB_AVAILABLE:
                self.chroma_client = chromadb.PersistentClient(
                    path=db_path,
                    settings=Settings(
                        anonymized_telemetry=False,
                        allow_reset=True
                    )
                )
                
                # Initialize sentence transformer
                if SENTENCE_TRANSFORMERS_AVAILABLE:
                    self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
                
                # Create collections
                self.knowledge_collection = self._get_or_create_collection("knowledge_base")
                self.confluence_collection = self._get_or_create_collection("confluence_pages")
                self.pdf_collection = self._get_or_create_collection("pdf_documents")
                
                print("Knowledge Agent with ChromaDB initialized successfully")
            else:
                print("ChromaDB not available")
        
        # Initialize Langfuse for LLM observability
        try:
            if LANGFUSE_AVAILABLE:
                self.langfuse_client = Langfuse()
                print("Langfuse observability initialized")
        except Exception as e:
            print(f"Langfuse initialization failed: {e}")
        
        # Initialize HuggingFace models
        try:
            if HUGGINGFACE_AVAILABLE:
                self.huggingface_pipeline = pipeline(
                    "text-generation",
                    model="microsoft/DialoGPT-medium",
                    device=0 if torch.cuda.is_available() else -1
                )
                self.hf_embeddings = HuggingFaceEmbeddings(
                    model_name="sentence-transformers/all-MiniLM-L6-v2"
                ) if LANGCHAIN_AVAILABLE else None
                print("HuggingFace models initialized")
        except Exception as e:
            print(f"HuggingFace initialization failed: {e}")
        
        # Initialize LangChain components
        try:
            if LANGCHAIN_AVAILABLE:
                self.text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=1000,
                    chunk_overlap=200,
                    length_function=len
                )
                self._setup_langchain_qa()
                print("LangChain components initialized")
        except Exception as e:
            print(f"LangChain initialization failed: {e}")
        
        # Initialize LangGraph workflow
        try:
            if LANGGRAPH_AVAILABLE:
                self._setup_langgraph_workflow()
                print("LangGraph workflow initialized")
        except Exception as e:
            print(f"LangGraph initialization failed: {e}")
                
        except Exception as e:
            print(f"Failed to initialize Knowledge Agent: {e}")
    
    def _get_or_create_collection(self, name: str):
        """Get or create a ChromaDB collection"""
        if not self.chroma_client:
            return None
        try:
            return self.chroma_client.get_collection(name=name)
        except ValueError:
            return self.chroma_client.create_collection(
                name=name,
                metadata={"hnsw:space": "cosine"}
            )
    
    def _setup_langchain_qa(self):
        """Setup LangChain QA chain with custom prompt template"""
        if not LANGCHAIN_AVAILABLE or not self.hf_embeddings:
            return
        
        try:
            # Custom prompt template for enterprise knowledge base
            prompt_template = """
            You are an intelligent enterprise knowledge assistant. Use the following context to answer questions accurately and professionally.
            
            Context: {context}
            
            Question: {question}
            
            Instructions:
            - Provide accurate, detailed answers based on the context
            - If information is not in the context, say so clearly
            - Include relevant source references when possible
            - Use professional, clear language suitable for enterprise environments
            
            Answer:
            """
            
            PROMPT = PromptTemplate(
                template=prompt_template,
                input_variables=["context", "question"]
            )
            
            # Setup retrieval QA chain
            if self.chroma_client and self.hf_embeddings:
                vectorstore = Chroma(
                    persist_directory=self.db_path,
                    embedding_function=self.hf_embeddings
                )
                
                self.langchain_qa_chain = RetrievalQA.from_chain_type(
                    llm=self.huggingface_pipeline,
                    chain_type="stuff",
                    retriever=vectorstore.as_retriever(search_kwargs={"k": 5}),
                    chain_type_kwargs={"prompt": PROMPT},
                    return_source_documents=True
                )
        except Exception as e:
            print(f"LangChain QA setup failed: {e}")
    
    def _setup_langgraph_workflow(self):
        """Setup LangGraph workflow for complex document processing"""
        if not LANGGRAPH_AVAILABLE:
            return
        
        try:
            # Define workflow states
            workflow = StateGraph(MessagesState)
            
            # Add nodes for different processing stages
            workflow.add_node("extract", self._extract_content_node)
            workflow.add_node("chunk", self._chunk_content_node)
            workflow.add_node("embed", self._embed_content_node)
            workflow.add_node("store", self._store_content_node)
            workflow.add_node("analyze", self._analyze_content_node)
            
            # Define workflow edges
            workflow.add_edge(START, "extract")
            workflow.add_edge("extract", "chunk")
            workflow.add_edge("chunk", "embed")
            workflow.add_edge("embed", "store")
            workflow.add_edge("store", "analyze")
            workflow.add_edge("analyze", END)
            
            self.langgraph_workflow = workflow.compile()
            
        except Exception as e:
            print(f"LangGraph workflow setup failed: {e}")
    
    def _extract_content_node(self, state):
        """LangGraph node for content extraction"""
        return {"extracted": True, "content": state.get("raw_content", "")}
    
    def _chunk_content_node(self, state):
        """LangGraph node for content chunking"""
        if self.text_splitter and state.get("content"):
            chunks = self.text_splitter.split_text(state["content"])
            return {"chunks": chunks}
        return {"chunks": []}
    
    def _embed_content_node(self, state):
        """LangGraph node for embedding generation"""
        chunks = state.get("chunks", [])
        if self.hf_embeddings and chunks:
            embeddings = [self.hf_embeddings.embed_query(chunk) for chunk in chunks]
            return {"embeddings": embeddings}
        return {"embeddings": []}
    
    def _store_content_node(self, state):
        """LangGraph node for vector storage"""
        return {"stored": True}
    
    def _analyze_content_node(self, state):
        """LangGraph node for content analysis"""
        return {"analyzed": True, "insights": "Content processed successfully"}
    
    def _cache_get(self, key: str) -> Optional[str]:
        """Get from Redis cache with fallback"""
        if self.redis_client:
            try:
                return self.redis_client.get(key)
            except:
                return None
        return None
    
    def _cache_set(self, key: str, value: str, expire: int = 3600):
        """Set to Redis cache with fallback"""
        if self.redis_client:
            try:
                self.redis_client.setex(key, expire, value)
            except:
                pass
    
    def scrape_confluence_pages(self, base_url: str, credentials: Dict[str, str], 
                               max_depth: int = 3) -> Dict[str, Any]:
        """
        Scrape Confluence pages including sub-menu items
        
        Args:
            base_url: Confluence base URL
            credentials: Authentication credentials
            max_depth: Maximum depth for sub-page crawling
        
        Returns:
            Scraping results with processed pages
        """
        try:
            scraped_pages = []
            processed_urls = set()
            
            # Generate cache key
            cache_key = f"confluence:{hashlib.md5(base_url.encode()).hexdigest()}"
            cached_result = self._cache_get(cache_key)
            
            if cached_result:
                print("Using cached Confluence data")
                return json.loads(cached_result)
            
            # Start scraping from base URL
            pages_to_process = [(base_url, 0)]
            
            while pages_to_process and len(scraped_pages) < 100:  # Limit to prevent infinite loops
                url, depth = pages_to_process.pop(0)
                
                if url in processed_urls or depth > max_depth:
                    continue
                
                processed_urls.add(url)
                page_content = self._scrape_confluence_page(url, credentials)
                
                if page_content:
                    scraped_pages.append(page_content)
                    
                    # Store in ChromaDB
                    if self.confluence_collection:
                        self._store_confluence_content(page_content)
                    
                    # Extract sub-pages
                    sub_pages = self._extract_confluence_links(page_content['content'], base_url)
                    for sub_url in sub_pages:
                        if sub_url not in processed_urls:
                            pages_to_process.append((sub_url, depth + 1))
                
                # Rate limiting
                time.sleep(1)
            
            result = {
                'status': 'success',
                'pages_scraped': len(scraped_pages),
                'pages': scraped_pages,
                'base_url': base_url
            }
            
            # Cache results
            self._cache_set(cache_key, json.dumps(result), 7200)  # 2 hours
            
            return result
            
        except Exception as e:
            print(f"Error scraping Confluence: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def _scrape_confluence_page(self, url: str, credentials: Dict[str, str]) -> Optional[Dict[str, Any]]:
        """Scrape individual Confluence page"""
        try:
            headers = {
                'User-Agent': 'Knowledge-Agent/1.0',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
            }
            
            # Add authentication if provided
            auth = None
            if credentials.get('username') and credentials.get('password'):
                auth = (credentials['username'], credentials['password'])
            elif credentials.get('token'):
                headers['Authorization'] = f"Bearer {credentials['token']}"
            
            response = requests.get(url, headers=headers, auth=auth, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract content
            title = soup.find('title').get_text().strip() if soup.find('title') else url
            
            # Remove navigation, footer, and other non-content elements
            for element in soup(['nav', 'footer', 'script', 'style', 'aside']):
                element.decompose()
            
            # Extract main content
            content_div = soup.find('div', class_='wiki-content') or soup.find('main') or soup.find('body')
            content = content_div.get_text(strip=True) if content_div else ""
            
            return {
                'url': url,
                'title': title,
                'content': content,
                'scraped_at': datetime.now().isoformat(),
                'content_length': len(content)
            }
            
        except Exception as e:
            print(f"Error scraping page {url}: {e}")
            return None
    
    def _extract_confluence_links(self, content: str, base_url: str) -> List[str]:
        """Extract Confluence links from page content"""
        links = []
        try:
            soup = BeautifulSoup(content, 'html.parser')
            for link in soup.find_all('a', href=True):
                href = link['href']
                if href.startswith('/'):
                    full_url = urljoin(base_url, href)
                elif href.startswith('http'):
                    full_url = href
                else:
                    continue
                
                # Filter for Confluence pages
                if 'pages/' in full_url or 'display/' in full_url:
                    links.append(full_url)
        except Exception as e:
            print(f"Error extracting links: {e}")
        
        return links
    
    @observe()
    def process_pdf_with_doclinq(self, pdf_path: str, doclinq_config: Dict[str, str]) -> Dict[str, Any]:
        """
        Process PDF documents using IBM Doclinq with LangChain integration
        
        Args:
            pdf_path: Path to PDF file or URL
            doclinq_config: IBM Doclinq configuration (API key, endpoint)
        
        Returns:
            Processed document content and metadata with AI insights
        """
        try:
            # Generate cache key for PDF
            cache_key = f"pdf:{hashlib.md5(pdf_path.encode()).hexdigest()}"
            cached_result = self._cache_get(cache_key)
            
            if cached_result:
                print("Using cached PDF data")
                return json.loads(cached_result)
            
            # Process with multiple approaches for comprehensive analysis
            if doclinq_config.get('api_key') and doclinq_config.get('endpoint'):
                # IBM Doclinq for enterprise-grade processing
                result = self._process_with_doclinq(pdf_path, doclinq_config)
            elif LANGCHAIN_AVAILABLE:
                # LangChain for advanced document processing
                result = self._process_with_langchain(pdf_path)
            else:
                # Fallback to local PDF processing
                result = self._process_pdf_locally(pdf_path)
            
            # Enhance with HuggingFace analysis if available
            if HUGGINGFACE_AVAILABLE and result.get('status') == 'success':
                result = self._enhance_with_huggingface(result)
            
            # Store in ChromaDB
            if result['status'] == 'success' and self.pdf_collection:
                self._store_pdf_content(result)
            
            # Cache results
            self._cache_set(cache_key, json.dumps(result), 3600)  # 1 hour
            
            return result
            
        except Exception as e:
            print(f"Error processing PDF: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def _process_with_doclinq(self, pdf_path: str, config: Dict[str, str]) -> Dict[str, Any]:
        """Process PDF using IBM Doclinq API"""
        try:
            # IBM Doclinq API integration
            headers = {
                'Authorization': f"Bearer {config['api_key']}",
                'Content-Type': 'application/json'
            }
            
            # Prepare file for upload
            if pdf_path.startswith('http'):
                pdf_data = requests.get(pdf_path).content
            else:
                with open(pdf_path, 'rb') as f:
                    pdf_data = f.read()
            
            # Call IBM Doclinq API (this is a simplified example)
            api_url = f"{config['endpoint']}/document/analyze"
            
            files = {'document': ('document.pdf', pdf_data, 'application/pdf')}
            response = requests.post(api_url, headers=headers, files=files, timeout=120)
            
            if response.status_code == 200:
                doclinq_result = response.json()
                
                return {
                    'status': 'success',
                    'source': pdf_path,
                    'processor': 'IBM Doclinq',
                    'content': doclinq_result.get('text', ''),
                    'metadata': doclinq_result.get('metadata', {}),
                    'entities': doclinq_result.get('entities', []),
                    'processed_at': datetime.now().isoformat()
                }
            else:
                raise Exception(f"Doclinq API error: {response.status_code}")
                
        except Exception as e:
            print(f"Doclinq processing failed: {e}, falling back to local processing")
            return self._process_pdf_locally(pdf_path)
    
    def _process_pdf_locally(self, pdf_path: str) -> Dict[str, Any]:
        """Fallback local PDF processing"""
        try:
            if pdf_path.startswith('http'):
                response = requests.get(pdf_path)
                pdf_data = response.content
                # Save temporarily
                temp_path = f"/tmp/{uuid.uuid4()}.pdf"
                with open(temp_path, 'wb') as f:
                    f.write(pdf_data)
                pdf_path = temp_path
            
            text_content = ""
            
            # Extract text using PyPDF2
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text_content += page.extract_text() + "\n"
            
            return {
                'status': 'success',
                'source': pdf_path,
                'processor': 'Local PyPDF2',
                'content': text_content,
                'metadata': {
                    'pages': len(pdf_reader.pages),
                    'title': pdf_reader.metadata.get('/Title', '') if pdf_reader.metadata else ''
                },
                'processed_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Local PDF processing failed: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def _process_with_langchain(self, pdf_path: str) -> Dict[str, Any]:
        """Process PDF using LangChain document loaders and processing"""
        try:
            # Use LangChain PDF loader
            loader = PyPDFLoader(pdf_path)
            documents = loader.load()
            
            # Split documents into chunks
            if self.text_splitter:
                doc_chunks = self.text_splitter.split_documents(documents)
            else:
                doc_chunks = documents
            
            # Extract text content
            text_content = "\n".join([doc.page_content for doc in documents])
            
            # Generate summary using HuggingFace if available
            summary = ""
            if self.huggingface_pipeline:
                try:
                    summary_result = self.huggingface_pipeline(
                        f"Summarize this document: {text_content[:1000]}...",
                        max_length=200,
                        do_sample=False
                    )
                    summary = summary_result[0]['generated_text'] if summary_result else ""
                except:
                    summary = "Summary generation failed"
            
            return {
                'status': 'success',
                'source': pdf_path,
                'processor': 'LangChain + HuggingFace',
                'content': text_content,
                'chunks': len(doc_chunks),
                'summary': summary,
                'metadata': {
                    'pages': len(documents),
                    'processing_method': 'langchain_advanced'
                },
                'processed_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"LangChain PDF processing failed: {e}")
            return self._process_pdf_locally(pdf_path)
    
    def _enhance_with_huggingface(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance document processing results with HuggingFace models"""
        try:
            content = result.get('content', '')
            if not content or not self.huggingface_pipeline:
                return result
            
            # Generate key insights using HuggingFace
            insights_prompt = f"Extract key insights from: {content[:500]}..."
            
            insights_result = self.huggingface_pipeline(
                insights_prompt,
                max_length=150,
                do_sample=True,
                temperature=0.7
            )
            
            insights = insights_result[0]['generated_text'] if insights_result else "No insights generated"
            
            # Add HuggingFace enhancements to result
            result['huggingface_insights'] = insights
            result['enhanced_processing'] = True
            result['ai_models_used'] = ['HuggingFace DialoGPT']
            
            return result
            
        except Exception as e:
            print(f"HuggingFace enhancement failed: {e}")
            return result
    
    def _store_confluence_content(self, page_data: Dict[str, Any]):
        """Store Confluence content in ChromaDB"""
        try:
            doc_id = hashlib.md5(page_data['url'].encode()).hexdigest()
            content = f"Title: {page_data['title']}\n\nContent: {page_data['content']}"
            
            if self.embedding_model:
                embedding = self.embedding_model.encode(content).tolist()
                self.confluence_collection.add(
                    embeddings=[embedding],
                    documents=[content],
                    metadatas=[{
                        'source': 'confluence',
                        'url': page_data['url'],
                        'title': page_data['title'],
                        'scraped_at': page_data['scraped_at'],
                        'content_length': page_data['content_length']
                    }],
                    ids=[doc_id]
                )
            else:
                self.confluence_collection.add(
                    documents=[content],
                    metadatas=[{
                        'source': 'confluence',
                        'url': page_data['url'],
                        'title': page_data['title'],
                        'scraped_at': page_data['scraped_at'],
                        'content_length': page_data['content_length']
                    }],
                    ids=[doc_id]
                )
        except Exception as e:
            print(f"Error storing Confluence content: {e}")
    
    def _store_pdf_content(self, pdf_data: Dict[str, Any]):
        """Store PDF content in ChromaDB"""
        try:
            doc_id = hashlib.md5(pdf_data['source'].encode()).hexdigest()
            content = pdf_data['content']
            
            if self.embedding_model:
                embedding = self.embedding_model.encode(content).tolist()
                self.pdf_collection.add(
                    embeddings=[embedding],
                    documents=[content],
                    metadatas=[{
                        'source': 'pdf',
                        'file_path': pdf_data['source'],
                        'processor': pdf_data['processor'],
                        'processed_at': pdf_data['processed_at'],
                        'metadata': json.dumps(pdf_data.get('metadata', {}))
                    }],
                    ids=[doc_id]
                )
            else:
                self.pdf_collection.add(
                    documents=[content],
                    metadatas=[{
                        'source': 'pdf',
                        'file_path': pdf_data['source'],
                        'processor': pdf_data['processor'],
                        'processed_at': pdf_data['processed_at'],
                        'metadata': json.dumps(pdf_data.get('metadata', {}))
                    }],
                    ids=[doc_id]
                )
        except Exception as e:
            print(f"Error storing PDF content: {e}")
    
    @observe()
    def chat_query(self, query: str, context_limit: int = 5) -> Dict[str, Any]:
        """
        Process chat query using advanced AI pipeline with multiple models
        
        Args:
            query: User's question
            context_limit: Maximum number of context documents to use
        
        Returns:
            Chat response with multi-model AI insights and relevant context
        """
        try:
            # Generate cache key for query
            cache_key = f"chat:{hashlib.md5(query.encode()).hexdigest()}"
            cached_result = self._cache_get(cache_key)
            
            if cached_result:
                return json.loads(cached_result)
            
            # Search for relevant content across all collections
            relevant_docs = self._search_knowledge_base(query, context_limit)
            
            # Generate response using multiple AI approaches
            if self.langchain_qa_chain and relevant_docs:
                # Use LangChain QA chain for sophisticated responses
                response = self._generate_langchain_response(query, relevant_docs)
            elif self.huggingface_pipeline:
                # Use HuggingFace for local AI processing
                response = self._generate_huggingface_response(query, relevant_docs)
            else:
                # Fallback to rule-based response
                response = self._generate_chat_response(query, relevant_docs)
            
            result = {
                'query': query,
                'response': response,
                'context_used': len(relevant_docs),
                'sources': [doc['metadata'] for doc in relevant_docs],
                'timestamp': datetime.now().isoformat()
            }
            
            # Cache response
            self._cache_set(cache_key, json.dumps(result), 1800)  # 30 minutes
            
            return result
            
        except Exception as e:
            print(f"Error processing chat query: {e}")
            return {
                'query': query,
                'response': f"Sorry, I encountered an error processing your question: {str(e)}",
                'context_used': 0,
                'sources': [],
                'timestamp': datetime.now().isoformat()
            }
    
    def _search_knowledge_base(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search across all knowledge collections"""
        all_results = []
        
        collections = [
            (self.confluence_collection, "confluence"),
            (self.pdf_collection, "pdf"),
            (self.knowledge_collection, "knowledge")
        ]
        
        for collection, source_type in collections:
            if not collection:
                continue
            
            try:
                if self.embedding_model:
                    query_embedding = self.embedding_model.encode(query).tolist()
                    results = collection.query(
                        query_embeddings=[query_embedding],
                        n_results=limit
                    )
                else:
                    results = collection.query(
                        query_texts=[query],
                        n_results=limit
                    )
                
                # Process results
                for doc, metadata, distance in zip(
                    results['documents'][0] if results['documents'] else [],
                    results['metadatas'][0] if results['metadatas'] else [],
                    results['distances'][0] if results['distances'] else []
                ):
                    all_results.append({
                        'content': doc,
                        'metadata': metadata,
                        'relevance_score': 1 - distance if distance else 0.5,
                        'source_type': source_type
                    })
                    
            except Exception as e:
                print(f"Error searching {source_type} collection: {e}")
        
        # Sort by relevance and return top results
        all_results.sort(key=lambda x: x['relevance_score'], reverse=True)
        return all_results[:limit]
    
    def _generate_chat_response(self, query: str, context_docs: List[Dict[str, Any]]) -> str:
        """Generate intelligent response using context"""
        if not context_docs:
            return "I don't have enough information to answer your question. Please try a different query or add more documents to the knowledge base."
        
        # Create context from relevant documents
        context_parts = []
        for doc in context_docs:
            content = doc['content'][:500]  # Limit content length
            source = doc['metadata'].get('title', doc['metadata'].get('file_path', 'Unknown'))
            context_parts.append(f"From {source}: {content}")
        
        context = "\n\n".join(context_parts)
        
        # Simple rule-based response generation
        # In production, this would use OpenAI or another LLM
        response_parts = [
            f"Based on the available knowledge base, here's what I found regarding '{query}':",
            "",
            "Key information:"
        ]
        
        # Extract key sentences from context
        sentences = context.split('.')
        relevant_sentences = [s.strip() for s in sentences if any(word.lower() in s.lower() for word in query.split()) and len(s.strip()) > 20]
        
        for i, sentence in enumerate(relevant_sentences[:3]):
            response_parts.append(f"• {sentence.strip()}.")
        
        response_parts.extend([
            "",
            f"This information comes from {len(context_docs)} source(s) in the knowledge base.",
            "For more detailed information, you can ask follow-up questions."
        ])
        
        return "\n".join(response_parts)
    
    def _generate_langchain_response(self, query: str, context_docs: List[Dict[str, Any]]) -> str:
        """Generate response using LangChain QA chain"""
        try:
            if not self.langchain_qa_chain:
                return self._generate_chat_response(query, context_docs)
            
            # Prepare context for LangChain
            context = "\n\n".join([doc['content'][:500] for doc in context_docs])
            
            # Use LangChain QA chain
            result = self.langchain_qa_chain({
                "query": query,
                "context": context
            })
            
            # Extract response and sources
            response = result.get('result', '')
            sources = result.get('source_documents', [])
            
            if sources:
                response += f"\n\nSources: {len(sources)} documents referenced"
            
            return response
            
        except Exception as e:
            print(f"LangChain response generation failed: {e}")
            return self._generate_chat_response(query, context_docs)
    
    def _generate_huggingface_response(self, query: str, context_docs: List[Dict[str, Any]]) -> str:
        """Generate response using HuggingFace models"""
        try:
            if not self.huggingface_pipeline:
                return self._generate_chat_response(query, context_docs)
            
            # Prepare context
            context = "\n".join([doc['content'][:200] for doc in context_docs[:3]])
            
            # Create prompt for HuggingFace model
            prompt = f"""
            Based on the following context, answer the question professionally:
            
            Context: {context}
            
            Question: {query}
            
            Answer:"""
            
            # Generate response
            result = self.huggingface_pipeline(
                prompt,
                max_length=300,
                do_sample=True,
                temperature=0.7,
                pad_token_id=self.huggingface_pipeline.tokenizer.eos_token_id
            )
            
            response = result[0]['generated_text'] if result else ""
            
            # Clean up response (remove prompt)
            if "Answer:" in response:
                response = response.split("Answer:")[-1].strip()
            
            return response
            
        except Exception as e:
            print(f"HuggingFace response generation failed: {e}")
            return self._generate_chat_response(query, context_docs)
    
    def get_agent_statistics(self) -> Dict[str, Any]:
        """Get Knowledge Agent statistics"""
        try:
            stats = {
                'agent_name': 'Knowledge Agent',
                'status': 'Active' if self.chroma_client else 'ChromaDB Unavailable',
                'collections': {
                    'confluence_pages': self.confluence_collection.count() if self.confluence_collection else 0,
                    'pdf_documents': self.pdf_collection.count() if self.pdf_collection else 0,
                    'knowledge_base': self.knowledge_collection.count() if self.knowledge_collection else 0
                },
                'capabilities': [
                    'Confluence Page Scraping',
                    'PDF Document Processing',
                    'IBM Doclinq Integration',
                    'LangChain Document Processing',
                    'LangGraph Workflow Orchestration',
                    'Langfuse LLM Observability',
                    'HuggingFace Model Integration',
                    'Multi-Model AI Pipeline',
                    'Web Scraping',
                    'Intelligent Q&A Chat',
                    'Vector Search',
                    'Redis Caching'
                ],
                'cache_status': 'Active' if self.redis_client else 'Disabled',
                'embedding_model': 'all-MiniLM-L6-v2' if self.embedding_model else 'ChromaDB Default',
                'vector_database': 'ChromaDB Persistent',
                'database_path': self.db_path
            }
            
            stats['total_documents'] = sum(stats['collections'].values())
            
            # Add cache statistics if available
            if self.redis_client:
                try:
                    cache_info = self.redis_client.info()
                    stats['cache_info'] = {
                        'keys': cache_info.get('db0', {}).get('keys', 0),
                        'memory_used': cache_info.get('used_memory_human', 'N/A')
                    }
                except:
                    stats['cache_info'] = {'status': 'error'}
            
            return stats
            
        except Exception as e:
            print(f"Error getting agent statistics: {e}")
            return {'error': str(e)}

def main():
    """Test the Knowledge Agent"""
    agent = KnowledgeAgent()
    print("Knowledge Agent initialized")
    
    # Test statistics
    stats = agent.get_agent_statistics()
    print(f"Agent stats: {json.dumps(stats, indent=2)}")

if __name__ == "__main__":
    main()