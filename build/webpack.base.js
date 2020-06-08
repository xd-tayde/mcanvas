const ExtractCss = require('mini-css-extract-plugin')
const webpack = require('webpack')
const path = require('path')
const resolve = (fileName) => path.resolve(__dirname, fileName)


const env = process.env.ENV
module.exports = {
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
        alias: {
            '@Src': resolve('../src'),
        },
    },
    module: {
        rules: [{
            test: /\.node$/,
            use: 'node-loader'
        }, {
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
                {
                    loader: ExtractCss.loader,
                    options: {
                        publicPath: '../',
                    }
                },
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
        new webpack.DefinePlugin({
            'ENV': JSON.stringify(env)
        }),
        new ExtractCss({
            filename: `css/[name].css?[hash:8]`,
        }),
    ]
}