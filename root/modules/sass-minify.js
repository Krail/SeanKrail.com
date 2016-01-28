// REQUIRE modules
var path = require('path');
var fs = require('fs');

var sass = require('node-sass');
var postcss = require('postcss');
var autoprefixer = require('autoprefixer');
var compressor = require('node-minify');


// Convert base.scss file into style.css prefixed and minified
module.exports.sass = () => {
  sass.render(
    {
      file: path.join(__dirname, '..', 'public', 'scss', 'base.scss'),
      outputStyle: 'compressed'
    }, (err, data) => {
      if (err) throw err;
      fs.writeFile(path.join(__dirname, '..', 'public', 'css', 'style.min.css'), data.css, 'utf8', (err) => { if (err) throw err; });
      postcss([autoprefixer]).process(data.css).then(function(res) {
        res.warnings().forEach(function(warn) { console.warn(warn.toString()); });
        fs.writeFile(path.join(__dirname, '..', 'public', 'css', 'style.prefixed.min.css'), res.css, 'utf8', (err) => { if (err) throw err; });
      });
    }
  );
  sass.render(
    {
      file: path.join(__dirname, '..', 'public', 'scss', 'base.scss'),
      outputStyle: 'nested'
    }, (err, data) => {
      if (err) throw err;
      fs.writeFile(path.join(__dirname, '..', 'public', 'css', 'style.css'), data.css, 'utf8', (err) => { if (err) throw err; });
      postcss([autoprefixer]).process(data.css).then(function(res) {
        res.warnings().forEach(function(warn) { console.warn(warn.toString()); });
        fs.writeFile(path.join(__dirname, '..', 'public', 'css', 'style.prefixed.css'), res.css, 'utf8', (err) => { if (err) throw err; });
      });
    }
  );
};

// Minify javascript files
module.exports.minify = () => {
  const jsDir = 'public/js'
  fs.readdir(path.join(__dirname, '..', 'public', 'js'), (err, files) => {
    if (err) throw err;
    files.forEach(
      (element, index, array) => {
        new compressor.minify({
          type: 'gcc',
          fileIn: path.join(__dirname, '..', 'public', 'js', element),
          fileOut: path.join(__dirname, '..', 'public', 'js', element.replace(/\.[^/.]+$/, "") + '.min.js'),
          callback: (err, min) => { if (err) throw err; }
        });
      }
    );
  });
}