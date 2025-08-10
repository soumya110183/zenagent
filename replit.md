# Zengent AI - Enterprise Application Intelligence Platform

## Overview

This is a comprehensive enterprise application intelligence platform designed to analyze multi-language project architectures through multiple input methods: ZIP file uploads and GitHub repository analysis. The system supports Java, Python, PySpark, and Mainframe codebases, extracting and parsing source files to identify architectural patterns, dependencies, and relationships between components. It provides interactive visual diagrams and AI-powered analysis using OpenAI GPT-4o for intelligent insights.

The platform features a modern React frontend with an agent-like interface supporting multiple programming languages, backed by an Express.js server that handles file processing, GitHub integration, and intelligent code analysis with UML-style diagrams and AI-generated recommendations. The system now includes comprehensive enterprise features including SonarQube integration, Swagger API documentation, and professional PDF report generation with corporate branding.

## Recent Changes (August 2025)

- **Enterprise Application Intelligence Platform**: Renamed to "Zengent AI - Enterprise Application Intelligence Platform" to reflect comprehensive enterprise capabilities
- **Multi-Language Support**: Expanded from Java-only to support Java, Python, PySpark, and Mainframe codebases
- **AI Agent Interface**: Redesigned with professional agent-like UI featuring language selection blocks
- **Four AI Model Options**: Complete integration of OpenAI GPT-4o, AWS Claude 3.5, Google Gemini Pro, and Local LLM (Ollama)
- **Custom Prompt Feature**: Added custom prompt input fields below analysis blocks for enhanced AI context
- **Enhanced Flow Chart**: Redesigned flow diagrams with connected nodes showing complete project architecture flow
- **Programming Language Icons**: Integrated proper icons (Java, Python, PySpark/Apache Spark, IBM) using react-icons
- **AI Model Selector**: Added configuration interface for choosing between online and local AI models
- **Local LLM Support**: Full integration with Ollama supporting Code Llama, Deepseek Coder, StarCoder, Llama 3, Mistral
- **SonarQube Integration**: Added comprehensive static code quality analysis with metrics and issue tracking
- **Swagger API Documentation**: Integrated API documentation with request mapping overviews
- **Project Structure Analysis**: Detailed module analysis with business logic descriptions and responsibilities
- **Enhanced PDF Export**: Professional "Project Analysis Document" with revision history, corporate branding, and comprehensive sections
- **Zensar Corporate Branding**: Integrated Zensar logos, colors, and "Prepared by Diamond Zensar Team" footer
- **GitHub Integration**: Enhanced GitHub repository analysis with multi-language detection
- **Local LLM Setup Guide**: Created comprehensive setup documentation for offline AI analysis
- **ZenVector Agent with ChromaDB**: Implemented advanced vector database agent for code similarity analysis, semantic search, and demographic data insights using ChromaDB for persistent storage
- **Knowledge Agent with ChromaDB & Redis**: Created comprehensive document scraper with Confluence integration, PDF processing via IBM Doclinq, Redis caching for performance, and chat interface for intelligent Q&A functionality
- **Enterprise AI Stack Integration**: Complete integration of IBM Doclinq, Langchain, LangGraph, Langfuse, SonarQube, and HuggingFace Models across all agents
- **Multi-Model AI Pipeline**: Advanced AI workflows with LangChain orchestration, LangGraph state management, and Langfuse observability
- **SonarQube Code Quality**: Comprehensive static code analysis with metrics, issue tracking, quality gates, and technical debt assessment
- **HuggingFace Model Integration**: Local AI processing with CodeBERT for code analysis, DialoGPT for insights, and sentence transformers for embeddings

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The client-side is built with React and TypeScript, utilizing a component-based architecture:

- **UI Framework**: React with TypeScript for type safety
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, modern design
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds

The frontend follows a three-phase user experience:
1. Upload phase - drag-and-drop ZIP file upload interface
2. Processing phase - real-time progress indicators while analysis runs
3. Results phase - interactive diagrams and detailed architectural insights

### Backend Architecture

The server is built with Express.js and follows a modular design:

- **Framework**: Express.js with TypeScript
- **File Processing**: Multer for handling ZIP file uploads with 50MB limit
- **Storage Layer**: Abstracted storage interface with in-memory implementation (extensible to databases)
- **Java Analysis**: Custom Java source code parser that identifies Spring annotations and architectural patterns
- **API Design**: RESTful endpoints for project management and file upload

### Data Storage Solutions

The application uses a flexible storage abstraction:

- **Current Implementation**: In-memory storage for development and testing
- **Database Schema**: Designed for PostgreSQL with Drizzle ORM
- **Project Data**: Stores metadata including file counts, analysis results, and architectural metrics
- **Analysis Results**: JSON storage of parsed Java classes, methods, annotations, and relationships

### Authentication and Authorization

The schema includes user management capabilities:

- **User Model**: Username/password based authentication structure
- **Session Management**: PostgreSQL session store configuration (connect-pg-simple)
- **Project Ownership**: Projects can be associated with users for multi-tenant support

### Multi-Language Code Analysis Engine

The core analysis functionality processes multiple programming languages:

