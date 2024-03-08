'use strict';

/**
 * @ngdoc service
 * @name navigation
 * @description
 * Provide directional navigation through the site
 */
angular.module('app').factory('navigation', function($state, $q){

	var resources = {
		id: 'resources',
		name: 'Resources',
		directions: {}
	};

	var media = {
		id: 'media',
		name: 'Logos & Font',
		directions: {}
	};

	var home = {
		id: 'home',
		name: 'Home',
		directions: {}
	};

	var features = {
		id: 'features',
		name: 'Features',
		directions: {}
	};

	var rights = {
		id: 'rights',
		name: 'Content Rights',
		directions: {}
	};

	var upgrade = {
		id: 'upgrade',
		name: 'Upgrade Your Browser',
		directions: {}
	};

	var faq = {
		id: 'faq',
		name: 'FAQ',
		directions: {}
	};

	var timeline = {
		id: 'timeline',
		name: 'Timeline',
		directions: {}
	};

	var tests = {
		id: 'tests',
		name: 'Run Test',
		directions: {}
	};

	var demos = {
		id: 'demos',
		name: 'Play Demos',
		directions: {}
	};

	resources.directions.right = home;
	resources.directions.down = media;

	media.directions.right = features;
	media.directions.up = resources;
	media.directions.down = rights;

	home.directions.right = timeline;
	home.directions.left = resources;
	home.directions.down = _.clone(features);
	home.directions.down.name = 'Run the Test';

	features.directions.up = home;
	features.directions.down = upgrade;
	features.directions.left = media;

	upgrade.directions.up = features;
	upgrade.directions.left = rights;

	rights.directions.up = media;
	rights.directions.right = upgrade;

	faq.directions.down = timeline;

	timeline.directions.up = faq;
	timeline.directions.left = home;

	var map = {
		resources: resources,
		media: media,
		home: home,
		features: features,
		rights: rights,
		upgrade: upgrade,
		faq: faq,
		timeline: timeline,
		tests: tests
	};

	/**
	 * get the current descriptor
	 *
	 * @param {String} id
	 * @return {Object}
	 */
	function getDescriptor(id){
		return map[id];
	}

	/**
	 * navigate to a destination based on direction
	 *
	 * @param {String} direction
	 * @return {Promise}
	 */
	function navigateByDirection(direction){
		var currentPage = $state.params.slug;

		if (!currentPage) {
			throw new Error('`$state.params.slug` was undefined.');
		}

		if (!$state.params.slug){
			// hidden pages are null
			return;
		}

		var destination = getDescriptor($state.params.slug).directions[direction];

		if (!destination) {
			return $q.reject('Invalid direction specified: ' + direction);
		}

		$state.transitionDirection = direction;

		return $state.go('app.page', {slug: destination.id});
	}

	return {
		getDescriptor: getDescriptor,
		navigateByDirection : navigateByDirection
	};

});
