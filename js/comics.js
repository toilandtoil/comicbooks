var app = angular.module('Comics',['ui.router','infinite-scroll']);

app.config(function ($stateProvider, $urlRouterProvider) {
	$stateProvider.state('index', {
		url: '',
		controler: 'MainCtrl',
		templateUrl: 'templates/character.html'
	})
	.state('index.single', {
		url: '/:id',
		templateUrl: 'templates/characterPopUp.html',
		controller: 'SingleCharacter'
	});
});
app.controller('MainCtrl',function($scope, ComicBooks) {
	ComicBooks.find().then(function(result) {
		var data = result.data.results;
		$scope.characters = data;
	});
	$scope.more = new ComicBooks.LoadMore();
});
app.directive('character', function() {
	var linker = function(scope, element, attrs) {
	};
	var controller = function() {};
	return  {
		restrict: 'E',
		link: linker,
		controller: controller
	};
});
app.controller('SingleCharacter', function($scope, $rootScope, $stateParams, ComicBooks, $window) {
	var id = $stateParams.id;
	ComicBooks.findOne(id).then(function(result) {
		var data = result.data.results[0];
		$scope.characterName = data.name;
		$scope.characterUrl = data.urls[0].url;
		$scope.characterImg = data.thumbnail.path + '.' + data.thumbnail.extension;
		var desc = data.description;
		if(desc.length <= 0){
			desc = "No description provided";
		}
		$scope.description = desc;
		//Not quite what I am looking for...?
		$rootScope.$broadcast('contentLoaded');
	});
});
//Works to prevent scrolling window
app.value('$anchorScroll', angular.noop);
app.directive('popup',function() {
	var linker = function(scope,element,attrs) {
		scope.$on('contentLoaded',function() {
			element.addClass('show');
		});
		scope.close = function() {
			element.removeClass('show');
		};
	};
	return {
		restrict: 'E',
		link: linker
	};
});
app.factory('ComicBooks',function($http,$q) {
	//For Client Side
	//Where apikey is public key
	//http://gateway.marvel.com/v1/comics/?ts=1&apikey=1234
	var publicKey = 'f1da2ae2dc487b462dc04513dea9eac1';
	var baseUrl = 'http://gateway.marvel.com/v1/';
	var limit = 50;
	var find = function() {
		var def = $q.defer();
		var url = baseUrl + 'public/characters?limit='+ limit +'&apikey=' + publicKey;
		$http.get(url).success(def.resolve).error(def.reject);

		return def.promise;
	};
	var findOne = function(id) {
		var def = $q.defer();
		var url = baseUrl + 'public/characters/' + id +'?apikey=' + publicKey;
		$http.get(url).success(def.resolve).error(def.reject);

		return def.promise;
	};
	var findNext = function(offset) {
		var def = $q.defer();
		var url = baseUrl + 'public/characters?limit=' + limit +'&offset=' + (limit*offset) + '&apikey=' + publicKey;
		$http.get(url).success(def.resolve).error(def.reject);

		return def.promise;
	};
	var LoadMore = function() {
		this.offset = 0;
		this.busy = false;
		//Need too append new character to exisiting list...or use this list?
		this.characters = [];
		this.load = function() {
			if(this.busy) {
				return;
			}
			this.busy = true;

			this.busy = true;
		}.bind(this);
	};

	return {
		find: find,
		findOne: findOne,
		LoadMore: LoadMore
	};
});