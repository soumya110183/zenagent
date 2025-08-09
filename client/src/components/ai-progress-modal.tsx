import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Bot, 
  Brain, 
  Code, 
  Database, 
  FileText, 
  Zap, 
  CheckCircle, 
  Circle, 
  Clock,
  Cpu,
  Server
} from "lucide-react";

interface AIProgressStep {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  timestamp?: Date;
  details?: string;
  model?: string;
}

interface AIProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: AIProgressStep[];
  currentStep: number;
  aiModel: string;
  estimatedTime?: number;
}

export default function AIProgressModal({
  isOpen,
  onClose,
  steps,
  currentStep,
  aiModel,
  estimatedTime = 30
}: AIProgressModalProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentStepDetails, setCurrentStepDetails] = useState<string>("");

  useEffect(() => {
    if (!isOpen) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (currentStep < steps.length && steps[currentStep]) {
      const step = steps[currentStep];
      if (step.status === 'running' && step.details) {
        setCurrentStepDetails(step.details);
      }
    }
  }, [currentStep, steps]);

  const getStepIcon = (step: AIProgressStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'running':
        return <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case 'error':
        return <Circle className="w-5 h-5 text-red-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getModelIcon = (model: string) => {
    if (model.includes('local') || model.includes('ollama')) {
      return <Server className="w-4 h-4 text-green-600" />;
    }
    return <Bot className="w-4 h-4 text-blue-600" />;
  };

  const progress = Math.min(100, (currentStep / Math.max(1, steps.length - 1)) * 100);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-blue-600" />
            <span>AI Analysis in Progress</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Model and Time Info */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2">
                  {getModelIcon(aiModel)}
                  <div>
                    <div className="font-medium text-sm">AI Model</div>
                    <div className="text-xs text-muted-foreground">{aiModel}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <div>
                    <div className="font-medium text-sm">Elapsed Time</div>
                    <div className="text-xs text-muted-foreground">
                      {formatTime(elapsedTime)} / ~{formatTime(estimatedTime)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Current Step Details */}
          {currentStepDetails && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-start space-x-2">
                  <Cpu className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <div className="font-medium text-sm text-blue-900">Current Process</div>
                    <div className="text-xs text-blue-700 mt-1">{currentStepDetails}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Steps List */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Analysis Steps</h3>
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 ${
                    step.status === 'running' 
                      ? 'bg-blue-50 border border-blue-200' 
                      : step.status === 'completed'
                      ? 'bg-green-50 border border-green-200'
                      : step.status === 'error'
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getStepIcon(step)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{step.label}</span>
                      <Badge 
                        variant={
                          step.status === 'completed' ? 'default' :
                          step.status === 'running' ? 'secondary' :
                          step.status === 'error' ? 'destructive' : 'outline'
                        }
                        className="text-xs"
                      >
                        {step.status}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                    
                    {step.timestamp && step.status === 'completed' && (
                      <p className="text-xs text-green-600 mt-1">
                        Completed at {step.timestamp.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <Card className="bg-gray-50">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-2">
                <Zap className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium text-sm">Processing Info</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    The AI is analyzing your codebase architecture, patterns, and relationships. 
                    {aiModel.includes('local') 
                      ? ' Processing locally for complete privacy.' 
                      : ' Using cloud AI for enhanced insights.'
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { AIProgressStep };