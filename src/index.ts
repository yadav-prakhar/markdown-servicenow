/**
 * Markdown to ServiceNow Journal Formatter
 *
 * Converts Markdown text to ServiceNow journal field format using [code] tags for rich HTML formatting.
 */

// =============================================================================
// CSS Styles
// =============================================================================

const CODE_CSS = `<style type="text/css">
code { color: crimson; background-color: #f1f1f1; padding-left: 4px; padding-right: 4px; font-size: 110%; }
</style>
`;

const HIGHLIGHT_CSS = `<style type="text/css">
.highlight { background-color: #fff3b0; padding: 2px 4px; }
</style>
`;

const ALERT_CSS = `<style type="text/css">
.note { color: #1f6feb; background-color: #e6ecff; padding: 8px 12px; border-left: 4px solid #1f6feb; display: block; margin: 8px 0; }
.tip { color: #1a7f37; background-color: #e6ffec; padding: 8px 12px; border-left: 4px solid #1a7f37; display: block; margin: 8px 0; }
.important { color: #8250df; background-color: #f3e8ff; padding: 8px 12px; border-left: 4px solid #8250df; display: block; margin: 8px 0; }
.warning { color: #9a6700; background-color: #fff8c5; padding: 8px 12px; border-left: 4px solid #9a6700; display: block; margin: 8px 0; }
.caution { color: #cf222e; background-color: #ffebe9; padding: 8px 12px; border-left: 4px solid #cf222e; display: block; margin: 8px 0; }
</style>
`;

const TABLE_CSS = `<style type="text/css">
.tg  {border-collapse:collapse;border-spacing:0;}
.tg td{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;
  overflow:hidden;padding:10px 5px;word-break:normal;}
.tg th{border-color:black;border-style:solid;border-width:1px;font-family:Arial, sans-serif;font-size:14px;
  font-weight:normal;overflow:hidden;padding:10px 5px;word-break:normal;}
.tg .tg-0pky{border-color:inherit;text-align:left;vertical-align:top}
</style>
`;

// =============================================================================
// Header Conversion
// =============================================================================

/**
 * Convert Markdown headers (# -> h1, ## -> h2, etc.) to HTML.
 */
export function convertHeaders(text: string): string {
  return text.replace(/^(#{1,6})\s+(.*)$/gm, (_match, hashes: string, headerText: string) => {
    const level = hashes.length;
    return `<h${level}>${headerText}</h${level}>`;
  });
}

// =============================================================================
// Text Formatting (Bold, Italic, Strikethrough)
// =============================================================================

/**
 * Convert bold+italic (***text*** or ___text___) to HTML.
 */
export function convertBoldItalic(text: string): string {
  text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
  text = text.replace(/___(.*?)___/g, '<strong><em>$1</em></strong>');
  return text;
}

/**
 * Convert bold (**text** or __text__) to HTML.
 */
export function convertBold(text: string): string {
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
  return text;
}

/**
 * Convert italic (*text* or _text_) to HTML.
 */
export function convertItalic(text: string): string {
  text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  text = text.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em>$1</em>');
  return text;
}

/**
 * Convert strikethrough (~~text~~) to HTML.
 */
export function convertStrikethrough(text: string): string {
  return text.replace(/~~(.*?)~~/g, '<strike>$1</strike>');
}

/**
 * Convert highlight (==text==) to HTML mark tag.
 */
export function convertHighlight(text: string): string {
  return text.replace(/==(.*?)==/g, '<span class="highlight">$1</span>');
}

/**
 * Apply all text formatting conversions in correct order.
 */
export function convertTextFormatting(text: string): string {
  text = convertBoldItalic(text);
  text = convertBold(text);
  text = convertItalic(text);
  text = convertStrikethrough(text);
  text = convertHighlight(text);
  return text;
}

// =============================================================================
// Code Conversion
// =============================================================================

/**
 * Convert fenced code blocks (```language\ncode```) to HTML.
 */
