'use strict';

/**
 * @ngdoc directive
 * @name view-timeline
 * @description
 * View directive
 */
angular.module('app').directive('viewTimeline', function($timeout){
	return {
		restrict: 'C',
		scope: true,
		link: function(scope, element){

			function initializeMouseInteractions(){
				$futures.on('mouseover', function(event){
					futures.forEach(function($component){
						if ($component[0] === event.currentTarget) {
							$component.addClass('active');
							$component.removeClass('inactive');
						} else {
							$component.removeClass('active');
							$component.addClass('inactive');
						}
					});
				});

				$futures.on('mouseout', function(){
					futures.forEach(function($component){
						$component.removeClass('inactive');
						$component.removeClass('active');
					});
				});

				$components.on('mouseover', function(event){
					$today.removeClass('show-content');

					components.forEach(function($component){
						if ($component[0] === event.currentTarget) {
							$component.addClass('active');
							$component.removeClass('inactive');
						} else {
							$component.removeClass('active');
							$component.addClass('inactive');
						}
					});

					$today.addClass('active');

					if ($futureComponent[0] === event.currentTarget) {
						return;
					}

					futures.forEach(function($component){
						if ($component[0] === $today[0]) {
							return;
						}

						$component.removeClass('active');
						$component.addClass('inactive');
					});
				});

				$components.on('mouseout', function(){
					$today.removeClass('active');

					components.forEach(function($component){
						$component.removeClass('inactive');
						$component.removeClass('active');
					});

					futures.forEach(function($component){
						$component.removeClass('active');
						$component.removeClass('inactive');
					});
				});
			}

			// Halo Animations
			function generateHaloVars(){
				return {
					delay: 0.5 + Math.random() * 8,
					css: {
						autoAlpha: 0,
						scale: 0.666 + Math.random() * 1.333
					}
				};
			}

			function getTimelineHeight() {
				setTimeout(function() {
					element.find('.components').height(element.find('.timeline-bg-polyfill')[0].getBoundingClientRect().height);
				}, 500);
			}

			var $components = element.find('.component');
			var components = $components.toArray().map(function(component){ return $(component); });
			// Remove the Today / Future component
			var $futureComponent = components.pop();
			var $futures = $futureComponent.find('.component-content > div');
			var futures = $futures.toArray().map(function(component){ return $(component); });
			var $today = element.find('.future-today');

			$timeout(initializeMouseInteractions, 0);

			if(scope.browserName === 'ie' || scope.browserName === 'edge') {

				// Edge 12 & IE 11 need a set height on the container in order to display the SVG.
				// Furthermore, both browsers are unable to get the height of an absolutely positioned
				// SVG so `.timeline-bg-polyfill` is used to get height.
				getTimelineHeight();
				$(window).resize(function() {
					getTimelineHeight();
				});

			}

			var halos = element.find('.dot-halo').toArray();

			halos.forEach(function(halo){
				TweenMax.set(halo, {
					css: {
						autoAlpha: 1,
						scale: 0,
						transformOrigin: '50% 50%'
					}
				});

				var haloVars = _.merge(generateHaloVars(), {
					ease: 'Quint.easeOut',
					repeat: -1,
					onRepeat: function() {
						this.updateTo(generateHaloVars(), true);
					}
				});

				TweenMax.to(halo, 3, haloVars);
			});

			// Today Animations
			var TIMING = 3;
			var todayElement = element.find('.today-dot');
			var todayTimeline = new TimelineMax({ repeat: -1 });

			// Setup
			TweenMax.set(todayElement.find('#inner-halo-1'), {
				css: {
					autoAlpha: 0.7,
					scale: 0.7,
					transformOrigin: '50% 50%'
				}
			});

			TweenMax.set(todayElement.find('#inner-halo-2'), {
				css: {
					autoAlpha: 0.7,
					scale: 0.7,
					transformOrigin: '50% 50%'
				}
			});

			// Timeline
			todayTimeline.add(TweenMax.to(todayElement.find('#inner-halo-1'), TIMING * 0.625, {
				ease: 'Power2.easeInOut',
				css: {
					autoAlpha: 0,
					scale: 1.9,
					transformOrigin: '50% 50%'
				}
			}), 0);

			todayTimeline.add(TweenMax.to(todayElement.find('#inner-halo-1'), TIMING * 0.75, {
				ease: 'Power2.easeInOut',
				css: {
					autoAlpha: 0.7,
					scale: 0.7,
					transformOrigin: '50% 50%'
				}
			}), TIMING);

			todayTimeline.add(TweenMax.to(todayElement.find('#inner-halo-2'), TIMING, {
				ease: 'Power2.easeInOut',
				css: {
					autoAlpha: 0,
					scale: 1.75,
					transformOrigin: '50% 50%'
				}
			}), 0);

			todayTimeline.add(TweenMax.to(todayElement.find('#inner-halo-2'), TIMING, {
				ease: 'Power2.easeInOut',
				css: {
					autoAlpha: 0.7,
					scale: 0.7,
					transformOrigin: '50% 50%'
				}
			}), TIMING);

			todayTimeline.add(TweenMax.to(todayElement.find('#outter-halo'), TIMING, {
				ease: 'Back.easeInOut',
				css: {
					scale: 1.35,
					autoAlpha: 0.12,
					transformOrigin: '50% 50%'
				}
			}), 0);

			todayTimeline.add(TweenMax.to(todayElement.find('#outter-halo'), TIMING, {
				ease: 'Back.easeInOut',
				css: {
					scale: 1,
					autoAlpha: 0.5,
					transformOrigin: '50% 50%'
				}
			}), TIMING);

			todayTimeline.add(TweenMax.to(todayElement.find('.dot-blue'), TIMING, {
				ease: 'Back.easeInOut',
				css: {
					scale: 1.3,
					transformOrigin: '50% 50%'
				}
			}), 0);

			todayTimeline.add(TweenMax.to(todayElement.find('.dot-blue'), TIMING, {
				ease: 'Back.easeInOut',
				css: {
					scale: 1,
					transformOrigin: '50% 50%'
				}
			}), TIMING);

			// Future
			element.find('.future .future-dot').toArray().forEach(function(dot){
				var origin = (50 + Math.random() * 15) + '% ' + (50 + Math.random() * 15) + '%';

				TweenMax.to(element.find(dot), 12 + Math.random() * 13, {
					ease: 'Power0.easeIn',
					repeat: -1,
					css: {
						rotation: 360,
						transformOrigin: origin
					}
				});
			});
		}
	};
});
