import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, ImageRun, TableOfContents, PageBreak } from 'docx';
import html2canvas from 'html2canvas';
import { type Project, type AnalysisData } from '@shared/schema';
import zensarLogoPath from "@assets/zenlogo_1754679408998.png";

interface DOCExportOptions {
  project: Project;
  analysisData: AnalysisData;
  sonarAnalysis?: any;
  swaggerData?: any;
  comprehensiveData?: any;
  structureData?: any;
}

interface CapturedDiagram {
  type: string;
  imageData: Uint8Array;
  width: number;
  height: number;
}

export class DOCExportService {
  private async captureDiagram(type: string): Promise<CapturedDiagram | null> {
    try {
      // Trigger diagram type change - Radix UI uses data-value attribute
      const tabTrigger = document.querySelector(`[data-value="${type}"]`) as HTMLElement;
      if (tabTrigger) {
        tabTrigger.click();
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for diagram to render
      } else {
        console.warn(`Could not find tab trigger for diagram type: ${type}`);
      }

      const diagramElement = document.querySelector('.react-flow') as HTMLElement;
      if (diagramElement) {
        const canvas = await html2canvas(diagramElement, {
          backgroundColor: '#ffffff',
          scale: 2,
          width: 1200,
          height: 900
        });

        // Convert canvas to blob then to array buffer
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/png');
        });
        
        const arrayBuffer = await blob.arrayBuffer();
        const imageData = new Uint8Array(arrayBuffer);

        return {
          type,
          imageData,
          width: canvas.width,
          height: canvas.height
        };
      }
      return null;
    } catch (error) {
      console.error(`Failed to capture ${type} diagram:`, error);
      return null;
    }
  }

  async exportProjectAnalysis(options: DOCExportOptions): Promise<void> {
    try {
      const { project, analysisData, sonarAnalysis, swaggerData, comprehensiveData, structureData } = options;
      const aiInsights = analysisData.aiAnalysis;
      const projectDetails = aiInsights?.projectDetails;

      // Capture diagrams first
      console.log('Capturing diagrams...');
      const diagrams: CapturedDiagram[] = [];
      try {
        for (const type of ['flow', 'component', 'class']) {
          const diagram = await this.captureDiagram(type);
          if (diagram) {
            diagrams.push(diagram);
          }
        }
      } catch (diagramError) {
        console.warn('Some diagrams could not be captured:', diagramError);
      }

      console.log('Generating document...');

    // Get logo as base64
    let logoImage: Uint8Array | undefined;
    try {
      const response = await fetch(zensarLogoPath);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      logoImage = new Uint8Array(arrayBuffer);
    } catch (error) {
      console.log('Logo not available');
    }

    const controllers = analysisData.classes.filter((c: any) => c.type === 'controller');
    const services = analysisData.classes.filter((c: any) => c.type === 'service');
    const repositories = analysisData.classes.filter((c: any) => c.type === 'repository');
    const entities = analysisData.classes.filter((c: any) => c.type === 'entity');

    // Create document sections
    const sections: any[] = [];

    // Cover Page
    sections.push(
      new Paragraph({
        text: "",
        pageBreakBefore: false,
      }),
      new Paragraph({
        text: "",
        spacing: { before: 1000 },
      }),
      ...(logoImage ? [
        new Paragraph({
          children: [
            new ImageRun({
              data: logoImage,
              transformation: {
                width: 200,
                height: 75,
              },
              type: 'png',
            } as any),
          ],
          alignment: AlignmentType.RIGHT,
        }),
      ] : []),
      new Paragraph({
        text: "Project Analysis Document",
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { before: 1000, after: 400 },
      }),
      new Paragraph({
        text: project.name,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "Comprehensive Multi-Language Architecture Analysis",
            bold: true,
            size: 28,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
            italics: true,
            size: 20,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "Powered by Zengent AI - Enterprise Application Intelligence Platform",
            italics: true,
            size: 20,
            color: "666666",
          }),
        ],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: "",
        pageBreakBefore: true,
      }),
    );

    // Table of Contents
    sections.push(
      new Paragraph({
        text: "Table of Contents",
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 },
      }),
      new TableOfContents("Table of Contents", {
        hyperlink: true,
        headingStyleRange: "1-3",
      }),
      new Paragraph({
        text: "",
        pageBreakBefore: true,
      }),
    );

    // 1. Executive Summary
    sections.push(
      new Paragraph({
        text: "1. Executive Summary",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `This document provides a comprehensive analysis of the `,
          }),
          new TextRun({
            text: project.name,
            bold: true,
          }),
          new TextRun({
            text: ` project. The analysis includes architectural patterns, code structure, quality metrics, and visual diagrams to facilitate understanding and decision-making.`,
          }),
        ],
        spacing: { after: 200 },
      }),
    );

    // Project Statistics
    sections.push(
      new Paragraph({
        text: "Project Statistics",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 200 },
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "Metric", bold: true })] })],
                width: { size: 50, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: "Count", bold: true })] })],
                width: { size: 50, type: WidthType.PERCENTAGE },
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Source Files")] }),
              new TableCell({ children: [new Paragraph(analysisData.structure.sourceFiles.length.toString())] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Controllers")] }),
              new TableCell({ children: [new Paragraph(controllers.length.toString())] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Services")] }),
              new TableCell({ children: [new Paragraph(services.length.toString())] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Repositories")] }),
              new TableCell({ children: [new Paragraph(repositories.length.toString())] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Entities")] }),
              new TableCell({ children: [new Paragraph(entities.length.toString())] }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Dependencies")] }),
              new TableCell({ children: [new Paragraph(analysisData.dependencies.length.toString())] }),
            ],
          }),
        ],
      }),
    );

    // 2. Project Details
    if (projectDetails) {
      sections.push(
        new Paragraph({
          text: "",
          pageBreakBefore: true,
        }),
        new Paragraph({
          text: "2. Project Analysis Details",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          text: "Project Description",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          text: projectDetails.projectDescription,
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: "Project Type",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        new Paragraph({
          text: projectDetails.projectType,
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: "Implemented Features",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        ...projectDetails.implementedFeatures.map((feature: any) => 
          new Paragraph({
            text: `• ${feature}`,
            spacing: { after: 100 },
          })
        ),
        new Paragraph({
          text: "Modules or Services Covered",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
        ...projectDetails.modulesServices.map((module: any) => 
          new Paragraph({
            text: `• ${module}`,
            spacing: { after: 100 },
          })
        ),
      );
    }

    // 3. Architecture Analysis
    sections.push(
      new Paragraph({
        text: "",
        pageBreakBefore: true,
      }),
      new Paragraph({
        text: "3. Architecture Analysis",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
      }),
      new Paragraph({
        text: "Detected Patterns",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      ...analysisData.patterns.map((pattern: any) => 
        new Paragraph({
          children: [
            new TextRun({
              text: `${pattern.name}: `,
              bold: true,
            }),
            new TextRun({
              text: `${pattern.description} (${pattern.classes.length} classes)`,
            }),
          ],
          spacing: { after: 100 },
        })
      ),
    );

    // Annotations Found
    const annotations = analysisData.classes
      .flatMap((c: any) => c.annotations || [])
      .filter((a: string, i: number, arr: string[]) => arr.indexOf(a) === i); // unique
    
    sections.push(
      new Paragraph({
        text: "Annotations Found",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      })
    );
    
    if (annotations.length > 0) {
      sections.push(
        ...annotations.map((annotation: string) => 
          new Paragraph({
            text: `• ${annotation}`,
            spacing: { after: 50 },
          })
        )
      );
    } else {
      sections.push(
        new Paragraph({
          text: "No annotations found",
          spacing: { after: 100 },
        })
      );
    }

    // Components by Type
    sections.push(
      new Paragraph({
        text: "Components by Type",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
      new Paragraph({
        text: "Controllers",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 100, after: 100 },
      }),
      ...controllers.slice(0, 10).map((ctrl: any) => 
        new Paragraph({
          text: `• ${ctrl.name}`,
          spacing: { after: 50 },
        })
      ),
      new Paragraph({
        text: "Services",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 100, after: 100 },
      }),
      ...services.slice(0, 10).map((svc: any) => 
        new Paragraph({
          text: `• ${svc.name}`,
          spacing: { after: 50 },
        })
      ),
      new Paragraph({
        text: "Repositories",
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 100, after: 100 },
      }),
      ...repositories.slice(0, 10).map((repo: any) => 
        new Paragraph({
          text: `• ${repo.name}`,
          spacing: { after: 50 },
        })
      ),
    );

    // 4. Architecture Diagrams
    sections.push(
      new Paragraph({
        text: "",
        pageBreakBefore: true,
      }),
      new Paragraph({
        text: "4. Architecture Diagrams",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
      }),
      new Paragraph({
        text: "The following diagrams provide visual representations of the project architecture, showing the relationships between components, classes, and the overall flow of the application.",
        spacing: { after: 400 },
      }),
    );

    // Add captured diagrams
    for (const diagram of diagrams) {
      const diagramName = diagram.type.charAt(0).toUpperCase() + diagram.type.slice(1);
      sections.push(
        new Paragraph({
          text: `${diagramName} Diagram`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
          pageBreakBefore: true,
        }),
        new Paragraph({
          children: [
            new ImageRun({
              data: diagram.imageData,
              transformation: {
                width: 600,
                height: Math.floor((diagram.height * 600) / diagram.width),
              },
              type: 'png',
            } as any),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Figure: ${diagramName} diagram showing the architectural structure and relationships`,
              italics: true,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        }),
      );
    }

    // 5. Comprehensive Analysis Data
    if (comprehensiveData) {
      sections.push(
        new Paragraph({
          text: "",
          pageBreakBefore: true,
        }),
        new Paragraph({
          text: "5. Comprehensive Analysis",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          text: "Project Overview",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
      );

      if (comprehensiveData.projectOverview) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "File Count: ",
                bold: true,
              }),
              new TextRun({
                text: comprehensiveData.projectOverview.fileCount?.toString() || 'N/A',
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Description: ",
                bold: true,
              }),
              new TextRun({
                text: comprehensiveData.projectOverview.description || 'No description available',
              }),
            ],
            spacing: { after: 200 },
          }),
        );
      }

      // Modules
      if (comprehensiveData.modules && comprehensiveData.modules.length > 0) {
        sections.push(
          new Paragraph({
            text: "Identified Modules",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          ...comprehensiveData.modules.map((module: any) => 
            new Paragraph({
              children: [
                new TextRun({
                  text: `${module.name}: `,
                  bold: true,
                }),
                new TextRun({
                  text: module.description || 'No description',
                }),
              ],
              spacing: { after: 100 },
            })
          ),
        );
      }
    }

    // 6. Project Structure
    sections.push(
      new Paragraph({
        text: "",
        pageBreakBefore: true,
      }),
      new Paragraph({
        text: "6. Project Structure",
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
      }),
      new Paragraph({
        text: "This section provides an overview of the project's directory structure and organization.",
        spacing: { after: 200 },
      }),
    );

    if (structureData && structureData.structure) {
      const renderStructure = (item: any, level: number = 0): Paragraph[] => {
        const paragraphs: Paragraph[] = [];
        const indent = "  ".repeat(level);
        
        if (item.type === 'file') {
          paragraphs.push(
            new Paragraph({
              text: `${indent}📄 ${item.name}`,
              spacing: { after: 50 },
            })
          );
        } else if (item.type === 'directory') {
          paragraphs.push(
            new Paragraph({
              text: `${indent}📁 ${item.name}/`,
              spacing: { after: 50 },
            })
          );
          if (item.children && item.children.length > 0) {
            item.children.forEach((child: any) => {
              paragraphs.push(...renderStructure(child, level + 1));
            });
          }
        }
        
        return paragraphs;
      };

      sections.push(...renderStructure(structureData.structure).slice(0, 100)); // Limit to 100 items
    } else {
      sections.push(
        new Paragraph({
          text: "No structure data available",
          spacing: { after: 100 },
        })
      );
    }

    // 7. Code Quality Analysis
    if (sonarAnalysis) {
      sections.push(
        new Paragraph({
          text: "",
          pageBreakBefore: true,
        }),
        new Paragraph({
          text: "6. Code Quality Analysis",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          text: "This section contains automated code quality metrics and issue detection results from static code analysis.",
          spacing: { after: 400 },
        }),
      );

      if (sonarAnalysis.issues && sonarAnalysis.issues.length > 0) {
        sections.push(
          new Paragraph({
            text: "Identified Issues",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          ...sonarAnalysis.issues.slice(0, 20).map((issue: any) => 
            new Paragraph({
              children: [
                new TextRun({
                  text: `[${issue.severity}] `,
                  bold: true,
                }),
                new TextRun({
                  text: `${issue.message} - ${issue.component}`,
                }),
              ],
              spacing: { after: 100 },
            })
          ),
        );
      }
    }

    // 8. API Documentation
    if (swaggerData && swaggerData.paths) {
      sections.push(
        new Paragraph({
          text: "",
          pageBreakBefore: true,
        }),
        new Paragraph({
          text: "8. API Documentation",
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        }),
        new Paragraph({
          text: "API Endpoints",
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        }),
      );

      const endpoints = Object.entries(swaggerData.paths).slice(0, 20);
      for (const [path, methods] of endpoints) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: path,
                bold: true,
              }),
            ],
            spacing: { after: 50 },
          }),
        );
        
        for (const [method, details] of Object.entries(methods as any)) {
          sections.push(
            new Paragraph({
              text: `  ${method.toUpperCase()}: ${(details as any).summary || 'No description'}`,
              spacing: { after: 50 },
            }),
          );
        }
      }
    }

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: sections,
      }],
      title: `${project.name} - Project Analysis`,
      description: "Comprehensive project analysis generated by Zengent AI",
      creator: "Zengent AI - Enterprise Application Intelligence Platform",
    });

    // Generate and download
    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    link.href = url;
    link.download = `${project.name}-Comprehensive-Analysis-${timestamp}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    console.log('Document exported successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during document generation';
      console.error('Failed to export DOC:', errorMessage, error);
      throw new Error(`Failed to generate document: ${errorMessage}`);
    }
  }
}

export const docExportService = new DOCExportService();
