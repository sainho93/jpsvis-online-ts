const path = require('path')


module.exports = {
  mode: 'development',
  entry: {
    index: __dirname + '/src/index.tsx'
  },

  output: {
    path: path.resolve(__dirname, 'static'),
    filename: '[name].bundle.js'
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.webpack.js', '.web.js', '.js', '.jsx', '.json'],

    modules: [
      'node_modules',
      path.resolve(__dirname, 'node_modules')
    ]
  },
  resolveLoader: {
    modules: ['node_modules']
  },

  module: {
    rules: [
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader'
      },
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
        options: {
          presets: ['react', 'es2015']
        }
      },
      {
        test: /\.css$/,
        use: [
          // style-loader
          {
            loader: 'style-loader'
          },
          // css-loader
          {
            loader: 'css-loader',
            options: {
              modules: true
            }
          }
        ]
      }
    ]
  },

  // Don't follow/bundle these modules, but request them at runtime from the environment
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
}
