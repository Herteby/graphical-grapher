Package.describe({
  name: 'herteby:graphical-grapher',
  version: '1.3.4',
  summary: 'Graphical Grapher - Visualize your queries in the browser',
  git: 'https://github.com/Herteby/graphical-grapher',
  documentation: 'README.md'
})

Npm.depends({ //leaving out React here, to avoid bloat for Vue users
    'lodash': '4.17.4',
    'vue': '2.5.9'
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