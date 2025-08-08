# Zengent - Java Project Architecture Analyzer

A full-stack web application that analyzes Java projects and generates interactive architectural diagrams. Upload ZIP files or analyze GitHub repositories to visualize Spring Boot applications, JPA entities, and architectural patterns.

## Features

- **Multiple Input Methods**
  - Upload ZIP files containing Java source code (up to 50MB)
  - Analyze public GitHub repositories directly

- **Comprehensive Analysis**
  - Detects Spring Boot annotations (@Controller, @Service, @Repository, @Entity)
  - Identifies architectural patterns (MVC, JPA/Hibernate, Dependency Injection)
  - Extracts class relationships and method calls
  - Analyzes JPA entity relationships

- **Interactive Visualizations**
  - **Flow Chart**: Controller → Service → Repository flow visualization
  - **Component Diagram**: Complete system architecture overview
  - **Sequence Diagram**: Method call sequences (coming soon)
  - **Class Diagram**: UML-style class representations with fields and methods
  - **ER Diagram**: JPA entity relationship visualization

- **Export Options**
  - PNG/SVG diagram export
  - JSON analysis data export
  - Comprehensive analysis reports

## Technical Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components built on Radix UI
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Diagrams**: React Flow for interactive visualizations
- **Build Tool**: Vite with hot module replacement
- **Icons**: Lucide React icon library

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js with REST API design
- **File Processing**: Multer for multipart uploads
- **Archive Handling**: JSZip for ZIP file extraction
- **Git Integration**: Native git commands for GitHub repository cloning
- **Java Analysis**: Custom Java source code parser
- **Session Management**: Express sessions with PostgreSQL store

### Database & ORM
- **Database**: PostgreSQL (configured with Neon serverless)
- **ORM**: Drizzle ORM with type-safe queries
- **Schema Management**: Drizzle Kit for migrations
- **Validation**: Zod for runtime type validation

### Development Tools
- **Language**: TypeScript throughout the stack
- **Package Manager**: npm
- **Bundling**: ESBuild for production builds
- **Linting**: TypeScript compiler for type checking
- **Development Server**: Vite dev server with Express integration

### Cloud & Deployment
- **Platform**: Replit cloud development environment
- **Database**: Neon PostgreSQL serverless
- **Storage**: In-memory storage with database fallback
- **Version Control**: Git integration for repository analysis

### Java Analysis Engine
- **Parser**: Custom regex-based Java source code parser
- **Pattern Detection**: Spring Framework architectural patterns
- **Annotation Processing**: @Controller, @Service, @Repository, @Entity, etc.
- **Relationship Mapping**: Class inheritance, method calls, dependency injection
- **JPA Analysis**: Entity relationships, table mappings, column annotations

## Getting Started

1. **Upload a Java Project**
   - Drag and drop a ZIP file containing Java source code
   - Or enter a GitHub repository URL

2. **Wait for Analysis**
   - The system extracts and parses Java files
   - Identifies architectural patterns and relationships
   - Generates interactive diagrams

3. **Explore Results**
   - Navigate between different diagram types
   - Interact with nodes and relationships
   - Export diagrams and analysis data

## Supported Java Frameworks

- **Spring Boot**: Controllers, Services, Repositories
- **Spring Framework**: Component scanning, dependency injection
- **JPA/Hibernate**: Entity mappings, relationships
- **Standard Java**: Classes, interfaces, inheritance

## API Endpoints

- `GET /api/projects` - List all analyzed projects
- `GET /api/projects/:id` - Get specific project details
- `POST /api/projects/upload` - Upload and analyze ZIP file
- `POST /api/projects/github` - Analyze GitHub repository
- `DELETE /api/projects/:id` - Delete project

## Architecture

The application follows a modern full-stack architecture:

- **Frontend**: React SPA with TypeScript and modern UI components
- **Backend**: Express.js REST API with TypeScript
- **Database**: PostgreSQL with type-safe ORM
- **Processing**: Custom Java parser with pattern recognition
- **Visualization**: React Flow for interactive diagrams

## License

This project is open source and available under the MIT License.