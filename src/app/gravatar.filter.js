'use strict';

angular.module('app').filter('gravatar', function(md5){
	return function(email){
		return '//www.gravatar.com/avatar/' + md5.hash(email);
	};
});

