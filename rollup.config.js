const fs = require('fs');
const path = require('path');
import { promisify } from 'util';

import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import string from '@ali/rollup-plugin-string';
import { terser } from "rollup-plugin-terser";

const readFile = promisify(fs.readFile);

const { LERNA_PACKAGE_NAME, PWD } = process.env;

let fileDirs;
// console.log(JSON.stringify(process.env));
if (!LERNA_PACKAGE_NAME) {
  console.log("build all");
  const pkgDir = path.join(__dirname, 'packages');
  const getDirs = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory() && f !== "r3-examples");

  fileDirs = getDirs(pkgDir);
} else {
  console.log("specify package");
  const dirname = path.basename(PWD);
  fileDirs = [dirname];
}

const pkg = (name, type) => {
  const location = path.resolve(__dirname, 'packages', name);
  let main = path.join('src', 'index.ts');
  return makeRollupConfig({ location, main, name, type });
};


let promises = [...fileDirs.map(name => pkg(name, 'module'))];

if (process.env.NODE_ENV === 'BUILD') {
  promises = [...['r3'].map(name => pkg(name, 'compress'))];
}


export default Promise.all(promises);

async function makeRollupConfig({ location, main, name, type }) {
  const extensions = [
    ".js", ".jsx", ".ts", ".tsx",
  ];

  const pkg = JSON.parse(
    await readFile(path.resolve(location, 'package.json'), {
      encoding: 'utf-8',
    }),
  );

  const commonPlugins = [
    resolve({ extensions, preferBuiltins: true }),
    string({
      include: /\.glsl$/
    }),
    babel({
      extensions,
      exclude: [
        'node_modules/**',
        'packages/**/node_modules/**',
      ],
      presets: [
        ["@babel/env"],
        ["@babel/preset-typescript"]
      ],
      plugins: [
        "@babel/plugin-proposal-export-namespace-from",
        "@babel/proposal-class-properties",
        "@babel/proposal-object-rest-spread"
      ]
    }),
    commonjs(),
  ];

  let input = path.join(location, main);
  if (!fs.existsSync(input)) {
    input = path.join(location, 'src', 'index.js');
  }

  if (type === 'compress') {
    return {
      input,
      output: {
        name: name,
        file: path.join(location, pkg.browser),
        format: 'umd',
        sourcemap: true
      },
      plugins: [
        ...commonPlugins,
        terser(),
      ],
    };
  }

  return {
    input,
    output: [
      {
        format: 'cjs',
        file: path.join(location, pkg.main),
        sourcemap: true,
      },
      {
        file: path.join(location, pkg.module),
        format: 'es',
        sourcemap: true,
      }
    ],
    external: Object.keys(pkg.dependencies || {}),
    plugins: [
      ...commonPlugins,
    ],
  };
}


