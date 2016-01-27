// REQUIRE modules
var https = require('https');
var path = require('path');
var fs = require('fs');

var GitHubAPI = require('github');
var mdConverter = new (require('showdown')).Converter();


// Export utility functions, in case that the user wants to use them.
module.exports.utilities = {
  // Sort projects by updated date (latest has lowest index)
  sort: (projects) => {
    projects.projects.sort((a, b) => {
      if (a.updated < b.updated) return 1; // set b (latest) to lower index than a (oldest)
      else if (a.updated > b.updated) return -1; // set a (latest) to lower index than b (oldest)56
      else return 0; // do nothing
    });
  },
  // Import hard-coded projects from static directory
  importHard: (projects, callback) => {
    fs.readdir(path.join(__dirname, '..', 'public', 'static', 'content', 'projects'), (err, files) => {
      console.log('utilities.importHard: ' + files.length + ' hard-coded files');
      if (err) throw err;
      files.forEach(
        (element, index, array) => {
          fs.readFile(path.join(__dirname, '..', 'public', 'static', 'content', 'projects', element), 'utf8', (err, data) => {
            if (err) throw err;
            projects.projects.push(JSON.parse(data));
            module.exports.utilities.sort(projects);
            console.log('utilities.importHard: Index is ' + index);
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
          var completed = 0;
          console.log('utilities.importSoft: ' + data.length + ' soft-coded files');
          // GET all 'hard' projects
          const githubRegexId1 = /[\:#]/;
          const githubRegexId2 = /[\._]/;
          const githubRegexName = /[\-_]/;
          data.forEach(
            (element, index, array) => {
              var project = {
                id: (element.name.replace(githubRegexId1, "").replace(githubRegexId2, "-") + '_github'),
                header: {
                  image: {
                    title: 'My GitHub Avatar',
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
                ],
                updated: element.updated_at
              };

              https.get('https://raw.githubusercontent.com/' + element.full_name + '/master/README.md', (res) => {
                var md = '';
                res.on('data', (data) => { md += data; });
                res.on('end', () => {
                  completed++;
                  project.content[0].html = mdConverter.makeHtml(md);
                  projects.projects.push(project);
                  module.exports.utilities.sort(projects);
                  console.log('utilities.importSoft: Completed is ' + completed);
                  if (completed === array.length) callback();
                });
              });

            }
          );

        }
      }
    );
  }
  // END of utility functions
}


// Refresh the projects list
module.exports.refresh = (projects) => {
  console.log('refresh(' + projects.projects + ') called');
  projects.projects = [];
  var sort = false
  console.log('refresh: Sort is ' + sort);
  var callback = () => {
    console.log('refresh: Sort was ' + sort);
    if (sort) {module.exports.utilities.sort(projects);console.log('refresh: Projects array is now: ' + projects.projects);}
    else sort = true;
    console.log('refresh: Sort is now ' + sort);
  };
  module.exports.utilities.importHard(projects, callback);
  module.exports.utilities.importSoft(projects, callback);
}