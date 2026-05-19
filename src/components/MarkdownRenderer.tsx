import { useRef, useEffect, useCallback, Fragment } from 'react';
import { marked } from 'marked';
import CopyButton from './CopyButton';
import ImageLightbox from './ImageLightbox';
import { useImageLightbox } from '../hooks/useImageLightbox';
import type { Renderer } from 'marked';

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

/**
 * Simple syntax highlighter for common language patterns.
 * Returns HTML with token classes applied.
 */
function highlightCode(code: string, lang: string): string {
  // Escape HTML entities
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Basic keyword patterns - order matters!
  const patterns = [
    // Strings (single and double quoted)
    { regex: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g, token: 'string' },
    // Numbers
    { regex: /\b\d+(?:\.\d+)?\b/g, token: 'number' },
    // Comments (// and /* */)
    { regex: /(\/\/.*$)/gm, token: 'comment' },
    { regex: /(\/\*[\s\S]*?\*\/)/g, token: 'comment' },
    // Keywords (common JS/TS/Python/Go/etc)
    { regex: /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|class|extends|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof|in|of|void|delete|yield|static|get|set)\b/g, token: 'keyword' },
    // Booleans and null
    { regex: /\b(true|false|null|undefined|NaN|Infinity)\b/g, token: 'boolean' },
    // Function calls
    { regex: /\b([a-zA-Z_$][\w$]*)\s*(?=\()/g, token: 'function' },
    // Tags (for HTML)
    { regex: /(&lt;\/?)([\w-]+)/g, token: 'tag' },
  ];

  const tokens: Array<{ start: number; end: number; token: string; text: string }> = [];

  patterns.forEach(({ regex, token }) => {
    const re = new RegExp(regex.source, regex.flags);
    let match: RegExpExecArray | null;
    while ((match = re.exec(escaped)) !== null) {
      // For tag pattern, only highlight the tag name part
      let matchText = match[2];
      if (token === 'tag' && match[1]) {
        // Replace just the tag name
        const before = escaped.slice(0, match.index + match[1].length);
        const after = escaped.slice(match.index + match[0].length);
        const tagIdx = tokens.findIndex(t => t.start <= match.index + match[1].length && t.end >= match.index + match[1].length);
        if (tagIdx === -1) {
          tokens.push({
            start: match.index + match[1].length,
            end: match.index + match[0].length,
            token,
            text: match[2],
          });
        }
        continue;
      }
      tokens.push({
        start: match.index,
        end: match.index + match[0].length,
        token,
        text: match[0],
      });
    }
  });

  // Remove overlapping tokens, keeping longest
  tokens.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start));

  const filtered: typeof tokens = [];
  let lastEnd = 0;
  for (const t of tokens) {
    if (t.start >= lastEnd) {
      filtered.push(t);
      lastEnd = t.end;
    }
  }

  // Build result
  let result = '';
  let pos = 0;
  for (const t of filtered) {
    result += escaped.slice(pos, t.start);
    result += `<span class="token ${t.token}">${t.text}</span>`;
    pos = t.end;
  }
  result += escaped.slice(pos);

  return result;
}

// Configure marked with custom renderer
const renderer = new (marked.Renderer as any)();

// Override link renderer to add target="_blank" for external links
renderer.link = ((href: string, title: string, text: string) => {
  const isExternal = href.startsWith('http://') || href.startsWith('https://');
  let html = `<a href="${href}"`;
  if (isExternal) {
    html += ` target="_blank" rel="noopener noreferrer"`;
  }
  if (title) {
    html += ` title="${title}"`;
  }
  html += `>${text}</a>`;
  return html;
}) as any;

// Override code block renderer to add copy button wrapper
renderer.codeblock = ((text: string, lang: string) => {
  const highlighted = lang
    ? highlightCode(text, lang)
    : text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `
    <div class="code-block-wrapper">
      <button
        class="copy-code-btn"
        data-code="${encodeURIComponent(text)}"
        aria-label="Copy code"
        title="Copy code"
      >
        Copy
      </button>
      <pre><code class="language-${lang || 'text'}">${highlighted}</code></pre>
    </div>
  `;
}) as any;

marked.setOptions({
  renderer,
  gfm: true,
});

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const lightbox = useImageLightbox();

  const renderContent = useCallback(() => {
    const { frontmatter, body } = extractFrontmatter(content);
    const html = marked.parse(body || content, { async: false }) as string;
    return { frontmatter, html };
  }, [content]);

  const { frontmatter, html } = renderContent();

  // Setup copy buttons, register images, and attach click handlers after render
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    // Register images for lightbox navigation
    lightbox.registerImages(container);

    // Set up copy button event listeners
    const setupCopyButtons = () => {
      container.querySelectorAll('.copy-code-btn').forEach((btn) => {
        const encodedCode = btn.getAttribute('data-code');
        if (!encodedCode) return;

        btn.addEventListener('click', async () => {
          try {
            const decoded = decodeURIComponent(encodedCode);
            await navigator.clipboard.writeText(decoded);
            btn.textContent = 'Copied!';
            btn.classList.add('text-green-400');
            setTimeout(() => {
              btn.textContent = 'Copy';
              btn.classList.remove('text-green-400');
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
    };

    // Handle image clicks for lightbox
    const handleImageClick = (e: MouseEvent) => {
      const img = (e.target as HTMLElement).closest('img');
      if (img instanceof HTMLImageElement) {
        e.preventDefault();
        lightbox.open(img.src, img.alt || '');
      }
    };

    setupCopyButtons();
    container.addEventListener('click', handleImageClick);

    return () => {
      container.removeEventListener('click', handleImageClick);
    };
  }, [html, lightbox]);

  return (
    <Fragment>
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

      {/* Image lightbox overlay */}
      <ImageLightbox
        src={lightbox.currentSrc}
        alt={lightbox.currentAlt}
        onClose={lightbox.close}
        onPrev={lightbox.images.length > 1 ? lightbox.prev : undefined}
        onNext={lightbox.images.length > 1 ? lightbox.next : undefined}
        hasPrev={lightbox.currentIndex > 0}
        hasNext={lightbox.currentIndex < lightbox.images.length - 1}
      />
    </Fragment>
  );
}

export { extractFrontmatter };
