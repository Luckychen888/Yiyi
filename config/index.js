const path = require('path');

const config = {
  projectName: '恋人空间',
  date: '2024-1-1',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {
  },
  copy: {
    patterns: [],
    options: {}
  },
  framework: 'react',
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {
          selectorBlackList: []
        }
      },
      url: {
        enable: true,
        config: {
          limit: 10240
        }
      },
      cssModules: {
        enable: true,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    uglify: {
      enable: true,
      config: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    },
    optimizeMainPackage: {
      enable: true
    },
    splitChunks: {
      enable: true,
      config: {
        minSize: 20000,
        minChunks: 1,
        cacheGroups: {
          vendors: {
            name: 'vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: -10
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true
          }
        }
      }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    postcss: {
      autoprefixer: {
        enable: true,
        config: {}
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    },
    devServer: {
      port: 10086,
      https: false
    }
  },
  alias: {
    '@': path.resolve(__dirname, '../src')
  }
};

module.exports = config;