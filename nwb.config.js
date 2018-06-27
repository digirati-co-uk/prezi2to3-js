module.exports = {
  type: 'web-module',
  npm: {
    esModules: true,
    umd: {
      global: 'y',
      externals: {}
    }
  },
  karma: {
    extra: {
      browserDisconnectTimeout: 10000000,
      browserNoActivityTimeout: 10000000,
    }
  }
}
