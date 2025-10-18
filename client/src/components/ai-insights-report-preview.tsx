import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, FileText, X, Brain, Lightbulb, Target, Award, CheckCircle2, Code } from "lucide-react";
import type { Project, AnalysisData } from "@shared/schema";
import { htmlExportService } from "@/services/htmlExportService";

interface AIInsightsReportPreviewProps {
  open: boolean;
  onClose: () => void;
  project: Project;
}

// Utility function to clean markdown and format text properly
const cleanMarkdown = (text: string): string => {
  if (!text) return '';
  
  return text
    // Remove bold markers
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Remove italic markers
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Remove numbered lists markers and keep clean text
    .replace(/^\d+\.\s+/gm, '')
    // Remove bullet points
    .replace(/^[-*]\s+/gm, '')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
};

// Component to render formatted text
const FormattedText = ({ content }: { content: string }) => {
  const cleaned = cleanMarkdown(content);
  return <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: cleaned }} />;
};

export default function AIInsightsReportPreview({
  open,
  onClose,
  project,
}: AIInsightsReportPreviewProps) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingDOC, setIsExportingDOC] = useState(false);
  const [isExportingHTML, setIsExportingHTML] = useState(false);

  const analysisData = project.analysisData as AnalysisData | null;
  const aiInsights = analysisData?.aiAnalysis;

  const handlePDFExport = async () => {
    setIsExportingPDF(true);
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
      const filename = `${project.name.replace(/\s+/g, '-')}-AI-Insights-${timestamp}.pdf`;
      await htmlExportService.exportToPDF('ai-insights-report-content', filename);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export failed. Please try again.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleDOCExport = async () => {
    setIsExportingDOC(true);
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
      const filename = `${project.name.replace(/\s+/g, '-')}-AI-Insights-${timestamp}.docx`;
      await htmlExportService.exportToDOCX('ai-insights-report-content', filename);
    } catch (error) {
      console.error('DOC export failed:', error);
      alert('DOC export failed. Please try again.');
    } finally {
      setIsExportingDOC(false);
    }
  };

  const handleHTMLExport = async () => {
    setIsExportingHTML(true);
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
      const filename = `${project.name.replace(/\s+/g, '-')}-AI-Insights-${timestamp}.html`;
      await htmlExportService.exportToHTML('ai-insights-report-content', filename);
    } catch (error) {
      console.error('HTML export failed:', error);
      alert('HTML export failed. Please try again.');
    } finally {
      setIsExportingHTML(false);
    }
  };

  if (!aiInsights) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>AI Insights Report</DialogTitle>
          </DialogHeader>
          <div className="p-8 text-center">
            <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No AI insights available for this project.</p>
            <p className="text-sm text-gray-500 mt-2">AI analysis may not have been performed yet.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              AI Insights Report
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleDOCExport}
                disabled={isExportingDOC}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
                data-testid="button-save-ai-insights-docx"
              >
                <FileText className="w-4 h-4 mr-2" />
                {isExportingDOC ? 'Saving...' : 'Save as DOCX'}
              </Button>
              <Button
                onClick={handlePDFExport}
                disabled={isExportingPDF}
                className="bg-red-600 hover:bg-red-700"
                size="sm"
                data-testid="button-save-ai-insights-pdf"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExportingPDF ? 'Saving...' : 'Save as PDF'}
              </Button>
              <Button
                onClick={handleHTMLExport}
                disabled={isExportingHTML}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
                data-testid="button-save-ai-insights-html"
              >
                <Code className="w-4 h-4 mr-2" />
                {isExportingHTML ? 'Saving...' : 'Save as HTML'}
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                data-testid="button-close-ai-insights-report"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div id="ai-insights-report-content" className="max-w-5xl mx-auto space-y-8 py-4">
            {/* Header */}
            <div className="text-center border-b-2 border-purple-200 pb-6">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
                AI Insights & Analysis Report
              </h1>
              <p className="text-xl font-semibold text-gray-700">{project.name}</p>
              <p className="text-sm text-gray-500 mt-2">Generated on {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>

            {/* Project Overview */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b-2 border-blue-200">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Project Overview</h2>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-xl border-l-4 border-blue-500 shadow-sm">
                <FormattedText content={aiInsights.projectOverview} />
              </div>
            </div>

            {/* Architecture Insights */}
            {aiInsights.architectureInsights && Array.isArray(aiInsights.architectureInsights) && aiInsights.architectureInsights.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-purple-200">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Architecture Insights</h2>
                </div>
                <div className="space-y-3">
                  {aiInsights.architectureInsights.map((insight: string, index: number) => (
                    <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-l-4 border-purple-500 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold shadow-md">
                          {index + 1}
                        </div>
                        <FormattedText content={insight} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quality Score */}
            {aiInsights.qualityScore !== undefined && aiInsights.qualityScore !== null && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-green-200">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Quality Assessment</h2>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-xl border-l-4 border-green-500 shadow-sm">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="text-center">
                      <div className="text-6xl font-bold text-green-600">{aiInsights.qualityScore}<span className="text-3xl text-gray-500">/10</span></div>
                      <div className="text-sm font-semibold text-gray-600 mt-3">Overall Quality Score</div>
                    </div>
                    <div className="flex-1 w-full">
                      <div className="w-full bg-gray-200 rounded-full h-6 shadow-inner">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-3 shadow-md" 
                          style={{ width: `${Math.min((aiInsights.qualityScore / 10) * 100, 100)}%` }}
                        >
                          <span className="text-white text-xs font-bold">{Math.round((aiInsights.qualityScore / 10) * 100)}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between mt-3 text-sm font-medium text-gray-600">
                        <span>Poor</span>
                        <span>Fair</span>
                        <span>Good</span>
                        <span>Excellent</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                        This score reflects the overall quality of the codebase based on architecture patterns, 
                        code maintainability, and adherence to best practices.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Recommendations */}
            {aiInsights.suggestions && Array.isArray(aiInsights.suggestions) && aiInsights.suggestions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-yellow-200">
                  <div className="bg-yellow-100 p-2 rounded-lg">
                    <Lightbulb className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">AI Recommendations</h2>
                </div>
                <div className="space-y-3">
                  {aiInsights.suggestions.map((suggestion: string, index: number) => (
                    <div key={index} className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl border-l-4 border-yellow-400 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold shadow-md">
                          {index + 1}
                        </div>
                        <FormattedText content={suggestion} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Module-Level Insights */}
            {aiInsights.moduleInsights && Object.keys(aiInsights.moduleInsights).length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b-2 border-indigo-200">
                  <div className="bg-indigo-100 p-2 rounded-lg">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Module-Level Insights</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(aiInsights.moduleInsights).map(([className, insight]: [string, any], index: number) => (
                    <div key={index} className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-colors shadow-sm">
                      <div className="flex items-start gap-3 mb-4">
                        <CheckCircle2 className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                        <h3 className="text-xl font-bold text-gray-900">{className}</h3>
                      </div>
                      <div className="space-y-3 pl-8">
                        {insight.role && (
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-sm text-indigo-600 uppercase tracking-wide">Role</span>
                            <FormattedText content={insight.role} />
                          </div>
                        )}
                        {insight.responsibilities && (
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-sm text-indigo-600 uppercase tracking-wide">Responsibilities</span>
                            <FormattedText content={insight.responsibilities} />
                          </div>
                        )}
                        {insight.improvements && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <span className="font-semibold text-sm text-orange-600 uppercase tracking-wide block mb-2">
                              💡 Improvement Opportunities
                            </span>
                            <FormattedText content={insight.improvements} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-sm text-gray-600 pt-8 border-t-2 border-gray-300 mt-12">
              <p className="font-semibold">Developed by: Ullas Krishnan, Sr Solution Architect</p>
              <p className="mt-1">Copyright © Project Diamond Zensar team</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
