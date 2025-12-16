# markdown-servicenow

> Convert Markdown to ServiceNow journal field format with rich HTML formatting

[![npm version](https://img.shields.io/npm/v/markdown-servicenow.svg)](https://www.npmjs.com/package/markdown-servicenow)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Write your incident notes, change requests, and documentation in Markdown — get beautifully formatted ServiceNow journal entries.

## Preview

| Screenshot 1 | Screenshot 2 |
| --- | --- |
| <img width="600" alt="screenshot 1" src="https://github.com/user-attachments/assets/c4281708-21ae-40fb-8bb3-e925475cb1e1" /> | <img width="600" alt="screenshot 2" src="https://github.com/user-attachments/assets/1263da67-1041-4a7c-9f4f-59f8e6252dae" /> |

---

## Installation

```bash
npm install markdown-servicenow
```

## Quick Start

```typescript
import { convertMarkdownToServiceNow } from 'markdown-servicenow';

const markdown = `
# Issue Summary

**Status:** Resolved

The issue was caused by:
- Missing configuration
- Incorrect permissions

\`\`\`bash
chmod 755 /path/to/file
\`\`\`
`;

const result = convertMarkdownToServiceNow(markdown);
// ✅ Ready to paste into ServiceNow journal fields!
```

---

## Features

| Feature | Markdown | Output |
|:--------|:---------|:-------|
| **Headers** | `# H1` to `###### H6` | `<h1>` to `<h6>` |
| **Bold** | `**text**` or `__text__` | `<strong>` |
| **Italic** | `*text*` or `_text_` | `<em>` |
| **Bold+Italic** | `***text***` | `<strong><em>` |
| **Strikethrough** | `~~text~~` | `<strike>` |
| **Highlight** | `==text==` | `<span class="highlight">` |
| **Inline Code** | `` `code` `` | `<code>` |
| **Code Blocks** | ` ```lang ` | `<pre><code>` |
| **Links** | `[text](url)` | `<a href>` |
| **Images** | `![alt](url)` | `<img>` |
| **Unordered Lists** | `- item` or `* item` | `<ul><li>` |
| **Ordered Lists** | `1. item` | `<ol><li>` |
| **Blockquotes** | `> text` | `<blockquote>` |
| **Tables** | `\| a \| b \|` | `<table>` |
| **Horizontal Rules** | `---` or `***` | `<hr>` |

### GitHub-style Alerts

```markdown
> [!NOTE]
> Useful information

> [!WARNING]
> Critical information
```

Supported types: `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, `CAUTION`

---

## API

### `convertMarkdownToServiceNow(markdown, options?)`

Main conversion function.

```typescript
// Default: wraps output in [code] tags with pretty-printing
const result = convertMarkdownToServiceNow(markdown);

// Skip the [code] wrapper (get raw HTML)
const html = convertMarkdownToServiceNow(markdown, { skipCodeTags: true });

// Compact output (no newlines after tags)
const compact = convertMarkdownToServiceNow(markdown, { skipPrettyPrint: true });
```

### Individual Converters

For custom pipelines, use individual functions:

```typescript
import {
  convertHeaders,
  convertBold,
  convertItalic,
  convertBoldItalic,
  convertStrikethrough,
  convertHighlight,
  convertTextFormatting,  // All text formatting combined
  convertCodeBlocks,
  convertInlineCode,
  convertLinks,
  convertImages,
  convertUnorderedLists,
  convertOrderedLists,
  convertBlockquotes,
  convertTables,
  convertHorizontalRules,
  convertNewlinesOutsidePre,
  prettyPrintHtml,
  wrapWithCodeTags,
} from 'markdown-servicenow';
```

---

## Development

```bash
npm install      # Install dependencies
npm run build    # Build for production
npm test         # Run tests
npm run dev      # Watch mode
```

## Limitations

- Nested lists are not supported
- Complex table alignments may not render perfectly

## License

MIT
