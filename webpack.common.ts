import path from "path";
import webpack from "webpack";
import { Configuration } from "./webpack.config";
import HtmlWebpackPlugin from "html-webpack-plugin";

const config: Configuration = {
  entry: {
    main: "./client/src/game.tsx",
  },
  output: {
    path: path.resolve(__dirname, "./client/build"),
    filename: "[name].js",
    publicPath: "/",
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        // exclude: /node_modules/,
        use: "ts-loader",
      },
      {
        test: [/\.vert$/, /\.frag$/],
        use: "raw-loader",
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: [
    new webpack.DefinePlugin({
      "typeof SHADER_REQUIRE": JSON.stringify(false),
      "typeof CANVAS_RENDERER": JSON.stringify(true),
      "typeof WEBGL_RENDERER": JSON.stringify(true),
    }),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./client/index.html",
    }),
  ],
};

export default config;
