'use strict';

angular.module('app').config(function config($stateProvider){
	var transition = {
		duration: 0.4,
		ease: 'Quart.easeInOut',
		css: {}
	};

	var transitionEnter = function($state) {
		var enterTransition = _.cloneDeep(transition);

		switch ($state.transitionDirection) {
			case 'up':
				enterTransition.css.y = '-100%';
			break;
			case 'down':
				enterTransition.css.y = '100%';
			break;
			case 'left':
				enterTransition.css.x = '-100%';
			break;
			case 'right':
				enterTransition.css.x = '100%';
			break;
		}

		return {
			transition: enterTransition
		};
	};

	var transitionLeave = function($state) {
		var leaveTransition = _.cloneDeep(transition);

		switch ($state.transitionDirection) {
			case 'up':
				leaveTransition.css.y = '100%';
			break;
			case 'down':
				leaveTransition.css.y = '-100%';
			break;
			case 'left':
				leaveTransition.css.x = '100%';
			break;
			case 'right':
				leaveTransition.css.x = '-100%';
			break;
		}

		return {
			transition: leaveTransition
		};
	};

	var pageTransitions = {
		enter: {
			in: ['$state', transitionEnter],
			out: ['$state', transitionEnter]
		},
		leave: {
			out: ['$state', transitionLeave],
			in: ['$state', transitionLeave]
		}
	};

	$stateProvider
		.state('app', {
			views: {
				'content': {
					templateUrl: 'home.html'
				}
			}
		})
		.state('app.page', {
			url: '/:slug.html',
			views: {
				'content@': {
					templateProvider: function($stateParams, $templateCache){

						// what we hope for
						var html = $templateCache.get($stateParams.slug + '.html');

						// what we settle for
						if (!html){
							html = $templateCache.get('unknown.html');
						}

						// moment of truth
						return html;

					}
				}
			},
			data: {
				'gsapifyRouter.content': pageTransitions
			}
		})
		.state('app.unknown', {
			url: '*path',
			views: {
				'content@': {

					controller: function($state, $stateParams, $templateCache){

						// clean up page slug
						var slug = $state.params.path.replace(/^\//, '').trim();

						if ($state.params.path === ''){

							// default page
							$state.go('app.page', {slug: 'home'});

						} else {

							// if just missing extension, be forgiving
							if ($templateCache.get(slug + '.html')){
								$state.go('app.page', {slug: slug});
							}

						}
					},

					// last resort
					templateUrl: 'unknown.html'

				}
			}
		});
});
