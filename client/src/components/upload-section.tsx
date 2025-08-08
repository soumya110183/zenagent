import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Project } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileArchive, FolderOpen, ChartGantt, Table, Database, Github } from "lucide-react";
import GithubInput from "@/components/github-input";

interface UploadSectionProps {
  onFileUploaded: (project: Project) => void;
}

export default function UploadSection({ onFileUploaded }: UploadSectionProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      console.log('Uploading file:', file.name, file.size, file.type);
      const formData = new FormData();
      formData.append('zipFile', file);
      
      // Use fetch directly to avoid JSON content-type header issues with FormData
      const response = await fetch('/api/projects/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (project: Project) => {
      toast({
        title: "Upload Successful",
        description: "Your Java project is being analyzed...",
      });
      onFileUploaded(project);
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip')) {
        uploadMutation.mutate(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a ZIP file containing Java source code.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      uploadMutation.mutate(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome Card */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="text-2xl text-primary w-8 h-8" />
            </div>
            <h2 className="text-2xl font-medium text-foreground mb-2">Analyze Your Java Project</h2>
            <p className="text-muted-foreground mb-6">
              Upload a ZIP file containing your Java project to visualize its architecture, dependencies, and relationships.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Input Methods Tabs */}
      <Card>
        <Tabs defaultValue="upload" className="w-full">
          <div className="border-b border-border">
            <TabsList className="h-auto p-0 bg-transparent w-full justify-start">
              <TabsTrigger value="upload" className="flex items-center space-x-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                <Upload className="w-4 h-4" />
                <span>Upload ZIP File</span>
              </TabsTrigger>
              <TabsTrigger value="github" className="flex items-center space-x-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
                <Github className="w-4 h-4" />
                <span>GitHub Repository</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upload" className="mt-0">
            <CardContent className="p-8">
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? 'border-primary bg-blue-50'
                    : 'border-gray-300 hover:border-primary'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <FileArchive className="text-3xl text-gray-400 w-12 h-12" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Drop your Java project ZIP file here
                    </h3>
                    <p className="text-muted-foreground mb-4">or click to browse and select a file</p>
                    <Button disabled={uploadMutation.isPending}>
                      <FolderOpen className="mr-2 w-4 h-4" />
                      Browse Files
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Supported: .zip files containing Java source code</p>
                    <p>Maximum file size: 50MB</p>
                  </div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={handleFileInput}
                className="hidden"
                disabled={uploadMutation.isPending}
              />
            </CardContent>
          </TabsContent>

          <TabsContent value="github" className="mt-0">
            <CardContent className="p-8">
              <GithubInput onRepoAnalyzed={onFileUploaded} />
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Features Overview */}
      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <ChartGantt className="text-xl text-primary w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium mb-2">Flow Analysis</h3>
            <p className="text-muted-foreground text-sm">
              Visualize Controller → Service → Repository patterns and method call flows.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Table className="text-xl text-accent w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium mb-2">Class Relationships</h3>
            <p className="text-muted-foreground text-sm">
              Generate interactive class diagrams showing inheritance and dependencies.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Database className="text-xl text-purple-600 w-6 h-6" />
            </div>
            <h3 className="text-lg font-medium mb-2">JPA Entity Mapping</h3>
            <p className="text-muted-foreground text-sm">
              Detect JPA entities and visualize database relationships automatically.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
