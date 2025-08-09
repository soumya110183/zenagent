# Zengent - Multi-Language Architecture Analyzer

A comprehensive AI-powered project architecture analysis platform that transforms source code into interactive, intelligent visualizations and detailed insights.

## Overview

Zengent is a full-stack web application designed to analyze multi-language project architectures through multiple input methods: ZIP file uploads and GitHub repository analysis. The system supports **Java**, **Python**, **PySpark**, and **Mainframe** codebases, extracting and parsing source files to identify architectural patterns, dependencies, and relationships between components.

## Key Features

### Multi-Language Support
- **Java Projects**: Spring Boot patterns, JPA entities, MVC architecture, Maven/Gradle dependencies
- **Python Applications**: Django/Flask frameworks, module dependencies, API endpoint mapping  
- **PySpark Workflows**: DataFrame analysis, job flow visualization, performance metrics
- **Mainframe Systems**: COBOL program flow, JCL job dependencies, database connections

### AI-Powered Analysis
Choose between two powerful AI analysis options:

#### 🌐 Online AI (OpenAI GPT-4o)
- **Technology**: OpenAI GPT-4o API
- **Features**: 
  - Advanced natural language understanding
  - Sophisticated code pattern recognition
  - Business context analysis
  - High-quality architectural insights
- **Best For**: Production environments, detailed analysis, professional reports
- **Requirements**: OpenAI API key

#### 🖥️ Local AI (Privacy-Focused)
- **Technology**: Local LLM via Ollama
- **Supported Models**:
  - **Llama 2** - General purpose code analysis
  - **Code Llama** - Specialized for code understanding
  - **Mistral** - Efficient multi-language analysis
  - **Deepseek Coder** - Advanced code comprehension
  - **StarCoder** - Programming language specialist
- **Features**:
  - Complete data privacy (no external API calls)
  - Customizable model selection
  - Local inference processing
  - No internet dependency for analysis
- **Best For**: Sensitive codebases, air-gapped environments, privacy-first organizations
- **Requirements**: Local Ollama installation

### Interactive Visualizations
- **React Flow Diagrams**: Interactive UML-style visualizations
- **5 Diagram Types**: Flow Chart, Component, Class, Sequence, and ER diagrams
- **Export Capabilities**: PNG and SVG format exports
- **Real-time Interaction**: Zoom, pan, and explore architectural relationships

### Comprehensive Analysis Reports
- **Project Description**: Detailed overview of application purpose
- **Business Problem Analysis**: What business challenge the system solves
- **Technical Architecture**: Code structure, patterns, and dependencies
- **Quality Metrics**: AI-powered quality scoring and recommendations
- **PDF Export**: Professional reports with all analysis details and diagrams

## Technology Stack

### Frontend
- **React** with TypeScript for type safety
- **Tailwind CSS** + **shadcn/ui** for modern UI components
- **React Flow** for interactive diagram rendering
- **TanStack Query** for efficient server state management
- **Vite** for fast development and optimized builds

### Backend
- **Express.js** with TypeScript
- **Multer** for file upload handling (50MB ZIP limit)
- **JSZip** for ZIP file extraction and processing
- **Custom parsers** for multi-language code analysis

### AI & Analysis
- **OpenAI GPT-4o** for online AI insights
- **Ollama Integration** for local LLM processing
- **Custom analysis engines** for each supported language
- **Pattern recognition algorithms** for architectural insights

### Database & Storage
- **PostgreSQL** with Drizzle ORM (configured)
- **In-memory storage** for development
- **Session management** with connect-pg-simple

## Local LLM Setup

### Installing Ollama
```bash
# Linux/macOS
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

### Recommended Models for Code Analysis
```bash
# Install code-specialized models
ollama pull codellama:7b
ollama pull codellama:13b
ollama pull deepseek-coder:6.7b
ollama pull starcoder:7b

# General purpose models
ollama pull llama2:7b
ollama pull mistral:7b
```

### Local LLM Configuration
1. Start Ollama server: `ollama serve`
2. Choose "Local LLM" in Zengent AI configuration
3. Configure endpoint (default: `http://localhost:11434`)
4. Select your preferred model (e.g., `codellama:7b`)

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- For Local LLM: Ollama installation
- For Online AI: OpenAI API key

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd zengent

# Install dependencies
npm install

# Start development server
npm run dev
```

### Configuration
1. **AI Model Selection**: Choose between OpenAI or Local LLM in the application
2. **API Keys**: Provide OpenAI API key if using online AI
3. **Local Setup**: Ensure Ollama is running for local AI analysis

## Supported Project Types

| Language | Frameworks | Analysis Features |
|----------|------------|-------------------|
| **Java** | Spring Boot, Spring MVC, JPA | Controllers, Services, Repositories, Entities |
| **Python** | Django, Flask, FastAPI | Modules, Views, Models, API endpoints |
| **PySpark** | Apache Spark | DataFrames, Jobs, Transformations |
| **Mainframe** | COBOL, JCL | Program flow, Job dependencies |

## Privacy & Security

### Local LLM Benefits
- **Zero Data Transmission**: All analysis happens locally
- **Model Customization**: Choose models best suited for your codebase
- **Compliance Ready**: Perfect for regulated industries
- **Cost Effective**: No per-request API charges

### Online AI Benefits
- **State-of-the-art Analysis**: Latest GPT-4o capabilities
- **No Local Resources**: No need for powerful local hardware
- **Always Updated**: Access to latest model improvements
- **Scalable**: Handles large codebases efficiently

## Export & Reporting

- **PDF Reports**: Professional documents with cover page, index, and detailed analysis
- **Diagram Export**: High-quality PNG/SVG exports of all visualizations
- **Comprehensive Data**: Project details, architecture insights, and recommendations
- **Professional Format**: Headers, footers, and proper document structure

## Architecture Patterns Detected

- Layered Architecture (MVC, MVP, MVVM)
- Microservices patterns
- Repository pattern
- Dependency Injection
- Factory patterns
- Observer patterns
- And many more...

## Contributing

This project follows modern development practices with TypeScript, comprehensive error handling, and modular architecture. Contributions are welcome!

## License

[License information here]

---

**Zengent** - Transforming code into insights with the power of AI, whether online or local.# Zengent AI - Enterprise Application Intelligence Platform
