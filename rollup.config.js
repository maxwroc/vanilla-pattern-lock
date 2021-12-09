import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

let targetFileName = pkg.main;

const filesToCopy = [
  { src: 'src/styles.css', dest: 'dist', rename: pkg.name + '.css' }
];

if (!process.env.RELEASE) {
  filesToCopy.push({ src: 'src/styles.css', dest: 'docs', rename: pkg.name + '.css' })
  filesToCopy.push({ src: ['dist/*.js', 'dist/*.map'], dest: 'docs' })
}

const plugins = [
  copy({
    targets: filesToCopy,
    hook: 'writeBundle'
  }),
  resolve(),
  typescript({ useTsconfigDeclarationDir: true })
];

let sourcemapPathTransform = undefined;

if (process.env.RELEASE) {
  plugins.push(
    terser({
      compress: {}
    })
  );

  let repoRoot = pkg.repository.url
    .replace("https://github.com", "https://raw.githubusercontent.com")
    .replace(/.git$/, "");
  repoRoot += "/";

  sourcemapPathTransform = file => repoRoot + "v" + pkg.version + file.substr(2);
}

export default [
  {
    external: [],
    input: 'src/index.ts',
    output: {
      name: "PatternLock",
      globals: {},
      file: targetFileName,
      format: 'iife',
      sourcemap: true,
      sourcemapExcludeSources: true,
      sourcemapPathTransform: sourcemapPathTransform
    },
    plugins: plugins,
  },
  {
    input: 'src/dts/index.d.ts',
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()]
  },
];