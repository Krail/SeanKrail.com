var content = require('../public/static/content/header-footer.js');
content.home = require('../public/static/content/home.js');
content.page = 'home';

/* GET home page */
module.exports = function(req, res) {
  res.render('home', {
    page: 'home',
    appTitle: 'Sean\'s Home',
    content: content
  });
};
