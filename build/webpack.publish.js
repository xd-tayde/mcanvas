const path = require("path");
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base')

const resolve = filePath => path.resolve(__dirname, filePath)

const config = {
    mode: 'production',
    entry: [
        resolve('../src/index.ts'),
    ],
    output: {
        path: resolve('../dist'),
        filename: 'mcanvas.js',
        library: 'MCanvas',
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"]
    },
    module: {
        rules: [{
            test: /\.(ts|tsx)$/,
            use: [{
                loader: require.resolve('ts-loader'),
                options: {
                    transpileOnly: true,
                    configFile: 'tsconfig.json'
                },
            }]
        }, {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
            loader: require.resolve('url-loader'),
            options: {
                limit: 5000,
                name: 'static/media/[name].[hash:8].[ext]',
            },
        }, {
            test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
            use: [{
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: 'fonts/'
                }
            }]
        }, {
            test: /\.s[ac]ss$/i,
            use: [
              'style-loader',
              'css-loader',
              'sass-loader',
            ],
        }, {
            test: /\.css$/,
            use: [
                require.resolve('css-loader'),
            ],
        }]
    },
}

module.exports = merge(baseConfig, config)