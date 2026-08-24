#!/usr/bin/env node
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const WEB = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const tokens = JSON.parse(
  await readFile(new URL('./tokens.json', import.meta.url), 'utf8'),
);

const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const vars = (palette, indent) =>
  Object.entries(palette)
    .map(([name, hex]) => `${indent}--wbill-${kebab(name)}: ${hex};`)
    .join('\n');

const css = `/* Generated from apps/web/tools/tokens.json by apps/web/tools/generate-tokens.mjs. Do not edit. */

:root {
${vars(tokens.colors.light, '  ')}
}

@media (prefers-color-scheme: dark) {
  :root {
${vars(tokens.colors.dark, '    ')}
  }
}

/* \`inline\` keeps the var() reference in the generated utility, so every
   colour utility follows prefers-color-scheme with no dark: prefixes. */
@theme inline {
${Object.keys(tokens.colors.light)
  .map((name) => `  --color-${kebab(name)}: var(--wbill-${kebab(name)});`)
  .join('\n')}
${Object.entries(tokens.radius)
  .map(([name, px]) => `  --radius-${name}: ${px}px;`)
  .join('\n')}
}
`;

const ts = `// Generated from apps/web/tools/tokens.json by apps/web/tools/generate-tokens.mjs. Do not edit.
export const brand = {
  name: ${JSON.stringify(tokens.site.name)},
  url: ${JSON.stringify(tokens.site.url)},
  email: ${JSON.stringify(tokens.contact.email)},
  colors: ${JSON.stringify(tokens.colors, null, 2)},
} as const;
`;

for (const [rel, body] of [
  ['app/tokens.css', css],
  ['lib/brand.ts', ts],
]) {
  await mkdir(path.dirname(path.join(WEB, rel)), { recursive: true });
  await writeFile(path.join(WEB, rel), body);
  console.log(`  apps/web/${rel}`);
}
