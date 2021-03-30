const webpack = require('webpack')
const path = require('path')
const fs = require('fs')
const TARGET = process.env.npm_lifecycle_event

const wrapperJs = (TARGET) =>
  `(function (w, d) {
  var l = document.createElement('script');
  l.src = 'https://${TARGET === 'build' ? 'scripts3' : 'scripts-stage'}.sendios.io/build/widget/latest.js?d=' + (new Date().getTime());
  l.type = 'text/javascript';
  l.async = true;
  var s = d.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(l, s);
})(window, document);
`

if (TARGET === 'start' || !TARGET) {
  module.exports = {
    entry: {
      main: './src/index.js'
    },
    output: {
      path: path.join(__dirname, 'build/widget'),
      filename: 'latest.js',
      publicPath: 'http://0.0.0.0/build/widget/',
    },
    devServer: {
      compress: true,
      host: '0.0.0.0',
      port: 80,
      proxy: {
        '/form': 'http://0.0.0.0:4000'
      }
    },
    module: {
      rules: [{
        test: /\.js$/,
        use: [{loader: 'babel-loader'}],
        exclude: /node_modules|build/
      }]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.API_ROOT': `"${process.env.API_ROOT || 'http://localhost:4000/'}"`,
        'process.env.NODE_ENV': '"development"'
      })
    ]
  }
}

if (TARGET === 'build' || TARGET === 'stage') {
  module.exports = {
    entry: {
      main: './src/index.js'
    },
    output: {
      path: path.join(__dirname, 'build/widget'),
      filename: 'latest.js'
    },
    module: {
      rules: [{
        test: /\.js$/,
        use: [{loader: 'babel-loader'}],
        exclude: /node_modules|build/
      }]
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {warnings: false}
      }),
      new webpack.DefinePlugin({
        'process.env.API_ROOT': `"${process.env.API_ROOT || 'http://localhost:4000/'}"`,
        'process.env.NODE_ENV': TARGET === 'build' ? '"production"' : "'stage'"
      }),
      new webpack.BannerPlugin({banner: process.env.BUILD ? 'v.' + process.env.BUILD : ''}),
      function () {
        this.plugin('done', function () {
          fs.writeFileSync(path.join(__dirname, 'build', 'widget', 'wrapper.js'), wrapperJs(TARGET))
          if (process.env.BUILD) {
            fs.writeFileSync(
              path.join(__dirname, 'build', 'widget', '1.x', 'v.' + process.env.BUILD + '.js'),
              fs.readFileSync(path.join(__dirname, 'build', 'widget', 'latest.js'))
            )
          }
        })
      }
    ]
  }
}
