const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const os = require('os');

const baseConfig = require('./webpack.base')

const resolve = filePath => path.resolve(__dirname, filePath)
// web-server 配置IP；
const ifaces = os.networkInterfaces();
let devHost = '0.0.0.0';
let port = 9000;
Object.keys(ifaces).forEach(key => {
    for (let i in ifaces[key]) {
        if (ifaces[key][i].family === 'IPv4' && 
        /^(192|172)\./.test(ifaces[key][i].address)) {
            devHost = ifaces[key][i].address;
        }
    }
});

const config = {
    mode: 'development',
    entry: [
        resolve('../example/index.ts'),
    ],
    output: {
        path: resolve('../example/dist'),
        filename: 'index.js',
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
                name: 'images/[name].[hash:8].[ext]',
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
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: resolve('../example/index.html'),
        }),
    ],
    devServer: {
        contentBase: resolve('../example/dist'),
        compress: false,
        port: port,
        open: true,
        host: devHost,
        writeToDisk: true,
    }
}

module.exports = merge(baseConfig, config)
