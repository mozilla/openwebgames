'use strict';

/**
 * @ngdoc service
 * @name page
 * @description
 * Maintains knowledge about the currently loaded page.
 */
angular.module('app').factory('page', function(){

	var data = {};

	var normalizeData = function(obj){
		if (obj && obj.slug){
			return {
				slug		: obj.slug,
				title		: obj.title || '',
				description	: obj.description || '',
				type		: obj.type || 'page',
				url			: obj.url || '/' + obj.slug + '.html',
				imageUrl	: obj.imageUrl || '',
				html		: obj.html || '',
				text		: obj.text || '',
				keywords	: obj.keywords || ''
			};
		} else {
			return null;
		}
	};

	var setData = function(obj){
		data = normalizeData(_.extend(data, obj));
	};

	return {
		data: data,
		normalizeData: normalizeData,
		setData: setData
	};

});

