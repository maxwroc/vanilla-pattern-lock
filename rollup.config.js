import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export default function (args) {

  let targetFileName = pkg.main;

  const plugins = [
    copy({
      targets: [
        { src: 'src/styles.css', dest: 'dist' },
        { src: 'src/styles.css', dest: 'docs' },
        { src: 'dist/*', dest: 'docs' },
      ],
      hook: 'writeBundle'
    }),
    resolve()
  ];

  const target = args.target ? args.target.toUpperCase() : null;
  const allowedTargets = ["ES3", "ES5", "ES6"];
  if (allowedTargets.some(t => t == target)) {
    plugins.push(typescript({ target: target }));
    targetFileName = targetFileName.replace(".js", `.${target.toLowerCase()}.js`);
  }
  else {
    plugins.push(typescript());
  }

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

  return {
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
  }
};