# CODE LENS v2 - Enterprise Application Intelligence Platform

**Platform Tagline**: Code Analytics Agent

---

## Project Description

CODE LENS v2 is a comprehensive enterprise application intelligence platform that analyzes multi-language project architectures from ZIP uploads and GitHub repositories. It supports Java, Python, PySpark, Mainframe (COBOL/JCL), C#, and Kotlin codebases, extracting and parsing source files to identify architectural patterns, dependencies, and relationships. The platform provides interactive visual diagrams and AI-powered analysis using various LLMs (OpenAI GPT-4o, Ollama local models), delivering intelligent insights and recommendations. 

With enterprise features including Swagger API documentation, demographic field scanning with compliance reporting, and professional PDF/DOC/HTML report generation with corporate branding, CODE LENS v2 provides comprehensive, AI-driven insights into complex enterprise applications to aid development, refactoring, and strategic planning. The vision is to accelerate code analysis by 85%, ensure data privacy compliance, and empower teams with actionable intelligence—all 100% offline for maximum security.

---

## Key Benefits

### **ASSIST**
- Helps developers understand legacy codebases, plan refactoring, and ensure data privacy compliance

### **AUGMENT**
- Enhances human analysis with AI-powered insights, interactive diagrams, and intelligent pattern recognition across multiple languages

### **AUTOMATE**
- Automatically scans demographic fields, generates architecture diagrams, creates reports, and extracts API documentation—eliminating weeks of manual work

### **Value Proposition**
- **85% Faster**: Accelerate enterprise code analysis from weeks to minutes
- **95% Coverage**: Comprehensive demographic field detection for compliance (GDPR, data privacy regulations)
- **100% Offline**: Complete data security with local AI models and pure Python/NumPy implementation
- **Multi-Language**: Single platform for Java, Python, PySpark, Mainframe, C#, Kotlin analysis

---

## Key Features

### **1. Multi-Language Code Analysis**
- Support for Java (Spring Boot, JPA, MVC), Python (Django/Flask), PySpark (DataFrame, job flow), Mainframe (COBOL, JCL), C#, Kotlin
- Automatic ZIP extraction and validation (up to 50MB)
- GitHub integration for direct repository import
- Handles large enterprise applications (1000+ files)
- Intelligent code parsing and structure analysis

### **2. Demographic Field Scanning & Compliance**
**Two Scanning Paths:**
- **Regex Scan**: 39 pre-defined patterns across 5 categories (Primary Names, Secondary Names, Government IDs, Contact Information, Financial/Health Data)
- **Excel Field Mapping**: Upload custom field lists with independent field/table name matching

**Capabilities:**
- Detects sensitive data: SSN, phone numbers, emails, addresses, birth dates, credit cards, medical records
- Shows exact file locations, line numbers, and code context
- Identifies which classes and functions use demographic fields
- Separates business logic classes from data-only DTOs/Entities/Models
- SQL query analysis for database field tracking
- Compliance reporting with detailed coverage metrics

### **3. Demographic Class Analysis**
- Identifies classes containing demographic fields with business logic functions
- Function-level analysis showing how sensitive data is processed
- Smart classification excludes DTOs/Entities without functions
- Diagnostic reporting explains why files were omitted
- Detailed function signatures and descriptions

### **4. AI-Powered Insights & Recommendations**
**Online Mode:**
- OpenAI GPT-4o integration for cloud-based analysis

**Offline Mode:**
- Local LLMs via Ollama (Code Llama, Deepseek Coder, StarCoder, Llama 3, Mistral)
- Complete data privacy—no external dependencies

**Capabilities:**
- Project overview and architecture analysis
- Actionable recommendations for improvement
- Quality assessment scores
- Module-level insights for individual classes
- Code quality analysis with HuggingFace CodeBERT

### **5. Code Lens ML (Traditional Machine Learning)**
- Scikit-learn based field suggestions (NOT LLM)
- Activated on explicit user request via "Get ML Suggestions" button
- Pattern-based demographic field recommendations
- Pure Python/NumPy implementation for offline operation

### **6. Swagger API Documentation**
- Automatic extraction from REST controllers
- Identifies endpoints, HTTP methods, request/response models
- Generates interactive API documentation
- Supports Spring Boot annotations (@RestController, @RequestMapping, @GetMapping, etc.)

