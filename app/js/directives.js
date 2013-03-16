'use strict';

/* Directives */

angular.module('tree-hierarchy', [])
  .directive('treeHierarchy', ["$http", function($http) {
    return {
      template: [
        '<div class="tree-hierarchy">',
          '<div class="tree-header">',
            '<button ng-click="expandAll()" class="btn btn-small">Expand All</button>',
            '<button ng-click="collapseAll()" class="btn btn-small">Collapse All</button>',
            '<div class="filter-wrapper">',
              '<label>Filter:</label>',
              '<input type="text" ng-model="filter" ng-change="filterNodes()" />',
            '</div>',
          '</div>',
          '<ul class="tree-body" ng-model="tree">',
            '<li ng-repeat="data in tree" tree-hierarchy-rec="data" allow-leaf-selection="allowLeafSelection"></li>',
          '</ul>',
        '</div>'
      ].join('\n'),
      replace: true,
      scope: {
        tree: '=treeHierarchy',
        allowLeafSelection: '=allowLeafSelection'
      },
      link: function($scope, elem, attrs) {
        $scope.load = function() {
          if(!attrs["treeHierarchy"]) {
            $scope.getTreeDataEndpoint = attrs["getTreeDataEndpoint"];
            $scope.saveNodeEndpoint = attrs["saveNodeEndpoint"];
            $scope.tree = {};
            $scope.getTreeData();
          }
        };
        
        $scope.getTreeData = function() {
          $http.get($scope.getTreeDataEndpoint).success(function(data) {
            $scope.tree = JSON.parse(data);
          });
        };
        
        $scope.expandAll = function() {
          $scope.$broadcast('expandAll');
        };
        
        $scope.collapseAll = function() {
          $scope.$broadcast('collapseAll');
        };
        
        $scope.filterNodes = function() {
          $scope.$broadcast('filter', $scope.filter);
        };
  
        $scope.$on("saveNode", function(event, nodeData) {
          $http.post($scope.saveNodeEndpoint, nodeData).success(function(data) {
            // Handle response...
          });
        });
        
        $scope.load();
      }
    };
  }])
  .directive('treeHierarchyRec', ['$compile', function($compile) {
    return {
      template: [
        '<span ng-hide="hidden">',
          '<span class="expand-collapse-link-wrapper">',
            '<a href="#" ng-click="toggleNodes()" ng-show="nodeData.children.length">',
              '<i ng-class="getToggleIconClass()"></i>',
            '</a>',
            '<input type="checkbox" ng-model="nodeData.isSelected" ng-show="allowLeafSelection && !nodeData.children.length" ng-click="saveNode()" />',
          '</span>',
          '<span ng-click="toggleNodes()" ng-hide="editing" ng-bind-html="highlightedLabel"></span>',
          '<form ng-submit="saveName()" ng-hide="!editing">',
            '<input type="text" ng-model="nodeData.name" />',
          '</form>',
          '<a href="#" ng-click="startEditing()" ng-hide="editing"><i class="icon-edit"></i></a>',
          '<button ng-click="saveName()" ng-hide="!editing" class="btn btn-mini btn-primary">Save</button>',
          '<button ng-click="cancelEditing()" ng-hide="!editing" class="btn btn-mini">Cancel</button>',
          '<a href="#" ng-click="add(nodeData)" ng-hide="editing"><i class="icon-plus"></i></a>',
          '<button ng-click="delete(nodeData)" ng-show="nodeData.nodes.length > 0" class="btn btn-mini btn-danger">Delete children</button>',
        '</span>',
        '<ul></ul>'
      ].join('\n'),
      replace: false,
      scope: {
        nodeData: '=treeHierarchyRec',
        allowLeafSelection: '=allowLeafSelection'
      },
      link: function($scope, elem, attrs) {
        $scope.$on('collapseAll', function() {
          if($scope.shown) {
            $scope.toggleNodes();
          }
        });
        
        $scope.$on('expandAll', function() {
          if(!$scope.shown) {
            $scope.toggleNodes();
          }
        });
        
        $scope.$on('filter', function(event, filter) {
          if(!$scope.nodeData.children.length) {
            var label = ($scope.nodeData.code + " - " + $scope.nodeData.name).toLowerCase();
            if(label.indexOf(filter.toLowerCase()) > -1) {
              $scope.showFromFilter(filter);
              $scope.$emit("showFromFilter", filter);
            } else {
              $scope.hideFromFilter();
            }
          } else {
            $scope.hideFromFilter();
          }
        });
        
        $scope.$on('showFromFilter', function(event, filter) {
          $scope.showFromFilter(filter);
        });
        
        $scope.$on('hideFromFilter', function() {
          $scope.hideFromFilter();
        });
        
        $scope.hideFromFilter = function() {
          $scope.hidden = true;
        };
        
        $scope.showFromFilter = function(filter) {
          $scope.hidden = false;
          var label = $scope.nodeData.code + " - " + $scope.nodeData.name
            , output = "";
          
          if(!filter) {
            $scope.highlightedLabel = label;
            return;
          }
          
          while(true) {
            var tempIndex = label.toLowerCase().indexOf(filter.toLowerCase());
            if(tempIndex === -1) {
              output += label;
              break;
            }
            
            var tempBeginningString = label.substr(0, tempIndex)
              , tempMatchString = label.substr(tempIndex, filter.length);
            
            output += tempBeginningString + "<ins>" + tempMatchString + "</ins>";
            label = label.substr(tempIndex + filter.length);
          }
          
          $scope.highlightedLabel = output;
        };
        
        $scope.load = function() {
          $scope.shown = true;
          $scope.ulReplaced = false;
          $scope.highlightedLabel = $scope.nodeData.code + " - " + $scope.nodeData.name;
          
          if($scope.nodeData && $scope.nodeData.children && $scope.nodeData.children.length) {
            $scope.loadChildNodes();
          }
        };
        
        $scope.getToggleIconClass = function() {
          if(!$scope.nodeData.children.length) {
            return "";
          } else if($scope.shown) {
            return "icon-minus-sign";
          } else {
            return "icon-plus-sign";
          }
        };
        
        $scope.loadChildNodes = function() {
          var ul = angular.element(elem).find('ul')
            , template = [
              '<ul ng-model="nodeData.children" ng-show="shown">',
                '<li ng-repeat="data in nodeData.children" tree-hierarchy-rec="data" allow-leaf-selection="allowLeafSelection"></li>',
              '</ul>'
            ].join('\n')
            , newElement = angular.element(template);
          
          $compile(newElement)($scope);
          if(!$scope.ulReplaced) {
            ul.replaceWith(newElement);
            $scope.ulReplaced = true;
          } else {
            angular.element(ul[0]).append(newElement);
          }
        };
        
        $scope.toggleNodes = function() {
          $scope.shown = !$scope.shown;
        };
        
        $scope.delete = function(data) {
          data.children = [];
        };
        
        $scope.add = function(data) {
          var newName = "New child of " + data.name
            , numChildren = data.children.length;
          
          data.children.unshift({
            name: newName,
            code: data.code + "" + (data.children.length + 1),
            children: []
          });
          
          if(!numChildren) {
            $scope.loadChildNodes();
          }
        };
        
        $scope.startEditing = function() {
          $scope.editing = true;
          $scope.previousName = $scope.nodeData.name;
        };
        
        $scope.cancelEditing = function() {
          $scope.nodeData.name = $scope.previousName;
          $scope.previousName = null;
          $scope.editing = false;
        };
        
        $scope.saveName = function(name) {
          console.log(name, $scope.nodeData.name);
          $scope.editing = false;
          $scope.highlightedLabel = $scope.nodeData.code + " - " + $scope.nodeData.name;
          $scope.previousName = null;
          $scope.saveNode();
        };
        
        $scope.saveNode = function() {
          $scope.$emit("saveNode", $scope.nodeData);
        };
        
        $scope.load();
      }
    };
  }]);