export function convertCodeBlocks(text: string): string {
  return text.replace(/```[a-zA-Z]*\n([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
}

/**
 * Convert inline code (`code`) to HTML.
 */
export function convertInlineCode(text: string): string {
  return text.replace(/`([^`]+)`/g, '<code>$1</code>');
}

// =============================================================================
// Links and Images
// =============================================================================

/**
 * Convert images (![alt](url)) to HTML. Must run before links.
 */
export function convertImages(text: string): string {
  return text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
}

/**
 * Convert links ([text](url)) to HTML.
 */
export function convertLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

// =============================================================================
// Horizontal Rules
// =============================================================================

/**
 * Convert horizontal rules (--- or ***) to HTML.
 */
export function convertHorizontalRules(text: string): string {
  return text.replace(/^[-*_]{3,}$/gm, '<hr>');
}

// =============================================================================
// List Conversion
// =============================================================================

/**
 * Convert list items matching pattern to HTML list with wrapper tag.
 */
function convertList(text: string, pattern: RegExp, wrapperTag: string): string {
  const lines = text.split('\n');
  let inList = false;
  const formattedLines: string[] = [];
  let listItems: string[] = [];

  for (const line of lines) {
    if (pattern.test(line)) {
      if (!inList) {
        inList = true;
      }
      const item = line.replace(pattern, '');
      listItems.push(`<li>${item}</li>`);
    } else {
      if (inList) {
        formattedLines.push(`<${wrapperTag}>${listItems.join('')}</${wrapperTag}>`);
        listItems = [];
        inList = false;
      }
      formattedLines.push(line);
    }
  }

  if (inList) {
    formattedLines.push(`<${wrapperTag}>${listItems.join('')}</${wrapperTag}>`);
  }

  return formattedLines.join('\n');
}

/**
 * Convert unordered lists (- item or * item) to HTML.
 */
export function convertUnorderedLists(text: string): string {
  return convertList(text, /^[-*]\s+/, 'ul');
}

/**
 * Convert ordered lists (1. item) to HTML.
 */
export function convertOrderedLists(text: string): string {
  return convertList(text, /^\d+\.\s+/, 'ol');
}

// =============================================================================
// Blockquote Conversion
// =============================================================================

type AlertType = 'note' | 'tip' | 'important' | 'warning' | 'caution';

/**
 * Format blockquote lines as HTML, with alert styling if applicable.
 */
function formatBlockquote(lines: string[], alertType: AlertType | null): string {
  const content = lines.join('<br>');
  if (alertType) {
    return `<p class="${alertType}">ℹ️ <strong>${alertType.toUpperCase()}:</strong> ${content}</p>`;
  }
  return `<blockquote>${content}</blockquote>`;
}

/**
 * Convert blockquotes (> text) to HTML, with special handling for alerts.
 */
export function convertBlockquotes(text: string): string {
  const lines = text.split('\n');
  let inBlockquote = false;
  const formattedLines: string[] = [];
  let blockquoteLines: string[] = [];
  let alertType: AlertType | null = null;

  for (const line of lines) {
    if (line.startsWith('>')) {
      if (!inBlockquote) {
        inBlockquote = true;
      }
      let content = line.slice(1).trim();
      // Check for alert syntax on first line
      if (blockquoteLines.length === 0 && content.startsWith('[!')) {
        const match = content.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/);
        if (match) {
          alertType = match[1].toLowerCase() as AlertType;
          content = content.slice(match[0].length).trim();
          if (content) {
            blockquoteLines.push(content);
          }
          continue;
        }
      }
      blockquoteLines.push(content);
    } else {
      if (inBlockquote) {
        formattedLines.push(formatBlockquote(blockquoteLines, alertType));
        blockquoteLines = [];
        inBlockquote = false;
        alertType = null;
      }
      formattedLines.push(line);
    }
  }

  if (inBlockquote) {
    formattedLines.push(formatBlockquote(blockquoteLines, alertType));
  }

  return formattedLines.join('\n');
}

// =============================================================================
// Table Conversion
// =============================================================================

/**
 * Parse a table and return HTML table or original text if invalid.
 */
function parseTable(tableText: string): string {
  const tableLines = tableText.trim().split('\n');
  if (tableLines.length < 2) {
    return tableText;
  }

  const headerRow = tableLines[0];
  const separatorRow = tableLines[1];

  const headers = headerRow.split('|').slice(1, -1).map(cell => cell.trim());
  const separators = separatorRow.split('|').slice(1, -1).map(cell => cell.trim());

  if (!separators.every(sep => /^-+$/.test(sep) || sep === '')) {
    return tableText;
  }

  let html = '<table class="tg"><thead><tr>';
  for (const header of headers) {
    html += `<th class="tg-0pky">${header}</th>`;
  }
  html += '</tr></thead><tbody>';

  for (const row of tableLines.slice(2)) {
    if (row.trim()) {
      const cells = row.split('|').slice(1, -1).map(cell => cell.trim());
      html += '<tr>';
      for (const cell of cells) {
        html += `<td class="tg-0pky">${cell}</td>`;
      }
      html += '</tr>';
    }
  }

  html += '</tbody></table>';
  return html;
}

/**
 * Convert Markdown tables to HTML tables.
 */
export function convertTables(text: string): string {
  return text.replace(/(?:^\|.*\|$\n?)+/gm, match => parseTable(match));
}

// =============================================================================
// Newline and Pretty-Print Handling
// =============================================================================

/**
 * Convert newlines to <br/> except inside <pre> blocks and after headers.
 */
export function convertNewlinesOutsidePre(text: string): string {
  const parts = text.split(/(<pre><code>[\s\S]*?<\/code><\/pre>)/);
  const result: string[] = [];

  for (const part of parts) {
    if (part.startsWith('<pre><code>')) {
      result.push(part);
    } else {
      let converted = part.replace(/\n/g, '<br/>');
      converted = converted.replace(/(\/h[1-6]>)<br\/>/g, '$1');
      result.push(converted);
    }
  }

  return result.join('');
}

/**
 * Add newlines after structural HTML tags for readability.
 */
export function prettyPrintHtml(text: string): string {
  text = text.replace(/<\/h[1-6]>|<\/ul>|<\/ol>|<\/blockquote>|<\/pre>/g, '$&\n');
  text = text.replace(/<br\/?>/g, '$&\n');
  text = text.replace(/<hr\/?>/g, '$&\n');
  text = text.replace(/<li>/g, '$&\n');
  text = text.replace(/<\/li>/g, '$&\n');
  return text;
}

// =============================================================================
// Output Wrapper
// =============================================================================

/**
 * Wrap output in [code] tags and add CSS styles if needed.
 */
export function wrapWithCodeTags(text: string): string {
  let css = '';
  if (text.includes('<code>')) {
    css += CODE_CSS;
  }
  if (text.includes('<span class="highlight">')) {
    css += HIGHLIGHT_CSS;
  }
  if (/class="(note|tip|important|warning|caution)"/.test(text)) {
    css += ALERT_CSS;
  }
  if (text.includes('<table class="tg">')) {
    css += TABLE_CSS;
  }
  if (css) {
    text = css + '\n' + text;
  }
  return `[code]${text}[/code]`;
}

// =============================================================================
// Main Converter
// =============================================================================

export interface ConvertOptions {
  /** Skip wrapping output in [code] tags */
  skipCodeTags?: boolean;
  /** Skip pretty-printing (newlines after tags) */
  skipPrettyPrint?: boolean;
}

/**
 * Convert Markdown text to ServiceNow journal format.
 *
 * @param markdownText - Input Markdown text
 * @param options - Optional configuration
 * @returns Formatted text for ServiceNow journal fields
 */
export function convertMarkdownToServiceNow(
  markdownText: string,
  options: ConvertOptions = {}
): string {
  let text = markdownText;

  // Convert structural elements
  text = convertHeaders(text);

  // Convert text formatting
  text = convertTextFormatting(text);

  // Convert code (blocks first, then inline)
  text = convertCodeBlocks(text);
  text = convertInlineCode(text);

  // Convert images and links (images first to avoid conflict)
  text = convertImages(text);
  text = convertLinks(text);

  // Convert horizontal rules
  text = convertHorizontalRules(text);

  // Convert lists
  text = convertUnorderedLists(text);
  text = convertOrderedLists(text);

  // Convert blockquotes
  text = convertBlockquotes(text);

  // Convert tables
  text = convertTables(text);

  // Handle newlines and pretty-print
  text = convertNewlinesOutsidePre(text);

  if (!options.skipPrettyPrint) {
    text = prettyPrintHtml(text);
  }

  // Wrap output
  if (!options.skipCodeTags) {
    text = wrapWithCodeTags(text);
  }

  return text;
}

// Default export for convenience
export default convertMarkdownToServiceNow;
