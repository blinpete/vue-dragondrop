const htmlWebpackPlugin = require('html-webpack-plugin')
const uglifyjsWebpackPlugin = require('uglifyjs-webpack-plugin')


const isProd = process.env.NODE_ENV === "prod";

const config = {
    entry: isProd ? './src/index.js' : './index.js',
    output: {filename: './dist/bundle.js'},

    mode: isProd ? 'production' : 'development',

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {presets: ['@babel/preset-env']}
                }
            },
            {
                test: /\.scss$/,
                use: [
                    {loader: 'style-loader'},
                    {loader: 'css-loader'},
                    {loader: 'sass-loader'}
                ]
            },
        ],
    },

    resolve: {
        alias: {
            vue: './dist/vue.js'
        }
    },

    plugins: [
        new htmlWebpackPlugin({template: './index.html', inject: 'body'}),
    ],

    devServer: {port: 7000},
};


if (isProd) {
    config.plugins.push( new uglifyjsWebpackPlugin() );
}


module.exports = config;
