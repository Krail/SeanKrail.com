var content = require('../public/static/content/header-footer/header-footer.js');
content.home = require('../public/static/content/home/home.js');

/* GET home page */
module.exports = function(req, res) {
  res.render('home', {
    page: 'home',
    appTitle: 'Sean\'s Home',
    content: content
  });
};
