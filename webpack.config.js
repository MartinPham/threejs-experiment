const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const webpack = require('webpack');


const buildDirectory = 'build';


const config = {
	mode: process.env.NODE_ENV,

	entry: './src/index.js',
  	output: {
		filename: 'main.js',
		path: path.resolve(__dirname, buildDirectory)
  	},
	module: {
		rules: [
		    {
		    	test: /\.(gltf|bin|jpg|png|obj|wrl)$/,
		        use: [
		          {
		            loader: 'file-loader',
		            options: {
		            	name: '[path][name].[ext]',
    					context: ''
		            }
		          }
		        ]
		    },
		    {
		    	test: /\.m?js$/,
		    	exclude: /(node_modules|bower_components)/,
		    	use: {
		    		loader: 'babel-loader',
		    		options: {
		    			presets: [
		    				'@babel/preset-env'
		    			],
		    			plugins: [
		    				'@babel/plugin-proposal-class-properties'
		    			]
		    		}
		    	}
		    }
		]
	},
	// plugins: plugins
};

let scssLoaders = [
	'css-loader',
	'sass-loader'
];

let plugins = [
	new CleanWebpackPlugin([buildDirectory]),
	new HtmlWebpackPlugin({
		template: path.resolve(__dirname, 'src/index.html'),
		inject: true
	}),
	new webpack.HotModuleReplacementPlugin()
];

if(process.env.NODE_ENV === 'production')
{
	scssLoaders = [
		{
			loader: MiniCssExtractPlugin.loader
		},
		...scssLoaders
	];

	plugins.push(new MiniCssExtractPlugin({
		filename: "[name].css",
		chunkFilename: "[id].css"
	}));
}else if(process.env.NODE_ENV === 'development')
{
	scssLoaders = [
		'style-loader',
		...scssLoaders
	];

	config.devServer = {
		contentBase: './' + buildDirectory,
		hot: true
	};

	config.devtool = 'inline-source-map';
}


config.module.rules.push(
	{
		test: /\.scss$/,
		use: scssLoaders
	}
);

config.plugins = plugins;


module.exports = config;