import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Database, 
  Zap, 
  TrendingUp, 
  Download, 
  Upload, 
  Clock,
  BarChart3,
  RefreshCw
} from "lucide-react";

interface UsageStats {
  openaiUsage: {
    requests: number;
    tokens: number;
    cost: number;
    averageResponseTime: number;
    models: Record<string, number>;
  };
  analysisStats: {
    totalProjects: number;
    completedAnalyses: number;
    averageProcessingTime: number;
    successRate: number;
  };
}

export default function UsageStatistics() {
  const [refreshing, setRefreshing] = useState(false);

  // Fetch real usage statistics from API
  const { data: stats, refetch } = useQuery<UsageStats>({
    queryKey: ['/api/usage-statistics'],
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (!stats) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600 dark:text-gray-400">Loading usage statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate estimated monthly token usage (assuming 100k limit)
  const monthlyTokenLimit = 100000;
  const tokenUsagePercent = (stats.openaiUsage.tokens / monthlyTokenLimit) * 100;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Usage Statistics
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor your AI analysis usage, LLM token consumption, and project statistics
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline"
          disabled={refreshing}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="llm">LLM Usage</TabsTrigger>
          <TabsTrigger value="projects">Project Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">LLM Requests</CardTitle>
                <Zap className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.openaiUsage.requests}</div>
                <p className="text-xs text-muted-foreground">
                  AI analysis requests
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
                <Database className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.openaiUsage.tokens.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {tokenUsagePercent.toFixed(1)}% of monthly limit
                </p>
                <Progress value={tokenUsagePercent} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="border-l-4 border-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">${stats.openaiUsage.cost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  ${(stats.openaiUsage.cost / stats.openaiUsage.requests).toFixed(3)} avg/request
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.analysisStats.successRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.analysisStats.completedAnalyses}/{stats.analysisStats.totalProjects} completed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Response Time Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Average Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-indigo-600">
                {(stats.openaiUsage.averageResponseTime / 1000).toFixed(2)}s
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Average time for AI to generate insights per request
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="llm" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-t-4 border-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  LLM API Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">Total AI Requests</span>
                  <span className="text-lg font-bold text-purple-600">{stats.openaiUsage.requests}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                  <span className="text-sm font-medium">Tokens Consumed</span>
                  <span className="text-lg font-bold text-indigo-600">{stats.openaiUsage.tokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Total API Cost</span>
                  <span className="text-lg font-bold text-green-600">${stats.openaiUsage.cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Average Cost/Request</span>
                  <span className="text-lg font-bold text-blue-600">${(stats.openaiUsage.cost / stats.openaiUsage.requests).toFixed(3)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium">Avg Response Time</span>
                  <span className="text-lg font-bold text-orange-600">{(stats.openaiUsage.averageResponseTime / 1000).toFixed(2)}s</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  Model Usage Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.openaiUsage.models).map(([model, tokens]) => (
                  <div key={model} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">{model}</span>
                      <span className="text-sm font-bold text-blue-600">{tokens.toLocaleString()} tokens</span>
                    </div>
                    <Progress 
                      value={(tokens / stats.openaiUsage.tokens) * 100} 
                      className="h-3" 
                    />
                    <p className="text-xs text-muted-foreground">
                      {((tokens / stats.openaiUsage.tokens) * 100).toFixed(1)}% of total usage
                    </p>
                  </div>
                ))}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">
                    <strong>Note:</strong> All requests use GPT-4o model for high-quality AI insights and analysis.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-l-4 border-indigo-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  Total Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-indigo-600">
                  {stats.analysisStats.totalProjects}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Projects analyzed with Zengent AI
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-green-600">
                  {stats.analysisStats.completedAnalyses}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Successfully completed analyses
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  Avg Processing Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-orange-600">
                  {stats.analysisStats.averageProcessingTime.toFixed(1)}s
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Average analysis duration
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-t-4 border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Success Rate Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-5xl font-bold text-green-600">{stats.analysisStats.successRate}%</p>
                    <p className="text-sm text-muted-foreground mt-1">Overall success rate</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-700">
                      {stats.analysisStats.completedAnalyses} / {stats.analysisStats.totalProjects}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Completed projects</p>
                  </div>
                </div>
                <Progress value={stats.analysisStats.successRate} className="h-4" />
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Successful</p>
                    <p className="text-2xl font-bold text-green-600">{stats.analysisStats.completedAnalyses}</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">
                      {stats.analysisStats.totalProjects - stats.analysisStats.completedAnalyses}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}