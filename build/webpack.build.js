const path = require("path");
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base')
const resolve = filePath => path.resolve(__dirname, filePath)

const env = process.env.ENV

const config = {
    mode: 'production',
    target: env,
    entry: [
        resolve('../src/index.ts'),
    ],
    output: {
        path: resolve('../dist'),
        filename: env === 'node' ? 'mcanvas.node.js' : 'mcanvas.web.js',
        library: 'MCanvas',
        libraryTarget: 'umd'
    }
}

module.exports = merge(baseConfig, config)