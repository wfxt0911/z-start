const path = require('path')
const { defineConfig } = require('vite')



module.exports = defineConfig({
  build: {
    target:'es2015',
    lib: {
      entry: path.resolve(__dirname, 'lib/main.js'),
      name: 'z-start',
      fileName: (format) => `z-start.${format}.js`
    }
  },
});