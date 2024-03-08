'use strict';

/**
 * @ngdoc directive
 * @name view-faq
 * @description
 * View directive
 */
angular.module('app').directive('viewFaq', function($timeout, $document, $rootScope){
	return {
		restrict: 'C',
		scope: true,
		link: function(scope, element){

			// @TODO: Temporary mobile check
			if(element.width() < 1099) {
				return;
			}

			$timeout(function(){
				$rootScope.onLeftScroll = function(){ slider.slick('slickPrev'); };
				$rootScope.onRightScroll = function(){ slider.slick('slickNext'); };
			});

			var slides;

			var slider = element.find('.js-slick').slick({
				centerMode: true,
				infinite: false,
				initialSlide: 0,
				variableWidth: true,
				nextArrow: '<div class="nav-arrow nav-right slick-next"><button class="nav-button"></button></div>',
				prevArrow: '<div class="nav-arrow nav-left slick-prev"><button class="nav-button"></button></div>'
			});

			$timeout(function(){
				setSlides();
				styleSlides(0);

				$document.on('keydown', onKeyboard);
			});

			slider.on('beforeChange', function(event, slick, currenSlide, nextSlide){
				styleSlides(nextSlide);
			});

			function onKeyboard(event){
				if (!$rootScope.blurred()){
					switch(event.which){
						case 37:
							slider.slick('slickPrev');
							break;
						case 39:
							slider.slick('slickNext');
							break;
						default:
							return;
					}
				}
			}

			function setSlides() {
				slides = element.find('.slick-slide').toArray()
				.reduce(function(accumulator, slide){
					slide = $(slide);
					accumulator[slide.data('slick-index')] = slide;

					return accumulator;
				}, {});
			}

			function styleSlides(centerIndex){
				_.forEach(slides, function(slide, key){

					if (key === centerIndex - 1 || key === centerIndex + 1) {
						slide.addClass('secondary');
						slide.removeClass('tertiary');
					} else if (key === centerIndex - 2 || key === centerIndex + 2) {
						slide.addClass('tertiary');
						slide.removeClass('secondary');
					} else {
						slide.removeClass('secondary');
						slide.removeClass('tertiary');
					}
				});
			}

			element.on('$destroy', function() {
				$document.off('keydown', onKeyboard);
				$rootScope.onLeftScroll = null;
				$rootScope.onRightScroll = null;
			});
		}
	};
});
