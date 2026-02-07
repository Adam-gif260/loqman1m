import { useState, useEffect, useRef, useMemo } from 'react';
import { X, ExternalLink, Code2, Eye } from 'lucide-react';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';
import logo from '@/assets/logo.png';

interface PreviewPanelProps {
  code: string | null;
  tab: 'preview' | 'code';
  onTabChange: (tab: 'preview' | 'code') => void;
  onClose: () => void;
  isMobile: boolean;
}

export default function PreviewPanel({ code, tab, onTabChange, onClose, isMobile }: PreviewPanelProps) {
  const codeRef = useRef<HTMLElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const highlightedCode = useMemo(() => {
    if (!code) return '';
    try {
      const result = hljs.highlightAuto(code);
      return result.value;
    } catch {
      return code;
    }
  }, [code]);

  const previewHtml = useMemo(() => {
    if (!code) return '';
    // If it looks like a complete HTML document
    if (code.includes('<html') || code.includes('<!DOCTYPE') || code.includes('<head')) {
      return code;
    }
    // Wrap in a basic HTML structure
    return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
</style>
</head>
<body>
${code}
</body>
</html>`;
  }, [code]);

  const openInNewWindow = () => {
    const w = window.open('', '_blank');
    if (w) { w.document.write(previewHtml); w.document.close(); }
  };

  if (!code) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <img src={logo} alt="NexCode" className="w-16 h-16 mx-auto mb-4 animate-heartbeat" />
          <p className="text-sm text-muted-foreground">En attente de code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Tabs */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onTabChange('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === 'preview' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye size={13} />
            Preview
          </button>
          <button
            onClick={() => onTabChange('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === 'code' ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Code2 size={13} />
            Code
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={openInNewWindow}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded"
            title="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink size={14} />
          </button>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded">
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'preview' ? (
          <iframe
            ref={iframeRef}
            srcDoc={previewHtml}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin"
            title="Preview"
          />
        ) : (
          <div className="h-full overflow-auto code-scrollbar bg-[hsl(250,20%,6%)] p-4">
            <pre className="text-xs leading-5">
              <code
                ref={codeRef}
                className="hljs"
                dangerouslySetInnerHTML={{ __html: highlightedCode }}
              />
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
