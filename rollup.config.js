import typescript from 'rollup-plugin-typescript2';
import dts from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';


const iifeFilePath = pkg.main.replace(".es", "");

const filesToCopy = [
  { src: 'src/styles.css', dest: 'dist', rename: pkg.name + '.css' }
];



if (!process.env.RELEASE) {
  filesToCopy.push({ src: 'src/styles.css', dest: 'docs', rename: pkg.name + '.css' })
  filesToCopy.push({ src: [iifeFilePath, 'dist/*.map'], dest: 'docs' })
}

const plugins = [
  copy({
    targets: filesToCopy,
    hook: 'writeBundle'
  }),
  resolve(),
  typescript({ 
    tsconfigOverride: { 
      compilerOptions: { 
        declaration: !!process.env.RELEASE,
        declarationDir: "src/dts"
      } 
    },
    useTsconfigDeclarationDir: process.env.RELEASE
  })
];

let sourcemapPathTransform = undefined;

const additionalBundles = [];

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

  // this bundle is the main package bundle (required for import statements from external modules)
  additionalBundles.push({
    external: [],
    input: 'src/index.ts',
    output: {
      name: "PatternLock",
      globals: {},
      file: pkg.main,
      format: 'es',
      sourcemap: false
    },
    plugins: plugins,
  });

  // bundling .d.ts files
  additionalBundles.push({
    input: 'src/dts/index.d.ts',
    output: [{ file: "dist/index.d.ts", format: "es" }],
    plugins: [dts()]
  });
}

export default [
  {
    external: [],
    input: 'src/index.ts',
    output: {
      name: "PatternLock",
      globals: {},
      file: iifeFilePath,
      format: 'iife',
      sourcemap: false, // TODO fix mappings
      sourcemapExcludeSources: true,
      sourcemapPathTransform: sourcemapPathTransform
    },
    plugins: plugins,
  },
  ...additionalBundles
];