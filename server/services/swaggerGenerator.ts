import swaggerJSDoc from 'swagger-jsdoc';
import { type AnalysisData } from '@shared/schema';

export interface SwaggerDocumentation {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  paths: Record<string, any>;
  components: {
    schemas: Record<string, any>;
    securitySchemes?: Record<string, any>;
  };
  tags: Array<{
    name: string;
    description: string;
  }>;
}

export interface RequestMapping {
  httpMethod: string;
  endpoint: string;
  controllerClass: string;
  controllerMethod: string;
  serviceCalled?: string;
  serviceMethod?: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    location: 'path' | 'query' | 'body' | 'header';
  }>;
  responseType: string;
  description: string;
  javadoc?: string;
  requestBody?: string;
  responseBody?: string;
  statusCodes: Array<{
    code: number;
    description: string;
  }>;
  authRequired: boolean;
}

export interface MethodComment {
  className: string;
  methodName: string;
  javadoc: string;
  parameters: Array<{
    name: string;
    type: string;
    description: string;
  }>;
  returnType: string;
  returnDescription: string;
  author?: string;
  since?: string;
  deprecated?: boolean;
  throws?: Array<{
    exception: string;
    description: string;
  }>;
}

export interface TechnologySummary {
  framework: string;
  version?: string;
  dependencies: Array<{
    name: string;
    version?: string;
    scope: string;
    description: string;
  }>;
  patterns: string[];
  architecture: string;
  buildTool: string;
  javaVersion?: string;
  testingFrameworks: string[];
  databases: string[];
  securityFrameworks: string[];
  webFrameworks: string[];
}

export class SwaggerGenerator {
  
