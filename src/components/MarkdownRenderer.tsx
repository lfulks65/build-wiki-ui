import { useRef, useEffect, useCallback } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import CopyButton from './CopyButton';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface Frontmatter {
  title?: string;
  date?: string;
  tags?: string[];
  [key: string]: unknown;
}

/**
 * Extract YAML frontmatter from markdown content.
 * Returns { frontmatter, body } or { frontmatter: null, body: content }
 */
function extractFrontmatter(content: string): {
  frontmatter: Frontmatter | null;
  body: string;
} {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { frontmatter: null, body: content };
  }

  try {
    const fmContent = match[1];
    const body = match[2];
    const frontmatter: Frontmatter = {};

    fmContent.split('\n').forEach((line) => {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) return;

      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();

      // Handle array values: [tag1, tag2]
      if (value.startsWith('[') && value.endsWith(']')) {
        value = value
          .slice(1, -1)
          .split(',')
          .map((t) => t.replace(/^["']|["']$/g, '').trim())
          .filter(Boolean);
        frontmatter[key] = value;
      }
      // Handle quoted string values
      else if ((value.startsWith('"') && value.endsWith('"')) ||
               (value.startsWith("'") && value.endsWith("'"))) {
        frontmatter[key] = value.replace(/^["']|["']$/g, '');
      }
      // Handle boolean values
      else if (value === 'true') {
        frontmatter[key] = true;
      } else if (value === 'false') {
        frontmatter[key] = false;
      }
      // Handle null values
      else if (value === 'null' || value === '~') {
        frontmatter[key] = null;
      }
      // Handle numeric values
      else if (!isNaN(Number(value))) {
        frontmatter[key] = Number(value);
      }
      else {
        frontmatter[key] = value;
      }
    });

    return { frontmatter, body };
  } catch {
    return { frontmatter: null, body: content };
  }
}

// Syntax highlighting function using highlight.js
function highlightWithHljs(code: string, lang: string): string {
  if (lang && hljs.getLanguage(lang)) {
    try {
      return hljs.highlight(code, { language: lang }).value;
    } catch (_e) {
      // fall through to auto-detect
    }
  }
  try {
    return hljs.highlightAuto(code).value;
  } catch (_e) {
    return code;
  }
}

// Configure marked globally once
marked.setOptions({
  highlight: highlightWithHljs,
  langPrefix: 'hljs language-',
  gfm: true,
});

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const renderContent = useCallback(() => {
    const { frontmatter, body } = extractFrontmatter(content);
    const html = marked.parse(body || content, { async: false }) as string;
    return { frontmatter, html };
  }, [content]);

  const { frontmatter, html } = renderContent();

  // Post-process: add data-language attributes and copy buttons
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const codeElements = container.querySelectorAll<HTMLCodeElement>('pre code[class*="hljs language-"]');

    codeElements.forEach((code) => {
      const classes = code.className.split(' ');
      const langClass = classes.find((c) => c.startsWith('hljs language-'));
      if (!langClass) return;

      const lang = langClass.replace('hljs language-', '');
      const pre = code.parentElement;
      if (!pre || pre.tagName !== 'PRE') return;

      // Add data-language attribute to <pre> for CSS language badge
      pre.setAttribute('data-language', lang);

      // Get raw code text for copy button
      const rawCode = code.textContent || '';

      // Skip if button already exists (e.g., during re-render)
      if (pre.querySelector('.copy-code-btn')) return;

      // Create copy button
      const btn = document.createElement('button');
      btn.className = 'copy-code-btn';
      btn.setAttribute('data-code', encodeURIComponent(rawCode));
      btn.setAttribute('aria-label', 'Copy code');
      btn.setAttribute('title', 'Copy code');
      btn.textContent = 'Copy';
      btn.style.cssText = 'position:absolute;top:0.5rem;right:0.5rem;padding:0.25rem 0.5rem;font-size:0.75rem;border-radius:0.25rem;background:rgba(0,0,0,0.4);color:#e5e7eb;border:1px solid rgba(255,255,255,0.1);cursor:pointer;z-index:10;transition:all 0.15s;';

      // Wrap pre for relative positioning
      const wrapperEl = document.createElement('div');
      wrapperEl.className = 'code-block-wrapper';
      wrapperEl.style.position = 'relative';
      pre.parentNode?.insertBefore(wrapperEl, pre);
      wrapperEl.appendChild(pre);

      pre.appendChild(btn);
    });

    // Set up click handlers for copy buttons
    container.querySelectorAll<HTMLButtonElement>('.copy-code-btn').forEach((btn) => {
      const encodedCode = btn.getAttribute('data-code');
      if (!encodedCode) return;

      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(decodeURIComponent(encodedCode));
          btn.textContent = 'Copied!';
          btn.style.color = '#4ade80';
          setTimeout(() => {
            btn.textContent = 'Copy';
            btn.style.color = '#e5e7eb';
          }, 2000);
        } catch {
          // Fallback
          const textArea = document.createElement('textarea');
          textArea.value = decodeURIComponent(encodedCode);
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
        }
      });
    });
  });

  return (
    <div className={className}>
      {/* Frontmatter metadata card */}
      {frontmatter && (
        <div className="metadata-card">
          {frontmatter.title && (
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
              {frontmatter.title}
            </h3>
          )}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {frontmatter.date && (
              <span className="text-gray-500 dark:text-gray-400">
                {new Date(frontmatter.date as string).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
            {frontmatter.tags && Array.isArray(frontmatter.tags) && (
              <div className="flex flex-wrap gap-1.5">
                {frontmatter.tags.map((tag, i) => (
                  <span key={i} className="tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Rendered markdown */}
      <div
        className="prose"
        dangerouslySetInnerHTML={{ __html: html }}
        ref={contentRef}
      />
    </div>
  );
}

export { extractFrontmatter };
