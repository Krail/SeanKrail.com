/* GET test page */
module.exports = function(req, res) {
  res.render('test', {
    appTitle: 'A New Startup: Sign Up Today!'
  });
};
