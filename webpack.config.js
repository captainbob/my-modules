var webpack = require('webpack')
var path = require('path')

var config = {
    entry: path.join(__dirname, '/src/index.js'),
    devtool: 'source-map',
    output: {
        path: path.join(__dirname, "dist"),
        filename: 'djmodules.min.js',
        libraryTarget: 'umd',
        library: 'djmodules'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                query: {
                    presets: ['es2015', 'react']
                }
            },
            {
                test: /\.(png|woff|svg|ttf|eot)$/,
                loader: 'url-loader?limit=10000'
            },
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            sourceMap: false,
            mangle: false
        }),
    ]
}

module.exports = config;