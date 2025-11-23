import { readFile } from 'fs/promises';

export type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: Error };

export class ExtractionError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'ExtractionError';
  }
}

/**
 * Extracts the first SVG tag and its content from a TSX file
 */
export async function extractSvgFromTsx(filePath: string): Promise<Result<string>> {
  try {
    const content = await readFile(filePath, 'utf-8');
    
    // Find the return statement with the SVG
    // Look for <svg with space or > after it (to avoid matching SVGElement type)
    const svgMatch = content.match(/<svg[\s>][^]*?<\/svg>/i);
    
    if (!svgMatch) {
      return {
        success: false,
        error: new ExtractionError(`No SVG tag found in file: ${filePath}`)
      };
    }
    
    // Extract just the SVG element
    let svgContent = svgMatch[0];
    
    // Find the proper opening tag (should have space or > after svg)
    const openingMatch = svgContent.match(/<svg[\s>]/i);
    if (openingMatch) {
      const startIndex = svgContent.indexOf(openingMatch[0]);
      svgContent = svgContent.substring(startIndex);
    }
    
    return {
      success: true,
      data: svgContent
    };
  } catch (error) {
    return {
      success: false,
      error: new ExtractionError(
        `Failed to read or extract SVG from file: ${filePath}`,
        error
      )
    };
  }
}

