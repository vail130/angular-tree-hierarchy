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
  
  var createTreeRecursive = function(seed, parent) {
    if(!parent) {
      parent = {code: ""};
    }
    var tree = []
      , num = Math.floor(Math.random()*3);
    
    for(var i = 1; seed > 1 && i < 5; i++) {
      var treeNode = createNode(i, parent.code);
      treeNode.children = createTreeRecursive(seed/10, treeNode);
      tree.push(treeNode);
    }
    return tree;
  };
  
  $scope.tree = createTreeRecursive(100);
}

angular.module('myApp.controllers', []).
  controller('TreeCtrl', TreeCtrl);
