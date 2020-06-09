import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';

export default [
  {
    input: 'src/index.ts',
    output: {
      format: 'esm',
      name: 'trkl',
      file: 'dist/trkl.min.js'
    },
    plugins: [typescript(), terser()]
  },
  {
    input: 'src/index.ts',
    output: {
      format: 'esm',
      name: 'trkl',
      file: 'dist/trkl.js'
    },
    plugins: [typescript()]
  },
  {
    input: 'src/index.ts',
    output: {
      format: 'cjs',
      name: 'trkl',
      file: 'dist/trkl.cjs.js'
    },
    plugins: [typescript()]
  }
]