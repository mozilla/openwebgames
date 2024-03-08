/**
 * @ngdoc directive
 * @name sidebar
 * @description
 * Sidebar interactions for the Demo page on mobile.
 */

angular.module('app').directive('gameDemosControl', function($timeout, $rootScope){
	return {
		restrict: 'C',
		scope: false,
		link: function(scope, elem){

			// When the button is clicked
			$('.intro button').on('click', function() {

				// Mark as opened
				elem.addClass('open');

				// Animate the targeted sidebar
				if ($(this).data('target') == 'tags') {
					TweenMax.to($('.tags'), .5, { left: -20, ease: Back.easeOut.config(0.7) });
				} else {
					TweenMax.to($('.search'), .5, { right: -20, ease: Back.easeOut.config(0.7) });
					$('.search input').focus();
				}

				// Lock scrolling
				$('.view-demos').addClass('lock');

				// Blur content
				$rootScope.blur('mobile-demos');

				// What happens when you close the sidebar
				elem.find('.close').on('click', function() {

					// Mark as closed
					elem.removeClass('open');

					// Unlock scroll
					$('.view-demos').removeClass('lock');

					// Reset sidebar
					TweenMax.to($('.tags'), .5, { left: '-120%', ease: Back.easeOut.config(0.7) });
					TweenMax.to($('.search'), .5, { right: '-120%', ease: Back.easeOut.config(0.7) });

					// Unblur content
					$rootScope.unblur('mobile-demos');

				});
			});
		}
	};
});
