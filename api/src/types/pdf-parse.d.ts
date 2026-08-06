declare module 'pdf-parse' {
  export interface PDFData {
    numpages: number;
    numRenderPages: number;
    info: Record<string, unknown>;
    metadata: Record<string, unknown>;
    text: string;
    version: string;
  }

  /**
   * Extracts text from a PDF buffer.
   * @param dataBuffer - A Node.js Buffer containing PDF bytes.
   */
  function pdfParse(dataBuffer: Buffer): Promise<PDFData>;
  export default pdfParse;
}
