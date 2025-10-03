const { defineConfig } = require('@vue/cli-service')
const webpack = require('webpack')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    host: process.env.VUE_APP_BASE_URL,
    port: 8080,
    https: false,
  },
  chainWebpack: (config) => {
    config.plugin('define').use(webpack.DefinePlugin, [
      {
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false)
      }
    ])
  }
})
