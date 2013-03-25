'use strict';

/* Directives */

angular.module('tree-hierarchy', [])
  .directive('treeHierarchy', function() {
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
            '<li ng-repeat="data in tree" tree-hierarchy-rec="data" selection-type="selectionType" pre-selection="preSelection"></li>',
          '</ul>',
        '</div>'
      ].join('\n'),
      replace: true,
      scope: {
        selectionType: '=selectionType',
        preSelection: '=preSelection'
      },
      link: function($scope, elem, attrs) {
        $scope.load = function() {
          if(!($scope.selectionType instanceof Array) && ['leaf', 'all'].indexOf($scope.selectionType) === -1) {
            $scope.selectionType = null;
          }
          if(!($scope.preSelection instanceof Array)) {
            $scope.preSelection = [];
          }
          $scope.getTreeData();
        };
        
        $scope.getTreeData = function() {
          $scope.$emit('loadData');
        };
        
        $scope.$on('dataLoaded', function(event, data) {
          $scope.tree = data;
        });
        
        $scope.$on('dataLoadError', function(event, data) {
          // Handle error
        });
        
        $scope.expandAll = function() {
          $scope.$broadcast('expandAll');
        };
        
        $scope.collapseAll = function() {
          $scope.$broadcast('collapseAll');
        };
        
        $scope.filterNodes = function() {
          $scope.$broadcast('filter', $scope.filter);
        };
        
        $scope.load();
      }
    };
  })
  .directive('treeHierarchyRec', ['$compile', function($compile) {
    return {
      template: [
        '<span ng-hide="hidden">',
          '<span class="checkbox-wrapper">',
            '<input type="checkbox" ng-show="getCheckboxVisibilityStatus(nodeData)" ng-model="nodeData.isSelected" ng-click="saveNode()" />',
          '</span>',
          '<span class="expand-collapse-link-wrapper">',
            '<a href="#" ng-click="toggleNodes()" ng-show="nodeData.children.length">',
              '<i ng-class="getToggleIconClass()"></i>',
            '</a>',
          '</span>',
          '<span ng-click="toggleNodes()" ng-hide="editing" ng-class="getCollapsibleClass(nodeData)" ng-bind-html="highlightedLabel"></span>',
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
        selectionType: '=selectionType',
        preSelection: '=preSelection'
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
          
          if($scope.preSelection.indexOf($scope.nodeData.id) > -1) {
            $scope.nodeData.isSelected = true;
          }
          
          if($scope.nodeData && $scope.nodeData.children && $scope.nodeData.children.length) {
            $scope.loadChildNodes();
          }
        };
        
        $scope.getCheckboxVisibilityStatus = function(nodeData) {
          if($scope.selectionType === 'leaf' && !nodeData.children.length) {
            return true;
          } else if($scope.selectionType === 'all') {
            return true;
          } else if($scope.selectionType instanceof Array && $scope.selectionType.indexOf(nodeData.id) > -1) {
            return true;
          } else {
            return false;
          }
        };
        
        $scope.getCollapsibleClass = function(nodeData) {
          return nodeData.children.length ? "collapsible" : "";
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
                '<li ng-repeat="data in nodeData.children" tree-hierarchy-rec="data" selection-type="selectionType" pre-selection="preSelection"></li>',
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
