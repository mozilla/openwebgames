'use strict';

/**
 * @ngdoc directive
 * @name d3-charts
 * @description
 * Generates data visualization charts using D3.js.
 */
angular.module('app').directive('chartType', function(){
	return {
		restrict: 'A',
		require: ['?chartData', '?unitWidth', '?unitHeight', '?unitMargin'],
		link: function(scope, elem, attr){

			// always use a uniqueid
			if (!elem.attr('id')){
				elem.attr('id', _.uniqueId('d3-'));
			}

			// basic options
			var type		= attr.chartType;
			var data		= attr.chartData;
			var unitWidth	= attr.unitWidth || 10;
			var unitHeight	= attr.unitHeight || unitWidth;
			var unitMargin	= attr.unitMargin || 1;

			/**
			 * generate a simple bar chart
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			var barChart = function(){

				// svg container
				var w = unitWidth * _.max(data);
				var h = (unitHeight * data.length) + (unitMargin * (data.length - 1));
				var svg = el.append('svg')
					.attr({
						'preserveAspectRatio': 'none',
						'shape-rendering': 'crispEdges',
						'width': w,
						'height': h,
						'viewBox': function(){
							return '0 0 ' + w + ' ' + h;
						}
					})
					.style({
						'width': '100%',
						'height': '100%'
					});

				// rectangles
				var rectangles = [];
				_.each(data, function(d, i){
					rectangles.push({
						x: 0,
						y: (i * unitHeight) + (i * unitMargin),
						width: d * unitWidth,
						height: unitHeight
					});
				});

				// draw
				svg.selectAll('rect')
					.data(rectangles)
					.enter()
					.append('rect')
					.attr({
						x: function(d){ return d.x; },
						y: function(d){ return d.y; },
						width: function(d){ return d.width; },
						height: function(d){ return d.height; }
					});
			};

			/**
			 * generate a circle chart (experimental)
			 *
			 * @param {Void}
			 * @return {Void}
			 */
			var circleChart = function(){

				// container dimensions
				var w = 0;
				var h = 0;

				// circles
				var circles = [];
				_.each(data, function(d, i){
					var prev = (i > 0) ? (circles[i - 1].cy + circles[i - 1].r) : 0;
					circles.push({
						cx: d * unitWidth,
						cy: d * unitWidth + prev,
						r: d * unitWidth
					});
					w = _.max([w, (d * unitWidth * 2)]);
					h = d * unitWidth + prev + (d * unitWidth);
				});

				// svg container
				var svg = el.append('svg')
					.attr({
						'preserveAspectRatio': 'none',
						//'shape-rendering': 'crispEdges',
						'width': w,
						'height': h,
						'viewBox': function(){
							return '0 0 ' + w + ' ' + h;
						}
					})
					.style({
						'width': '100%',
						'height': '100%'
					});

				// draw
				svg.selectAll('circle')
					.data(circles)
					.enter()
					.append('circle')
					.attr({
						cx: function(d){ return d.cx; },
						cy: function(d){ return d.cy; },
						r: function(d){ return d.r; }
					});
			};

			// make it happen cap'n
			if (type && data){

				// self
				var el = d3.select('#' + elem.attr('id'));

				// @todo: support external json files
				// @todo: validate data
				data = JSON.parse(data);

				switch(type){

					// bar chart
					case 'bar':
						barChart();
						break;

					// circle chart
					case 'circle':
						circleChart();
						break;

				}
			}
		}
	};
});

