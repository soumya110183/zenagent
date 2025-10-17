import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Settings, 
  Scan, 
  FileSearch,
  Plus,
  Download,
  Filter,
  CheckCircle,
  XCircle
} from "lucide-react";
import DemographicScanTab from "@/components/demographic-scan-tab";

export default function DemographicScanPage() {
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Fetch demographic patterns
  const { data: patternsData } = useQuery({
    queryKey: ['/api/demographic/patterns'],
  });

  const { data: projectsData } = useQuery({
    queryKey: ['/api/projects'],
  });

  const patterns = patternsData?.patterns || [];
  const projects = projectsData || [];

  // Group patterns by category
  const groupedPatterns = patterns.reduce((acc: any, pattern: any) => {
    if (!acc[pattern.category]) {
      acc[pattern.category] = [];
    }
    acc[pattern.category].push(pattern);
    return acc;
  }, {});

  const categories = Object.keys(groupedPatterns);
  const totalFields = patterns.length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
              <Database className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Demographic Field Scanner</h1>
              <p className="text-muted-foreground mt-1">
                Scan repositories for demographic data fields with {totalFields} customizable patterns across {categories.length} categories
              </p>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white" data-testid="button-download-patterns">
            <Download className="w-4 h-4 mr-2" />
            Export Patterns
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Fields</p>
                <p className="text-3xl font-bold text-blue-600">{totalFields}</p>
              </div>
              <FileSearch className="w-10 h-10 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-3xl font-bold text-green-600">{categories.length}</p>
              </div>
              <Filter className="w-10 h-10 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Patterns</p>
                <p className="text-3xl font-bold text-purple-600">
                  {patterns.reduce((sum: number, p: any) => sum + p.patternCount, 0)}
                </p>
              </div>
              <Settings className="w-10 h-10 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Projects</p>
                <p className="text-3xl font-bold text-orange-600">{projects.length}</p>
              </div>
              <Scan className="w-10 h-10 text-orange-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="patterns" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="patterns" data-testid="tab-patterns">
            <Settings className="w-4 h-4 mr-2" />
            Field Patterns
          </TabsTrigger>
          <TabsTrigger value="scan" data-testid="tab-scan">
            <Scan className="w-4 h-4 mr-2" />
            Scan Projects
          </TabsTrigger>
        </TabsList>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="mt-6">
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle>Demographic Field Patterns Configuration</CardTitle>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="button-add-pattern">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Field
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {categories.map((category) => (
                  <div key={category} className="border rounded-lg p-6 bg-muted/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          category === 'Name' ? 'bg-blue-500' :
                          category === 'Personal' ? 'bg-green-500' :
                          category === 'Address' ? 'bg-purple-500' :
                          category === 'Phone' ? 'bg-orange-500' :
                          category === 'Email' ? 'bg-pink-500' :
                          'bg-gray-500'
                        }`} />
                        <h3 className="text-xl font-semibold">{category} Fields</h3>
                        <Badge variant="secondary">{groupedPatterns[category].length} fields</Badge>
                      </div>
                      <Button variant="ghost" size="sm" data-testid={`button-expand-${category.toLowerCase()}`}>
                        View Details
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {groupedPatterns[category].map((pattern: any, idx: number) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
                          data-testid={`pattern-${pattern.fieldName.replace(/\s/g, '-').toLowerCase()}`}
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{pattern.fieldName}</p>
                              <p className="text-xs text-muted-foreground truncate">{pattern.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-3">
                            <Badge variant="outline" className="text-xs">
                              {pattern.patternCount} patterns
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pattern Examples */}
              <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                  <FileSearch className="w-5 h-5 mr-2" />
                  Pattern Matching Examples
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <span className="font-medium">Date of Birth</span> matches: <code className="text-xs bg-white dark:bg-gray-800 px-2 py-0.5 rounded">dob</code>, <code className="text-xs bg-white dark:bg-gray-800 px-2 py-0.5 rounded">dateOfBirth</code>, <code className="text-xs bg-white dark:bg-gray-800 px-2 py-0.5 rounded">birth_date</code>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <span className="font-medium">Home Address</span> matches: <code className="text-xs bg-white dark:bg-gray-800 px-2 py-0.5 rounded">homeAddress</code>, <code className="text-xs bg-white dark:bg-gray-800 px-2 py-0.5 rounded">home_address</code>, <code className="text-xs bg-white dark:bg-gray-800 px-2 py-0.5 rounded">residentialAddress</code>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <span className="font-medium">Mobile Phone</span> matches: <code className="text-xs bg-white dark:bg-gray-800 px-2 py-0.5 rounded">mobilePhone</code>, <code className="text-xs bg-white dark:bg-gray-800 px-2 py-0.5 rounded">cellPhone</code>, <code className="text-xs bg-white dark:bg-gray-800 px-2 py-0.5 rounded">mobile_number</code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scan Tab */}
        <TabsContent value="scan" className="mt-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Scan Projects for Demographic Fields</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Project Selection */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Select a Project to Scan</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {projects.length > 0 ? (
                      projects.map((project: any) => (
                        <div
                          key={project.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-all ${
                            selectedProject === project.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                              : 'border-border hover:border-blue-300 hover:bg-muted'
                          }`}
                          onClick={() => setSelectedProject(project.id)}
                          data-testid={`project-${project.id}`}
                        >
                          <div className="flex items-center space-x-3">
                            <Database className="w-5 h-5 text-blue-600" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{project.name}</p>
                              <p className="text-xs text-muted-foreground">Click to scan</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-8">
                        <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-muted-foreground">No projects available. Please analyze a repository first.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Scan Results */}
                {selectedProject && (
                  <div className="mt-6 border-t pt-6">
                    <DemographicScanTab projectId={selectedProject} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
