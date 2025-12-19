import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './qa-components.css';

/**
 * MarkdownEditor Component
 * Simple markdown editor with preview
 */
const MarkdownEditor = ({
  value,
  onChange,
  placeholder = 'Write your content here...',
  minLength = 10,
  maxLength = 30000,
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  // Basic markdown to HTML (simple version)
  const renderMarkdown = text => {
    if (!text) return '';

    let html = text;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

    // Code blocks
    html = html.replace(/```(.*?)```/gims, '<pre><code>$1</code></pre>');

    // Inline code
    html = html.replace(/`(.*?)`/gim, '<code>$1</code>');

    // Links
    html = html.replace(
      /\[(.*?)\]\((.*?)\)/gim,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Line breaks
    html = html.replace(/\n/gim, '<br>');

    return html;
  };

  return (
    <div className="markdown-editor">
      <div className="editor-toolbar">
        <button
          type="button"
          className={`toolbar-btn ${!showPreview ? 'active' : ''}`}
          onClick={() => setShowPreview(false)}
        >
          Write
        </button>
        <button
          type="button"
          className={`toolbar-btn ${showPreview ? 'active' : ''}`}
          onClick={() => setShowPreview(true)}
        >
          Preview
        </button>
        <span className="char-count">
          {value?.length || 0} / {maxLength}
        </span>
      </div>

      {!showPreview ? (
        <textarea
          ref={textareaRef}
          className="markdown-textarea"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          minLength={minLength}
          maxLength={maxLength}
          rows={10}
        />
      ) : (
        <div
          className="markdown-preview"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
        />
      )}

      <div className="editor-help">
        <small>
          Supports Markdown: **bold**, *italic*, `code`, [link](url), # headers
        </small>
      </div>
    </div>
  );
};

MarkdownEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  minLength: PropTypes.number,
  maxLength: PropTypes.number,
};

export default MarkdownEditor;
