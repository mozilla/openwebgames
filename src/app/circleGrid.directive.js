'use strict';

/**
 * @ngdoc directive
 * @name circle-grid
 * @description
 * Circle Grid (Animated Backdrop)
 */
angular.module('app').directive('circleGrid', function($timeout){
	return {
		restrict: 'C',
		link: function(scope, elem){

			var minSmokeCount	= 5;
			var maxSmokeCount	= 10;
			var circleSize		= 45;
			var supportedPages	= ['faq', 'home', 'media', 'resources', 'rights', 'upgrade'];

			/**
			 * Geometry Vector library (x,y based)
			 */
			Math.Vector = function(x, y) {
				this.x = x;
				this.y = y;
			};
			Math.Vector.prototype = {
				clone: function() {
					return new Math.Vector(this.x, this.y);
				},
				negate: function() {
					this.x = -this.x;
					this.y = -this.y;
					return this;
				},
				neg: function() {
					return this.clone().negate();
				},
				addeq: function(v) {
					this.x += v.x;
					this.y += v.y;
					return this;
				},
				subeq: function(v) {
					return this.addeq(v.neg());
				},
				add: function(v) {
					return this.clone().addeq(v);
				},
				sub: function(v) {
					return this.clone().subeq(v);
				},
				multeq: function(c) {
					this.x *= c;
					this.y *= c;
					return this;
				},
				diveq: function(c) {
					this.x /= c;
					this.y /= c;
					return this;
				},
				mult: function(c) {
					return this.clone().multeq(c);
				},
				div: function(c) {
					return this.clone().diveq(c);
				},
				dot: function(v) {
					return this.x * v.x + this.y * v.y;
				},
				length: function() {
					return Math.sqrt(this.dot(this));
				},
				normal: function() {
					return this.clone().diveq(this.length());
				}
			};

			/**
			 * generate random smoke containers html
			 *
			 * @param {Void}
			 * @return {String} html
			 */
			function generateSmokeHtml(){

				var count = _.random(minSmokeCount, maxSmokeCount);
				var type = null;
				var html = '';

				for (var i = 0; i < count; i++){
					type = _.random(1, 2);
					html += '<div class="smoke' + type + '"></div>';
				}

				return html;

			}

			/**
			 * generate container elements
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function generateContainers(){

				// create random smoke elements
				var smokeHtml = generateSmokeHtml();

				// create master container(s)
				var container = $('<div class="grid-container">' + smokeHtml + '<div class="circle-container"></div></div>');

				// prepend to directive container
				$(elem).prepend(container);

			}

			/**
			 * randomize smoke positions
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function randomizeSmokePosition(){

				var selector		= $(elem).find('.smoke1,.smoke2'),
					width 			= $(window).width(),
					height 			= document.body.scrollHeight,
					minPixelShift 	= -100;

				selector.each(function(){
					$(this).css({
						marginTop	: _.random(minPixelShift, height),
						marginLeft	: _.random(minPixelShift, width)
					});
				});

			}

			/**
			 * generate circle elements
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function generateCircles(){

				var width 	= $(window).width(),
					height 	= document.body.scrollHeight,
					columns	= Math.floor(width / circleSize),
					rows	= Math.floor(height / circleSize),
					count 	= columns * rows;

				for (var i = 0; i < count; i++){
					$( '.circle-container' ).append('<div class="circle-outer"><div class="circle-inner"></div></div>');
				}

			}

			/**
			 * teach an element to evade mouse focus
			 *
			 * @param {DOMEvent}
			 * @return {Void}
			 */
			function evade(evt) {

				var $this = $(this),
					corner = $this.offset(),
					center = {
						x: corner.left + $this.outerWidth() / 2,
						y: corner.top + $this.outerHeight() / 2
					},
					dist = new Math.Vector(center.x - evt.pageX, center.y - evt.pageY),
					closest = $this.outerWidth() / 2;

				// proximity test
				if (dist.length() >= closest) {
					return;
				}

				// calculate new position
				var delta = dist.normal().multeq(closest).sub(dist),
					newCorner = {
						left: corner.left + delta.x,
						top: corner.top + delta.y
					};

				// bounds check
				var padding = parseInt($this.css('padding-left'));
				if (newCorner.left < -padding) {
					newCorner.left = -padding;
				} else if (newCorner.left + $this.outerWidth() - padding > $(document).width()) {
					newCorner.left = $(document).width() - $this.outerWidth() + padding;
				}
				if (newCorner.top < -padding) {
					newCorner.top = -padding;
				} else if (newCorner.top + $this.outerHeight() - padding > $(document).height()) {
					newCorner.top = $(document).height() - $this.outerHeight() + padding;
				}

				// move bumper
				$this.css('opacity', 0.25);
				$this.offset(newCorner);
			}

			/**
			 * bind mouse movement to evade
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function beginEvade() {
				$(this).bind('mousemove', evade);
			}

			/**
			 * unbind mousemove from evade and animate bumper back to original spot
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function endEvade() {
				var $this = $(this);
				$this.unbind('mousemove', evade);
				$this.animate({
					top		: 0,
					left	: 0,
					opacity	: 0.07
				}, {
					easing: 'swing',
					duration: 500
				});
			}

			/**
			 * setup evade events for each circle
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function setupEvadeEvents() {
				$('.circle-outer').bind('mouseover', beginEvade);
				$('.circle-outer').bind('mouseout', endEvade);
			}

			/**
			 * kill the background animations
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function destroy(){
				$('.grid-container').remove();
			}

			/**
			 * initialize the background animations
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function initialize(){
				generateContainers();
				generateCircles();
				randomizeSmokePosition();
				setupEvadeEvents();
			}

			/**
			 * re-initialize the background animations
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			function reInitialize(){
				destroy();
				initialize();
			}

			/**
			 * determine if a page has support for this animation experience
			 *
			 * @param {String} pagekey
			 * @return {Boolean}
			 */
			function pageHasSupport(pagekey){
				return _.includes(supportedPages, pagekey);
			}

			// execute between digest cycles
			$timeout(function(){

				if (scope.isMobile === false){

					// not on this page
					if (!pageHasSupport(scope.stateParams.slug)){
						return destroy();
					}

					// first time!
					initialize();

					scope.$on('$stateChangeSuccess', function(event, toState, toParams){

						// not on this page
						if (!pageHasSupport(toParams.slug)){
							return destroy();
						}

						// been here before, and ready to do it again
						reInitialize();

					});

					$(window).resize(function(){
						destroy();
						if (pageHasSupport(scope.stateParams.slug)){
							initialize();
						}
					});

				}

			});

		}
	};
});

