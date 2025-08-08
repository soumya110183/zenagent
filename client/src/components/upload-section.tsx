import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type Project } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileArchive, FolderOpen, ChartGantt, Table, Database, Github, Bot, Zap, FileCode } from "lucide-react";
import { SiPython, SiApachespark } from "react-icons/si";
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
        description: "Your project is being analyzed...",
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
          description: "Please upload a ZIP file containing source code.",
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
    <div className="space-y-8">
      {/* AI Agent Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
          <Bot className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to Analyze Your Code
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          I'll analyze your codebase and provide intelligent insights about architecture patterns, dependencies, and optimization opportunities. Choose your preferred method below.
        </p>
      </div>

      {/* Analysis Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4">
            <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI-Powered Analysis</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Advanced pattern recognition and intelligent insights powered by OpenAI GPT-4o
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg mb-4">
            <ChartGantt className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Interactive Diagrams</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Visual architecture diagrams with interactive exploration capabilities
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg mb-4">
            <FileCode className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Multi-Language Support</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Supports Java, Python, PySpark, and Mainframe codebases
          </p>
        </div>
      </div>

      {/* Input Methods Tabs */}
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <Tabs defaultValue="upload" className="w-full">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <TabsList className="h-auto p-0 bg-transparent w-full justify-start">
              <TabsTrigger value="upload" className="flex items-center space-x-2 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-6 py-4 text-gray-600 dark:text-gray-300 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                <Upload className="w-5 h-5" />
                <span className="font-medium">Upload ZIP File</span>
              </TabsTrigger>
              <TabsTrigger value="github" className="flex items-center space-x-2 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none px-6 py-4 text-gray-600 dark:text-gray-300 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400">
                <Github className="w-5 h-5" />
                <span className="font-medium">GitHub Repository</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upload" className="mt-0">
            <CardContent className="p-8">
              <div
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="space-y-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <FileArchive className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Drop your project ZIP file here
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">or click to browse and select a file</p>
                    <Button 
                      disabled={uploadMutation.isPending}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium px-8 py-3 rounded-lg shadow-lg transition-all duration-300"
                    >
                      {uploadMutation.isPending ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FolderOpen className="mr-2 w-5 h-5" />
                          Browse Files
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <p className="font-medium">✓ Supported: .zip files containing source code</p>
                      <p className="font-medium">✓ Maximum file size: 50MB</p>
                      <p className="font-medium">✓ Languages: Java, Python, PySpark, Mainframe</p>
                    </div>
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
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Github className="w-12 h-12 text-gray-600 dark:text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Connect GitHub Repository
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Analyze public repositories directly from GitHub
                </p>
              </div>
              <GithubInput onRepoAnalyzed={onFileUploaded} />
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}