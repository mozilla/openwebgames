'use strict';

/**
 * @ngdoc service
 * @name game-browser
 * @description
 * Identify web browsers and their supported gaming features
 */
angular.module('app').factory('gameBrowser', function(browser, gameSupport){

	function getCurrentBrowser(){

		var currentBrowser = browser.getCurrentBrowser();
		var featureHierarchy = gameSupport.getHierarchy(true);
		var supportedFeatures = {};
		currentBrowser.browser.features = featureHierarchy;
		_.each(currentBrowser.browser.features, function(group, cat){
			_.each(group, function(obj, key){
				supportedFeatures[key] = obj;
			});
		});
		currentBrowser.browser.supportedFeatures = supportedFeatures;
		return currentBrowser;

	}

	return {
		getCurrentBrowser : getCurrentBrowser
	};

});

