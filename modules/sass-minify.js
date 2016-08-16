// REQUIRE modules
var path = require('path');
var fs = require('fs');
var http = require('http');

var ncp = require('ncp').ncp; // node `cp -r` implementation
var sass = require('node-sass');
var postcss = require('postcss');
var autoprefixer = require('autoprefixer');
var compressor = require('node-minify');


// Convert base.scss file into style.css prefixed and minified
module.exports.sass = () => {
  ncp.limit = 16;
  ncp(path.join(__dirname, '..', 'public', 'static', 'css', 'fonts'), path.join(__dirname, '..', 'public', 'dynamic', 'css', 'fonts'), (err) => { if (err) throw err.formatted; });
  sass.render(
    {
      file: path.join(__dirname, '..', 'public', 'static', 'scss', 'base.scss'),
      outputStyle: 'compressed'
    }, (err, data) => {
      if (err) throw err.formatted;
      fs.writeFile(path.join(__dirname, '..', 'public', 'dynamic', 'css', 'style.min.css'), data.css, 'utf8', (err) => { if (err) throw err.formatted; });
      postcss([autoprefixer]).process(data.css).then(function(res) {
        res.warnings().forEach(function(warn) { console.warn(warn.toString()); });
        fs.writeFile(path.join(__dirname, '..', 'public', 'dynamic', 'css', 'style.prefixed.min.css'), res.css, 'utf8', (err) => { if (err) throw err.formatted; });
      });
    }
  );
  sass.render(
    {
      file: path.join(__dirname, '..', 'public', 'static', 'scss', 'base.scss'),
      outputStyle: 'nested'
    }, (err, data) => {
      if (err) throw err.formatted;
      fs.writeFile(path.join(__dirname, '..', 'public', 'dynamic', 'css', 'style.css'), data.css, 'utf8', (err) => { if (err) throw err.formatted; });
      postcss([autoprefixer]).process(data.css).then(function(res) {
        res.warnings().forEach(function(warn) { console.warn(warn.toString()); });
        fs.writeFile(path.join(__dirname, '..', 'public', 'dynamic', 'css', 'style.prefixed.css'), res.css, 'utf8', (err) => { if (err) throw err.formatted; });
      });
    }
  );
  http.get('http://cdnjs.cloudflare.com/ajax/libs/normalize/4.2.0/normalize.min.css', (res) => {
    var css = '';
    res.on('data', (data) => { css += data });
    res.on('end', () => {
    fs.writeFile(path.join(__dirname, '..', 'public', 'dynamic', 'css', 'normalize.min.css'), css, 'utf8', (err) => { if (err) throw err.formatted; });
    });
  });
};

// Minify javascript files
module.exports.minify = () => {
  fs.readdir(path.join(__dirname, '..', 'public', 'static', 'js'), (err, files) => {
    if (err) throw err.formatted;
    files.forEach(
      (element, index, array) => {
        new compressor.minify({
          type: 'gcc',
          fileIn: path.join(__dirname, '..', 'public', 'static', 'js', element),
          fileOut: path.join(__dirname, '..', 'public', 'dynamic', 'js', element.replace(/(\.min)*\.js/, "") + '.min.js'),
          callback: (err, min) => { if (err) throw err.formatted; }
        });
        fs.readFile(path.join(__dirname, '..', 'public', 'static', 'js', element), 'utf8', (err, data) => {
          if (err) throw err.formatted;
          fs.writeFile(path.join(__dirname, '..', 'public', 'dynamic', 'js', element), data, 'utf8', (err) => { if (err) throw err.formatted; });
        });
      }
    );
  });
}
