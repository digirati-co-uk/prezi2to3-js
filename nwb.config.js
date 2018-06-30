module.exports = {
  type: 'web-module',
  npm: {
    esModules: true,
    umd: {
      global: 'Upgrader',
      externals: {}
    }
  },
  karma: {
    frameworks: ['mocha', 'fixture'],
    plugins: [
      'karma-fixture',
      'karma-json-fixtures-preprocessor',
    ],
    extra: {
      browserDisconnectTimeout: 100000,
      browserNoActivityTimeout: 100000,
      captureTimeout: 60000,
      files: [
        {
          pattern: 'tests/spec/fixtures/**/*',
        }
      ],
      preprocessors: {
        'tests/spec/fixtures/**/*'   : ['json_fixtures']
      },
      jsonFixturesPreprocessor: {
        variableName: '__json__'
      }
    }
  }
}
