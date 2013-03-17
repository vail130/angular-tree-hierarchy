'use strict';

/* Controllers */

var TreeCtrl = function($scope) {
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
  
  $scope.tree = createSampleDataTree(3, 6);
}

angular.module('myApp.controllers', []).
  controller('TreeCtrl', TreeCtrl);
