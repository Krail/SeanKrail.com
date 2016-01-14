"use strict";

/*
 * Class definitions
 */

// Header classes
class NavItem {
  constructor(title, name, url) {
    this.title = title;
    this.name = name;
    this.url = url;
    window.console.log("new NavItem(String title, String name, String url):");
    window.console.log(this);
    window.console.log("\n");
  }
}

class Header {
  constructor(title, navItems) {
    this.title = title;
    this.navBar = navItems;
    window.console.log("new Header(String title, NavItem[] navItems):");
    window.console.log(this);
    window.console.log("\n");
  }
}

// Main classes
class Paragraph {
  constructor(text) {
    this.text = text;
    window.console.log("new Paragraph(String text):");
    window.console.log(this);
    window.console.log("\n");
  }
}

class Article {
  constructor(heading, date, paragraphs) {
    this.heading = heading;
    this.date = date;
    this.paragraphs = paragraphs;
    window.console.log("new Article(String heading, Date date, Paragraph[] paragraphs):");
    window.console.log(this);
    window.console.log("\n");
  }
}

class Main {
  constructor(articles) {
    this.articles = articles;
    window.console.log("new Main(Article[] articles):");
    window.console.log(this);
    window.console.log("\n");
  }
}

// Footer classes
class Footer {
  constructor(text, date) {
    this.text = text;
    this.date = date;
    window.console.log("new Footer(String text, Date date):");
    window.console.log(this);
    window.console.log("\n");
  }
}

// All-embodying Webpage class
class Webpage {
  constructor(header, main, footer) {
    this.header = header;
    this.main = main;
    this.footer = footer;
    window.console.log("new Webpage(Header header, Main main, Footer footer):")
    window.console.log(this);
    window.console.log("\n");
  }
}


/*
 * Construct the objects from these class definitions
 */

{
  // Articles
  let welcomeArticle = new Article("Welcome to my page", new Date("September 26, 2015, 7:55:00"), [
    new Paragraph(
      "It's finished construction and should be bug free in all modern browsers supporting the latest HTML5 and ECMAScript6 specifications. Have a look around! I'm working on adding more projects and redesigning the framework of the site to make it easier for me to update."
    ),
    new Paragraph(
      "This site primarily serves as a place to host my resume and college projects, although I also use this site for personal projects that require a basic server. I hope to add some of these projects to my site soon!"
    ),
    new Paragraph(
      "Thanks for visiting,<br />Sean"
    )
  ]);

  let fontArticle = new Article("Font used on this site", new Date("February 7, 2015, 12:15:00"), [
    new Paragraph(
      "The Lato font family is open source and is available as a free download under the <a title=\"SIL OFL 1.1\" href=\"http://scripts.sil.org/OFL\">SIL Open Font License 1.1</a> at <a title=\"Lato Fonts Website\" href=\"http://www.latofonts.com\">latofonts.com</a>"
    )
  ]);

  // Webpage
  var webpage = new Webpage(
    new Header("Sean Krail", [
      new NavItem("My Projects", "projects", "./projects.html"),
      new NavItem("Home", "home", "./home.html"),
      new NavItem("My Resume", "resume", "./resume.html")
    ]),
    new Main([
      welcomeArticle,
      fontArticle
    ]),
    new Footer("Back to Top", new Date())
  );
}


/*
 * Construct the webpage from these objects
 */

// Body element
var body = document.getElementsByTagName("body")[0];
// Test for correctness
{
  if(!body.children || body.children.length < 3) window.console.error("Incorrect HTML formatting: There should be no less than 3 children in the body element..");
  let numNonScriptChildren = 0;
  for(let i = 0; i < body.children.length; i++) {
    if(body.children[i].nodeName != "SCRIPT" && body.children[i].nodeName != "NOSCRIPT") numNonScriptChildren++;
  }
  if(numNonScriptChildren != 3) window.console.error("Incorrect HTML formatting: There should be exactly 3 elements (excluding script and noscript elements); header, main, and footer.");
}

// Header element
var header = body.children[0];
// Test for correctness
{
  if(header.nodeName != "HEADER") window.console.error("Incorrect HTML formatting: The first child of the body element is not a header element.");
  else if(!header.children || header.children.length != 0) window.console.error("Incorrect HTML formatting: There shouldn't be any children in the header element.");
}

// Main element
var main = body.children[1];
// Test for correctness
{
  if(main.nodeName != "MAIN") window.console.error("Incorrect HTML formatting: The second child of the body element is not a header element.");
  else if(!main.children || main.children.length != 0) window.console.error("Incorrect HTML formatting: There shouldn't be any children in the main element.");
}

// Footer element
var footer = body.children[2];
// Test for correctness
{
  if(footer.nodeName != "FOOTER") window.console.error("Incorrect HTML formatting: The third child of the body element is not a footer element.");
  else if(!footer.children || footer.children.length != 0) window.console.error("Incorrect HTML formatting: There shouldn't be any children in the footer element.");
}

