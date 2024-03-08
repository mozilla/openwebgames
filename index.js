
// node modules
var _			= require('underscore'),
	async		= require('async'),
	auth		= require('basic-auth-connect'),
	bodyParser	= require('body-parser'),
	cors		= require('cors'),
	express		= require('express'),
	interceptor	= require('express-interceptor'),
	livereload	= require('connect-livereload'),
	qr			= require('qr-image'),
	request		= require('request'),
	sendgrid	= require('sendgrid');

// express server
var app			= express(),
	port		= process.env.PORT || 5000,
	dist		= process.env.DIST || 'prod',
	privateUrl	= process.env.STATIC_PRIVATE_URL || null,
	publicUrl	= process.env.STATIC_PUBLIC_URL || null;

// cors support
app.use(cors());

// static site dev support
if (privateUrl && publicUrl){
	app.use(interceptor(function(req, res){
		return {
			isInterceptable: function(){
				if (/\.(html|js|json)/.test(req.url)){
					return true;
				}
				return false;
			},
			intercept: function(body, send){
				body = body.split(publicUrl).join(privateUrl);
				send(body);
			}
		};
	}));
}

// http auth config (if specified)
var httpUser = process.env.HTTP_USER;
var httpPass = process.env.HTTP_PASS;
if (httpUser && httpPass){
	app.use(auth(httpUser, httpPass));
}

// sendgrid config (if specified)
var sendgridApiKey = process.env.SENDGRID_APIKEY;
var mail = null;
if (sendgridApiKey){
	mail = sendgrid(sendgridApiKey);
} else {
	console.warn('Unable to find sendgrid credentials, email forms disabled');
}

if (dist === 'dev'){

	// support livereload
	app.use(livereload({
		port: 35729
	}));
}

// support jsonp
app.set('jsonp callback name', 'callback');

// support json encoded bodies
app.use(bodyParser.json());

// support url encoded bodies
app.use(bodyParser.urlencoded({
	extended: true
}));

// generate qr code image
app.get('/qr', function(req, res){
	var url = req.query.url || null;
	if (url){
		var code = qr.image(url, {type: 'svg'});
		res.type('svg');
		return code.pipe(res);
	}
	res.status(500).send(new Error('Missing url parameter'));
});

// email feedback form
app.post('/feedback', function(req, res, next){

	if (!mail){
		return res.status(500).send(new Error('Mail is not configured'));
	}

	var text = req.body.text;
	if (!text){
		return res.status(400);
	}

	mail.send({
		to		: 'owgsmoketest@mozilla.com',
		bcc		: 'toby@bonfirered.com',
		from	: 'no-reply@openwebgames.com',
		subject	: 'OpenWebGames.com Feedback Form',
		text	: text
	}, function(err, json){
		if (!!err){
			console.error(err);
			return res.status(500).send(err);
		}
		res.status(200).send(json);
	});

});

// cache browser results for 24 hours
var browserVersions = {};
var browserExpiration = null;

app.get('/assets/data/browser-versions.:ext', function(req, res, next){

	// test extension
	if (!/jsonp*/.test(req.params.ext)){
		return next();
	}

	var now = new Date();

	// expire data
	if (browserExpiration !== null && now.getTime() > browserExpiration.getTime()){
		browserVersions = {};
		browserExpiration = null;
	}

	// load cached data
	if (browserExpiration !== null){
		if (req.params.ext === 'jsonp'){
			res.status(200).jsonp(browserVersions);
		} else {
			res.status(200).json(browserVersions);
		}
		return;
	}

	var url = 'https://raw.githubusercontent.com/Fyrd/caniuse/master/region-usage-json/alt-ww.json';

	request(url, function(err, res2, body){

		if (!!err){
			return res.status(500);
		}

		var json = JSON.parse(body);
		var browsers = _.keys(json.data);
		var data = {};

		_.each(browsers, function(browser){

			// the keys are the versions
			var keys = _.keys(json.data[browser]);
			var stable;

			// find the "highest" adopted version
			var highestAdopted = [];
			_.each(json.data[browser], function(usage, version){
				if (parseFloat(usage) >= 1){
					highestAdopted.push(version);
				}
			});
			highestAdopted = highestAdopted.sort();

			if (highestAdopted.length > 0){

				stable = _.last(highestAdopted);

			} else {

				// find the "most" adopted version
				var sortedByAdoption = keys.sort(function(a, b){
					return parseFloat(json.data[browser][a]) - parseFloat(json.data[browser][b]);
				});
				stable = _.last(sortedByAdoption);

			}

			// latest is based on highest version
			var sortedByLatest = keys.sort(function(a, b){
				return parseFloat(a) - parseFloat(b);
			});
			var latest = _.last(sortedByLatest);

			// simplified interface
			data[browser] = {
				stable: stable,
				latest: latest
			};

		});

		browserExpiration = new Date(now.getTime() + 60 * 60 * 24 * 1000);
		browserVersions = data;

		if (req.params.ext === 'jsonp'){
			res.status(200).jsonp(browserVersions);
		} else {
			res.status(200).json(browserVersions);
		}

	});

});

app.use(express.static(__dirname + '/dist/' + dist));

// home
app.get('/', function(req, res){
	res.sendFile(__dirname + '/dist/' + dist + '/index.html');
});

// normal page requests
app.get('*.html', function(req, res){
	res.redirect(302, '/#' + req.url);
});

app.get('*', function(req, res){

	if (/^\/[a-z0-9_-]+$/i.test(req.url)){

		// html extensions are optional
		return res.redirect(302, '/#' + req.url + '.html');

	} else {

		// everything else is not
		return res.redirect(302, '/#' + req.url);

	}

});

app.listen(port, function(){
	console.log('listening on port ' + port);
});

