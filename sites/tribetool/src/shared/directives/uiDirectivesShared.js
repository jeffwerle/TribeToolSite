angular.module('app.Directives')

    /* Focuses an element based on databind
     Usage: <input ng-autofocus="isInputFocused" />*/
    .directive('ngAutofocus', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            scope: {
                trigger: '=ngAutofocus'
            },
            link: function (scope, element, attrs) {
                scope.$watch('trigger', function (val) {
                    if (angular.isDefined(val) && val) {
                        $timeout(function () {
                            element.focus();

                            // html5
                            element.attr('autofocus', true);

                            scope.trigger = false;
                        });
                    }
                    else {
                        element.attr('autofocus', false);
                    }
                }, true);
            }
        };
    }])
    .directive('ngControllerDynamic', ['$timeout', '$compile', '$parse', function($timeout, $compile, $parse) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var parent = element.parent();
                    attrs.$observe('ngControllerDynamic', function(newValue) {
                        if(newValue) {
                            var locals = {
                                $scope: scope,
                                $element: element,
                                $attrs: attrs
                            };

                            var controllerName = $parse(element.attr('ngControllerDynamic'))(scope);

                            element.attr('ng-controller', controllerName);

                            $timeout(function() {
                                var compiled = $compile(element.html())(scope);
                                parent.append(compiled);
                                element.remove();
                            });

                        }
                    });
                }
            };
        }
    ]);