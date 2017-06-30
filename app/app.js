
var app = angular.module('stellarAD',
                        [
                          'ui.router',
                          'angular-loading-bar',
                          'tokenService'
                        ]);

// config loading bar
app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeBar = true;
    cfpLoadingBarProvider.includeSpinner = true;
    cfpLoadingBarProvider.latencyThreshold = 100;
  }]);


// config routes

app.config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $provide) {

  function redirectWhenLoggedOut($q, $injector) {

    return {

        responseError: function(rejection) {

            var $state = $injector.get('$state');

            if (rejection.status === 401 || rejection.status === 403) {
              localStorage.removeItem('user');
              $state.go('login', {message: "Login Expired. Please sign in"});
            }

            return $q.reject(rejection);
        }
    };
  }

  // Setup for the $httpInterceptor
  $provide.factory('redirectWhenLoggedOut', redirectWhenLoggedOut);

  // Push the new factory onto the $http interceptor array
  $httpProvider.interceptors.push('redirectWhenLoggedOut');


	$urlRouterProvider.otherwise('/');

	$stateProvider
		.state('home', {
			url: '/',
      views:{
          // 'sideBar' : {
          //   templateUrl: 'app/shared/menu/sidemenu.controller.html',
          //   controller: 'sideBarController'
          // },
          'pgContent': {
          templateUrl: 'app/token/create.controller.html',
          controller: 'createController'
        }

      },
      data: {
        requireLogin: false
      }
		});

  $locationProvider.html5Mode(true);


});

app.run(function ($rootScope, $state) {
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

  var requireLogin = toState.data.requireLogin;
  window.scrollTo(0, 0);

  });

});