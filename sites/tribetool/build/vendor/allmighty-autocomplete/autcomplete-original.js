/* --- Made by justgoscha and licensed under MIT license --- */

var app = angular.module('autocomplete', []);

app.directive('autocomplete', function() {
    var index = -1;

    return {
        restrict: 'E',
        replace: true,
        scope: {
            searchParam: '=ngModel',
            suggestions: '=terms',
            data: '=data',
            onType: '=onType',
            onSelect: '=onSelect',
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
                    $scope.searchFilter = $scope.searchParam;
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


            // selecting a suggestion with RIGHT ARROW or ENTER
            $scope.select = function(suggestion){
                if(suggestion){
                    $scope.searchParam = suggestion;
                    $scope.searchFilter = suggestion;
                    if($scope.onSelect)
                        $scope.onSelect($scope.data[suggestion]);
                }
                watching = false;
                $scope.completing = false;
                setTimeout(function(){watching = true;},1000);
                $scope.setIndex(-1);
            };

            $scope.onFocused = function() {
                if(!$scope.searchFilter)
                    $scope.completing = true;
            };


        }],
        link: function(scope, element, attrs){

            setTimeout(function() {
                scope.initLock = false;
                scope.$apply();
            }, 250);

            var attr = '';

            // Default attrs
            scope.attrs = {
                "placeholder": "Search...",
                "class": "",
                "id": "",
                "inputclass": "",
                "inputid": ""
            };

            for (var a in attrs) {
                attr = a.replace('attr', '').toLowerCase();
                // add attribute overriding defaults
                // and preventing duplication
                if (a.indexOf('attr') === 0) {
                    scope.attrs[attr] = attrs[a];
                }
            }

            if (attrs.clickActivation) {
                element[0].onclick = function(e){
                    if(!scope.searchParam){
                        setTimeout(function() {
                            scope.completing = true;
                            scope.$apply();
                        }, 200);
                    }
                };
            }

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

            element[0].addEventListener("keydown",function (e){
                var keycode = e.keyCode || e.which;

                var l = angular.element(this).find('li').length;

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
                            var liElem = $(angular.element(this).find('li')[index]);
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
                            var liElem = $(angular.element(this).find('li')[index]);
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
                            var liElem = $(angular.element(this).find('li')[index]);
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
        },

        // {{ attrs.inputclass }}
        template: '\
        <form class="input-group autocomplete" style="margin-bottom: 0px;" id="{{ attrs.id }}" ng-submit="select(searchParam)">\
          <input\
            type="text"\
            name="search_bar"\
            ng-model="searchParam"\
            placeholder="{{ attrs.placeholder }}"\
            id="{{ attrs.inputid }}"\
            class="form-control autocomplete-input {{ attrs.inputclass }}"\
            ng-required="{{ autocompleteRequired }}" \
            ng-focus="isFocused=true;onFocused()"\
            ng-blur="isFocused=false"/>\
            <div class="input-group-btn">\
                <button type="submit" class="btn form-control autocomplete-input {{ attrs.inputclass }}" ng-class="{\'btn-success\': isFocused}"><span class="glyphicon glyphicon-search"></span></button>\
            </div>\
              <ul ng-show="completing && (suggestions | filter:searchFilter).length > 0">\
                <li\
                  suggestion\
                  ng-repeat="suggestion in suggestions | filter:searchFilter | limitTo: 7 | orderBy:\'toString()\' track by $index"\
                  index="{{ $index }}"\
                  val="{{ suggestion }}"\
                  class="pointer"\
                  ng-class="{ active: ($index === selectedIndex) }"\
                  ng-click="select(suggestion)"\
                  ng-bind-html="suggestion | highlight:searchParam:data[suggestion]">\
                </li>\
              </ul>\
        </form>'
    };
});

app.filter('highlight', ['$sce', function ($sce) {
    return function (input, searchParam, data) {
        if (typeof input === 'function') return '';

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
        html += data.text;

        return $sce.trustAsHtml(html);
    };
}]);

app.directive('suggestion', function(){
    return {
        restrict: 'A',
        require: '^autocomplete', // ^look for controller on parents element
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