### **7. Interactive Visual Diagrams**
- UML-style class diagrams with AntV X6 and React Flow
- Dependency graphs and architectural relationships
- Language-specific representations
- Mermaid.js integration for flow diagrams
- Component, sequence, and comprehensive diagrams

### **8. Professional Report Generation**
- Export formats: PDF, DOC, HTML
- Comprehensive analysis with diagrams and insights
- Corporate branding footer: "Developed by: Ullas Krishnan, Sr Solution Architect. Copyright © Project Diamond Zensar team"
- HTML preview before download
- Customizable report sections

### **9. Vector Database Intelligence (ZenVector Agent)**
- ChromaDB for persistent vector storage
- Code similarity detection and semantic search
- Demographic data analysis with vector embeddings
- Multi-modal search capabilities
- Sentence transformer models for semantic understanding

### **10. Knowledge Agent - Document Intelligence & Q&A**
- Confluence integration for enterprise documentation
- IBM Doclinq for PDF processing
- LangChain for document processing workflows
- LangGraph for AI workflow orchestration
- Langfuse for LLM observability and tracing
- Redis caching for performance optimization
- Chat interface for context-aware Q&A

### **11. Enterprise Security & Authentication**
- Database-based user authentication with bcrypt password encryption
- Secure session management with express-session
- Multi-tenant support with user-based project association
- PostgreSQL database with Drizzle ORM
- Role-based access control

### **12. GitHub Integration**
- Direct repository import via GitHub URL
- Automatic repository cloning and analysis
- Version-controlled project tracking
- Support for public and private repositories

---

## Technology Stack

### **Frontend**
- **React** with TypeScript
- **Tailwind CSS** with shadcn/ui component library
- **TanStack Query (React Query)** for state management
- **Wouter** for routing
- **Vite** for fast builds and development
- **AntV X6** and **React Flow** for interactive diagrams
- **Mermaid.js** for flowcharts
- **Lucide React** for icons

### **Backend**
- **Express.js** with TypeScript
- **Multer** for file upload handling (ZIP files up to 50MB)
- **JSZip** for ZIP extraction
- **Passport.js** with local strategy for authentication
- **bcrypt** for password encryption
- **express-session** for session management

### **Database & ORM**
- **PostgreSQL** (Neon-backed serverless database)
- **Drizzle ORM** for type-safe database queries
- **Drizzle Kit** for database migrations

### **AI & Machine Learning**
- **OpenAI API** (GPT-4o) for online AI analysis
- **Ollama** for local LLM integration (Code Llama, Deepseek Coder, StarCoder, Llama 3, Mistral)
- **HuggingFace Transformers** (CodeBERT, DialoGPT) for local AI processing
- **Scikit-learn** for traditional ML (Code Lens ML feature)
- **NumPy** for numerical computations
- **ChromaDB** for vector database and semantic search
- **LangChain** for AI application development
- **LangGraph** for AI workflow orchestration
- **Langfuse** for LLM observability and monitoring

### **Document Processing**
- **IBM Doclinq** for enterprise-grade PDF processing
- **Python libraries**: reportlab, pdfkit, pypdf2, openpyxl
- **docx** for Word document generation

### **Utilities & Tools**
- **Zod** for schema validation with drizzle-zod integration
- **date-fns** for date handling
- **nanoid** for unique ID generation
- **Swagger JSDoc** and **Swagger UI Express** for API documentation
- **Redis** for caching (Knowledge Agent)

### **Development Tools**
- **TypeScript** for static type checking
- **ESBuild** for fast JavaScript bundling
- **tsx** for TypeScript execution
- **Drizzle Kit** for database schema management

### **Languages & Platforms**
- **Node.js** (v20+)
- **Python 3** for ML and document processing
- **NixOS** environment on Replit

---

## Compliance & Standards

### **ISO/IEC 25022:2016 - Quality of Use Metrics**
CODE LENS v2 follows **ISO/IEC 25022:2016** standards for software quality measurement, focusing on:
- **Effectiveness**: Achieving comprehensive code analysis and compliance detection
- **Efficiency**: Reducing manual effort by 85% with automated analysis
- **Satisfaction**: Providing intuitive UI/UX for enterprise users
- **Freedom from Risk**: 100% offline operation for data security
- **Context Coverage**: Multi-language, multi-platform support

*Note: ISO/IEC 25022:2021 compliance integration is planned for future releases.*

---

## Architecture Overview

