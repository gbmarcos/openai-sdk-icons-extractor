import { Result } from './extractor.js';

export class TransformationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'TransformationError';
  }
}

export interface TransformOptions {
  width?: string;
  height?: string;
  color?: string;
}

/**
 * Converts camelCase to kebab-case
 * Example: fillRule -> fill-rule
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * SVG attributes that should NOT be converted to kebab-case
 * These are special SVG attributes that must remain in camelCase
 */
const SVG_CAMEL_CASE_ATTRS = new Set([
  'viewBox',
  'preserveAspectRatio',
  'gradientUnits',
  'gradientTransform',
  'clipPathUnits',
  'baseFrequency',
  'calcMode',
  'tableValues',
  'targetX',
  'targetY',
  'patternUnits',
  'patternContentUnits',
  'patternTransform',
  'maskUnits',
  'maskContentUnits'
]);

/**
 * Extracts width and height from viewBox attribute
 * viewBox format: "minX minY width height"
 */
function extractViewBoxDimensions(svgContent: string): { width?: string; height?: string } {
  const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/i);
  if (!viewBoxMatch) {
    return {};
  }
  
  const values = viewBoxMatch[1].split(/\s+/);
  if (values.length >= 4) {
    return {
      width: values[2],
      height: values[3]
    };
  }
  
  return {};
}

/**
 * Transforms extracted SVG content:
 * - Removes {...props}
 * - Adds xmlns attribute if missing
 * - Replaces currentColor with specified color (default: #000000)
 * - Converts JSX numeric values {number} to string values "number"
 * - Replaces width/height attributes if custom values provided or from viewBox
 * - Converts camelCase attributes to kebab-case (except special SVG attributes)
 */
export function transformSvg(svgContent: string, options?: TransformOptions): Result<string> {
  try {
    let transformed = svgContent;
    const replacementColor = options?.color || '#000000';
    
    // Remove {...props} occurrences (with or without spaces)
    transformed = transformed.replace(/\{\s*\.\.\.\s*props\s*\}/g, '');
    
    // Replace currentColor with specified color (case-insensitive)
    transformed = transformed.replace(/currentColor/gi, replacementColor);
    
    // Convert JSX numeric values {number} to string values "number"
    // Matches patterns like width={24}, height={7}, rx={45}, etc.
    transformed = transformed.replace(/=\{\s*(\d+(?:\.\d+)?)\s*\}/g, '="$1"');
    
    // Determine width and height to use
    let targetWidth = options?.width;
    let targetHeight = options?.height;
    
    // If no custom dimensions provided, try to extract from viewBox
    if (!targetWidth || !targetHeight) {
      const viewBoxDimensions = extractViewBoxDimensions(transformed);
      if (!targetWidth && viewBoxDimensions.width) {
        targetWidth = viewBoxDimensions.width;
      }
      if (!targetHeight && viewBoxDimensions.height) {
        targetHeight = viewBoxDimensions.height;
      }
    }
    
    // Replace width and height attributes only in the opening SVG tag
    if (targetWidth || targetHeight) {
      transformed = transformed.replace(/(<svg[^>]*?>)/i, (svgTag) => {
        let modifiedTag = svgTag;
        if (targetWidth) {
          if (/width="[^"]*"/.test(modifiedTag)) {
            modifiedTag = modifiedTag.replace(/width="[^"]*"/, `width="${targetWidth}"`);
          } else {
            modifiedTag = modifiedTag.replace(/<svg/, `<svg width="${targetWidth}"`);
          }
        }
        if (targetHeight) {
          if (/height="[^"]*"/.test(modifiedTag)) {
            modifiedTag = modifiedTag.replace(/height="[^"]*"/, `height="${targetHeight}"`);
          } else {
            modifiedTag = modifiedTag.replace(/<svg/, `<svg height="${targetHeight}"`);
          }
        }
        return modifiedTag;
      });
    }
    
    // Add xmlns if not present
    if (!transformed.includes('xmlns=')) {
      // Insert xmlns after the opening svg tag
      transformed = transformed.replace(
        /<svg/i,
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }
    
    // Convert camelCase attributes to kebab-case
    // Matches attribute names that contain at least one uppercase letter
    // Preserves special SVG attributes that must remain in camelCase
    transformed = transformed.replace(/\s([a-z][a-zA-Z]*[A-Z][a-zA-Z]*)=/g, (match, attrName) => {
      // Don't convert special SVG camelCase attributes
      if (SVG_CAMEL_CASE_ATTRS.has(attrName)) {
        return match;
      }
      return ` ${camelToKebab(attrName)}=`;
    });
    
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

