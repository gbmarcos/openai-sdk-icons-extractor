# OpenAI Apps SDK UI - SVG Icon Extractor

A TypeScript CLI tool specifically designed to extract and convert SVG icons from the **OpenAI Apps SDK UI** component library into clean, standalone SVG files.

[OpenAI Apps SDK UI](https://github.com/openai/apps-sdk-ui) is a resource provided by OpenAI for developers building applications for ChatGPT. This tool extracts the icon components from TSX format and converts them into pure SVG files ready to use in any project.

## Features

- Extracts SVG content from OpenAI SDK TSX icon components
- Removes React-specific props (`{...props}`)
- Converts JSX numeric values to standard SVG attributes
- Automatically calculates dimensions from `viewBox` or uses custom values
- Adds proper SVG namespace (`xmlns`)
- Replaces `currentColor` with customizable hex color (default: `#000000`)
- Converts camelCase attributes to kebab-case (`fillRule` → `fill-rule`)
- Preserves special SVG attributes (`viewBox`, `preserveAspectRatio`, etc.)
- Converts filenames to snake_case
- Processes multiple files in batch
- Clean error reporting with color validation

## About OpenAI Apps SDK UI

The OpenAI Apps SDK UI is a comprehensive UI library provided by OpenAI for developers creating applications that integrate with ChatGPT. It includes a complete set of icon components designed to maintain consistency with ChatGPT's interface.

This tool allows you to:
- Extract icons from the SDK's TSX components
- Use them as standalone SVG files in any web project
- Customize dimensions and colors as needed

## Getting the Icons from OpenAI SDK

1. Clone or download the OpenAI Apps SDK UI repository:
   ```bash
   git clone https://github.com/openai/apps-sdk-ui.git
   ```

2. Copy the icon components from the SDK to the `icons/` folder:
   ```bash
   cp apps-sdk-ui/src/components/Icon/svg/*.tsx ./icons/
   ```

3. Run the converter to generate SVG files

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

### Custom Width and Height

Replace all width and height values with custom dimensions:

```bash
npm start -- --width 24 --height 24
```

This will replace any existing width/height values (like `1em`, `20px`, etc.) with the specified values.

### Automatic Dimension Extraction from ViewBox

If you **don't** specify `--width` or `--height`, the tool will automatically extract dimensions from the `viewBox` attribute:

```bash
npm start  # No width/height specified
```

**Example:**
- If `viewBox="0 0 6 6"` → automatically sets `width="6" height="6"`
- If `viewBox="0 0 24 24"` → automatically sets `width="24" height="24"`
- If no `viewBox` exists → leaves original values unchanged

### Custom Color Replacement

Replace `currentColor` with a custom hex color:

```bash
npm start -- --color "#404040"
```

This will replace all instances of `currentColor` with your specified color. If not provided, defaults to `#000000` (black).

**Example:**
```bash
npm start -- --color "#ff0000"  # Red icons
npm start -- --color "#3b82f6"  # Blue icons
npm start                        # Black icons (default)
```

### Organize Icons by Group

Use `--group` to organize icons into subdirectories. Files will be saved in a folder with the group name:

```bash
npm start -- --color "#ffffff" --group "dark"
```

This will generate files in `results/dark/`:
```
results/dark/
├── add_member.svg
├── arrow_up.svg
└── ...
```

**Example use cases:**
```bash
# Generate dark theme icons (white) in results/dark/
npm start -- --color "#ffffff" --group "dark"

# Generate light theme icons (black) in results/light/
npm start -- --color "#000000" --group "light"

# Generate brand colored icons in results/brand/
npm start -- --color "#3b82f6" --group "brand"

# Supports hyphens and underscores
npm start -- --color "#ffffff" --group "dark-mode"
npm start -- --color "#000000" --group "light_theme"
```

**Note:** Group name must contain only letters, numbers, hyphens (`-`), and underscores (`_`). Spaces and special characters are not allowed.

### CLI Options

- `-i, --input <path>` - Input directory containing TSX files (default: `./icons`)
- `-o, --output <path>` - Output directory for SVG files (default: `./results`)
- `--width <value>` - Set width attribute for all SVG files (replaces existing values)
- `--height <value>` - Set height attribute for all SVG files (replaces existing values)
- `--color <hex>` - Hex color to replace currentColor (e.g., `#404040`, default: `#000000`)
- `--group <name>` - Group icons in a subdirectory (e.g., `"dark"` → `results/dark/icon.svg`)
  - Only letters, numbers, hyphens, and underscores allowed
  - No spaces or special characters
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

### 3. Replace Width and Height

The tool intelligently handles width and height attributes:

**Option A: Custom dimensions (with --width/--height):**
```bash
npm start -- --width 32 --height 32
```
```tsx
# Before: <svg width="1em" height="1em" viewBox="0 0 24 24">
# After:  <svg width="32" height="32" viewBox="0 0 24 24">
```

**Option B: Auto-extract from viewBox (default):**
```bash
npm start  # No width/height specified
```
```tsx
# Before: <svg width="1em" height="1em" viewBox="0 0 6 6">
# After:  <svg width="6" height="6" viewBox="0 0 6 6">
```

If no viewBox exists and no custom dimensions are provided, original values remain unchanged.

### 4. Convert JSX Numeric Values to Strings

**Before:**
```tsx
<rect width={6} height={7} rx={45} />
```

**After:**
```svg
<rect width="6" height="7" rx="45" />
```

JSX numeric expressions (values in curly braces) are converted to standard SVG string attributes.

### 5. Replace Dynamic Colors

**Before:**
```svg
<path stroke="currentColor" fill="currentColor" />
```

**After (default):**
```svg
<path stroke="#000000" fill="#000000" />
```

**After (with --color "#404040"):**
```svg
<path stroke="#404040" fill="#404040" />
```

The replacement color can be customized using the `--color` option.

### 6. Convert CamelCase Attributes to Kebab-Case

**Before:**
```tsx
<path fillRule="evenodd" clipRule="evenodd" />
```

**After:**
```svg
<path fill-rule="evenodd" clip-rule="evenodd" />
```

React/JSX uses camelCase for SVG attributes, but standard SVG uses kebab-case. The tool automatically converts attributes like `fillRule`, `clipRule`, `strokeWidth`, etc. to their proper SVG format.

**Note:** Special SVG attributes that must remain in camelCase (like `viewBox`, `preserveAspectRatio`) are preserved correctly.

## Use Case

This tool is particularly useful when you want to:
- Use OpenAI's icon set in non-React projects
- Create a custom icon library with consistent styling
- Integrate ChatGPT-style icons in static websites or other frameworks
- Build design systems based on OpenAI's visual language
- Generate multiple icon groups for different themes (light, dark, brand colors)

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

### Output (default): `results/add_member.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#000000">
  <path d="M11.4998 7.5C11.4998 5.01472..." fill="#000000" />
</svg>
```

### Output (with --color "#ffffff" --group "dark"): `results/dark/add_member.svg`

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ffffff">
  <path d="M11.4998 7.5C11.4998 5.01472..." fill="#ffffff" />
</svg>
```

**Note:** When using `--group`, files are saved in a subdirectory with the group name.

## Real World Example: Generating Multiple Icon Groups

Generate icons for both light and dark themes organized in separate directories:

```bash
# Generate dark theme icons (white color) in results/dark/
npm start -- --color "#ffffff" --group "dark"

# Generate light theme icons (black color) in results/light/
npm start -- --color "#000000" --group "light"

# Generate brand colored icons in results/brand/
npm start -- --color "#3b82f6" --group "brand"
```

This will create:
```
results/
├── dark/
│   ├── add_member.svg    # White icons for dark backgrounds
│   ├── arrow_up.svg
│   └── ...
├── light/
│   ├── add_member.svg    # Black icons for light backgrounds
│   ├── arrow_up.svg
│   └── ...
└── brand/
    ├── add_member.svg    # Blue brand colored icons
    ├── arrow_up.svg
    └── ...
```

Use them in your application:
```html
<!-- Dark theme -->
<img src="icons/dark/add_member.svg" alt="Add Member">

<!-- Light theme -->
<img src="icons/light/add_member.svg" alt="Add Member">

<!-- Brand theme -->
<img src="icons/brand/add_member.svg" alt="Add Member">
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

