// REQUIRE modules
var https = require('https');
var path = require('path');
var fs = require('fs');

var GitHubAPI = require('github');
var mdConverter = new (require('showdown')).Converter({headerLevelStart: 2});


// Export utility functions, in case that the user wants to use them.
module.exports.utilities = {
  // Shuffle project keywords
  shuffle: (projects) => {
    // http://stackoverflow.com/a/6274381
    for(var j, x, i = projects.keywords.length; i; j = Math.floor(Math.random() * i), x = projects.keywords[--i], projects.keywords[i] = projects.keywords[j], projects.keywords[j] = x);
    //projects.keywords = shuffle(projects.keywords);
  },
  // Add keywords
  addKeywords: (projects, keywords) => {
    keywords.forEach(function(projectKey, index, array) {
      var match = false;
      projects.keywords.forEach(function(globalKey, index, array) {
        if (projectKey === globalKey) match = true;
      });
      if (!match) projects.keywords.push(projectKey);
    });
  },
  // Sort projects by updated date (latest has lowest index)
  sort: (projects) => {
    projects.projects.sort((a, b) => {
      if (a.updated < b.updated) return 1; // set b (latest) to lower index than a (oldest)
      else if (a.updated > b.updated) return -1; // set a (latest) to lower index than b (oldest)
      else { // last updated on the same date
        if (a.id > b.id) return 1; // set b (lowest) to lower index than a (highest)
        else if (a.id < b.id) return -1; // set a (lowest) to lower index than b (highest)
        else return 0; // do nothing
      }
    });
  },
  // Import hard-coded projects from static directory
  importHard: (projects, callback) => {
    fs.readdir(path.join(__dirname, '..', 'public', 'static', 'content', 'projects'), (err, files) => {
      console.log('  ' + files.length + ' hard-coded files');
      if (err) throw err;
      files.forEach(
        (element, index, array) => {
          fs.readFile(path.join(__dirname, '..', 'public', 'static', 'content', 'projects', element), 'utf8', (err, data) => {
            if (err) throw err;
            projects.projects.push(JSON.parse(data));
            module.exports.utilities.sort(projects);
            console.log('    ' + JSON.parse(data).id);
            module.exports.utilities.addKeywords(projects, JSON.parse(data).keywords);
            if (index + 1 === array.length) callback();
          });
        }
      );
    });
  },
  // Import 'soft' GitHub repository projects
  importSoft: (projects, callback) => {
    // Convert all of my GitHub Repos
    var github = new GitHubAPI({
      version: '3.0.0',
      protocol: 'https',
      host: 'api.github.com'
    });
    github.authenticate({
      type: 'oauth',
      token: fs.readFileSync(path.join(__dirname, '..', 'token.token'), 'utf8')
    });
    github.repos.getAll(
      {
        type: 'all',
        sort: 'updated',
        direction: 'desc',
        page: 1,
        per_page: 15
      }, (err, data) => {
        if (err) throw err;
        if(!Array.isArray(data)) console.error('Error. GitHub data is not an array: ', data);
        else {
          var completed = 0;
          console.log('  ' + data.length + ' soft-coded files');
          // GET all 'spft' projects
          const githubRegexId1 = /[\:#]/;
          const githubRegexId2 = /[\._]/;
          const githubRegexName = /[\-_]/;
          data.forEach(function(element, index, array) {
            var project = {
              id: (element.name.replace(githubRegexId1, "").replace(githubRegexId2, "-") + '_github'),
              updated: element.updated_at,
              url: element.html_url,
              keywords: ['GitHub'],
              "progress": Math.floor(Math.random() * 101), // [0,100]
              header: {
                image: {
                  title: element.owner.login === 'Krail' ? 'My GitHub avatar' : 'GitHub avatar of the repository\'s owner',
                  src: element.owner.avatar_url,
                  alt: element.name.replace(githubRegexName, " ")
                },
                heading: element.name.replace(githubRegexName, " "),
                paragraphs: [ element.description ]
              },
              content: [
                {
                  type: 'readme',
                  html: ''
                }
              ]
            };
            https.get('https://raw.githubusercontent.com/' + element.full_name + '/master/README.md', (res) => {
                var md = '';
                res.on('data', (data) => { md += data; });
                res.on('end', () => {
                  console.log('    ' + element.name);
                  completed++;
                  project.content[0].html = mdConverter.makeHtml(md);
                  fs.writeFile(path.join(__dirname, '..', 'public', 'static', 'content', 'projects', project.id), JSON.stringify(project), 'utf8', (err) => { if (err) throw err; });
                  projects.projects.push(project);
                  module.exports.utilities.sort(projects);
                  module.exports.utilities.addKeywords(projects, project.keywords);
                  if (completed === array.length) callback();
                });
              }); // end of https get
          }); // end of forEach
        }
    }); // end of repos.getAll()
    // debug start
    github.authenticate({
      type: 'oauth',
      token: fs.readFileSync(path.join(__dirname, '..', 'token.token'), 'utf8')
    });
    github.repos.getAll(
      {
        type: 'private',
        sort: 'updated',
        direction: 'desc',
        page: 1,
        per_page: 15
      }, (err, data) => {
        if (err) throw err;
        if(!Array.isArray(data)) console.error('Error. GitHub data is not an array: ', data);
        else {
          console.log('  ' + data.length + ' private files');
          data.forEach(function(element, index, array) {
            console.log(element.name);
          }); // end of forEach
        }
    }); // end of repos.getAll()
    github.authenticate({
      type: 'oauth',
      token: fs.readFileSync(path.join(__dirname, '..', 'token.token'), 'utf8')
    });
    github.repos.getAll(
      {
        type: 'member',
        sort: 'updated',
        direction: 'desc',
        page: 1,
        per_page: 15
      }, (err, data) => {
        if (err) throw err;
        if(!Array.isArray(data)) console.error('Error. GitHub data is not an array: ', data);
        else {
          console.log('  ' + data.length + ' private files');
          data.forEach(function(element, index, array) {
            console.log(element.name);
          }); // end of forEach
        }
    }); // end of repos.getAll()
    // debug end
  }, // End of importHard
  // Verify that the search field is valid
  verifySearchField: (searchField) => {
    // Test search field for only letters and space
    // Includes "a-z", "A-Z", "0-9", " ", ",", ".", "'", and "-".
    if (!searchField || searchField.length === 0 || !(/^[a-zA-Z0-9 ,.'\-]+$/.test(searchField))) return false; // invalid

    // Test search field for 60 characters
    if (searchField.length > 60) return false; // invalid

    return true; // valid

  } // End of verifySearchField
} // END of utility functions


// Refresh the projects list
module.exports.refresh = (projects) => {
  console.log('Loading projects...');
  projects.projects = [];
  var sort = false;
  var callback = () => {
    if (sort) {
      console.log('refresh(): All projects have been downloaded, that\'s ' + projects.projects.length + ' projects.');
      module.exports.utilities.sort(projects);
      module.exports.utilities.shuffle(projects);
    }
    else sort = true;
  };
  module.exports.utilities.importHard(projects, callback);
  module.exports.utilities.importSoft(projects, callback);
}