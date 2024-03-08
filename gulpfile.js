'use strict';

/*******************************************************************/
/**  npm modules                                                  **/
/*******************************************************************/

var _				= require('underscore'),					// utilities
	annotate		= require('gulp-ng-annotate'),				// annotate angular dependencies
	cache			= require('gulp-cached'),					// cache task results
	concat			= require('gulp-concat'),					// concat task results into one file
	del				= require('del'),							// delete files/folders
	environment		= require('gulp-env'),						// overwrite process.env
	cors			= require('cors'),							// cors support
	express			= require('express'),						// express server
	extension		= require('gulp-ext-replace'),				// rewrite file extensions
	fs				= require('fs'),							// file system access
	gramophone		= require('gramophone'),					// extract common keywords/phrases
	gulp			= require('gulp'),							// "this"
	help			= require('gulp-help')(gulp),				// add custom help messages to tasks
	htmlToText		= require('html-to-text'),					// convert html to beautiful text
	intercept		= require('gulp-intercept'),				// intercept and change gulp streams
	liveserver		= require('gulp-live-server'),				// attach live server to real server
	minifyCss		= require('gulp-clean-css'),				// minify css
	minifyJs		= require('gulp-uglify'),					// minify js files
	net				= require('net'),							// create servers
	open			= require('open'),							// open browser
	os				= require('os'),							// read os interface data
	path			= require('path'),							// path manipulation
	runSequence		= require('run-sequence'),					// run gulp tasks in order
	sass			= require('gulp-sass'),						// parse/convert sass/scss to css
	sourcemaps		= require('gulp-sourcemaps'),				// generate sourcemap files
	templateCache	= require('gulp-angular-templatecache');	// generate angular template cache file

/*******************************************************************/
/**  internal variables                                           **/
/*******************************************************************/

var env = 'dev',
	server = null,
	host = null,
	port = null,
	srcPath = 'src',
	buildPath = {
		dev: 'dist/dev',
		prod: 'dist/prod'
	},
	validExtensions = [
		'css', 'eot', 'gif', 'ico', 'jpeg', 'jpg', 'js', 'json',
		'jsonp', 'map', 'otf', 'png', 'svg', 'ttf', 'woff', 'woff2',
		'html', 'data', 'mem', 'unity3d', 'zip', 'babylon'
	],
	validRootExtensions = [
		'html', 'ico'
	];

/*******************************************************************/
/**  internal functions                                           **/
/*******************************************************************/

/**
 * get next available (unused) tcp port
 *
 * @param {Function} cb(port)
 * @return {Void}
 */
var getNextAvailablePort = function(cb){
	var server = net.createServer();
	server.listen(0, function(){
		var port = server.address().port;
		server.once('close', function(){
			cb(port);
		});
		server.close();
	});
};

/**
 * get local address (falls back to localhost)
 *
 * @param {Function} cb(ip)
 * @return {Void}
 */
var getLocalAddress = function(cb){
	var host = 'localhost';
	var interfaces = _.values(os.networkInterfaces());
	_.each(interfaces, function(group){
		_.each(_.values(group), function(entry){
			if (host === 'localhost' && entry.family === 'IPv4' && entry.internal === false && entry.mac !== '00:00:00:00:00:00'){
				host = entry.address;
			}
		});
	});
	cb(host);
};

/**
 * get keywords from html string
 *
 * @param {String} html
 * @return {Array}
 */
var getKeywordsFromHtml = function(html){
	var min = 3;
	var limit = 10;
	var keywords = gramophone.extract(htmlToText.fromString(html), {limit: limit * 2});
	keywords = _.filter(keywords, function(k){return k.length > min}).slice(0, limit);
	return keywords;
};

/**
 * notify livereload server of changes
 *
 * @param {Event} event
 * @return {Void}
 */
var notifyLivereload = _.debounce(function(event){
	if (server){
		server.notify.apply(server, [event]);
	}
}, 500);

/**
 * build environment distribution
 *
 * @param {String} target
 * @param {Function} cb
 */
