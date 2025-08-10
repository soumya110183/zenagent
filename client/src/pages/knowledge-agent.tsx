import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  FileText, 
  MessageCircle, 
  Database,
  Download,
  Upload,
  Globe,
  Zap,
  Activity,
  Search,
  Bot,
  Files,
  ExternalLink,
  Settings,
  Plus,
  Trash2
} from 'lucide-react';

interface KnowledgeStats {
  agent_name: string;
  status: string;
  collections: {
    confluence_pages: number;
    pdf_documents: number;
    knowledge_base: number;
  };
  total_documents: number;
  capabilities: string[];
  cache_status: string;
  embedding_model: string;
  vector_database: string;
  database_path: string;
  cache_info?: {
    keys: number;
    memory_used: string;
  };
}

interface ChatMessage {
  id: string;
  type: 'user' | 'agent';
  content: string;
  timestamp: string;
  sources?: any[];
}

interface SourceConfig {
  id: string;
  type: 'confluence' | 'pdf';
  name: string;
  url?: string;
  path?: string;
  credentials?: any;
  config?: any;
}

export default function KnowledgeAgent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [confluenceUrl, setConfluenceUrl] = useState('');
  const [confluenceCredentials, setConfluenceCredentials] = useState('');
  const [pdfPath, setPdfPath] = useState('');
  const [doclinqConfig, setDoclinqConfig] = useState('');
  const [sources, setSources] = useState<SourceConfig[]>([]);
  const [newSourceType, setNewSourceType] = useState<'confluence' | 'pdf'>('confluence');
  
  const { toast } = useToast();

  // Get Knowledge Agent statistics
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<KnowledgeStats>({
    queryKey: ['/api/knowledge/stats'],
    refetchInterval: 30000
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await fetch('/api/knowledge/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, contextLimit: 5 })
      });
      if (!response.ok) throw new Error('Chat query failed');
      return response.json();
    },
    onSuccess: (data) => {
      const agentMessage: ChatMessage = {
        id: Date.now().toString() + '_agent',
        type: 'agent',
        content: data.response,
        timestamp: new Date().toISOString(),
        sources: data.sources
      };
      setChatMessages(prev => [...prev, agentMessage]);
      setCurrentQuery('');
    },
    onError: (error) => {
      toast({
        title: "Chat Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Confluence scraping mutation
  const confluenceMutation = useMutation({
    mutationFn: async (data: { baseUrl: string; credentials: any; maxDepth: number }) => {
      const response = await fetch('/api/knowledge/scrape-confluence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Confluence scraping failed');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Confluence Scraping Complete",
        description: `Successfully scraped ${data.pages_scraped || 0} pages`,
      });
      refetchStats();
    },
    onError: (error) => {
      toast({
        title: "Scraping Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // PDF processing mutation
  const pdfMutation = useMutation({
    mutationFn: async (data: { pdfPath: string; doclinqConfig: any }) => {
      const response = await fetch('/api/knowledge/process-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('PDF processing failed');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "PDF Processing Complete",
        description: `Successfully processed PDF document`,
      });
      refetchStats();
    },
    onError: (error) => {
      toast({
        title: "Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Bulk processing mutation
  const bulkProcessMutation = useMutation({
    mutationFn: async (sources: SourceConfig[]) => {
      const sourcesData = sources.map(source => ({
        type: source.type,
        url: source.url,
        path: source.path,
        credentials: source.credentials,
        doclinqConfig: source.config,
        maxDepth: 3
      }));

      const response = await fetch('/api/knowledge/bulk-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sources: sourcesData })
      });
      if (!response.ok) throw new Error('Bulk processing failed');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Bulk Processing Complete",
        description: `Processed ${data.successful}/${data.processed} sources successfully`,
      });
      refetchStats();
    },
    onError: (error) => {
      toast({
        title: "Bulk Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = () => {
    if (!currentQuery.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString() + '_user',
      type: 'user',
      content: currentQuery,
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(currentQuery);
  };

  const handleConfluenceScrape = () => {
    if (!confluenceUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a Confluence URL",
        variant: "destructive",
      });
      return;
    }

    let credentials = {};
    if (confluenceCredentials.trim()) {
      try {
        credentials = JSON.parse(confluenceCredentials);
      } catch (e) {
        toast({
          title: "Invalid Credentials",
          description: "Please provide valid JSON credentials",
          variant: "destructive",
        });
        return;
      }
    }

    confluenceMutation.mutate({
      baseUrl: confluenceUrl,
      credentials,
      maxDepth: 3
    });
  };

  const handlePdfProcess = () => {
    if (!pdfPath.trim()) {
      toast({
        title: "PDF Path Required",
        description: "Please enter a PDF file path or URL",
        variant: "destructive",
      });
      return;
    }

    let config = {};
    if (doclinqConfig.trim()) {
      try {
        config = JSON.parse(doclinqConfig);
      } catch (e) {
        toast({
          title: "Invalid Config",
          description: "Please provide valid JSON configuration for Doclinq",
          variant: "destructive",
        });
        return;
      }
    }

    pdfMutation.mutate({
      pdfPath,
      doclinqConfig: config
    });
  };

  const addSource = () => {
    const newSource: SourceConfig = {
      id: Date.now().toString(),
      type: newSourceType,
      name: `${newSourceType === 'confluence' ? 'Confluence' : 'PDF'} Source ${sources.length + 1}`,
      url: newSourceType === 'confluence' ? '' : undefined,
      path: newSourceType === 'pdf' ? '' : undefined,
      credentials: {},
      config: {}
    };
    setSources([...sources, newSource]);
  };

  const removeSource = (id: string) => {
    setSources(sources.filter(s => s.id !== id));
  };

  const updateSource = (id: string, updates: Partial<SourceConfig>) => {
    setSources(sources.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <span>Knowledge Agent</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Document Scraper & Q&A System with ChromaDB & Redis
          </p>
        </div>
        <div className="flex space-x-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Database className="w-4 h-4 mr-1" />
            ChromaDB
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            <Zap className="w-4 h-4 mr-1" />
            Redis Cache
          </Badge>
        </div>
      </div>

      {/* Agent Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-green-600" />
            <span>Knowledge Base Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : stats ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status: {stats.status}</span>
                <span className="text-sm text-gray-600">Cache: {stats.cache_status}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">Confluence Pages</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {stats.collections.confluence_pages}
                  </p>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium">PDF Documents</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {stats.collections.pdf_documents}
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium">Total Knowledge</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {stats.total_documents}
                  </p>
                </div>
              </div>

              {stats.cache_info && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Redis Cache: {stats.cache_info.keys} keys, {stats.cache_info.memory_used} memory used
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {stats.capabilities.map((capability, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {capability}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Unable to load agent statistics</p>
          )}
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="chat">Chat Q&A</TabsTrigger>
          <TabsTrigger value="confluence">Confluence</TabsTrigger>
          <TabsTrigger value="pdf">PDF Processing</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Knowledge Agent Capabilities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Confluence Scraping</h4>
                      <p className="text-sm text-gray-600">
                        Scrape Confluence pages with sub-menu navigation and authentication support
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">PDF Processing</h4>
                      <p className="text-sm text-gray-600">
                        Process PDFs using IBM Doclinq API with fallback to local processing
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <MessageCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Intelligent Q&A</h4>
                      <p className="text-sm text-gray-600">
                        Chat interface with context-aware responses from knowledge base
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Database className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Vector Storage</h4>
                      <p className="text-sm text-gray-600">
                        ChromaDB vector database with Redis caching for optimal performance
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>IBM Doclinq Integration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-800">Enterprise PDF Processing</h4>
                  <p className="text-sm text-blue-600 mt-2">
                    IBM Doclinq provides advanced document analysis including:
                  </p>
                  <ul className="text-sm text-blue-600 mt-2 space-y-1">
                    <li>• Entity extraction and recognition</li>
                    <li>• Document structure analysis</li>
                    <li>• Multi-language support</li>
                    <li>• Advanced OCR capabilities</li>
                  </ul>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800">Performance Optimization</h4>
                  <p className="text-sm text-green-600 mt-2">
                    Redis caching ensures fast response times by storing:
                  </p>
                  <ul className="text-sm text-green-600 mt-2 space-y-1">
                    <li>• Processed document content</li>
                    <li>• Frequently accessed queries</li>
                    <li>• Confluence page data</li>
                    <li>• Vector search results</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <span>Knowledge Q&A Chat</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chat Messages */}
              <ScrollArea className="h-[400px] border rounded-lg p-4">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Start a conversation by asking a question about your knowledge base</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          {message.sources && message.sources.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-300">
                              <p className="text-xs opacity-75">
                                Sources: {message.sources.length} document(s)
                              </p>
                            </div>
                          )}
                          <p className="text-xs opacity-75 mt-1">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Chat Input */}
              <div className="flex space-x-2">
                <Input
                  placeholder="Ask a question about your knowledge base..."
                  value={currentQuery}
                  onChange={(e) => setCurrentQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={chatMutation.isPending || !currentQuery.trim()}
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="confluence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Confluence Page Scraping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Confluence Base URL</label>
                <Input
                  placeholder="https://your-company.atlassian.net/wiki/spaces/..."
                  value={confluenceUrl}
                  onChange={(e) => setConfluenceUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Authentication (JSON)</label>
                <Textarea
                  placeholder='{"username": "user@example.com", "password": "your-api-token"}'
                  value={confluenceCredentials}
                  onChange={(e) => setConfluenceCredentials(e.target.value)}
                  className="min-h-[100px] font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  Optional: Provide username/password or token for authenticated access
                </p>
              </div>

              <Button 
                onClick={handleConfluenceScrape}
                disabled={confluenceMutation.isPending}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                {confluenceMutation.isPending ? 'Scraping...' : 'Scrape Confluence Pages'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pdf" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>PDF Document Processing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">PDF File Path or URL</label>
                <Input
                  placeholder="/path/to/document.pdf or https://example.com/document.pdf"
                  value={pdfPath}
                  onChange={(e) => setPdfPath(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">IBM Doclinq Configuration (JSON)</label>
                <Textarea
                  placeholder='{"api_key": "your-api-key", "endpoint": "https://api.doclinq.ibm.com"}'
                  value={doclinqConfig}
                  onChange={(e) => setDoclinqConfig(e.target.value)}
                  className="min-h-[100px] font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  Optional: IBM Doclinq credentials for advanced processing. Falls back to local processing if not provided.
                </p>
              </div>

              <Button 
                onClick={handlePdfProcess}
                disabled={pdfMutation.isPending}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {pdfMutation.isPending ? 'Processing...' : 'Process PDF Document'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Knowledge Base Operations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Knowledge Sources</h4>
                <div className="flex space-x-2">
                  <select
                    value={newSourceType}
                    onChange={(e) => setNewSourceType(e.target.value as 'confluence' | 'pdf')}
                    className="px-3 py-1 border rounded text-sm"
                  >
                    <option value="confluence">Confluence</option>
                    <option value="pdf">PDF</option>
                  </select>
                  <Button size="sm" onClick={addSource}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Source
                  </Button>
                </div>
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {sources.map((source) => (
                  <div key={source.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{source.type}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeSource(source.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Input
                        placeholder="Source name"
                        value={source.name}
                        onChange={(e) => updateSource(source.id, { name: e.target.value })}
                      />
                      
                      {source.type === 'confluence' ? (
                        <Input
                          placeholder="Confluence URL"
                          value={source.url || ''}
                          onChange={(e) => updateSource(source.id, { url: e.target.value })}
                        />
                      ) : (
                        <Input
                          placeholder="PDF path or URL"
                          value={source.path || ''}
                          onChange={(e) => updateSource(source.id, { path: e.target.value })}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {sources.length > 0 && (
                <Button 
                  onClick={() => bulkProcessMutation.mutate(sources)}
                  disabled={bulkProcessMutation.isPending}
                  className="w-full"
                >
                  <Files className="w-4 h-4 mr-2" />
                  {bulkProcessMutation.isPending ? 'Processing...' : `Process ${sources.length} Sources`}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}