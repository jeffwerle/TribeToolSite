/* --- Made by justgoscha and licensed under MIT license --- */

var app = angular.module('autocomplete');


app.directive('autocomplete', ['mediaService', 'OPTIONS', function(mediaService, OPTIONS) {
  var index = -1;

  return {
    restrict: 'E',
    replace: true,
    scope: {
      inputId: '=', // The id of the input field
      clickActivation: '=?',
      searchParam: '=ngModel',
      suggestions: '=terms',
      data: '=data',
      onType: '=onType',
      onSelect: '=onSelect',
      completing: '=',
      autocompleteRequired: '='
    },
    controller: ['$scope', function($scope){
      // the index of the suggestions that's currently selected
      $scope.selectedIndex = -1;


      $scope.initLock = true;

      // set new index
      $scope.setIndex = function(i){
        $scope.selectedIndex = parseInt(i);
      };

      this.setIndex = function(i){
        $scope.setIndex(i);
        $scope.$apply();
      };

      $scope.getIndex = function(i){
        return $scope.selectedIndex;
      };

      // watches if the parameter filter should be changed
      var watching = true;

      // autocompleting drop down on/off
      $scope.completing = false;

      // starts autocompleting on typing in something
      $scope.$watch('searchParam', function(newValue, oldValue){

        if (oldValue === newValue || (!oldValue && $scope.initLock)) {
          return;
        }

        if(watching && typeof $scope.searchParam !== 'undefined' && $scope.searchParam !== null) {
          $scope.completing = true;
            // Remove all whitespace from the text that is typed for comparing to search terms
          $scope.searchFilter = $scope.searchParam.toLowerCase().replace(/\s/g, '');
          $scope.selectedIndex = -1;

        }

        // function thats passed to on-type attribute gets executed
        if($scope.onType)
          $scope.onType($scope.searchParam);
      });

      // for hovering over suggestions
      this.preSelect = function(suggestion){

        watching = false;

        // this line determines if it is shown
        // in the input field before it's selected:
        //$scope.searchParam = suggestion;

        $scope.$apply();
        watching = true;

      };

      $scope.preSelect = this.preSelect;

      this.preSelectOff = function(){
        watching = true;
      };

      $scope.preSelectOff = this.preSelectOff;


      // selecting a suggestion with RIGHT ARROW or ENTER or CLICK
      $scope.select = function(suggestion){
        if(suggestion){
            var data = $scope.data[suggestion];
          $scope.searchParam = data.text;
          $scope.searchFilter = data.text;
          if($scope.onSelect)
            $scope.onSelect(data);

            $scope.selectionClicked = true;
            setTimeout(function() {
                $scope.selectionClicked = false;
            });
        }
        watching = false;
        $scope.completing = false;

        setTimeout(function(){
            watching = true;
        },1000);

        $scope.setIndex(-1);
      };


    }],
    link: function(scope, element, attrs){
        scope.element = element;
      setTimeout(function() {
        scope.initLock = false;
        scope.$apply();
      }, 250);

      var key = {left: 37, up: 38, right: 39, down: 40 , enter: 13, esc: 27, tab: 9};

      document.addEventListener("keydown", function(e){
        var keycode = e.keyCode || e.which;

        switch (keycode){
          case key.esc:
            // disable suggestions on escape
            scope.select();
            scope.setIndex(-1);
            scope.$apply();
            e.preventDefault();
        }
      }, true);

      document.addEventListener("blur", function(e){
        // disable suggestions on blur
        // we do a timeout to prevent hiding it before a click event is registered
        setTimeout(function() {
          scope.select();
          scope.setIndex(-1);
          scope.$apply();
        }, 150);
      }, true);

        scope.mediaService = mediaService;
        scope.OPTIONS = OPTIONS;
        scope.$watch('mediaService.isPhone', function(isPhone) {
            scope.limit = isPhone || OPTIONS.isMobile ? 3 : 7;
        });
        scope.$watch('OPTIONS.isMobile', function(isMobile) {
            scope.limit = isMobile || mediaService.isPhone ? 3 : 7;
        });


        scope.$watch('inputId', function(newValue) {

            if(!newValue) {
                return;
            }

            var inputElement = $('#' + scope.inputId);

            if (scope.clickActivation) {
                inputElement[0].onclick = function(e){
                    if(scope.selectionClicked) {
                        scope.selectionClicked = false;
                        return;
                    }

                    //if(!scope.searchParam){
                        setTimeout(function() {
                            scope.completing = true;
                            scope.$apply();
                        }, 200);
                    //}
                };
            }

            inputElement[0].addEventListener("keydown",function (e){
                var keycode = e.keyCode || e.which;

                var l = scope.element.find('li').length;

                // this allows submitting forms by pressing Enter in the autocompleted field
                if(!scope.completing || l == 0) return;

                // implementation of the up and down movement in the list of suggestions
                switch (keycode){
                    case key.up:

                        index = scope.getIndex()-1;
                        if(index<-1){
                            index = l-1;
                        } else if (index >= l ){
                            index = -1;
                            scope.setIndex(index);
                            scope.preSelectOff();
                            break;
                        }
                        scope.setIndex(index);

                        if(index!==-1) {
                            var liElem = $(scope.element.find('li')[index]);
                            scope.preSelect(liElem.attr('val'));
                        }

                        scope.$apply();

                        break;
                    case key.down:
                        index = scope.getIndex()+1;
                        if(index<-1){
                            index = l-1;
                        } else if (index >= l ){
                            index = -1;
                            scope.setIndex(index);
                            scope.preSelectOff();
                            scope.$apply();
                            break;
                        }
                        scope.setIndex(index);

                        if(index!==-1) {
                            var liElem = $(scope.element.find('li')[index]);
                            scope.preSelect(liElem.attr('val'));
                        }

                        break;
                    case key.left:
                        break;
                    case key.right:
                    case key.enter:
                    case key.tab:

                        index = scope.getIndex();
                        // scope.preSelectOff();
                        if(index !== -1) {
                            var liElem = $(scope.element.find('li')[index]);
                            scope.select(liElem.attr('val'));
                            if(keycode == key.enter) {
                                e.preventDefault();
                            }
                        } else {
                            if(keycode == key.enter) {
                                scope.select();
                            }
                        }
                        scope.setIndex(-1);
                        scope.$apply();

                        break;
                    case key.esc:
                        // disable suggestions on escape
                        scope.select();
                        scope.setIndex(-1);
                        scope.$apply();
                        e.preventDefault();
                        break;
                    default:
                        return;
                }

            });
        });
    },

      // {{ attrs.inputclass }}
    template: '\
              <ul class="autocomplete autocomplete-float" ng-show="completing && (suggestions | search:searchFilter:data).length > 0">\
                <li\
                  suggestion\
                  ng-repeat="suggestion in suggestions | search:searchFilter:data | limitTo: limit | orderBy:\'toString()\' track by $index"\
                  index="{{ $index }}"\
                  val="{{ suggestion }}"\
                  class="pointer"\
                  ng-class="{ active: ($index === selectedIndex) }"\
                  ng-click="select(suggestion)"\
                  ng-bind-html="suggestion | highlight:searchParam:data[suggestion]">\
                </li>\
              </ul>'
  };
}]);

