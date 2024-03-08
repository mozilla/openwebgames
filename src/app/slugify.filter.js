'use strict';

angular.module('app').filter('slugify', function(){
	return function(text){
		return text.toString().toLowerCase()
			.replace(/\s+/g, '-')		// spaces as dashes
			.replace(/[^\w-]+/g, '')	// ignore non-words
			.replace(/-+/g, '-')		// only one dash
			.replace(/_+/g, '_')		// only one underscore
			.replace(/^[_-]/, '')		// only chars at start
			.replace(/[_-]$/g, '');		// only chars at end
	};
});

