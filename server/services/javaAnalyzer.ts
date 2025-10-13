import { storage } from "../storage";
import { AnalysisData, AnalysisDataSchema } from "@shared/schema";
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { promisify } from 'util';
import { exec } from 'child_process';
import JSZip from 'jszip';

const execAsync = promisify(exec);

export async function analyzeJavaProject(projectId: string, zipBuffer: Buffer): Promise<void> {
  let tempDir: string | null = null;
  
  try {
    // Create temporary directory
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'java-analyzer-'));
    
    // Extract ZIP file
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(zipBuffer);
    
    const javaFiles: string[] = [];
    
    // Extract all files, focusing on .java files
    for (const filename of Object.keys(zipContent.files)) {
      const file = zipContent.files[filename];
      
      if (!file.dir) {
        const filePath = path.join(tempDir, filename);
        const fileDir = path.dirname(filePath);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }
        
        const content = await file.async('nodebuffer');
        fs.writeFileSync(filePath, content);
        
        if (filename.endsWith('.java')) {
          javaFiles.push(filePath);
        }
      }
    }

    if (javaFiles.length === 0) {
      await storage.updateProject(projectId, {
        status: 'failed',
      });
      return;
    }

    // Analyze Java files
    const analysisData = await performAnalysis(javaFiles, tempDir);
    
    // Delete existing source files for this project to avoid duplicates on re-analysis
    await storage.deleteProjectSourceFiles(projectId);
    
    // Store source files in database before cleanup
    const sourceFilesToStore = javaFiles.map(filePath => {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(tempDir, filePath);
      const fileSize = Buffer.byteLength(content, 'utf-8');
      
      return {
        projectId,
        relativePath,
        content,
        fileSize,
        language: 'java',
      };
    });
    
    // Batch insert source files
    if (sourceFilesToStore.length > 0) {
      await storage.createSourceFiles(sourceFilesToStore);
      console.log(`Stored ${sourceFilesToStore.length} source files for project ${projectId}`);
    }
    
    // Update project with analysis results
    await storage.updateProject(projectId, {
      status: 'completed',
      analysisData,
      fileCount: javaFiles.length,
      controllerCount: analysisData.classes.filter(c => c.type === 'controller').length,
      serviceCount: analysisData.classes.filter(c => c.type === 'service').length,
      repositoryCount: analysisData.classes.filter(c => c.type === 'repository').length,
      entityCount: analysisData.classes.filter(c => c.type === 'entity').length,
    });

  } catch (error) {
    console.error('Analysis error:', error);
    await storage.updateProject(projectId, {
      status: 'failed',
    });
  } finally {
    // Clean up temporary directory
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

async function performAnalysis(javaFiles: string[], baseDir: string): Promise<AnalysisData> {
  const classes: AnalysisData['classes'] = [];
  const relationships: AnalysisData['relationships'] = [];
  const patterns: AnalysisData['patterns'] = [];
  const entities: AnalysisData['entities'] = [];
  const packages = new Set<string>();
  const sourceFiles: string[] = [];

  // Parse each Java file
  for (const filePath of javaFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(baseDir, filePath);
      sourceFiles.push(relativePath);
      
      const classInfo = parseJavaFile(content, relativePath);
      if (classInfo) {
        classes.push(classInfo);
        packages.add(classInfo.package);
        
        // Extract relationships
        const classRelationships = extractRelationships(classInfo, content);
        relationships.push(...classRelationships);
        
        // Check if it's a JPA entity
        if (classInfo.annotations.includes('@Entity')) {
          const entityInfo = extractEntityInfo(classInfo);
          if (entityInfo) {
            entities.push(entityInfo);
          }
        }
      }
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
    }
  }

  // Detect patterns
  const detectedPatterns = detectPatterns(classes);
  patterns.push(...detectedPatterns);

  return {
    classes,
    relationships,
    patterns,
    entities,
    structure: {
      packages: Array.from(packages),
      sourceFiles,
    }
  };
}

