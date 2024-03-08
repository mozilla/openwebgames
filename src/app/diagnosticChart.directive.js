'use strict';

/**
 * @ngdoc directive
 * @name diagnostic-chart
 * @description
 * Output a diagnostic chart outlining information about the current browser.
 */
angular.module('app').directive('diagnosticChart', function($compile){
	return {
		restrict: 'C',
		link: function(scope, elem){

			// current browser
			console.log(scope.currentBrowser);

			// generete template
			var html = '<img style="float: right; max-width:60px;" src="' + scope.currentBrowser.browser.urls.icon + '"/>';
			html += '<p>' + scope.currentBrowser.ua + '</p>';
			html += '<table class="table table-compact">';

			// browser
			html += '<tr><th colspan="2">BROWSER</th></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;browser name</td><td>' + scope.currentBrowser.browser.name + '</td></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;browser major</td><td>' + scope.currentBrowser.browser.major + '</td></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;browser version</td><td>' + scope.currentBrowser.browser.version + '</td></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;browser stable</td><td>' + scope.currentBrowser.browser.stableVersion + '</td></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;browser latest</td><td>' + scope.currentBrowser.browser.latestVersion + '</td></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;latest</td><td>' + scope.currentBrowser.browser.latest + '</td></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;development</td><td>' + scope.currentBrowser.browser.development + '</td></tr>';

			// engine
			html += '<tr><th colspan="2">ENGINE</th></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;name</td><td>' + scope.currentBrowser.engine.name + '</td></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;version</td><td>' + scope.currentBrowser.engine.version + '</td></tr>';

			// os
			html += '<tr><th colspan="2">OS</th></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;name</td><td>' + scope.currentBrowser.os.name + '</td></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;version</td><td>' + scope.currentBrowser.os.version + '</td></tr>';

			// separator
			//html += '<tr><td colspan="2">&nbsp;</td></tr>';

			// cpu
			html += '<tr><th colspan="2">CPU</th></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;architecture</td><td>' + scope.currentBrowser.cpu.architecture + '</td></tr>';

			// device
			html += '<tr><th colspan="2">DEVICE</th></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;model</td><td>' + scope.currentBrowser.device.model + '</td></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;type</td><td>' + scope.currentBrowser.device.type + '</td></tr>';
			html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;vendor</td><td>' + scope.currentBrowser.device.vendor + '</td></tr>';

			// separator
			//html += '<tr><td colspan="2">&nbsp;</td></tr>';

			html += '<tr><th colspan="2">FEATURES</th></tr>';

			// feature hierarchy
			_.each(scope.currentBrowser.browser.features, function(category, categoryKey){
				html += '<tr><th colspan="2">' + categoryKey.toUpperCase() + ' SUPPORT</th></tr>';
				_.each(category, function(feature, featureKey){
					html += '<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;' + featureKey + '</td><td>' + feature + '</td></tr>';
				});
			});

			html += '</table>';

			// show template
			elem.html(html).show();

			// link the scope to template
			$compile(elem.contents())(scope);
		}
	};
});

