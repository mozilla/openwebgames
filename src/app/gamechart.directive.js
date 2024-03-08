'use strict';

/**
 * @ngdoc directive
 * @name game-chart
 * @description
 * Output a game support chart comparing features to the current browser
 */
angular.module('app').directive('gameChart', function($compile, game){
	return {
		restrict: 'C',
		link: function(scope, elem){

			// games
			var games = game.getGames();

			// generete template
			var html = '<table class="table">';

			var hasResults = !!(scope.results);

			// create a custom feature collection
			var features = ['canvas', 'webgl', 'webgl2', 'gamepad'];

			// feature headers
			html += '<tr><th colspan="2"></th>';
			_.each(features, function(feature){
				html += '<th>' + feature + '</th>';
			});
			if (hasResults){
				html += '<th>results</th>';
			}
			html += '</tr>';

			// each game
			_.each(games, function(game, key){
				html += '<tr><td>' + game.name + '</td><td><img style="max-width:100px;" src="' + game.icon + '"/></td>';
				_.each(features, function(feature){
					if (_.contains(game.features, feature)){
						html += '<td>yes</td>';
					} else {
						html += '<td>no</td>';
					}
				});
				if (hasResults){
					html += '<td>' + (Math.round((scope.results[key].stopTime - scope.results[key].startTime) * 100) / 100) + 'ms</td>';
				}
				html += '</tr>';
			});

			html += '</table>';

			// show template
			elem.html(html).show();

			// link the scope to template
			$compile(elem.contents())(scope);
		}
	};
});

