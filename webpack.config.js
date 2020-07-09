/*
 * \file webpack.config.js
 * \date 2020 - 6 - 8
 * \author Tao Zhong
 * \copyright <2009 - 2020> Forschungszentrum Jülich GmbH. All rights reserved.
 *
 * \section License
 * This file is part of JuPedSim.
 *
 * JuPedSim is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 *  any later version.
 *
 * JuPedSim is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with JuPedSim. If not, see <http://www.gnu.org/licenses/>.
 *
 */

const path = require('path')
const tsImportPluginFactory = require('ts-import-plugin')

module.exports = {
  mode: 'development',
  entry: {
    index: __dirname + '/src/index.tsx',
  },

  output: {
    path: path.resolve(__dirname, 'static'),
    filename: '[name].bundle.js'
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: 'source-map',

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: ['.ts', '.tsx', '.webpack.js', '.web.js', '.js', '.jsx', '.json', 'css'],

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
              modules: false // Close CSS modules in css-loader
            }
          }
        ]
      },
      {
        test: /\.(jsx|tsx|js|ts)$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          // Using ts-import-plugin to load ant design components in Typescript
          getCustomTransformers: () => ({
            before: [tsImportPluginFactory({
              libraryName: 'antd',
              libraryDirectory: 'lib',
              style: 'css'
            })]
          }),
          compilerOptions: {
            module: 'es2015'
          }
        },
        exclude: /node_modules/
      }
    ]
  },



  // Don't follow/bundle these modules, but request them at runtime from the environment
  externals: {
  }
}
