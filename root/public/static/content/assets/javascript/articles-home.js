var Article = function(header, paragraphs, date) {
  this.header = header;
  this.paragraphs = paragraphs;
  this.date = date;
};
var articles =
    [
      new Article(
        "Welcome to my page",
        [
          "It's finished construction and should be bug free in all modern browsers supporting html5. Have a look around! I'm going to be working on adding more of my projects to the site in the coming weeks. If you notice any bugs, feel free to email me about it.",
          "This site primarily serves as a place to host my resume and college projects, although I also use this site for personal projects that require a server as well. I will add some of these projects to my projects page soon!",
          "Thanks for visiting,<br />Sean"
        ],
        new Date("June 3, 2015 2:45:00")),
      new Article(
        "Font used on this site",
        [
          "The Lato font family is open source and is available as a free download under the <a title=\"SIL OFL 1.1\" href=\"http://scripts.sil.org/OFL\">SIL Open Font License 1.1</a> at <a title=\"Lato Fonts Website\" href=\"http://www.latofonts.com\">latofonts.com</a>"
        ],
        null)
    ];



var mainElement = document.getElementsByTagName("main");
if(mainElement.length != 1) {
  window.console.error("Incorrect HTML formatting: There is not a single main element in the document");
} else if(mainElement.children) {
  window.console.error("Incorrect HTML formatting: There shouldn't be any children in the main element.")
}
mainElement = mainElement[0];
var i;
for(i = 0; i < articles.length; i++) {
  var articleElement = document.createElement("article");
  articleElement.className = "home";
  if(articles[i].header) {
    var headerElement = document.createElement("h3");
    headerElement.innerHTML = articles[i].header;
    articleElement.appendChild(headerElement);
  }
  console.log(articles[i].paragraphs);
  if(articles[i].paragraphs.length > 0) {
    var j;
    for(j = 0; j < articles[i].paragraphs.length; j++) {
      var paragraphElement = document.createElement("p");
      paragraphElement.innerHTML = articles[i].paragraphs[j];
      console.log("Paragraph:InnerHTML - " + paragraphElement.innerHTML);
      articleElement.appendChild(paragraphElement);
    }
  }
  if(articles[i].date) {
    var timeElement = document.createElement("time");
    timeElement.setAttribute("datetime", articles[i].date.toISOString());
    timeElement.innerHTML = articles[i].date.toDateString();
    articleElement.appendChild(timeElement);
  }
  mainElement.appendChild(articleElement);
}