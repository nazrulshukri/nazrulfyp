const webpack = require('webpack'); // Import webpack
const path = require('path');

module.exports = {
  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  webpack: {
    alias: {
      stream: 'stream-browserify',
      zlib: 'browserify-zlib',
      assert: 'assert',
      util: 'util',
      buffer: 'buffer',
    },
    configure: (webpackConfig) => {
      webpackConfig.resolve.fallback = {
        fs: false,
        stream: require.resolve('stream-browserify'),
        zlib: require.resolve('browserify-zlib'),
        assert: require.resolve('assert'),
        util: require.resolve('util'),
        buffer: require.resolve('buffer'),
      };

      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      );

      return webpackConfig;
    },
  },
  jest: {
    configure: (jestConfig) => {
      jestConfig.moduleNameMapper = {
        ...jestConfig.moduleNameMapper,
        '^axios$': require.resolve('axios/dist/node/axios.cjs'),
        '^lucide-react$': path.join(__dirname, 'node_modules/lucide-react/dist/cjs/lucide-react.js'),
      };

      return jestConfig;
    },
  },
};
