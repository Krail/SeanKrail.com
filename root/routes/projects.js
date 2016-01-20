var content = require('../public/static/content/header-footer.js');
content.projects = require('../public/static/content/projects.js');

/* GET projects page */
module.exports = function(req, res) {
  res.render('projects2', {
    page: 'projects',
    appTitle: 'Sean\'s Projects',
    content: content
  });
};
