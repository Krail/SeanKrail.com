var content = require('../public/static/content/header-footer.js');
content.resume = require('../public/static/content/resume.js');

/* GET resume page */
module.exports = function(req, res) {
  res.render('resume2', {
    page: 'resume',
    appTitle: 'Sean\'s Resume',
    content: content
  });
};
