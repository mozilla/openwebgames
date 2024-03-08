'use strict';

/**
 * @ngdoc directive
 * @name modal
 * @description
 * OpenWebGames Modal Component
 */
angular.module('app').directive('modal', function($rootScope){
	var sampleData = {'sponzadynamicshadows':{'name':'Sponza Dynamic Shadows','icon':'/assets/games/sponza.jpg','url':'/assets/games/sponza.html','width':1366,'height':768,'features':['optimizedJavaScript','webGl'],'timeout':60000,'credits':[{'category':'WebGL JavaScript Framework','name':'BabylonJS','url':'http://www.babylonjs.com/','$$hashKey':'object:39'}],'mobile':false,'desktop':true,'status':'success','startTime':4134.35,'timer':'00:35','timeoutPercentage':0,'interval':{'$$state':{'status':2,'value':'cancelled','processScheduled':false},'$$intervalId':36},'stopTime':39645.955,'results':{'totalTime':35535,'wrongPixels':34,'cpuTime':14013,'cpuIdle':0.6056595835690157,'fps':56.28206318787234,'pageLoadTime':162.35000000000002,'numStutterEvents':32,'result':'FAIL'}},'suntemple':{'name':'Sun Temple','icon':'/assets/games/suntemple.png','url':'/assets/games/suntemple.html','width':1366,'height':768,'features':['optimizedJavaScript','webGl'],'timeout':120000,'credits':[{'category':'Unreal Engine 4.10','name':'Sun Temple','url':'https://www.unrealengine.com/','$$hashKey':'object:59'}],'mobile':false,'desktop':true,'status':'success','startTime':102041.78,'timer':'01:12','timeoutPercentage':0,'interval':{'$$state':{'status':2,'value':'cancelled','processScheduled':false},'$$intervalId':252},'stopTime':175307.795,'results':{'totalTime':73291,'wrongPixels':3,'cpuTime':69251,'cpuIdle':0.05512089924838826,'fps':38.203880054279516,'pageLoadTime':60899.490000000005,'numStutterEvents':99,'result':'PASS'}}};

	return {
		restrict: 'E',
		templateUrl: 'modal.html',
		scope: false,
		link: function(scope){
			scope.modalTitle = '';
			scope.modalContent = '';
			scope.modalButton = 'Close';

			scope.showModal = function(){
				$('#modal').modal('show');
				$('#modal div.modal-header').css('display', scope.modalTitle ? 'block' : 'none');
				$('#modal div.modal-footer').css('display', scope.modalButton ? 'block' : 'none');
			};

			scope.closeModal = function(){
				$('#modal').modal('hide');
			};

			scope.setModalTitle = function(title){
				scope.modalTitle = title;
			};

			scope.setModalContent = function(content){
				scope.modalContent = content;
			};

			scope.setModalButton = function(button){
				scope.modalButton = button;
			};

			scope.showSampleResults = function(){
				scope.setModalTitle('Sample Data');
				scope.setModalContent('<pre>' + JSON.stringify(sampleData, null, 4) + '</pre>');
				scope.setModalButton('Close Sample');
				scope.showModal();
			};

			scope.fullscreenModal = function(id){

				var el = document.getElementById(id);

				if(el.requestFullscreen) {
					el.requestFullscreen();
				} else if(el.mozRequestFullScreen) {
					el.mozRequestFullScreen();
				} else if(el.webkitRequestFullscreen) {
					el.webkitRequestFullscreen();
				} else if(el.msRequestFullscreen) {
					el.msRequestFullscreen();
				}

			}

			$('#modal').on('show.bs.modal', function(){

				// blur page underneath
				$rootScope.blur();

				// disable page scroll
				$('body').css('overflow', 'hidden');

				// hide visual arrows
				$('nav-arrow').addClass('hidden');

			});

			$('#modal').on('hide.bs.modal', function(){

				// remove page blur
				$rootScope.unblur();

				// enable page scroll
				$('body').css('overflow', 'auto');

				// show visual arrows (as were hidden by this modal)
				$('nav-arrow').removeClass('hidden');

			});

		}
	};
});
