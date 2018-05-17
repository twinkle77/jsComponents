const path = require('path')
const webpack = require('webpack')
// webpack 插件
const UglifyJSPlugin = require('uglifyjs-webpack-plugin') // webpack自带
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const autoprefixer = require("autoprefixer")

const name = 'demo'

module.exports = {
    cache: false,
    entry: {
        main: './src/index.js'
    },
    output: {
        path: path.join(__dirname, 'examples'),
        filename: name + '/' + name + '.js',
        libraryTarget: 'umd'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            minimize: {
                                safe: true
                            }
                        }
                    },
                    {
                        loader: "postcss-loader",
                        options: {
                          autoprefixer: {
                            browsers: ["last 2 versions"]
                          },
                          plugins: () => [autoprefixer]
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new UglifyJSPlugin({
            uglifyOptions: {
                compress: {
                    warnings: false
                }
            }
        }),
        new MiniCssExtractPlugin({
            filename: name + '/' + name + '.css'
        })
    ]
}