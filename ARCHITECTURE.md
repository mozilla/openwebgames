
# OpenWebGames: Architecture

This document describes the general website architecture for [openwebgames.com](http://openwebgames.com).

## Technologies

This website experience will utilize the following technologies and techniques.

### 3rd Party Services

+ [Heroku](http://heroku.com) ([Cedar](https://devcenter.heroku.com/articles/stack#cedar)) - Ubuntu + Node.js
+ [Github](https://github.com/) - Source code hosting
+ [MongoLab](https://elements.heroku.com/addons/mongolab) (via Heroku) - Managed database service
+ [Tinfoil Security](https://elements.heroku.com/addons/tinfoilsecurity) (via Heroku) - Security scanning service
+ [Hosted Graphite](https://elements.heroku.com/addons/hostedgraphite) (via Heroku) - Process monitoring
+ [Deploy Hooks](https://elements.heroku.com/addons/deployhooks) (via Heroku) - Email &amp; Basecamp deployment notifications
+ [Google Analytics](https://www.google.com/analytics/) - Record website metrics
+ [MailChimp](http://mailchimp.com/) - Collect emails, send newsletters

_Note: Most 3rd party services require separate service contracts._

### Server-Side Technologies

+ [Node.js](https://nodejs.org/en/) - Non-blocking server-side programming language
+ [Express](http://expressjs.com/) - Node.js web server
+ [MongoDB](https://www.mongodb.org/) - Non-relational database
+ [Mongoose](http://mongoosejs.com/) - Node.js/MongoDB ORM
+ [Gulp](http://gulpjs.com/) - Stream-based build/pre-compilation
+ [Sass](http://sass-lang.com/) - CSS extension language

_Note: All server-side solutions will be designed to be stateless._

### Client-Side Technologies

+ [AngularJS](https://angularjs.org/) - JavaScript MVC framework (applications)
+ [Bootstrap](http://getbootstrap.com/) - HTML/CSS/JS framework (responsive)
+ [D3.js](http://d3js.org/) - JavaScript SVG Library (charts)
+ [three.js](http://threejs.org/) - 3D JavaScript Library (effects)
+ TweenMax - DISCUSSING (for Morphing)
+ [asm.js](http://asmjs.org/) - Low Level JavaScript (games)

## Components

This website experience will use the following custom web components/implementations.

### Node.js REST APIs

REST APIs translate read/write results between a server-side data storage service and a client-side web applications (via HTTP/HTTPS).

endpoint        | summary
---             | ---
browsers        | browser details (e.g. mapping features to browsers)
resources       | development resources (e.g. blogs, repos, articles, etc)
results         | user test result details (e.g. captured results from test drives ... POST-ONLY)
gamedemos       | game demos (e.g. playable version of angrybots)
gametests       | game tests (e.g. automated optimizied version of angrybots)

### AngularJS Services

Services expose functionality to controllers and directives.

service         | summary
---             | ---
browsers        | $http: browser collections and their supported gaming features
resources       | $http: development resources
gamingfeatures  | $http: supportable gaming features
gamedemos       | $http: playable game demos
gametests       | $http: automated game demos
results         | $http: user captured test results
currentbrowser  | $js: current browser and real-time tested gaming support features
states          | $js: tracked session states across site routes, actions, and activities

_$http: remote functionality_  
_$js: local functionality_

### AngularJS UI Routes

UI Routes provide URLS for navigation and SEO purposes.

_Note: /some/missing/page.html will 302 redirect to /#/some/missing/page.html_

route           | title                             | summary
---             | ---                               | ---
/               | OpenWebGames                      | home page
/about          | About OpenWebGames                | details about openwebgames
/diagnostics    | OpenWebGames Browser Diagnostics  | current browser diagnostics chart
/gamedemos      | OpenWebGames Game Demos           | playable game demos
/gamedemos/*    | OpenWebGames :: {Demo Name}       | playable game demo
/gametests      | OpenWebGames Game Tests           | testable game experiences
/gametests/*    | OpenWebGames :: {Game Name}       | testable game experience
/unknown        | OpenWebGames :: Unknown Page      | 404 user experience

### AngularJS UI Layouts

UI Layouts describe the structure for a page experience.

layout  | summary
---     | ---
default | one page structure (header, content, footer)

### AngularJS UI View Templates

UI View templates organize zones used inside layouts.

template            | summary
---                 | ---
header              | common header zone
footer              | common footer zone
upgrade             | browser upgrade zone
content             | common content zone (default = home)
content-home        | home page content zone
content-about       | about page content zone
content-browsers    | browser support page content zone
content-demos       | game demo collection page content zone
content-demo        | playable game demo page content zone
content-tests       | game test collection page content zone
content-test        | testable game test page content zone

### AngularJS UI Directives

UI Directives describe self contained DOM components (HTML/JS) used within views.

directive       | summary
---             | ---
logo            | logo animation
carousel        | content carousel experience
preloader       | game test preloader icon
gamedemo        | game demo player (playable experience)
gametest        | game test player (automated experience)
gamestatus      | game test status bar (animated)
fullscreen      | grows dom element to fullscreen
timeline        | timeline chart (d3)
timer           | minute:second timer
signup          | email signup form
feedback        | user feedback form
particles       | background particle animations

### Gulp Build Tasks

__Source Code Workflow__

```
feature/name -> development -> master
```

task        | summary
---         | ---
build       | build production distro
debug       | build development distro, start livereload server, and synchronize changes
docs        | build angular documentation, start docs server

## Mozilla Questions

+ mailchimp (newsletters)
+ heroku (hosting)
+ github (source code)
+ google analytics (website metrics)
+ hardware test (can we just use performance.now?)
+ can we force quit a game test that's taking too long? if so how long is that?
+ what is considered "compliant"?

