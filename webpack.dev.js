const path = require("path");
const common = require("./webpack.common.js");
const { merge } = require("webpack-merge");

module.exports = merge(common, {
  mode: "development", 
  devtool: "eval-source-map", // Source map untuk debugging
  module: {
    rules: [
      {
        test: /\.css$/, 
        use: [
          "style-loader", 
          {
            loader: "css-loader",
            options: {
              sourceMap: true, // Aktifkan source map
            },
          },
        ],
      },
    ],
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, "dist"), 
    },
    port: 9000, 
    hot: true, 
    compress: true, // Kompresi gzip
    historyApiFallback: true, // Fallback untuk Single Page Applications
    client: {
      overlay: {
        errors: true, // Tampilkan overlay untuk error
        warnings: true, // Tampilkan overlay untuk warning
        runtimeErrors: true, // Tampilkan runtime errors
      },
      logging: "error", 
      progress: true, // Tampilkan progress kompilasi
    },
  },
});
