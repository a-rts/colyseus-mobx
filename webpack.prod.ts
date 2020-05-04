import { Configuration } from "./webpack.config";

const config: Configuration = {
  mode: "production",
  stats: "normal",
  optimization: {
    minimize: true,
  },
};

export default config;