  generateSwaggerDocumentation(
    analysisData: AnalysisData,
    projectName: string,
    requestMappings: RequestMapping[]
  ): SwaggerDocumentation {
    const controllers = analysisData.classes.filter(c => c.type === 'controller');
    const entities = analysisData.classes.filter(c => c.type === 'entity');

    const paths: Record<string, any> = {};
    const schemas: Record<string, any> = {};
    const tags = this.generateTags(controllers);

    // Generate paths from request mappings
    requestMappings.forEach(mapping => {
      const pathKey = mapping.endpoint.replace(/{(\w+)}/g, '{$1}');
      
      if (!paths[pathKey]) {
        paths[pathKey] = {};
      }

      paths[pathKey][mapping.httpMethod.toLowerCase()] = {
        tags: [this.extractControllerTag(mapping.controllerClass)],
        summary: mapping.description,
        description: mapping.javadoc || mapping.description,
        operationId: `${mapping.controllerMethod}_${mapping.httpMethod}`,
        parameters: this.generateParameters(mapping.parameters),
        responses: this.generateResponses(mapping.responseType),
        ...(mapping.httpMethod.toLowerCase() === 'post' || mapping.httpMethod.toLowerCase() === 'put' ? {
          requestBody: this.generateRequestBody(mapping.parameters)
        } : {})
      };
    });

    // Generate schemas from entities
    entities.forEach(entity => {
      schemas[entity.name] = this.generateEntitySchema(entity);
    });

    return {
      openapi: '3.0.0',
      info: {
        title: `${projectName} API Documentation`,
        version: '1.0.0',
        description: `Comprehensive API documentation for ${projectName} generated from source code analysis.`
      },
      servers: [
        {
          url: 'http://localhost:8080',
          description: 'Development server'
        },
        {
          url: 'https://api.example.com',
          description: 'Production server'
        }
      ],
      paths,
      components: {
        schemas,
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          },
          basicAuth: {
            type: 'http',
            scheme: 'basic'
          }
        }
      },
      tags
    };
  }

  extractRequestMappings(analysisData: AnalysisData): RequestMapping[] {
    const mappings: RequestMapping[] = [];
    const controllers = analysisData.classes.filter(c => c.type === 'controller');

    console.log('[SwaggerGenerator] Found controllers:', controllers.length);
    
    controllers.forEach(controller => {
      console.log('[SwaggerGenerator] Processing controller:', controller.name, 'annotations:', controller.annotations);
      const baseMapping = this.extractBaseMapping(controller);
      console.log('[SwaggerGenerator] Base mapping:', baseMapping);
      
      controller.methods.forEach(method => {
        console.log('[SwaggerGenerator] Processing method:', method.name, 'annotations:', method.annotations);
        const mapping = this.extractMethodMapping(method, controller, baseMapping);
        if (mapping) {
          mappings.push(mapping);
        }
      });
    });

    console.log('[SwaggerGenerator] Total mappings extracted:', mappings.length);
    return mappings;
  }

  extractMethodComments(analysisData: AnalysisData): MethodComment[] {
    const comments: MethodComment[] = [];
    const controllersAndServices = analysisData.classes.filter(
      c => c.type === 'controller' || c.type === 'service'
    );

    controllersAndServices.forEach(classData => {
      classData.methods.forEach(method => {
        const comment = this.extractJavaDoc(method, classData.name);
        if (comment) {
          comments.push(comment);
        }
      });
    });

    return comments;
  }

  generateTechnologySummary(analysisData: AnalysisData): TechnologySummary {
    const patterns = this.identifyPatterns(analysisData);
    const dependencies = this.identifyDependencies(analysisData);
    
    return {
      framework: this.identifyFramework(analysisData),
      dependencies,
      patterns,
      architecture: this.identifyArchitecture(analysisData),
      buildTool: this.identifyBuildTool(analysisData),
      javaVersion: this.identifyJavaVersion(analysisData),
      testingFrameworks: this.identifyTestingFrameworks(analysisData),
      databases: this.identifyDatabases(analysisData),
      securityFrameworks: this.identifySecurityFrameworks(analysisData),
      webFrameworks: this.identifyWebFrameworks(analysisData)
    };
  }

  private generateTags(controllers: any[]): Array<{ name: string; description: string }> {
    return controllers.map(controller => ({
      name: this.extractControllerTag(controller.name),
      description: `Operations related to ${controller.name.replace('Controller', '')} management`
    }));
  }

  private extractControllerTag(controllerName: string): string {
    return controllerName.replace('Controller', '').toLowerCase();
  }

  private generateParameters(parameters: RequestMapping['parameters']): any[] {
    return parameters
      .filter(p => p.location !== 'body')
      .map(param => ({
        name: param.name,
        in: param.location,
        required: param.required,
        description: param.description,
        schema: {
          type: this.mapJavaTypeToOpenAPI(param.type)
        }
      }));
  }

  private generateRequestBody(parameters: RequestMapping['parameters']): any {
    const bodyParams = parameters.filter(p => p.location === 'body');
    
    if (bodyParams.length === 0) return undefined;

    return {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: bodyParams.reduce((acc, param) => {
              acc[param.name] = {
                type: this.mapJavaTypeToOpenAPI(param.type),
                description: param.description
              };
              return acc;
            }, {} as any)
          }
        }
      }
    };
  }

  private generateResponses(responseType: string): any {
    return {
      '200': {
        description: 'Successful operation',
        content: {
          'application/json': {
            schema: this.generateResponseSchema(responseType)
          }
        }
      },
      '400': {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: { type: 'string' },
                message: { type: 'string' }
              }
            }
          }
        }
      },
      '500': {
        description: 'Internal server error'
      }
    };
  }

  private generateResponseSchema(responseType: string): any {
    if (responseType.includes('List') || responseType.includes('[]')) {
      const itemType = responseType.replace(/List<|>|\[\]/g, '');
      return {
        type: 'array',
        items: {
          $ref: `#/components/schemas/${itemType}`
        }
      };
    }

    if (this.isPrimitiveType(responseType)) {
      return {
        type: this.mapJavaTypeToOpenAPI(responseType)
      };
    }

    return {
      $ref: `#/components/schemas/${responseType}`
    };
  }

  private generateEntitySchema(entity: any): any {
    const properties: any = {};
    const required: string[] = [];

    entity.fields.forEach((field: any) => {
      properties[field.name] = {
        type: this.mapJavaTypeToOpenAPI(field.type),
        description: this.generateFieldDescription(field)
      };

      if (this.isRequiredField(field)) {
        required.push(field.name);
      }
    });

    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined
    };
  }

  private extractBaseMapping(controller: any): string {
    // Look specifically for @RequestMapping first (not @RestController)
    const requestMapping = controller.annotations?.find((a: string) => 
      a.startsWith('@RequestMapping')
    );
    
    if (requestMapping) {
      // Try named parameters first: value="/path" or path="/path"
      const namedMatch = requestMapping.match(/(?:value|path)\s*=\s*["']([^"']+)["']/);
      if (namedMatch) return namedMatch[1];
      
      // Try shorthand form: @RequestMapping("/path")
      const shorthandMatch = requestMapping.match(/\(["']([^"']+)["']\)/);
      if (shorthandMatch) return shorthandMatch[1];
    }
    
    return '';
  }

  private extractMethodMapping(method: any, controller: any, baseMapping: string): RequestMapping | null {
    const mappingAnnotations = method.annotations?.filter((a: string) => 
      a.includes('Mapping') && !a.includes('RequestMapping')
    ) || [];

    if (mappingAnnotations.length === 0) return null;

    const annotation = mappingAnnotations[0];
    const httpMethod = this.extractHttpMethod(annotation);
    const path = this.extractPath(annotation);
    const endpoint = `${baseMapping}${path}`.replace(/\/+/g, '/');

    console.log('[SwaggerGenerator] Extracted mapping:', {
      controller: controller.name,
      method: method.name,
      annotation,
      httpMethod,
      path,
      baseMapping,
      endpoint
    });

    const parameters = this.extractMethodParameters(method);
    const hasRequestBody = parameters.some(p => p.location === 'body');
    const responseType = method.returnType || 'void';

    return {
      httpMethod,
      endpoint,
      controllerClass: controller.name,
      controllerMethod: method.name,
      serviceCalled: this.findServiceCall(method, controller),
      parameters,
      responseType,
      description: this.generateMethodDescription(method, httpMethod),
      javadoc: this.extractMethodJavaDoc(method),
      requestBody: hasRequestBody ? JSON.stringify({ [method.name]: "request data" }, null, 2) : undefined,
      responseBody: responseType !== 'void' ? JSON.stringify({ type: responseType }, null, 2) : undefined,
      statusCodes: [
        { code: 200, description: "Success" },
        { code: 400, description: "Bad Request" },
        { code: 401, description: "Unauthorized" },
        { code: 500, description: "Internal Server Error" }
      ],
      authRequired: true
    };
  }

  private extractHttpMethod(annotation: string): string {
    if (annotation.includes('GetMapping')) return 'GET';
    if (annotation.includes('PostMapping')) return 'POST';
    if (annotation.includes('PutMapping')) return 'PUT';
    if (annotation.includes('DeleteMapping')) return 'DELETE';
    if (annotation.includes('PatchMapping')) return 'PATCH';
    return 'GET';
  }

  private extractPath(annotation: string): string {
    // Try named parameters first: value="/path" or path="/path"
    const namedMatch = annotation.match(/(?:value|path)\s*=\s*["']([^"']+)["']/);
    if (namedMatch) return namedMatch[1];
    
    // Try shorthand form: @GetMapping("/path")
    const shorthandMatch = annotation.match(/\(["']([^"']+)["']\)/);
    if (shorthandMatch) return shorthandMatch[1];
    
    return '';
  }

  private extractMethodParameters(method: any): RequestMapping['parameters'] {
    return method.parameters?.map((param: string) => {
      const [type, name] = param.split(' ').slice(-2);
      return {
        name: name || 'param',
        type: type || 'String',
        required: !param.includes('@RequestParam') || !param.includes('required=false'),
        description: `${name} parameter`,
        location: this.determineParameterLocation(param)
      };
    }) || [];
  }

  private determineParameterLocation(param: string): 'path' | 'query' | 'body' | 'header' {
    if (param.includes('@PathVariable')) return 'path';
    if (param.includes('@RequestHeader')) return 'header';
    if (param.includes('@RequestBody')) return 'body';
    return 'query';
  }

  private extractJavaDoc(method: any, className: string): MethodComment | null {
    // This would ideally parse actual JavaDoc comments from source files
    // For now, we'll generate placeholder documentation
    return {
      className,
      methodName: method.name,
      javadoc: `${method.name} method in ${className}`,
      parameters: method.parameters?.map((param: string) => ({
        name: param.split(' ').pop() || 'param',
        type: param.split(' ')[0] || 'Object',
        description: `Parameter ${param.split(' ').pop()}`
      })) || [],
      returnType: method.returnType || 'void',
      returnDescription: `Returns ${method.returnType || 'nothing'}`
    };
  }

  private identifyFramework(analysisData: AnalysisData): string {
    const annotations = this.getAllAnnotations(analysisData);
    
    if (annotations.some(a => a.includes('SpringBoot') || a.includes('RestController'))) {
      return 'Spring Boot';
    }
    if (annotations.some(a => a.includes('Entity') && a.includes('javax.persistence'))) {
      return 'Spring Framework with JPA';
    }
    return 'Java Application';
  }

  private identifyPatterns(analysisData: AnalysisData): string[] {
    const patterns: string[] = [];
    const hasControllers = analysisData.classes.some(c => c.type === 'controller');
    const hasServices = analysisData.classes.some(c => c.type === 'service');
    const hasRepositories = analysisData.classes.some(c => c.type === 'repository');
    const hasEntities = analysisData.classes.some(c => c.type === 'entity');

    if (hasControllers && hasServices && hasRepositories) {
      patterns.push('Layered Architecture');
      patterns.push('MVC Pattern');
    }
    if (hasRepositories) {
      patterns.push('Repository Pattern');
    }
    if (hasServices) {
      patterns.push('Service Layer Pattern');
    }
    if (hasEntities) {
      patterns.push('Domain Model Pattern');
    }

    return patterns;
  }

  private identifyDependencies(analysisData: AnalysisData): TechnologySummary['dependencies'] {
    // This would ideally parse pom.xml or build.gradle files
    return [
      {
        name: 'Spring Boot Starter Web',
        scope: 'compile',
        description: 'Web application framework'
      },
      {
        name: 'Spring Data JPA',
        scope: 'compile', 
        description: 'Data access framework'
      },
      {
        name: 'Hibernate Validator',
        scope: 'compile',
        description: 'Bean validation framework'
      }
    ];
  }

  private identifyArchitecture(analysisData: AnalysisData): string {
    const hasControllers = analysisData.classes.some(c => c.type === 'controller');
    const hasServices = analysisData.classes.some(c => c.type === 'service');
    const hasRepositories = analysisData.classes.some(c => c.type === 'repository');

    if (hasControllers && hasServices && hasRepositories) {
      return 'Layered Architecture (Controller-Service-Repository)';
    }
    if (hasControllers) {
      return 'Web-based Architecture';
    }
    return 'Modular Architecture';
  }

  private identifyBuildTool(analysisData: AnalysisData): string {
    // This would check for pom.xml or build.gradle
    return 'Maven'; // Default assumption
  }

  private identifyJavaVersion(analysisData: AnalysisData): string {
    return '11'; // Default assumption
  }

  private identifyTestingFrameworks(analysisData: AnalysisData): string[] {
    return ['JUnit 5', 'Mockito'];
  }

  private identifyDatabases(analysisData: AnalysisData): string[] {
    const hasEntities = analysisData.classes.some(c => c.type === 'entity');
    return hasEntities ? ['H2 Database', 'MySQL'] : [];
  }

  private identifySecurityFrameworks(analysisData: AnalysisData): string[] {
    return ['Spring Security'];
  }

  private identifyWebFrameworks(analysisData: AnalysisData): string[] {
    const hasControllers = analysisData.classes.some(c => c.type === 'controller');
    return hasControllers ? ['Spring Web MVC'] : [];
  }

  private getAllAnnotations(analysisData: AnalysisData): string[] {
    const allAnnotations: string[] = [];
    
    analysisData.classes.forEach(cls => {
      allAnnotations.push(...(cls.annotations || []));
      cls.methods.forEach(method => {
        allAnnotations.push(...(method.annotations || []));
      });
      cls.fields.forEach(field => {
        allAnnotations.push(...(field.annotations || []));
      });
    });

    return allAnnotations;
  }

  private mapJavaTypeToOpenAPI(javaType: string): string {
    const typeMap: Record<string, string> = {
      'String': 'string',
      'Integer': 'integer',
      'int': 'integer',
      'Long': 'integer',
      'long': 'integer',
      'Double': 'number',
      'double': 'number',
      'Float': 'number',
      'float': 'number',
      'Boolean': 'boolean',
      'boolean': 'boolean',
      'Date': 'string',
      'LocalDate': 'string',
      'LocalDateTime': 'string'
    };

    return typeMap[javaType] || 'object';
  }

  private isPrimitiveType(type: string): boolean {
    const primitives = ['String', 'Integer', 'int', 'Long', 'long', 'Double', 'double', 'Float', 'float', 'Boolean', 'boolean'];
    return primitives.includes(type);
  }

  private generateFieldDescription(field: any): string {
    const annotations = field.annotations || [];
    
    if (annotations.some((a: string) => a.includes('Id'))) {
      return 'Unique identifier';
    }
    if (annotations.some((a: string) => a.includes('Email'))) {
      return 'Email address';
    }
    if (annotations.some((a: string) => a.includes('NotNull'))) {
      return 'Required field';
    }
    
    return `${field.name} field`;
  }

  private isRequiredField(field: any): boolean {
    const annotations = field.annotations || [];
    return annotations.some((a: string) => a.includes('NotNull') || a.includes('Id'));
  }

  private generateMethodDescription(method: any, httpMethod: string): string {
    const name = method.name.toLowerCase();
    
    switch (httpMethod) {
      case 'GET':
        return `Retrieve ${name.replace(/^get|^find/, '')} data`;
      case 'POST':
        return `Create new ${name.replace(/^create|^add/, '')} resource`;
      case 'PUT':
        return `Update existing ${name.replace(/^update|^modify/, '')} resource`;
      case 'DELETE':
        return `Delete ${name.replace(/^delete|^remove/, '')} resource`;
      default:
        return `${method.name} operation`;
    }
  }

  private extractMethodJavaDoc(method: any): string {
    // This would ideally extract actual JavaDoc from source files
    return `Documentation for ${method.name} method`;
  }

  private findServiceCall(method: any, controller: any): string | undefined {
    // This would analyze method body to find service method calls
    // For now, return a placeholder
    return undefined;
  }
}

export const swaggerGenerator = new SwaggerGenerator();