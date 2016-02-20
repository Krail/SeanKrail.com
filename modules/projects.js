// REQUIRE modules
var https = require('https');
var path = require('path');
var fs = require('fs');

var GitHubAPI = require('github');
var mdConverter = new (require('showdown')).Converter({headerLevelStart: 2});


// Export utility functions, in case that the user wants to use them.
module.exports.utilities = {
  // Shuffle project keywords
  shuffleKeywords: (projects) => {
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
  sortByDate: (projects) => {
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
  // Import hard-coded projects from public/content/projects directory
  importHard: (projects, callback) => {
    fs.readdir(path.join(__dirname, '..', 'public', 'static', 'content', 'projects'), (err, files) => {
      console.log('  ' + files.length + ' hard-coded files');
      if (err) throw err.formatted;
      var completed = 0;
      files.forEach(
        (element, index, array) => {
          fs.readFile(path.join(__dirname, '..', 'public', 'static', 'content', 'projects', element), 'utf8', (err, data) => {
            if (err) throw err.formatted;
            completed++;
            var json = JSON.parse(data);
            projects.projects.push(json);
            console.log('    ' + json.id + ' (' + completed + ' of ' + array.length + ')');
            module.exports.utilities.addKeywords(projects, json.keywords);
            if (index + 1 === array.length) callback();
            fs.writeFile(path.join(__dirname, '..', 'public', 'dynamic', 'content', 'projects', json.id + '.json'), data, 'utf8', (err) => { if (err) throw err.formatted; });
          });
        }
      );
    });
  },
  // Import 'soft' GitHub repository projects
  importSoft: (projects, callback) => {
    const token = fs.readFileSync(path.join(__dirname, '..', 'token.token'), 'utf8');
    // Convert all of my GitHub Repos
    var github = new GitHubAPI({
      version: '3.0.0',
      protocol: 'https',
      host: 'api.github.com'
    });
    github.authenticate({
      type: 'oauth',
      token: token
    });
    github.repos.getAll(
      {
        type: 'all',
        sort: 'updated',
        direction: 'desc',
        page: 1,
        per_page: 15
      }, (err, data) => {
        if (err) throw err.formatted;
        if (Array.isArray(data)) {
          var completed = 0;
          console.log('  ' + data.length + ' soft-coded files');
          // GET all 'soft' projects
          const githubRegexId1 = /[\:#]/;
          const githubRegexId2 = /[\._]/;
          const githubRegexName = /[\-_]/;
          data.forEach(function(repo, index, array) {
            //console.log('Current repo: ' + repo.name);
            var readme = false;
            var json = false;
            var png = false;
            var project = {
              id: (repo.name.replace(githubRegexId1, "").replace(githubRegexId2, "-") + '-github'),  // Update from /.meta/project.json
              updated: repo.updated_at,
              url: repo.html_url,
              keywords: ['GitHub'], // Update from /.meta/project.json
              progress: Math.floor(Math.random() * 100), // [0,100] // Update from /.meta/project.json
              software: true, // Update from /.meta/project.json
              hardware: false, // Update from /.meta/project.json
              header: {
                heading: repo.name.replace(githubRegexName, " "),
                image: {
                  title: repo.owner.login === 'Krail' ? 'My GitHub avatar' : repo.name.replace(githubRegexName, " ") + '\'s GitHub avatar', // Update with /.meta/project.png
                  src: repo.owner.avatar_url, // Update from /.meta/project.png
                  alt: repo.name.replace(githubRegexName, " ")
                },
                paragraph: repo.description
              },
              content: [
                {
                  type: 'readme',
                  html: ''
                }
              ]
            };
            
            function finish() {
              completed++;
              console.log('    ' + repo.name + ' (' + completed + ' of ' + array.length + ')');
              //console.log(repo.name + ': project pushed.');
              //console.log(project.header.image.src);
              projects.projects.push(project);
              module.exports.utilities.addKeywords(projects, project.keywords);
              fs.writeFile(path.join(__dirname, '..', 'public', 'dynamic', 'content', 'projects', project.id + '.json'), JSON.stringify(project), 'utf8', (err) => { if (err) throw err.formatted; });
              if (completed === array.length) callback();
            }
            
            // GET README.md
            https.get('https://raw.githubusercontent.com/' + repo.full_name + '/' + repo.default_branch + '/README.md', (res) => {
              var md = '';
              res.on('data', (data) => { md += data; });
              res.on('end', () => {
                project.content[0].html = mdConverter.makeHtml(md);
                readme = true;
                console.log(repo.name + ': project loaded readme, json(' + json + ') and png(' + png + ').');
                if (json && png) finish();
              });
            }); // end of https get
            
            // GET /.meta
            github.authenticate({
              type: 'oauth',
              token: token
            });
            github.repos.getContent(
              {
                headers: { 'User-Agent': 'Krail' },
                user: repo.owner.login,
                repo: repo.name,
                path: '/.meta'
              }, (err, data) => {
                if (data) { // Meta data exists
                  var jsonExists = false;
                  var pngExists = false;
                  data.forEach(
                    function(content, index, array) {
                      if(/\.json/.test(content.name)) { // Json meta data
                        jsonExists = true;
                        // GET /.meta/*.json
                        //console.log(repo.name + ': Json download_url -> ' + content.download_url);
                        if (content.download_url)
                            https.get(content.download_url, (res) => {
                              var json = '';
                              res.on('data', (data) => { json += data; });
                              res.on('end', () => {
                                json = JSON.parse(json);
                                if (json.id) project.id = json.id + '-github';
                                //console.log('Project Keywords: ' + project.keywords + ', Json Keywords: ' + json.keywords);
                                if (json.keywords) Array.prototype.push.apply(project.keywords, json.keywords);
                                if (json.progress) project.progress = json.progress;
                                if (json.software) project.software = json.software;
                                if (json.hardware) project.hardware = json.hardware;
                                json = true;
                                if (readme && png) finish();
                                else console.log(repo.name + ': project loaded json, readme(' + readme + ') and png(' + png + ').');
                              });
                            });
                      } else if (/[\.png|\.jpeg|\.gif]$/.test(content.name)) { // Image meta data
                        pngExists = true;
                        // GET /.meta/[*.png|*.jpeg|*.gif]
                        project.header.image.title = repo.name.replace(githubRegexName, " ") + '\'s logo';
                        project.header.image.src = content.download_url;
                        //console.log(repo.name + ': image updated.');
                        png = true;
                        console.log(repo.name + ': project loaded png, readme(' + readme + ') and json(' + json + ').');
                        if (readme && json) finish();
                      }
                  });
                  if (!jsonExists) json = true;
                  if (!pngExists) png = true;
                  console.log(repo.name + ': project has meta data, readme(' + readme + ') and json(' + json + ') and png(' + png + ').');
                  if (readme && json && png) finish();
                } else { // No meta data
                  json = png = true;
                  console.log(repo.name + ': project doesn\'t have meta data, readme(' + readme + ').');
                  if (readme) finish();
                }
            });
            
          }); // end of forEach
        }
    }); // end of repos.getAll()
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
  console.log('Refreshing projects...');
  projects.projects = [];
  var sort = false;
  var callback = () => {
    if (sort) {
      console.log('All ' + projects.projects.length + ' projects have been downloaded');
      module.exports.utilities.sortByDate(projects);
      module.exports.utilities.shuffleKeywords(projects);
    }
    else sort = true;
  };
  module.exports.utilities.importHard(projects, callback);
  module.exports.utilities.importSoft(projects, callback);
}