var content = require('../public/static/content/header-footer.js');
content.home = require('../public/static/content/home.js');

/* GET home page */
module.exports = function(req, res) {
  res.render('home2', {
    page: 'home',
    appTitle: 'Sean\'s Home',
    content: content
  });
};
