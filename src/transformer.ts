import { Result } from './extractor.js';

export class TransformationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'TransformationError';
  }
}

/**
 * Transforms extracted SVG content:
 * - Removes {...props}
 * - Adds xmlns attribute if missing
 * - Replaces currentColor with #000000
 * - Converts JSX numeric values {number} to string values "number"
 */
export function transformSvg(svgContent: string): Result<string> {
  try {
    let transformed = svgContent;
    
    // Remove {...props} occurrences (with or without spaces)
    transformed = transformed.replace(/\{\s*\.\.\.\s*props\s*\}/g, '');
    
    // Replace currentColor with #000000 (case-insensitive)
    transformed = transformed.replace(/currentColor/gi, '#000000');
    
    // Convert JSX numeric values {number} to string values "number"
    // Matches patterns like width={24}, height={7}, rx={45}, etc.
    transformed = transformed.replace(/=\{\s*(\d+(?:\.\d+)?)\s*\}/g, '="$1"');
    
    // Add xmlns if not present
    if (!transformed.includes('xmlns=')) {
      // Insert xmlns after the opening svg tag
      transformed = transformed.replace(
        /<svg/i,
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }
    
    // Clean up any double spaces that might have been created
    transformed = transformed.replace(/\s+/g, ' ');
    
    // Clean up spaces before closing tags
    transformed = transformed.replace(/\s+>/g, '>');
    
    return {
      success: true,
      data: transformed
    };
  } catch (error) {
    return {
      success: false,
      error: new TransformationError('Failed to transform SVG content', error)
    };
  }
}

