'use strict';

/* Controllers */

var TreeCtrl = ['$scope', '$http', function($scope, $http) {
  var s4 = function(){return Math.floor((1+Math.random())*0x10000).toString(16).substring(1)}
    , guid = function(){return s4()+s4()+'-'+s4()+'-'+s4()+'-'+s4()+'-'+s4()+s4()+s4()};
  
  var createNode = function(index, parentCode) {
    return {
      id: guid(),
      name: "Random Node Name " + Math.floor(Math.random()*10000),
      code: parentCode + index.toString(),
      children: []
    };
  };
  
  var createSampleDataTree = function(breadth, depth, parent) {
    if(!parent) {
      var tree = [];
      for(var i = 0; i < breadth; i++) {
        var treeNode = createNode(i+1, "");
        createSampleDataTree(breadth, depth-1, treeNode);
        tree.push(treeNode);
      }
      return tree;
    } else if(depth) {
      for(var i = 0; i < breadth; i++) {
        var child = createNode(i+1, parent.code);
        createSampleDataTree(breadth, depth-1, child);
        parent.children.push(child);
      }
    }
  };
  
  $scope.tree = createSampleDataTree(2, 6);
  $scope.selectionType = [$scope.tree[0].id, $scope.tree[0].children[0].id, $scope.tree[0].children[0].children[0].id];
  $scope.preSelection = [$scope.tree[0].id, $scope.tree[0].children[0].children[0].id];
  
  $scope.$on('loadData', function(event, data) {
    /*
    $http.get(
      ''
    ).success(function(data) {
      $scope.$broadcast('dataLoaded', data);
    }).error(function(data) {
      $scope.$broadcast('dataLoadError', data);
    });
    */
    console.log('tree loaded', $scope.tree);
    $scope.$broadcast('dataLoaded', $scope.tree);
  });
  
  $scope.$on("saveNode", function(event, nodeData) {
    /*
    $http.post(
      '', nodeData
    ).success(function(data) {
      $scope.$broadcast('nodeSaved', data);
    }).error(function(data) {
      $scope.$broadcast('nodeSaveError', data);
    });
    */
    console.log('node saved', nodeData);
    $scope.$broadcast('nodeSaved', nodeData);
  });
}];

angular.module('myApp.controllers', []).
  controller('TreeCtrl', TreeCtrl);
