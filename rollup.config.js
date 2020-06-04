import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import replace from 'rollup-plugin-replace';

import pkg from './package.json';

export default [
    {
        input: 'src/index.js',
        output: [
            {
                file: pkg.web,
                name: 'Presentation3Upgrader',
                format: 'umd',
            },
        ],
        plugins: [
            replace({
                'process.env.NODE_ENV': JSON.stringify('production')
            }),
            resolve({ browser: true }), // so Rollup can find `ms`
            commonjs({ extensions: ['.js'] }),
            babel({
                babelrc: false,
                presets: [['@babel/preset-env', { modules: false }]],
                plugins: [["@babel/plugin-proposal-class-properties", { "loose": true }]]
            }),
            terser(),
            compiler(),
        ],
    },
    {
        input: 'src/index.js',
        output: [
            {
                file: pkg.main,
                format: 'cjs',
            },
            {
                file: pkg.module,
                format: 'es',
            },
        ],
        plugins: [
            replace({
                'process.env.NODE_ENV': JSON.stringify('production')
            }),
            resolve(), // so Rollup can find `ms`
            commonjs({ extensions: ['.js'] }),
        ],
        external: [
            'crypto'
        ]
    },
];
