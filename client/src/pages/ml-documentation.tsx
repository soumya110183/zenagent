import { useState, useEffect } from 'react';
import Layout from '@/components/layout';
import { Card } from '@/components/ui/card';
import { Loader2, BookOpen } from 'lucide-react';

export default function MLDocumentation() {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDocumentation() {
      try {
        setLoading(true);
        const response = await fetch('/api/ml-documentation');
        
        if (!response.ok) {
          throw new Error('Failed to load documentation');
        }
        
        const data = await response.json();
        setContent(data.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadDocumentation();
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Content Card */}
          <Card className="p-8 bg-white dark:bg-gray-800 shadow-lg">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Loading documentation...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">Error: {error}</p>
              </div>
            )}

            {!loading && !error && (
              <div 
                className="prose prose-slate dark:prose-invert max-w-none
                  prose-headings:text-gray-900 dark:prose-headings:text-white
                  prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4
                  prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed
                  prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
                  prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-900 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                  prose-pre:bg-gray-900 dark:prose-pre:bg-black prose-pre:text-gray-100 prose-pre:overflow-x-auto
                  prose-ul:list-disc prose-ul:ml-6 prose-ul:text-gray-700 dark:prose-ul:text-gray-300
                  prose-ol:list-decimal prose-ol:ml-6 prose-ol:text-gray-700 dark:prose-ol:text-gray-300
                  prose-li:my-2
                  prose-table:border-collapse prose-table:w-full
                  prose-th:bg-gray-100 dark:prose-th:bg-gray-900 prose-th:p-3 prose-th:text-left prose-th:font-semibold
                  prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700 prose-td:p-3
                  prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic
                  prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline"
                dangerouslySetInnerHTML={{ __html: content }}
                data-testid="ml-documentation-content"
              />
            )}
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              <strong>Developed by: Ullas Krishnan, Sr Solution Architect</strong>
            </p>
            <p>Copyright © Project Diamond Zensar team</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