function parseJavaFile(content: string, filePath: string): AnalysisData['classes'][0] | null {
  try {
    // Extract package
    const packageMatch = content.match(/package\s+([^;]+);/);
    const packageName = packageMatch ? packageMatch[1].trim() : 'default';

    // Extract class name
    const classMatch = content.match(/(?:public\s+)?(?:abstract\s+)?class\s+(\w+)/);
    if (!classMatch) return null;
    
    const className = classMatch[1];

    // Extract annotations
    const annotations = extractAnnotations(content);
    
    // Determine class type based on annotations
    let classType: 'controller' | 'service' | 'repository' | 'entity' | 'component' | 'configuration' | 'other' = 'other';
    
    if (annotations.some(a => a.includes('@Controller') || a.includes('@RestController'))) {
      classType = 'controller';
    } else if (annotations.includes('@Service')) {
      classType = 'service';
    } else if (annotations.includes('@Repository')) {
      classType = 'repository';
    } else if (annotations.includes('@Entity')) {
      classType = 'entity';
    } else if (annotations.includes('@Component')) {
      classType = 'component';
    } else if (annotations.includes('@Configuration')) {
      classType = 'configuration';
    }

    // Extract methods
    const methods = extractMethods(content);
    
    // Extract fields
    const fields = extractFields(content);
    
    // Extract inheritance
    const extendsMatch = content.match(/class\s+\w+\s+extends\s+(\w+)/);
    const implementsMatch = content.match(/class\s+\w+.*?implements\s+([^{]+)/);
    
    return {
      name: className,
      package: packageName,
      type: classType,
      annotations,
      methods,
      fields,
      extends: extendsMatch ? extendsMatch[1] : undefined,
      implements: implementsMatch ? implementsMatch[1].split(',').map(i => i.trim()) : [],
    };
  } catch (error) {
    console.error(`Error parsing class in ${filePath}:`, error);
    return null;
  }
}

function extractAnnotations(content: string): string[] {
  const annotations: string[] = [];
  const annotationRegex = /@(\w+)(\([^)]*\))?/g;
  let match;
  
  while ((match = annotationRegex.exec(content)) !== null) {
    // Include the full annotation with parameters if present
    const fullAnnotation = `@${match[1]}${match[2] || ''}`;
    annotations.push(fullAnnotation);
  }
  
  return Array.from(new Set(annotations)); // Remove duplicates
}

function extractMethods(content: string): AnalysisData['classes'][0]['methods'] {
  const methods: AnalysisData['classes'][0]['methods'] = [];
  
  // Simple regex to match method declarations
  const methodRegex = /(?:@\w+(?:\([^)]*\))?\s+)*(?:public|private|protected)?\s*(?:static\s+)?(?:final\s+)?(\w+(?:<[^>]+>)?)\s+(\w+)\s*\(([^)]*)\)/g;
  let match;
  
  while ((match = methodRegex.exec(content)) !== null) {
    const returnType = match[1];
    const methodName = match[2];
    const parametersStr = match[3];
    
    // Extract method annotations (look backwards from method)
    const methodStart = match.index;
    const beforeMethod = content.substring(Math.max(0, methodStart - 1000), methodStart);
    const methodAnnotations = extractAnnotations(beforeMethod);
    
    // Parse parameters
    const parameters = parametersStr
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .map(p => {
        const parts = p.split(/\s+/);
        return parts[parts.length - 2] || p; // Get the type part
      });
    
    methods.push({
      name: methodName,
      annotations: methodAnnotations,
      parameters,
      returnType,
    });
  }
  
  return methods;
}

function extractFields(content: string): AnalysisData['classes'][0]['fields'] {
  const fields: AnalysisData['classes'][0]['fields'] = [];
  
  // Match field declarations
  const fieldRegex = /(?:@\w+(?:\([^)]*\))?\s+)*(?:private|public|protected)?\s*(?:static\s+)?(?:final\s+)?(\w+(?:<[^>]+>)?)\s+(\w+)\s*(?:=.*?)?;/g;
  let match;
  
  while ((match = fieldRegex.exec(content)) !== null) {
    const fieldType = match[1];
    const fieldName = match[2];
    
    // Extract field annotations (look backwards from field)
    const fieldStart = match.index;
    const beforeField = content.substring(Math.max(0, fieldStart - 100), fieldStart);
    const fieldAnnotations = extractAnnotations(beforeField);
    
    fields.push({
      name: fieldName,
      type: fieldType,
      annotations: fieldAnnotations,
    });
  }
  
  return fields;
}

