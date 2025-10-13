interface FormattedAIContentProps {
  content: string;
  variant?: 'default' | 'architecture';
}

export default function FormattedAIContent({ content, variant = 'default' }: FormattedAIContentProps) {
  if (!content) return null;

  // Special handling for architecture overview - convert to table
  if (variant === 'architecture') {
    const lines = content.split('\n').filter(line => line.trim());
    const architectureItems: { label: string; value: string }[] = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      // Remove numbers like "1.", "2.", etc.
      const withoutNumber = trimmed.replace(/^\d+\.\s*/, '');
      // Remove bold markdown **
      const withoutBold = withoutNumber.replace(/\*\*/g, '');
      
      // Check if line contains a colon (label: value pattern)
      if (withoutBold.includes(':')) {
        const [label, ...valueParts] = withoutBold.split(':');
        const value = valueParts.join(':').trim();
        if (label && value) {
          architectureItems.push({ label: label.trim(), value });
        }
      } else if (withoutBold && !withoutBold.startsWith('#')) {
        // Treat as a general description if it doesn't have a colon
        architectureItems.push({ label: 'Description', value: withoutBold });
      }
    });

    if (architectureItems.length === 0) {
      return (
        <div className="text-gray-700 leading-relaxed">
          {content.replace(/\*\*/g, '').replace(/^\d+\.\s*/gm, '')}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {architectureItems.map((item, index) => (
          <div key={index} className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50/50">
            <div className="text-sm font-semibold text-gray-800 mb-1">{item.label}</div>
            <div className="text-sm text-gray-700 leading-relaxed">{item.value}</div>
          </div>
        ))}
      </div>
    );
  }

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
      // Numbered lists - remove numbers
      else if (/^\d+\.\s/.test(trimmed)) {
        const text = trimmed.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '');
        listItems.push(text);
      }
      // Bullet lists (-, *, •)
      else if (/^[-*•]\s/.test(trimmed)) {
        const text = trimmed.replace(/^[-*•]\s*/, '').replace(/\*\*/g, '');
        listItems.push(text);
      }
      // Bold text (**text**) - just remove the markers, don't make bold
      else if (trimmed.includes('**')) {
        flushList();
        const cleanText = trimmed.replace(/\*\*/g, '');
        elements.push(
          <p key={`p-${index}`} className="text-gray-700 leading-relaxed mb-3">
            {cleanText}
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
