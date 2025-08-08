# Zengent - Java Project Architecture Analyzer

## Overview

This is a full-stack web application designed to analyze Java project architecture through multiple input methods: ZIP file uploads and GitHub repository analysis. The system extracts and parses Java files to identify architectural patterns, annotations, and relationships between classes. It provides interactive visual diagrams and detailed analysis of Spring Boot applications, including controllers, services, repositories, and entities.

The application features a modern React frontend with a clean, professional interface for uploading projects and viewing analysis results, backed by an Express.js server that handles file processing, GitHub integration, and Java code analysis with UML-style class diagram generation.

## Recent Changes (August 2025)

- **GitHub Integration**: Added ability to analyze public GitHub repositories directly
- **Enhanced Class Diagrams**: Implemented UML-style class representations with proper field/method sections
- **Improved UI**: Enhanced diagram canvas with better node styling and relationship visualization
- **Technical Documentation**: Added comprehensive README with full technical stack details

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

### Java Code Analysis Engine

The core analysis functionality processes uploaded Java projects:

- **ZIP Extraction**: Automatic extraction and validation of Java source files
- **Pattern Recognition**: Identifies Spring Boot architectural patterns (controllers, services, repositories, entities)
- **Annotation Processing**: Parses and categorizes Java annotations
- **Relationship Mapping**: Builds dependency graphs between classes
- **Metrics Collection**: Counts various architectural components for summary statistics

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

### Development Tools
- **Vite**: Frontend build tool with hot module replacement
- **TypeScript**: Static type checking across the entire application
- **ESBuild**: Fast JavaScript bundler for production builds

### Validation and Utilities
- **Zod**: TypeScript-first schema validation library
- **date-fns**: Modern JavaScript date utility library
- **clsx**: Utility for constructing className strings conditionally

The architecture supports both development and production environments with appropriate tooling for each, including Replit-specific integrations for cloud development.