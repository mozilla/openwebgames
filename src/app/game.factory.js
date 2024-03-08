'use strict';

/**
 * @ngdoc service
 * @name game
 * @description
 * Identify web games
 */
angular.module('app').factory('game', function(){

	var cdnUrl = 'https://s3.amazonaws.com/owg/';
	var games = {

		sponzadynamicshadows: {
			name: 'Sponza Dynamic Shadows',
			icon: cdnUrl + 'sponza/icon.png',
			screenshot: cdnUrl + 'sponza/reference.png',
			url: cdnUrl + 'sponza/Demos/SponzaDynamicShadows/index.html',
			width: 1366,
			height: 768,
			features: [
				'webGl',
				'domLevel3'
			],
			folderSize: 78560,
			timeout: 60000,
			credits: [
				{
					category: 'WebGL JavaScript Framework',
					name: 'BabylonJS',
					url: 'http://www.babylonjs.com/'
				}
			],
			mobileTest: true,
			mobileDemo: false,
			desktopTest: true,
			desktopDemo: false,
			fullscreen: true
		},

		heroesofparagon: {
			name: 'Heroes of Paragon',
			icon: cdnUrl + 'heroesofparagon/icon.png',
			screenshot: cdnUrl + 'heroesofparagon/reference.png',
			url: cdnUrl + 'heroesofparagon/index.html',
			width: 1366,
			height: 768,
			features: [
				'optimizedJavaScript',
				'webGl',
				'webAudio',
				'indexedDb',
				'domLevel3'
			],
			folderSize: 244488,
			timeout: 120000,
			credits: [
				{
					category: 'Unity3D',
					name: 'EVERYDAYiPLAY',
					url: 'https://everydayiplay.com/'
				}
			],
			mobileTest: false,
			mobileDemo: false,
			desktopTest: true,
			desktopDemo: true,
			fullscreen: true
		},

		suntemple: {
			name: 'Sun Temple',
			icon: cdnUrl + 'suntemple/icon.jpg',
			screenshot: cdnUrl + 'suntemple/reference.png',
			url: cdnUrl + 'suntemple/index.html',
			width: 1366,
			height: 768,
			features: [
				'optimizedJavaScript',
				'webGl',
				'indexedDb',
				'domLevel3'
			],
			folderSize: 203144,
			timeout: 120000,
			credits: [
				{
					category: 'Unreal Engine 4.10',
					name: 'Sun Temple',
					url: 'https://www.unrealengine.com/'
				}
			],
			mobileTest: false,
			mobileDemo: false,
			desktopTest: true,
			desktopDemo: false,
			fullscreen: false
		},

		casino: {
			name: 'Casino',
			icon: cdnUrl + 'casino/icon.jpg',
			screenshot: cdnUrl + 'casino/reference.png',
			url: cdnUrl + 'casino/index.html',
			width: 1366,
			height: 768,
			features: [
				'webGl',
				'domLevel3'
			],
			folderSize: 157720,
			timeout: 120000,
			credits: [
				{
					category: 'PlayCanvas',
					name: 'Casino',
					url: 'https://playcanvas.com/industries/gambling'
				}
			],
			mobileTest: false,
			mobileDemo: false,
			desktopTest: true,
			desktopDemo: true,
			fullscreen: true
		},

		alphabear: {
			name: 'Alphabear',
			icon: cdnUrl + 'alphabear/icon.jpg',
			screenshot: cdnUrl + 'alphabear/reference.png',
			url: cdnUrl + 'alphabear/index.html',
			width: 1366,
			height: 768,
			features: [
				'webGl',
				'domLevel3'
			],
			folderSize: 51968,
			timeout: 120000,
			credits: [
				{
					category: 'SpryFox',
					name: 'Alphabear',
					url: 'http://spryfox.com/our-games/alphabear/'
				}
			],
			mobileTest: false,
			mobileDemo: false,
			desktopTest: true,
			desktopDemo: true,
			fullscreen: false
		},

		hurry: {
			name: 'Hurry!',
			icon: cdnUrl + 'hurry/icon.jpg',
			screenshot: cdnUrl + 'hurry/reference.png',
			url: cdnUrl + 'hurry/index.html',
			width: 1117,
			height: 768,
			features: [
				'canvas',
				'domLevel3'
			],
			folderSize: 2712,
			timeout: 120000,
			credits: [
				{
					category: 'Hugh Kennedy',
					name: 'Hurry!',
					url: 'https://github.com/hughsk/ludum-dare-27'
				}
			],
			mobileTest: true,
			mobileDemo: false,
			desktopTest: true,
			desktopDemo: false,
			fullscreen: false
		},

		skisafari: {
			name: 'Ski Safari',
			icon: cdnUrl + 'skisafari/icon.jpg',
			screenshot: cdnUrl + 'skisafari/reference.png',
			url: cdnUrl + 'skisafari/index.html',
			width: 1366,
			height: 768,
			features: [
				'webGl',
				'domLevel3'
			],
			folderSize: 96512,
			timeout: 120000,
			credits: [
				{
					category: 'Sleepy Z Studios',
					name: 'Ski Safari',
					url: 'http://skisafari2.com/'
				}
			],
			mobileTest: false,
			mobileDemo: false,
			desktopTest: true,
			desktopDemo: true,
			fullscreen: false
		},

		medusae: {
			name: 'Medusae',
			icon: cdnUrl + 'medusae/icon.jpg',
			screenshot: cdnUrl + 'medusae/reference.png',
			url: cdnUrl + 'medusae/index.html',
			width: 1366,
			height: 768,
			features: [
				'webGl'
			],
			folderSize: 9328,
			timeout: 120000,
			credits: [
				{
					category: 'Jay Weeks',
					name: 'Medusae',
					url: 'https://github.com/jpweeks/particulate-medusae'
				}
			],
			mobileTest: true,
			mobileDemo: true,
			desktopTest: true,
			desktopDemo: true,
			fullscreen: true
		},

	};

	function getGames(){
		return games;
	}

	return {
		getGames : getGames
	};

});


