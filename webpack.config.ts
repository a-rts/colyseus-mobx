import merge from "webpack-merge";
import { Configuration as WebpackConfiguration } from "webpack";
import { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";

export interface Configuration extends WebpackConfiguration {
  devServer?: WebpackDevServerConfiguration;
}

export default (env: string): Configuration => {
  const baseConfig = require(`./webpack.common.ts`).default;
  const envConfig = require(`./webpack.${env}.ts`).default;
  return merge(baseConfig, envConfig);
};
