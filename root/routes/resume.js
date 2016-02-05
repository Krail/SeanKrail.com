var content = require('../public/static/content/header-footer/header-footer.js');
content.resume = require('../public/static/content/resume/resume.js');

/* GET resume page */
module.exports = function(req, res) {
  res.render('resume', {
    page: 'resume',
    appTitle: 'Sean\'s Resume',
    content: content
  });
};
