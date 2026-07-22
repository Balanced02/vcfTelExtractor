import { defineConfig } from 'tsup';
import * as fs from 'fs/promises';
import * as path from 'path';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    browser: 'src/browser.ts',
  },
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  minify: false,
  onSuccess: async () => {
    const filesToShim = ['index.js', 'browser.js'];
    for (const filename of filesToShim) {
      const filePath = path.join(__dirname, 'dist', filename);
      try {
        let content = await fs.readFile(filePath, 'utf8');
        
        // Append a compatibility shim to export the default export function
        // directly as module.exports, while keeping named exports attached as properties.
        content += `\n
if (typeof module !== 'undefined' && module.exports && module.exports.default) {
  const defaultExport = module.exports.default;
  Object.assign(defaultExport, module.exports);
  module.exports = defaultExport;
}
`;
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`CJS compatibility shim successfully appended to dist/${filename}`);
      } catch (err) {
        console.warn(`Could not append CJS shim to dist/${filename} (maybe ESM-only build or file missing):`, err);
      }
    }
  },
});
