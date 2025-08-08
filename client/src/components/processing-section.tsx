import { type Project } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Loader2, Circle } from "lucide-react";

interface ProcessingSectionProps {
  project: Project;
}

export default function ProcessingSection({ project }: ProcessingSectionProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 className="text-2xl text-primary animate-spin-slow w-8 h-8" />
            </div>
            <h2 className="text-xl font-medium text-foreground mb-2">Processing Your Project</h2>
            <p className="text-muted-foreground mb-6">
              Analyzing Java source files and extracting architectural information...
            </p>
            
            <div className="w-full mb-6">
              <Progress value={65} className="h-2" />
            </div>
            
            <div className="text-left max-w-md mx-auto space-y-2">
              <div className="flex items-center text-sm">
                <CheckCircle className="text-accent mr-3 w-4 h-4" />
                <span className="text-muted-foreground">Extracting ZIP contents</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className="text-accent mr-3 w-4 h-4" />
                <span className="text-muted-foreground">Parsing Java source files</span>
              </div>
              <div className="flex items-center text-sm">
                <Loader2 className="text-primary mr-3 animate-spin w-4 h-4" />
                <span className="text-muted-foreground">Analyzing annotations and patterns</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Circle className="mr-3 text-xs w-4 h-4" />
                <span>Generating diagrams</span>
              </div>
            </div>
            
            <Button variant="ghost" className="mt-6 text-muted-foreground hover:text-foreground">
              Cancel Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