var buildTargetDistro = function(target, cb){
	env = target;
	runSequence(
		'_purgeBuild',				// purge build folder
		[
			'_buildApp',			// build custom app
			'_copyAssets',			// copy asset files
			'_copyRoots',			// copy root files
			'_copyLibs',			// copy library files
			'_buildStyles'			// build stylesheets
		],
		'_copyTemplates',			// copy templates
		'_buildTemplateCache',		// build template cache
		'_compressApp',				// compress custom app
		'_compressAssetScripts',	// compress asset script files
		'_compressStyles',			// compress styles
		cb
	);
};

/*******************************************************************/
/**  private tasks                                                **/
/*******************************************************************/

gulp.task('_purgeBuild', false, function(){
	return del(buildPath[env]);
});

gulp.task('_buildApp', false, function(){
	return gulp.src(srcPath + '/app/**/*.js')
		.pipe(annotate())
		.pipe(concat('app.js'))
		.pipe(gulp.dest(buildPath[env] + '/js'));
});

gulp.task('_copyAssets', false, function(){
	return gulp.src(srcPath + '/assets/**/*.{' + validExtensions.join(',') + '}')
		.pipe(cache('asset'))
		.pipe(gulp.dest(buildPath[env] + '/assets'))
		.pipe(intercept(notifyLivereload));
});

gulp.task('_copyRoots', false, function(){
	return gulp.src(srcPath + '/*.{' + validRootExtensions.join(',') + '}')
		.pipe(gulp.dest(buildPath[env]))
		.pipe(intercept(notifyLivereload));
});

gulp.task('_copyLibs', false, function(){
	return gulp.src(srcPath + '/libs/**/*.{' + validExtensions.join(',') + '}')
		.pipe(cache('lib'))
		.pipe(gulp.dest(buildPath[env] + '/libs'));
});

gulp.task('_copyTemplates', false, function(){
	return gulp.src(srcPath + '/{pages,snippets}/*.html')
		.pipe(gulp.dest(buildPath[env] + '/templates'));
});

gulp.task('_buildStyles', false, function(){
	return gulp.src(srcPath + '/styles/**/*.scss')
		.pipe(sass())
		.pipe(concat('app.css'))
		.pipe(gulp.dest(buildPath[env] + '/css'));
});