- **Java Projects**: Spring Boot patterns, JPA entities, MVC architecture, Maven/Gradle dependencies
- **Python Applications**: Django/Flask frameworks, module dependencies, API endpoint mapping
- **PySpark Workflows**: DataFrame analysis, job flow visualization, performance metrics
- **Mainframe Systems**: COBOL program flow, JCL job dependencies, database connections
- **ZIP Extraction**: Automatic extraction and validation of source files across all supported languages
- **Dual AI Options**: Choose between OpenAI GPT-4o (online) or Local LLM via Ollama (offline)
- **Local LLM Models**: Support for Code Llama, Deepseek Coder, StarCoder, Llama 2, Mistral
- **Privacy-First Analysis**: Complete offline analysis capability with no external data transmission
- **Relationship Mapping**: Builds dependency graphs and architectural relationships
- **Interactive Diagrams**: UML-style visualizations with language-specific representations
- **Professional Reporting**: Comprehensive PDF exports with all analysis and diagrams

### ZenVector Agent - Vector Database Intelligence

Advanced AI agent for code intelligence and demographic analysis:

- **ChromaDB Integration**: Persistent vector storage for code similarity analysis
- **Semantic Search**: Natural language queries across codebases with intelligent context matching
- **Code Similarity Detection**: Find similar code patterns and architectural relationships
- **Demographic Data Analysis**: Pattern recognition and clustering for business intelligence
- **Multi-modal Search**: Search across different data types and content formats
- **Vector Embeddings**: Sentence transformer models for high-quality semantic understanding

### Knowledge Agent - Document Intelligence & Q&A

Comprehensive document scraper and intelligent Q&A system with enterprise AI integration:

- **Confluence Integration**: Advanced web scraping with sub-menu navigation and authentication
- **IBM Doclinq Processing**: Enterprise PDF document analysis with entity extraction and OCR
- **LangChain Document Processing**: Advanced document loaders, text splitters, and QA chains
- **LangGraph Workflow Orchestration**: Complex AI pipelines with state management and node orchestration
- **Langfuse LLM Observability**: Complete monitoring, tracing, and analytics for AI model usage
- **HuggingFace Model Integration**: Local AI processing with DialoGPT and sentence transformers
- **ChromaDB Vector Storage**: Persistent knowledge base with semantic search capabilities
- **Redis Caching**: High-performance caching for fast response times and reduced API calls
- **Multi-Model AI Responses**: Intelligent Q&A with LangChain QA chains and HuggingFace pipelines
- **Chat Interface**: Context-aware responses with multiple AI model support
- **Bulk Operations**: Process multiple document sources simultaneously
- **Web Scraping**: Comprehensive knowledge extraction from web-based documentation
- **Document Analysis**: Advanced text processing with metadata extraction and content structuring

### ZenVector Agent - Advanced Code Intelligence

Enhanced AI agent with enterprise-grade code analysis capabilities:

- **ChromaDB Integration**: Persistent vector storage for code similarity analysis
- **HuggingFace Code Analysis**: CodeBERT integration for code quality assessment and pattern detection
- **SonarQube Integration**: Comprehensive static code analysis with quality metrics, issue tracking, and quality gates
- **Langfuse Observability**: LLM monitoring and tracing for all AI operations
- **Semantic Search**: Natural language queries across codebases with intelligent context matching
- **Code Similarity Detection**: Advanced pattern recognition using vector embeddings
- **Demographic Data Analysis**: Pattern recognition and clustering for business intelligence
- **Multi-Model AI Pipeline**: Integration of multiple AI models for comprehensive code insights
- **Quality Metrics**: Lines of code, complexity, coverage, duplications, bugs, vulnerabilities analysis
- **Technical Debt Assessment**: SonarQube integration for code maintainability and technical debt tracking

### Enterprise AI Technology Stack

Advanced AI and ML integration across all platform components:

- **IBM Doclinq**: Enterprise-grade PDF processing with OCR and entity extraction
- **LangChain Framework**: Document loaders, text splitters, vector stores, and QA chains
- **LangGraph Orchestration**: State-based workflow management for complex AI pipelines
- **Langfuse Observability**: Complete LLM monitoring, tracing, and performance analytics
- **SonarQube Integration**: Static code analysis with comprehensive quality metrics
- **HuggingFace Models**: Local AI processing with CodeBERT, DialoGPT, and transformer models
- **Multi-LLM Support**: OpenAI, Claude, Gemini, and local model integration
- **Vector Databases**: ChromaDB for persistent semantic search and similarity analysis
- **Performance Optimization**: Redis caching and efficient model inference

## External Dependencies

### Database and ORM
- **PostgreSQL**: Primary database (configured but not actively used in current implementation)
- **Drizzle ORM**: Type-safe database queries and schema management
- **Neon Database**: Serverless PostgreSQL integration (@neondatabase/serverless)

### Frontend Libraries
- **shadcn/ui**: Comprehensive React component library built on Radix UI
- **Radix UI**: Headless UI primitives for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework
- **React Flow**: Interactive diagram and flowchart rendering
- **Lucide React**: Modern icon library

### File Processing
- **Multer**: Express middleware for handling multipart/form-data file uploads
- **JSZip**: JavaScript library for reading and extracting ZIP files

### AI & Analysis Integration  
- **OpenAI API**: GPT-4o integration for advanced online AI analysis
- **Ollama Integration**: Local LLM server support for offline, privacy-focused analysis
- **Model Flexibility**: Support for multiple specialized code analysis models
- **AI Configuration Interface**: User-selectable AI model configuration with real-time switching

### Development Tools
- **Vite**: Frontend build tool with hot module replacement
- **TypeScript**: Static type checking across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds

### Validation and Utilities
- **Zod**: TypeScript-first schema validation library
- **date-fns**: Modern JavaScript date utility library
- **clsx**: Utility for constructing className strings conditionally

The architecture supports both development and production environments with appropriate tooling for each, including Replit-specific integrations for cloud development.