app.filter('search', ['$filter', function ($filter) {
    return function (input, searchFilter, data) {
        if(!input) {
            return [];
        }
        if(!searchFilter) {
            return input;
        }

        var suggestions = input;
        var applicable = [];
        for(var i = 0; i < suggestions.length; i++) {
            var suggestion = suggestions[i];
            var d = data[suggestion];
            if(d.text.toLowerCase().replace(/\s/g, '').indexOf(searchFilter) !== -1 ||
                d.term.toLowerCase().replace(/\s/g, '').indexOf(searchFilter) !== -1) {
                applicable.push(suggestion);
            }
        }
        return applicable;
    };
}]);

app.filter('highlight', ['$sce', function ($sce) {
  return function (input, searchParam, data) {
    if (typeof input === 'function') return '';

    input = data.text;
    var html = '';
    if (searchParam) {
      var words = '(' +
            searchParam.split(/\ /).join(' |') + '|' +
            searchParam.split(/\ /).join('|') +
          ')',
          exp = new RegExp(words, 'gi');
      if (words.length) {
          input = input.replace(exp, '<span class=\"highlight\">$1</span>');
      }
    }

    if(data.url) {
       html += '<img style="margin-right: 10px;" src="' + data.url + '">';
    }
    else if(data.icon) {
       html += '<i style="margin-right: 10px;" class="fa ' + data.icon + '"></i>'
    }
    html += input;

    return $sce.trustAsHtml(html);
  };
}]);

app.directive('suggestion', function(){
  return {
    restrict: 'A',
    require: '^autocomplete', // ^look for controller on parent's element
    link: function(scope, element, attrs, autoCtrl){
      element.bind('mouseenter', function() {
        autoCtrl.preSelect(attrs.val);
        autoCtrl.setIndex(attrs.index);
      });

      element.bind('mouseleave', function() {
        autoCtrl.preSelectOff();
      });
    }
  };
});
