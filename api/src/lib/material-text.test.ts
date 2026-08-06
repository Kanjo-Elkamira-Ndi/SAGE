import { describe, expect, it, vi } from 'vitest';
import { extractTextFromMaterial, truncateText } from './material-text';

const pdfParseMock = vi.hoisted(() => vi.fn());
vi.mock('pdf-parse', () => ({ __esModule: true, default: pdfParseMock }));

describe('truncateText', () => {
  it('returns short text unchanged', () => {
    expect(truncateText('hello world', 100)).toBe('hello world');
  });

  it('truncates to the limit keeping whole words', () => {
    const text = 'word '.repeat(2000);
    const out = truncateText(text, 100);
    expect(out.length).toBeLessThanOrEqual(100);
  });
});

describe('extractTextFromMaterial', () => {
  it('reads notes as UTF-8 text', async () => {
    const text = await extractTextFromMaterial('notes', Buffer.from('Hello notes', 'utf8'));
    expect(text).toBe('Hello notes');
  });

  it('throws MATERIAL_TEXT_EMPTY for blank notes', async () => {
    await expect(extractTextFromMaterial('notes', Buffer.from('   \n', 'utf8'))).rejects.toMatchObject({
      code: 'MATERIAL_TEXT_EMPTY',
    });
  });

  it('parses PDF via pdf-parse and trims', async () => {
    pdfParseMock.mockResolvedValue({ text: '  Page one  ' });
    const text = await extractTextFromMaterial('pdf', Buffer.from('%PDF-1.4'));
    expect(text).toBe('Page one');
  });

  it('throws PDF_PARSE_FAILED when pdf-parse rejects', async () => {
    pdfParseMock.mockRejectedValue(new Error('bad pdf'));
    await expect(extractTextFromMaterial('pdf', Buffer.from('x'))).rejects.toMatchObject({
      code: 'PDF_PARSE_FAILED',
    });
  });

  it('rejects pptx for now', async () => {
    await expect(extractTextFromMaterial('pptx', Buffer.from('x'))).rejects.toMatchObject({
      code: 'MATERIAL_TYPE_UNSUPPORTED',
    });
  });
});