function addTopOfThePageLink(parent) {
  let a = window.document.createElement("a");
  a.setAttribute("id", "topofthispage");
  parent.appendChild(a);
}
function addTitle(parent) {
  let a = document.createElement("a");
  a.setAttribute("id", "title");
  a.setAttribute("title", "home");
  a.setAttribute("type", "text/html");
  a.setAttribute("href", "./home.html");
  let h1= document.createElement("h1");
  h1.innerHTML = webpage.header.title;
  a.appendChild(h1);
  parent.appendChild(a);
}
function addNavBar(parent) {
  let nav = document.createElement("nav");
  let ul = document.createElement("ul");
  for(let i = 0; i < webpage.header.navBar.length; i++) {
    let navItem = webpage.header.navBar[i];
    let li = document.createElement("li");
    let a = document.createElement("a");
    if(navItem.name == "home") a.setAttribute("id", "page"); // specific to home.html
    a.setAttribute("title", navItem.title);
    a.setAttribute("type", "text/html");
    a.setAttribute("href", navItem.url);
    a.innerHTML = navItem.name;
    li.appendChild(a);
    ul.appendChild(li);
  }
  nav.appendChild(ul); // put it all together
  parent.appendChild(nav);
}
function addHeader() {
  // Create the top of the page link
  addTopOfThePageLink(header);
  // Create the title
  addTitle(header);
  // Create the navigation bar
  addNavBar(header);
}

// Build header
addHeader();

function addHomeArticleHeading(parent, articleObject) {
  let header = window.document.createElement("header");
  let heading = window.document.createElement("h3");
  heading.innerHTML = articleObject.heading;
  header.appendChild(heading);
  parent.appendChild(header);
}
function addHomeArticleParagraph(parent, paragraphObject) {
  let paragraph = window.document.createElement("p");
  paragraph.innerHTML = paragraphObject.text;
  parent.appendChild(paragraph);
}
function addHomeArticleParagraphs(parent, articleObject) {
  for(let i = 0; i < articleObject.paragraphs.length; i++) addHomeArticleParagraph(parent, articleObject.paragraphs[i]);
}
function addHomeArticleDate(parent, articleObject) {
  let p = window.document.createElement("p");
  p.setAttribute("class", "time");
  let time = window.document.createElement("time");
  time.setAttribute("datetime", articleObject.date.toISOString());
  time.innerHTML = articleObject.date.toDateString();
  p.appendChild(time);
  parent.appendChild(p);
}
function addHomeArticle(parent, articleObject) {
  let article = window.document.createElement("article");
  article.className = "home"; // specific to home.html
  // Create the article's heading
  if(articleObject.heading) addHomeArticleHeading(article, articleObject);
  // Create the article's paragraphs
  if(articleObject.paragraphs) addHomeArticleParagraphs(article, articleObject);
  // Create the article's date
  if(articleObject.date) addHomeArticleDate(article, articleObject);
  parent.appendChild(article);
}
function addHomeArticles(parent) {
  for(let i = 0; i < webpage.main.articles.length; i++) addHomeArticle(parent, webpage.main.articles[i]);
}

// Build main (a variable number of articles)
addHomeArticles(main);

function addEmailContactInfo(parent) {
  let email = window.document.createElement("a");
  email.setAttribute("title", "Send Me an Email");
  email.innerHTML = "i@seankrail.com";
  let li = window.document.createElement("li");
  let address = window.document.createElement("address");
  address.appendChild(email);
  li.appendChild(address);
  parent.appendChild(li);
}
function addPhoneContactInfo(parent) {
  let phone = window.document.createElement("a");
  phone.setAttribute("title", "Leave a message!");
  phone.innerHTML = "267.421.8790";
  let li = document.createElement("li");
  let address = document.createElement("address");
  address.appendChild(phone);
  li.appendChild(address);
  parent.appendChild(li);
}
function addContactInfo(parent) {
  let ul = document.createElement("ul");
  // Create the email contact info
  addEmailContactInfo(ul);
  // Create the phone contact info
  addPhoneContactInfo(ul);
  // Put it all together
  parent.appendChild(ul);
}
function addTopOfThePageText(parent) {
  let p = window.document.createElement("p");
  p.innerHTML = webpage.footer.text;
  parent.appendChild(p);
}
function addCopyright(parent) {
  let p = window.document.createElement("p");
  p.setAttribute("id", "small");
  let small = window.document.createElement("small");
  small.setAttribute("title", "Copyright Notice");
  small.innerHTML = "Copyright &copy; Sean Krail, <time datetime=\"" + webpage.footer.date.toISOString() + "\">" + webpage.footer.date.toDateString() + "</time>";
  p.appendChild(small);
  parent.appendChild(p);
}
function addFooter(parent) {
  // Create the contact info
  addContactInfo(parent);
  // Create the footer (which is one big link)
  let a = window.document.createElement("a");
  a.setAttribute("title", "Top of this Page");
  a.setAttribute("href", "#topofthispage");
  // Create the top of this page text
  addTopOfThePageText(a);
  // Create the copyright text
  addCopyright(a);
  parent.appendChild(a);
}

// Build footer
addFooter(footer);
