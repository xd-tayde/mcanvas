const path = require("path");
const merge = require('webpack-merge');
const nodeExternals = require("webpack-node-externals");
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
        filename: `mcanvas.${env}.js`,
        library: 'MCanvas',
        libraryTarget: 'umd'
    },
}

if (env === 'node') {
    config.externals = [nodeExternals()]
}

module.exports = merge(baseConfig, config)