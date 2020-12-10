const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/main.ts',
    target: 'node',
    resolve: {
        extensions: ['.ts', '.js', '.json'],
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    output: {
        filename: 'wuxiaco.js',
        path: path.resolve(__dirname, 'dist'),
    },

    plugins: [
        new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true }),
    ],
};