gulp.task('_buildTemplateCache', false, function(){
	return gulp.src(buildPath[env] + '/templates/**/*.html')
		.pipe(intercept(function(file){
			file.contents = new Buffer('<input type="hidden" metadata name="type" value="include"/>\n' + file.contents.toString());
			return file;
		}))
		.pipe(templateCache('templates.js', {
			'module'		: 'app',
			'transformUrl'	: function(url){
				return url = url.replace(/^[^\/]+\//, '');
			}
		}))
		.pipe(gulp.dest(buildPath[env] + '/js'));
});

gulp.task('_compressApp', false, ['_buildApp'], function(){
	return gulp.src([buildPath[env] + '/js/*.js', '!' + buildPath[env] + '/js/*.min.js'])
		.pipe(sourcemaps.init())
		.pipe(minifyJs())
		.pipe(extension('.min.js'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(buildPath[env] + '/js'))
		.pipe(intercept(notifyLivereload));
});

gulp.task('_compressAssetScripts', false, ['_copyAssets'], function(){
	return gulp.src([buildPath[env] + '/assets/js/*.js', '!' + buildPath[env] + '/assets/js/*.min.js'])
		.pipe(sourcemaps.init())
		.pipe(minifyJs())
		.pipe(extension('.min.js'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(buildPath[env] + '/assets/js'))
		.pipe(intercept(notifyLivereload));
});

gulp.task('_compressStyles', false, ['_buildStyles'], function(){
	return gulp.src([buildPath[env] + '/css/*.css', '!' + buildPath[env] + '/css/*.min.css'])
		.pipe(sourcemaps.init())
		.pipe(minifyCss())
		.pipe(extension('.min.css'))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(buildPath[env] + '/css'))
		.pipe(intercept(notifyLivereload));
});

gulp.task('_watchApp', false, function(){
	gulp.watch(srcPath + '/app/**/*.js', ['_buildApp', '_compressApp']);
});

gulp.task('_watchAssets', false, function(){
	gulp.watch(srcPath + '/assets/**/*.{' + validExtensions.join(',') + '}', ['_copyAssets', '_compressAssetScripts']);
});

gulp.task('_watchRoots', false, function(){
	gulp.watch(srcPath + '/*.{' + validRootExtensions.join(',') + '}', ['_copyRoots']);
});

gulp.task('_watchStyles', false, function(){
	gulp.watch(srcPath + '/styles/**/*.scss', ['_buildStyles', '_compressStyles']);
});

gulp.task('_watchTemplates', false, function(){
	gulp.watch(srcPath + '/{pages,snippets}/**/*.html', ['_copyTemplates']);
	gulp.watch(buildPath[env] + '/templates/**/*.html', ['_buildTemplateCache']);
});

gulp.task('_watchCompiledTemplates', false, function(){
	gulp.watch(buildPath[env] + '/js/templates.js', ['_compressApp']);
});

gulp.task('_watch', false, function(cb){
	runSequence(
		[
			'_watchApp',				// watch custom app files
			'_watchAssets',				// watch asset files
			'_watchRoots',				// watch root folder files
			'_watchStyles',				// watch stylesheet files
			'_watchTemplates',			// watch template files
			'_watchCompiledTemplates',	// watch compiled template file
		],
		cb
	);
});

gulp.task('_debugDistro', false, function(cb){
	buildTargetDistro('dev', cb);
});

gulp.task('_prodDistro', false, function(cb){
	buildTargetDistro('prod', cb);
});

gulp.task('_debugServer', false, function(){

	getLocalAddress(function(newHost){

		// remember host
		host = newHost;

		// get available port
		getNextAvailablePort(function(newPort){

			// remember port
			port = newPort;

			// set environment
			environment({
				vars: {
					DIST				: 'dev',
					PORT				: port,
					STATIC_PATH			: __dirname + '/../openwebgames-games/src',
					STATIC_PORT			: 5001,
					STATIC_PRIVATE_URL	: 'http://' + host + ':5001/owg/',
					STATIC_PUBLIC_URL	: 'https://s3.amazonaws.com/owg/'
				}
			});

			// start server
			server = liveserver('index.js', {env: process.env});
			server.start();

			// watch self
			gulp.watch('index.js', function(){
				server.start.bind(server);
			});

			// open in browser
			setTimeout(function(){
				open('http://' + host + ':' + port + '/qrcode');
			}, 500);

		});

	});
});

gulp.task('_staticServer', false, function(){

	// static asset server
	var staticPath	= process.env.STATIC_PATH || __dirname + '/../openwebgames-games/src',
		staticPort	= process.env.STATIC_PORT || 5001,
		privateUrl	= process.env.STATIC_PRIVATE_URL || 'http://' + (host || 'localhost') + ':5001/owg/',
		publicUrl	= process.env.STATIC_PUBLIC_URL || 'https://s3.amazonaws.com/owg/';

	// express server
	var app = express();

	// cross origin resource sharing
	app.use(cors());

	app.get('*gz', function(req, res, next){

		if (/\.(data|js|mem|symbols)\.*gz$/.test(req.url)){

			var filePath = path.normalize(staticPath + req.url);
			var fileStat = fs.statSync(filePath);
			var headers = {
				'Content-Encoding'	: 'gzip',
				'Content-Length'	: fileStat.size
			};

			if (/\.js\.*gz$/.test(req.url)){
				headers['Content-Type'] = 'application/x-javascript';
			}

			if (/\.(data|mem|symbols)\.*gz$/.test(req.url)){
				headers['Content-Type'] = 'application/octet-stream';
			}

			res.writeHead(200, headers);
			return fs.createReadStream(filePath).pipe(res);

		}

		next();

	});

	app.use(express.static(staticPath));

	app.listen(staticPort, function(){
		console.log('static server listening on port ' + staticPort);
	});

});

/*******************************************************************/
/**  public tasks                                                 **/
/*******************************************************************/

gulp.task('debug', 'Build development distro, start livereload server, and synchronize changes.', function(cb){
	runSequence(
		'_debugDistro',			// debug distro
		'_debugServer',			// debug server
		'_staticServer',		// static server
		'_watch',				// watch files
		cb
	);
});

gulp.task('build', 'Build production distro.', function(cb){
	runSequence(
		'_prodDistro', // prod distro
		cb
	);
});

gulp.task('default', 'Run help task.', function(cb){
	// help
	runSequence(
		'help',
		cb
	);
});

// @TODO:
// + minify all image files
// + minify all svg files
// + convert post metadata into json data?