### **Frontend Architecture**
- Component-based React application with TypeScript
- Tailwind CSS with shadcn/ui for consistent design
- TanStack Query for server state management
- Wouter for client-side routing
- Three-phase UX: Upload → Processing → Results

### **Backend Architecture**
- Modular Express.js server with TypeScript
- RESTful API design with Swagger documentation
- Service layer pattern (demographicScanner, demographicClassAnalyzer, swaggerGenerator)
- Storage abstraction layer (in-memory or PostgreSQL)
- File processing pipeline (ZIP → Extract → Parse → Analyze)

### **Data Storage**
- Flexible storage abstraction (IStorage interface)
- Current: In-memory storage (MemStorage)
- Future: PostgreSQL with Drizzle ORM
- JSON format for analysis results
- User authentication and project metadata persistence

### **AI Analysis Pipeline**
1. **Code Extraction**: ZIP/GitHub → Source files
2. **Pattern Matching**: Regex/Excel field detection
3. **Class Analysis**: Function extraction and demographic field mapping
4. **AI Processing**: Local LLM or OpenAI GPT-4o analysis
5. **Report Generation**: PDF/DOC/HTML with diagrams

---

## Project Structure

```
├── client/                      # Frontend React application
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom React hooks
│   │   └── lib/                # Utility libraries
├── server/                      # Backend Express application
│   ├── routes.ts               # API route definitions
│   ├── services/               # Business logic services
│   │   ├── demographicScanner.ts
│   │   ├── demographicClassAnalyzer.ts
│   │   └── swaggerGenerator.ts
│   ├── storage.ts              # Storage abstraction layer
│   └── python/                 # Python scripts for ML and reports
├── shared/                      # Shared types and schemas
│   └── schema.ts               # Drizzle ORM schemas and Zod validation
└── README.md                    # This file
```

---

## Getting Started

### **Prerequisites**
- Node.js v20+
- PostgreSQL database (optional, uses in-memory storage by default)
- Python 3.x (for ML features and report generation)

### **Installation**

1. Clone the repository:
```bash
git clone <repository-url>
cd code-lens-v2
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Database (optional)
DATABASE_URL=your_postgres_url

# OpenAI API (optional, for online AI analysis)
OPENAI_API_KEY=your_openai_key
```

4. Run the application:
```bash
npm run dev
```

5. Access the application:
```
http://localhost:5000
```

### **Default Credentials**
- Username: `amex`
- Password: `zensar`

---

## Usage Workflow

### **1. Login**
- Use the login page to authenticate
- Default admin credentials provided above

### **2. Upload Project**
- **Option A**: Upload ZIP file (up to 50MB)
- **Option B**: Import from GitHub repository URL

### **3. Analysis**
- Platform automatically analyzes the codebase
- Real-time processing indicators show progress
- Multiple analysis types run in parallel

### **4. View Results**
- **Project Overview**: Summary statistics and metadata
- **Architecture Diagrams**: Interactive UML and flow diagrams
- **Swagger API**: Extracted API documentation
- **Demographic Scan**: 
  - Regex Scan: Pre-defined pattern matching
  - Excel Field Mapping: Custom field list scanning
  - Demographic Class: Function-level analysis
- **AI Insights**: Recommendations and quality assessment

### **5. Generate Reports**
- Export as PDF, DOC, or HTML
- Preview before download
- Professional corporate branding included

---

## Security & Privacy

- **100% Offline Operation**: No external dependencies required (local LLM mode)
- **Data Encryption**: bcrypt password hashing, secure session management
- **No Data Transmission**: All analysis performed locally
- **PostgreSQL Storage**: Enterprise-grade database security
- **User Isolation**: Multi-tenant project separation

---

## Support & Contact

**Developed by**: Ullas Krishnan, Sr Solution Architect  
**Copyright**: © Project Diamond Zensar Team  
**Platform**: Powered by Zensar - An RPG Company

For support, feature requests, or issues, please contact your system administrator.

---

## License

Proprietary - Zensar Technologies Limited  
All rights reserved.

---

## Future Roadmap

- ISO/IEC 25022:2021 full compliance certification
- Enhanced ML models for field suggestion accuracy
- Real-time collaboration features
- Integration with CI/CD pipelines
- Advanced code refactoring suggestions
- Performance optimization for 10,000+ file projects
- Custom demographic pattern builder UI
- Multi-repository comparative analysis
#   z e n a g e n t  
 