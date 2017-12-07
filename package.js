Package.describe({
  name: 'herteby:graphical-grapher',
  version: '1.0.0',
  // Brief, one-line summary of the package.
  summary: 'Graphical Grapher - Visualize your queries in the browser',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/Herteby/graphical-grapher',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
})

Npm.depends({
    'lodash': '4.17.4',
})

Package.onUse(function(api) {
  api.versionsFrom('1.3')
  api.use('ecmascript')
  api.use('tmeasday:check-npm-versions@0.3.1')
  api.use('cultofcoders:grapher@1.3.0')

  api.mainModule('main.client.js', 'client')
  api.mainModule('main.server.js', 'server')
})

Package.onTest(function(api) {
})