interface FormattedAIContentProps {
  content: string;
}

export default function FormattedAIContent({ content }: FormattedAIContentProps) {
  if (!content) return null;

  const formatContent = (text: string) => {
    const lines = text.split('\n');
    const elements: JSX.Element[] = [];
    let listItems: string[] = [];
    let currentSection = '';

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-2 mb-4 ml-4">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-gray-700 leading-relaxed">{item}</li>
            ))}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      if (!trimmed) {
        flushList();
        if (elements.length > 0 && elements[elements.length - 1].type !== 'div') {
          elements.push(<div key={`space-${index}`} className="h-2" />);
        }
        return;
      }

      // Headers (##, ###, etc.)
      if (trimmed.startsWith('###')) {
        flushList();
        const text = trimmed.replace(/^###\s*/, '');
        elements.push(
          <h4 key={`h4-${index}`} className="text-base font-semibold text-gray-800 mt-4 mb-2">
            {text}
          </h4>
        );
      } else if (trimmed.startsWith('##')) {
        flushList();
        const text = trimmed.replace(/^##\s*/, '');
        elements.push(
          <h3 key={`h3-${index}`} className="text-lg font-semibold text-gray-900 mt-6 mb-3">
            {text}
          </h3>
        );
      } else if (trimmed.startsWith('#')) {
        flushList();
        const text = trimmed.replace(/^#\s*/, '');
        elements.push(
          <h2 key={`h2-${index}`} className="text-xl font-bold text-gray-900 mt-6 mb-4">
            {text}
          </h2>
        );
      }
      // Numbered lists
      else if (/^\d+\.\s/.test(trimmed)) {
        flushList(); // Flush any bullet list first
        const text = trimmed.replace(/^\d+\.\s*/, '');
        if (listItems.length === 0) {
          // Check if this is continuing a numbered list
          const prevElement = elements[elements.length - 1];
          if (prevElement?.type === 'ol') {
            elements.pop(); // Remove previous ol to add to it
            const prevItems = prevElement.props.children;
            listItems = prevItems.map((child: any) => child.props.children);
          }
        }
        listItems.push(text);
        elements.push(
          <ol key={`ol-${index}`} start={listItems.length - listItems.length + 1} className="list-decimal list-inside space-y-2 mb-4 ml-4">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-gray-700 leading-relaxed">{item}</li>
            ))}
          </ol>
        );
        listItems = [];
      }
      // Bullet lists (-, *, •)
      else if (/^[-*•]\s/.test(trimmed)) {
        const text = trimmed.replace(/^[-*•]\s*/, '');
        listItems.push(text);
      }
      // Bold text (**text**)
      else if (trimmed.includes('**')) {
        flushList();
        const formattedText = trimmed.split('**').map((part, idx) => 
          idx % 2 === 1 ? <strong key={idx} className="font-semibold text-gray-900">{part}</strong> : part
        );
        elements.push(
          <p key={`p-${index}`} className="text-gray-700 leading-relaxed mb-3">
            {formattedText}
          </p>
        );
      }
      // Code blocks (```text```)
      else if (trimmed.startsWith('```')) {
        flushList();
        currentSection = 'code';
      } else if (currentSection === 'code' && trimmed.includes('```')) {
        currentSection = '';
      } else if (currentSection === 'code') {
        elements.push(
          <pre key={`code-${index}`} className="bg-gray-100 p-3 rounded-md overflow-x-auto mb-4">
            <code className="text-sm text-gray-800">{trimmed}</code>
          </pre>
        );
      }
      // Quote blocks (>)
      else if (trimmed.startsWith('>')) {
        flushList();
        const text = trimmed.replace(/^>\s*/, '');
        elements.push(
          <blockquote key={`quote-${index}`} className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 italic text-gray-700">
            {text}
          </blockquote>
        );
      }
      // Regular paragraphs
      else {
        flushList();
        elements.push(
          <p key={`p-${index}`} className="text-gray-700 leading-relaxed mb-3">
            {trimmed}
          </p>
        );
      }
    });

    flushList(); // Flush any remaining list items
    return elements;
  };

  return (
    <div className="prose prose-sm max-w-none">
      {formatContent(content)}
    </div>
  );
}
