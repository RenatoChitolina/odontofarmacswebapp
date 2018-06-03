const sass = require('@stencil/sass');

exports.config = {
  outputTargets: [
    {
      type: 'www',
      serviceWorker: {
        swSrc: 'src/sw.js',
        globPatterns: [
          '**/*.{js,css,json,html,ico,png,svg,txt}'
        ]
      }
    }
  ],
  //TODO: (R) Quando houver uma versão estável, remover esse trecho de cópia forçada das libs e fazer o import corretamente
  copy: [
    { src: '../node_modules/pouchdb/dist/pouchdb.min.js', dest: 'third-party/pouchdb.min.js' },
    { src: '../node_modules/js-cookie/src/js.cookie.js', dest: 'third-party/js.cookie.js' }
  ],
  globalStyle: 'src/global/app.css',
  plugins: [
    sass()
  ]
};

exports.devServer = {
  root: 'www',
  watchGlob: '**/**'
};
