// REQUIRE modules
var https = require('https');
var path = require('path');
var fs = require('fs');

var GitHubAPI = require('github');
var mdConverter = new (require('showdown')).Converter();


// Export utility functions, in case that the user wants to use them.
module.exports.utilities = {
  // Import hard-coded projects from static directory
  importHard: (projectsArray, callback) => {
    fs.readdir(path.join(__dirname, '..', 'public', 'static', 'content', 'projects'), (err, files) => {
      if (err) throw err;
      files.forEach(
        (element, index, array) => {
          fs.readFile(path.join(__dirname, '..', 'public', 'static', 'content', 'projects', element), 'utf8', (err, data) => {
            if (err) throw err;
            projectsArray.push(JSON.parse(data));
            if (index + 1 === array.length) callback();
          });
        }
      );
    });
  },
  // Import 'soft' GitHub repository projects
  importSoft: (projectsArray, callback) => {
    // Convert all of my GitHub Repos
    var github = new GitHubAPI({
      version: '3.0.0',
      protocol: 'https',
      host: 'api.github.com'
    });
    const token = fs.readFileSync(path.join(__dirname, '..', 'token.token'), 'utf8');
    github.authenticate({
      type: 'oauth',
      token: token
    });
    github.repos.getFromUser(
      {
        user: 'Krail', // required
        type: 'all',
        sort: 'updated',
        direction: 'desc',
        per_page: 10
      }, (err, data) => {
        if (err) throw err;
        if(!Array.isArray(data)) console.error('Error. GitHub data is not an array: ', data);
        else {
          // GET all 'hard' projects
          const githubRegex1 = /[\-_]/;
          const githubRegex2 = /_/;
          const githubRegex3 = /:/;
          data.forEach(
            (element, index, array) => {
              var project = {
                id: (element.name.replace(githubRegex2, "-").replace(githubRegex3, "") + '_github'),
                header: {
                  image: {
                    title: 'My GitHub Avatar',
                    src: element.owner.avatar_url,
                    alt: element.name.replace(githubRegex1, " ").replace(githubRegex3, "")
                  },
                  heading: element.name.replace(githubRegex1, " ").replace(githubRegex3, ""),
                  paragraphs: [ element.description ]
                },
                content: [
                  {
                    type: 'readme',
                    html: ''
                  }
                ],
                updated: element.updated_at
              };

              https.get('https://raw.githubusercontent.com/' + element.full_name + '/master/README.md', (res) => {
                var md = '';
                res.on('data', (data) => { md += data; });
                res.on('end', () => {
                  project.content[0].html = mdConverter.makeHtml(md);
                  projectsArray.push(project);
                  if (index + 1 === array.length) callback();
                });
              });

            }
          );

        }
      }
    );
  },
  // Sort projects by updated date (latest has lowest index)
  sort: (projectsArray) => {
    projectsArray.sort((a, b) => {
      if(a.updated > b.updated) return -1; // set a (latest) to lower index than b (oldest)
      else if(a.update < b.updated) return 1; // set b (latest) to lower index than a (oldest)
      else return 0; // do nothing
    });
  }
  // END of utility functions
}


// Refresh the projects list
module.exports.refresh = (projectsArray) => {
  projectsArray = [];
  var sort = false
  var callback = () => {
    if (sort) module.exports.utilities.sort(projectsArray);
    else sort = true;
  };
  module.exports.utilities.importHard(projectsArray, callback);
  module.exports.utilities.importSoft(projectsArray, callback);
}