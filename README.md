# TSX to SVG Converter

A TypeScript CLI tool that extracts SVG content from TSX icon files and converts them to clean, standalone SVG files.

## Features

- Extracts SVG content from React/TSX icon components
- Removes React-specific props (`{...props}`)
- Adds proper SVG namespace (`xmlns`)
- Replaces `currentColor` with black (`#000000`)
- Processes multiple files in batch
- Clean error reporting

## Installation

```bash
npm install
```

## Usage

### Basic Usage

Convert all TSX files from the `icons/` folder to SVG files in the `results/` folder:

```bash
npm start
```

Or using `tsx` directly:

```bash
npm run convert
```

### Custom Input/Output Directories

```bash
npm start -- --input ./my-icons --output ./svg-output
```

### CLI Options

- `-i, --input <path>` - Input directory containing TSX files (default: `./icons`)
- `-o, --output <path>` - Output directory for SVG files (default: `./results`)
- `-V, --version` - Output version number
- `-h, --help` - Display help information

## Transformations

The tool applies the following transformations to each SVG:

### 0. Convert Filename to snake_case

**Before:** `AddMember.tsx`  
**After:** `add_member.svg`

All output filenames are automatically converted from PascalCase/camelCase to snake_case.

### 1. Remove React Props

**Before:**
```tsx
<svg {...props} width="24" height="24">
```

**After:**
```svg
<svg width="24" height="24">
```

### 2. Add XML Namespace

**Before:**
```svg
<svg width="24" height="24">
```

**After:**
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
```

### 3. Convert JSX Numeric Values to Strings

**Before:**
```tsx
<rect width={6} height={7} rx={45} />
```

**After:**
```svg
<rect width="6" height="7" rx="45" />
```

JSX numeric expressions (values in curly braces) are converted to standard SVG string attributes.

### 4. Replace Dynamic Colors

**Before:**
```svg
<path stroke="currentColor" fill="currentColor" />
```

**After:**
```svg
<path stroke="#000000" fill="#000000" />
```

## Example

### Input: `icons/AddMember.tsx`

```tsx
import type { SVGProps } from "react"
const AddMember = (props: SVGProps<SVGSVGElement>) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    {...props}
  >
    <path d="M11.4998 7.5C11.4998 5.01472..." />
  </svg>
)
export default AddMember
```

### Output: `results/add_member.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#000000">
  <path d="M11.4998 7.5C11.4998 5.01472..." fill="#000000" />
</svg>
```

## Project Structure

```
tsx_to_svg/
├── src/
│   ├── main.ts          # CLI entry point
│   ├── extractor.ts     # SVG extraction logic
│   ├── transformer.ts   # SVG transformation
│   └── logger.ts        # Logging utilities
├── icons/               # Input folder (TSX files)
├── results/             # Output folder (SVG files)
├── package.json
├── tsconfig.json
└── README.md
```

## Development

### Watch Mode

Run in development mode with auto-reload:

```bash
npm run dev
```

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

## Requirements

- Node.js >= 18
- npm >= 9

## Error Handling

The tool provides clear error messages for common issues:

- **No TSX files found**: Warns if the input directory is empty
- **No SVG tag found**: Reports files that don't contain SVG content
- **File read/write errors**: Reports permission or I/O issues
- **Transformation errors**: Reports any issues during SVG processing

## License

MIT

