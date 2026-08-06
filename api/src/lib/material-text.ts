import pdfParse from 'pdf-parse';
import { AppError } from './errors';
import { env } from '../config/env';
import type { MaterialType } from './storage';

/** Maximum number of characters of extracted text to forward to the LLM. */
const MAX_TEXT_CHARS = env.MAX_MATERIAL_TEXT_CHARS;

/**
 * Extracts plain text from a material's raw bytes based on its type.
 * - `notes` / text-based notes: interpreted as UTF-8 text.
 * - `pdf`: parsed via pdf-parse.
 * - `pptx`: not supported for server-side text extraction in v1.
 */
export async function extractTextFromMaterial(
  type: MaterialType,
  bytes: Buffer,
): Promise<string> {
  switch (type) {
    case 'notes': {
      const text = bytes.toString('utf8').trim();
      if (!text) {
        throw new AppError('MATERIAL_TEXT_EMPTY', 'The selected material contains no readable text.', 422);
      }
      return text;
    }
    case 'pdf': {
      try {
        const data = await pdfParse(bytes);
        const text = (data.text ?? '').trim();
        if (!text) {
          throw new AppError('MATERIAL_TEXT_EMPTY', 'No text could be extracted from this PDF.', 422);
        }
        return text;
      } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError(
          'PDF_PARSE_FAILED',
          'Failed to parse the PDF material.',
          422,
          err instanceof Error ? err.message : undefined,
        );
      }
    }
    case 'pptx':
      throw new AppError(
        'MATERIAL_TYPE_UNSUPPORTED',
        'PowerPoint (.pptx) materials are not yet supported for AI quiz generation. Upload a PDF or notes file.',
        422,
      );
  }
}

/** Trims text to a safe size for LLM context, keeping whole words. */
export function truncateText(text: string, maxChars = MAX_TEXT_CHARS): string {
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastSpace = Math.max(cut.lastIndexOf(' '), cut.lastIndexOf('\n'));
  if (lastSpace > maxChars * 0.8) {
    return cut.slice(0, lastSpace).trim();
  }
  return cut.trim();
}
