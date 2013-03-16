'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['ngSanitize', 'tree-hierarchy', 'myApp.controllers']).
  config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
      $locationProvider.html5Mode(true);
      $routeProvider.when('/tree', {
        templateUrl: 'partials/tree.html',
        controller: TreeCtrl
      })
      .otherwise({redirectTo: '/tree'});
    }
  ]);