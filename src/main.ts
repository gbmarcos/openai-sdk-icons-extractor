#!/usr/bin/env node

import { Command } from 'commander';
import glob from 'fast-glob';
import { mkdir, writeFile } from 'fs/promises';
import { basename, join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { extractSvgFromTsx } from './extractor.js';
import { transformSvg } from './transformer.js';
import { log } from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ProcessResult {
  file: string;
  success: boolean;
  error?: string;
}

interface Options {
  input: string;
  output: string;
  width?: string;
  height?: string;
}

/**
 * Converts a string from PascalCase/camelCase to snake_case
 */
function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

/**
 * Processes a single TSX file: extract SVG, transform it, and save as .svg
 */
async function processFile(
  inputPath: string,
  outputDir: string,
  width?: string,
  height?: string
): Promise<ProcessResult> {
  const fileName = basename(inputPath, '.tsx');
  const snakeCaseFileName = toSnakeCase(fileName);
  const outputPath = join(outputDir, `${snakeCaseFileName}.svg`);
  
  // Extract SVG from TSX
  const extractResult = await extractSvgFromTsx(inputPath);
  if (!extractResult.success) {
    return {
      file: inputPath,
      success: false,
      error: extractResult.error.message
    };
  }
  
  // Transform SVG
  const transformResult = transformSvg(extractResult.data, { width, height });
  if (!transformResult.success) {
    return {
      file: inputPath,
      success: false,
      error: transformResult.error.message
    };
  }
  
  // Write to output file
  try {
    await writeFile(outputPath, transformResult.data, 'utf-8');
    return {
      file: inputPath,
      success: true
    };
  } catch (error) {
    return {
      file: inputPath,
      success: false,
      error: `Failed to write output file: ${error}`
    };
  }
}

/**
 * Main CLI function
 */
async function main(options: Options): Promise<void> {
  const inputDir = options.input;
  const outputDir = options.output;
  const { width, height } = options;
  
  log.info(`Converting TSX icons from: ${inputDir}`);
  log.info(`Output directory: ${outputDir}`);
  if (width || height) {
    log.info(`Custom dimensions: ${width ? `width="${width}"` : ''} ${height ? `height="${height}"` : ''}`.trim());
  }
  
  // Create output directory if it doesn't exist
  try {
    await mkdir(outputDir, { recursive: true });
  } catch (error) {
    log.error(`Failed to create output directory: ${error}`);
    process.exit(1);
  }
  
  // Find all .tsx files in input directory (non-recursive)
  const pattern = join(inputDir, '*.tsx');
  let files: string[];
  
  try {
    files = await glob(pattern, { onlyFiles: true, deep: 1 });
  } catch (error) {
    log.error(`Failed to find TSX files: ${error}`);
    process.exit(1);
  }
  
  if (files.length === 0) {
    log.warn(`No TSX files found in ${inputDir}`);
    return;
  }
  
  log.info(`Found ${files.length} TSX file(s)`);
  
  // Process all files
  const results: ProcessResult[] = [];
  for (const file of files) {
    const result = await processFile(file, outputDir, width, height);
    results.push(result);
    
    if (result.success) {
      log.success(`Converted: ${basename(file)}`);
    } else {
      log.error(`Failed: ${basename(file)} - ${result.error}`);
    }
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('');
  log.info(`Summary: ${successful} successful, ${failed} failed`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

// CLI setup
const program = new Command()
  .name('tsx-to-svg')
  .description('Convert TSX icon files to clean SVG files')
  .version('1.0.0')
  .option(
    '-i, --input <path>',
    'Input directory containing TSX files',
    './icons'
  )
  .option(
    '-o, --output <path>',
    'Output directory for SVG files',
    './results'
  )
  .option(
    '--width <value>',
    'Set width attribute for all SVG files (replaces existing values)'
  )
  .option(
    '--height <value>',
    'Set height attribute for all SVG files (replaces existing values)'
  )
  .action(async (options) => {
    await main(options);
  });

program.parse();

