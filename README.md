# OpenWebGames

The open gaming stack for building games on the web.

[http://openwebgames.com](http://openwebgames.com/)

## Development

For technology details please see the [ARCHITECTURE](ARCHITECTURE.md) document.

```
[~] npm install
[~] npm run debug
```

## Latest Stable Versions

This is temporary, convert this to a local dev setup task in gulp (save these two files locally):

```
[~] node index
[~] curl -o src/assets/data/browser-versions.json -u root:kit http://localhost:5000/assets/data/browser-versions.json
[~] curl -o src/assets/data/browser-versions.jsonp -u root:kit http://localhost:5000/assets/data/browser-versions.jsonp?callback=setBrowserVersions
```

## Deployment

The `master` branch is used for production.

1. Create a pull request from "development" to "master"
2. Get another Developer to review it.
3. Merge it.

## Website Requirements

For web page details please see the [WIREFRAMES](WIREFRAMES.md) document.

### Supported Web Browsers

The website is optimized for the following web browsers.

browser                 | desktop       | mobile
---                     | ---           | ---
Chrome                  | latest        | latest
Edge                    | latest        | none
Firefox                 | latest        | none
Internet Explorer       | 11+           | none
Safari                  | 8+            | 8+

_Note: Any web browser failing the minimum feature requirements for OpenWebGames will be shown a fixed upgrade message on the top of each page._

### Supported Screen Resolutions

The website is optimized for the following screen resolutions.

type    | w     | h     | o
---     | ---   | ---   | ---
mobile  | 320   | 480   | both
mobile  | 320   | 568   | both
mobile  | 360   | 640   | both
mobile  | 375   | 667   | both
mobile  | 414   | 736   | both
desktop | 1024  | 768   | landscape
desktop | 1280  | 800   | landscape
desktop | 1280  | 1024  | landscape
desktop | 1366  | 768   | landscape
desktop | 1440  | 900   | landscape
desktop | 1600  | 900   | landscape
desktop | 1920  | 1080  | landscape

_Note: All OpenWebGames are exported to 800x600 and adjusted to fit in website designs with that aspect ratio in mind._

