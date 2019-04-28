import babel from 'rollup-plugin-babel'
import { uglify } from 'rollup-plugin-uglify'
import sourcemaps from 'rollup-plugin-sourcemaps'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

const packages = require('./package.json')
const env = process.env.NODE_ENV
const paths = {
    root: '/',
    source: {
        root: env === 'example' ? './example/' : './src/',
    },
    dist: {
        root: env === 'example' ? './example/dist/' : './dist/',
    },
}

let fileName,
    Configure

switch (process.env.NODE_ENV) {
    case 'development':
        fileName = packages.name
        break
    case 'example':
        fileName = `example`
        break
    case 'production':
        fileName = `${packages.name}.min`
        break
}

Configure = {
    input: `${paths.source.root}index.js`,
    output: {
        file: `${paths.dist.root}${fileName}.js`,
        format: 'umd',
        name: 'MCanvas',
        sourcemap: true,
    },
    plugins: [
        babel({
            exclude: 'node_modules/**', 
            babelrc: false,
            presets: [['@babel/preset-env', { modules: false }]],
            runtimeHelpers: true,
            plugins: [],
          }),
        sourcemaps(),
        resolve(),
        commonjs(),
    ],
}

if (process.env.NODE_ENV === 'production') {
    Configure.plugins.push(uglify())
} else {
    // Configure.targets.push({dest: `${paths.dist.root}${fileName}.es.js`, format: 'es'})
}

export default Configure
