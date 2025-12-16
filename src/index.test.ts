import { describe, it, expect } from 'vitest';
import {
  convertHeaders,
  convertBold,
  convertItalic,
  convertBoldItalic,
  convertStrikethrough,
  convertHighlight,
  convertCodeBlocks,
  convertInlineCode,
  convertImages,
  convertLinks,
  convertHorizontalRules,
  convertUnorderedLists,
  convertOrderedLists,
  convertBlockquotes,
  convertTables,
  convertMarkdownToServiceNow,
} from './index';

describe('convertHeaders', () => {
  it('converts h1', () => {
    expect(convertHeaders('# Hello')).toBe('<h1>Hello</h1>');
  });

  it('converts h2-h6', () => {
    expect(convertHeaders('## Level 2')).toBe('<h2>Level 2</h2>');
    expect(convertHeaders('### Level 3')).toBe('<h3>Level 3</h3>');
    expect(convertHeaders('###### Level 6')).toBe('<h6>Level 6</h6>');
  });

  it('handles multiple headers', () => {
    const input = '# Title\n## Subtitle';
    const expected = '<h1>Title</h1>\n<h2>Subtitle</h2>';
    expect(convertHeaders(input)).toBe(expected);
  });
});

describe('text formatting', () => {
  it('converts bold with **', () => {
    expect(convertBold('**bold**')).toBe('<strong>bold</strong>');
  });

  it('converts bold with __', () => {
    expect(convertBold('__bold__')).toBe('<strong>bold</strong>');
  });

  it('converts italic with *', () => {
    expect(convertItalic('*italic*')).toBe('<em>italic</em>');
  });

  it('converts italic with _', () => {
    expect(convertItalic('_italic_')).toBe('<em>italic</em>');
  });

  it('converts bold+italic with ***', () => {
    expect(convertBoldItalic('***both***')).toBe('<strong><em>both</em></strong>');
  });

  it('converts strikethrough', () => {
    expect(convertStrikethrough('~~deleted~~')).toBe('<strike>deleted</strike>');
  });

  it('converts highlight', () => {
    expect(convertHighlight('==highlighted==')).toBe('<span class="highlight">highlighted</span>');
  });
});

describe('code conversion', () => {
  it('converts inline code', () => {
    expect(convertInlineCode('use `npm install`')).toBe('use <code>npm install</code>');
  });

  it('converts code blocks', () => {
    const input = '```js\nconst x = 1;\n```';
    const expected = '<pre><code>const x = 1;\n</code></pre>';
    expect(convertCodeBlocks(input)).toBe(expected);
  });
});

describe('links and images', () => {
  it('converts links', () => {
    expect(convertLinks('[Google](https://google.com)')).toBe('<a href="https://google.com">Google</a>');
  });

  it('converts images', () => {
    expect(convertImages('![Alt text](image.png)')).toBe('<img src="image.png" alt="Alt text">');
  });
});

describe('horizontal rules', () => {
  it('converts ---', () => {
    expect(convertHorizontalRules('---')).toBe('<hr>');
  });

  it('converts ***', () => {
    expect(convertHorizontalRules('***')).toBe('<hr>');
  });
});

describe('lists', () => {
  it('converts unordered list with -', () => {
    const input = '- Item 1\n- Item 2';
    const expected = '<ul><li>Item 1</li><li>Item 2</li></ul>';
    expect(convertUnorderedLists(input)).toBe(expected);
  });

  it('converts unordered list with *', () => {
    const input = '* Item 1\n* Item 2';
    const expected = '<ul><li>Item 1</li><li>Item 2</li></ul>';
    expect(convertUnorderedLists(input)).toBe(expected);
  });

  it('converts ordered list', () => {
    const input = '1. First\n2. Second';
    const expected = '<ol><li>First</li><li>Second</li></ol>';
    expect(convertOrderedLists(input)).toBe(expected);
  });
});

describe('blockquotes', () => {
  it('converts simple blockquote', () => {
    expect(convertBlockquotes('> Quote')).toBe('<blockquote>Quote</blockquote>');
  });

  it('converts multi-line blockquote', () => {
    const input = '> Line 1\n> Line 2';
    const expected = '<blockquote>Line 1<br>Line 2</blockquote>';
    expect(convertBlockquotes(input)).toBe(expected);
  });

  it('converts alert blockquotes', () => {
    const input = '> [!NOTE]\n> This is a note';
    expect(convertBlockquotes(input)).toContain('class="note"');
    expect(convertBlockquotes(input)).toContain('NOTE:');
  });
});

describe('tables', () => {
  it('converts simple table', () => {
    const input = '| A | B |\n|---|---|\n| 1 | 2 |';
    const result = convertTables(input);
    expect(result).toContain('<table class="tg">');
    expect(result).toContain('<th class="tg-0pky">A</th>');
    expect(result).toContain('<td class="tg-0pky">1</td>');
  });
});

describe('convertMarkdownToServiceNow', () => {
  it('wraps output in [code] tags', () => {
    const result = convertMarkdownToServiceNow('# Hello');
    expect(result.startsWith('[code]')).toBe(true);
    expect(result.endsWith('[/code]')).toBe(true);
  });

  it('includes CSS when code is present', () => {
    const result = convertMarkdownToServiceNow('Use `npm`');
    expect(result).toContain('<style type="text/css">');
    expect(result).toContain('code {');
  });

  it('respects skipCodeTags option', () => {
    const result = convertMarkdownToServiceNow('# Hello', { skipCodeTags: true });
    expect(result.startsWith('[code]')).toBe(false);
  });
});
