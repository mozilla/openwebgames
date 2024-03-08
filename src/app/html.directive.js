'use strict';

/**
 * @ngdoc directive
 * @name html
 * @description
 * Monitor page and state changes, record activity in scope, and report results to Google Analytics.
 */
angular.module('app').directive('html', function($location, $state, $window, page, gameBrowser){
	return {
		restrict: 'E',
		link: function(scope){

			// maintain page data at the highest level
			scope.page = page.data;

			// utility (only use in templates for development purposes)
			scope._ = _;

			// test results
			scope.results = null;

			// status message
			scope.status = null;

			// setup browser info
			scope.currentBrowser = gameBrowser.getCurrentBrowser();
			scope.browserName = scope.currentBrowser.browser.name.toLowerCase();

			// used in feature chart
			scope.currentVersionSnippet = scope.currentBrowser.browser.version;
			if (scope.currentVersionSnippet.toString().length <= 6){
				scope.currentVersionSnippet = 'Version ' + scope.currentVersionSnippet;
			}

			// set mobile test
			scope.isMobile = (scope.currentBrowser.device.type === 'mobile');

			// state object
			scope.state = $state;

			// game testing state
			scope.testStateClass = null;

			// before view render
			// set scope info for state and page data
			scope.$on('$stateChangeStart', function(event, toState, toParams){
				scope.stateClass = toParams.slug;		// bind to body for "page" styling
				scope.stateName = toState.name;			// state.go('this')
				scope.statePath = $location.url();		// state switch key
				scope.stateUrl = $location.absUrl();	// uri (absolute url)
				scope.stateParams = toParams;			// state path params (e.g. /my/path/:param)
				scope.page = page.normalizeData(scope.pages[scope.stateClass]);
			});

			// after view render
			// make state views synonymous with page views in google analytics
			scope.$on('$stateChangeSuccess', function(event, toState){
				$window.ga('send', 'pageview', {page: toState.url});
			});
		},
		controller: function($scope, $templateCache){

			// clean slate
			var data = {};

			// get keys from templateCache (using custom decorator)
			var keys = $templateCache.getKeys();
			_.each(keys, function(key){

				// initialize template object
				var self = {
					slug: key.replace(/\.html$/, ''),
					html: $templateCache.get(key),
					text: $('<div>'+$templateCache.get(key)+'</div>').text().replace(/[\r\n\s]+/g, ' ').trim()
				};

				// extract metadata from input fields
				var inputs = $(self.html).filter('input[metadata]');
				_.each(inputs, function(input){
					self[input.name] = input.value;
				});

				// assign normalized template data
				data[self.slug] = page.normalizeData(self);

			});

			// final results
			$scope.pages = data;
		}
	};
});

