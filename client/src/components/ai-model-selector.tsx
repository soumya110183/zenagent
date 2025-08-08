import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Brain, Cloud, Server, Settings } from "lucide-react";

interface AIModelSelectorProps {
  onModelSelect: (config: AIModelConfig) => void;
  currentConfig?: AIModelConfig;
}

export interface AIModelConfig {
  type: 'openai' | 'local';
  openaiApiKey?: string;
  localEndpoint?: string;
  modelName?: string;
}

export default function AIModelSelector({ onModelSelect, currentConfig }: AIModelSelectorProps) {
  const [modelType, setModelType] = useState<'openai' | 'local'>(currentConfig?.type || 'openai');
  const [openaiApiKey, setOpenaiApiKey] = useState(currentConfig?.openaiApiKey || '');
  const [localEndpoint, setLocalEndpoint] = useState(currentConfig?.localEndpoint || 'http://localhost:11434');
  const [modelName, setModelName] = useState(currentConfig?.modelName || 'llama2');

  const handleSaveConfig = () => {
    const config: AIModelConfig = {
      type: modelType,
      ...(modelType === 'openai' && { openaiApiKey }),
      ...(modelType === 'local' && { localEndpoint, modelName })
    };
    onModelSelect(config);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <span>AI Model Configuration</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose between online OpenAI or local LLM for generating AI insights
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <RadioGroup value={modelType} onValueChange={(value) => setModelType(value as 'openai' | 'local')}>
          {/* OpenAI Option */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg">
            <RadioGroupItem value="openai" id="openai" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="openai" className="flex items-center space-x-2 cursor-pointer">
                <Cloud className="w-4 h-4 text-blue-600" />
                <span className="font-medium">OpenAI (Online)</span>
                <Badge variant="secondary" className="text-xs">Recommended</Badge>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Use OpenAI GPT-4o for high-quality analysis and insights
              </p>
              
              {modelType === 'openai' && (
                <div className="mt-3 space-y-2">
                  <Label htmlFor="openai-key" className="text-xs font-medium">API Key</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    placeholder="sk-..."
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your OpenAI API key for GPT-4o access
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Local LLM Option */}
          <div className="flex items-start space-x-3 p-4 border rounded-lg">
            <RadioGroupItem value="local" id="local" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="local" className="flex items-center space-x-2 cursor-pointer">
                <Server className="w-4 h-4 text-green-600" />
                <span className="font-medium">Local LLM</span>
                <Badge variant="outline" className="text-xs">Privacy Focused</Badge>
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Use local Ollama or other LLM server for private analysis
              </p>
              
              {modelType === 'local' && (
                <div className="mt-3 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="endpoint" className="text-xs font-medium">Local Endpoint</Label>
                    <Input
                      id="endpoint"
                      placeholder="http://localhost:11434"
                      value={localEndpoint}
                      onChange={(e) => setLocalEndpoint(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="model-name" className="text-xs font-medium">Model Name</Label>
                    <Input
                      id="model-name"
                      placeholder="llama2, codellama, etc."
                      value={modelName}
                      onChange={(e) => setModelName(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Ensure your local LLM server is running and accessible
                  </p>
                </div>
              )}
            </div>
          </div>
        </RadioGroup>

        <div className="pt-4 border-t">
          <Button onClick={handleSaveConfig} className="w-full">
            <Settings className="w-4 h-4 mr-2" />
            Save AI Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}