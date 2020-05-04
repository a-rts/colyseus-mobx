import { Configuration } from "./webpack.config";

const config: Configuration = {
  mode: "development",
  // stats: "errors-warnings",
  stats: "minimal",
  devtool: "eval-source-map",
  devServer: {
    contentBase: "./client/build",
  },
  output: {
    devtoolModuleFilenameTemplate: "../[resource-path]",
  },
};

export default config;