function extractRelationships(classInfo: AnalysisData['classes'][0], content: string): AnalysisData['relationships'] {
  const relationships: AnalysisData['relationships'] = [];
  const className = classInfo.name;
  
  // Look for @Autowired fields and constructor injection
  classInfo.fields.forEach(field => {
    if (field.annotations.includes('@Autowired') || field.annotations.includes('@Inject')) {
      relationships.push({
        from: className,
        to: field.type,
        type: 'injects',
      });
    }
  });
  
  // Look for method calls (simple pattern matching)
  const methodCallRegex = /(\w+)\.(\w+)\s*\(/g;
  let match;
  
  while ((match = methodCallRegex.exec(content)) !== null) {
    const targetObject = match[1];
    const methodName = match[2];
    
    // Try to find if this is a field reference
    const field = classInfo.fields.find(f => f.name === targetObject);
    if (field) {
      relationships.push({
        from: className,
        to: field.type,
        type: 'calls',
        method: methodName,
      });
    }
  }
  
  // Handle inheritance
  if (classInfo.extends) {
    relationships.push({
      from: className,
      to: classInfo.extends,
      type: 'extends',
    });
  }
  
  classInfo.implements.forEach(interfaceName => {
    relationships.push({
      from: className,
      to: interfaceName,
      type: 'implements',
    });
  });
  
  return relationships;
}

function extractEntityInfo(classInfo: AnalysisData['classes'][0]): AnalysisData['entities'][0] | null {
  // Extract table name from @Table annotation
  let tableName = classInfo.name.toLowerCase();
  
  const tableAnnotation = classInfo.annotations.find(a => a.includes('@Table'));
  if (tableAnnotation) {
    const nameMatch = tableAnnotation.match(/name\s*=\s*"([^"]+)"/);
    if (nameMatch) {
      tableName = nameMatch[1];
    }
  }
  
  // Process fields to identify relationships
  const entityFields = classInfo.fields.map(field => {
    let relationship: string | undefined;
    let targetEntity: string | undefined;
    let columnName = field.name;
    
    // Check for JPA relationship annotations
    if (field.annotations.some(a => a.includes('@OneToMany'))) {
      relationship = 'OneToMany';
      // Try to extract target entity
      const targetMatch = field.annotations.find(a => a.includes('@OneToMany'))?.match(/targetEntity\s*=\s*(\w+)/);
      targetEntity = targetMatch ? targetMatch[1] : undefined;
    } else if (field.annotations.some(a => a.includes('@ManyToOne'))) {
      relationship = 'ManyToOne';
    } else if (field.annotations.some(a => a.includes('@OneToOne'))) {
      relationship = 'OneToOne';
    } else if (field.annotations.some(a => a.includes('@ManyToMany'))) {
      relationship = 'ManyToMany';
    }
    
    // Check for @Column annotation
    const columnAnnotation = field.annotations.find(a => a.includes('@Column'));
    if (columnAnnotation) {
      const nameMatch = columnAnnotation.match(/name\s*=\s*"([^"]+)"/);
      if (nameMatch) {
        columnName = nameMatch[1];
      }
    }
    
    return {
      name: field.name,
      type: field.type,
      columnName,
      relationship,
      targetEntity,
    };
  });
  
  return {
    name: classInfo.name,
    tableName,
    fields: entityFields,
  };
}

function detectPatterns(classes: AnalysisData['classes']): AnalysisData['patterns'] {
  const patterns: AnalysisData['patterns'] = [];
  
  // Detect Spring MVC pattern
  const controllers = classes.filter(c => c.type === 'controller');
  const services = classes.filter(c => c.type === 'service');
  const repositories = classes.filter(c => c.type === 'repository');
  
  if (controllers.length > 0 && services.length > 0 && repositories.length > 0) {
    patterns.push({
      name: 'Spring MVC',
      type: 'Architectural Pattern',
      classes: [...controllers.map(c => c.name), ...services.map(c => c.name), ...repositories.map(c => c.name)],
      description: 'Model-View-Controller pattern with Spring Framework'
    });
  }
  
  // Detect JPA/Hibernate pattern
  const entities = classes.filter(c => c.type === 'entity');
  if (entities.length > 0) {
    patterns.push({
      name: 'JPA/Hibernate ORM',
      type: 'Data Access Pattern',
      classes: entities.map(c => c.name),
      description: 'Object-Relational Mapping with JPA entities'
    });
  }
  
  // Detect Dependency Injection pattern
  const autowiredClasses = classes.filter(c => 
    c.fields.some(f => f.annotations.includes('@Autowired'))
  );
  
  if (autowiredClasses.length > 0) {
    patterns.push({
      name: 'Dependency Injection',
      type: 'Design Pattern',
      classes: autowiredClasses.map(c => c.name),
      description: 'Inversion of Control with Spring dependency injection'
    });
  }
  
  return patterns;
}
