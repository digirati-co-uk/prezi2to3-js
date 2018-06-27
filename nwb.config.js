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
    frameworks: ['mocha', 'fixture'],
    plugins: [
      'karma-fixture',
      'karma-json-fixtures-preprocessor',
    ],
    extra: {
      browserDisconnectTimeout: 10000000,
      browserNoActivityTimeout: 10000000,
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
