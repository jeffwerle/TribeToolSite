var utilityangular = angular.module('utilityangular', []);


utilityangular
    .factory('utilityService', ['$rootScope', '$timeout', function($rootScope, $timeout) {
        return {
            /*
             Calls the given func within an $apply after the digest cycle has completed on
             the given scope.
             If no digest cycle is occurring, calls the given fun within $apply immediately.
             If no scopeis provided, uses the $rootScope.
             */
            applyAfterCurrentDigest: function(func, scope) {
                var s = (scope ? scope : $rootScope);
                this.callAfterDigest(function() {
                    s.$apply(func);
                }, s);
            },
            /*
                Calls the specified function after the digest cycle has completed on the given
                scope. If no digest cycle is occurring, calls the function immediately.
                If no scope is provided, uses the $rootScope.
             */
            callAfterDigest: function(func, scope) {
                if((scope ? scope : $rootScope).$$phase)
                    $timeout(func);
                else
                    func();
            },
            /*
                Calls $apply after the digest cycle has completed on the given scope.
                If no digest cycle is occurring, calls $apply immediately. If no scope
                is provided, uses the $rootScope.
             */
            digestAfterCurrentDigest: function(scope) {
                this.callAfterDigest(function() {
                    (scope ? scope : $rootScope).$apply();
                }, scope);
            },
            /*
             http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects
             example usage:
             // Sort by price high to low
             homes.sort(sort_by('price', true, parseInt));

             // Sort by city, case-insensitive, A-Z (i.e. ascending)
             homes.sort(sort_by('city', false, function(a){return a.toUpperCase()}));
             */
            sortBy: function(field, descending, primer){

                var key = primer ?
                    function(x) {return primer(x[field]);} :
                    function(x) {return x[field];};

                descending = [-1, 1][+!!descending];

                return function (a, b) {
                    return a = key(a), b = key(b), descending * ((a > b) - (b > a));
                };

            }
        };
    }]);

// See http://stackoverflow.com/questions/15217461/why-cant-i-get-the-attribute-value-of-my-custom-directive
// and http://stackoverflow.com/questions/12050268/angularjs-make-a-simple-countdown

utilityangular.controller('toggleClassController', ['$scope', '$element', '$attrs', '$timeout', function ($scope, $element, $attrs, $timeout) {
    var array = $attrs.uaToggleClass.split(',');
    $scope.firstClass = array[0];
    $scope.secondClass = array[1];

    $scope.count = 0;

    $scope.onElapsed = function() {
        $scope.count++;
        if($scope.count % 2 === 0) {
            $element.addClass($scope.firstClass);
            $element.removeClass($scope.secondClass);
        }
        else {
            $element.addClass($scope.secondClass);
            $element.removeClass($scope.firstClass);
        }
        if(typeof $scope.maxCycles !== "undefined") {
            if($scope.count/2 >= $scope.maxCycles) {
                $scope.stop();
                return;
            }
        }

        timer = resetTimer();
    };


    function resetTimer() {
        if(typeof $scope.interval === "undefined") {
            $scope.interval = 1000;
        }
        return $timeout($scope.onElapsed, $scope.interval);
    }

    var timer = $timeout($scope.onElapsed, typeof $scope.initialDelay === "undefined" ? 500 : $scope.initialDelay);

    $scope.stop = function() {
        $timeout.cancel(timer);
    };


}]);

utilityangular.directive(
    "uaToggleClass",
    [function () {
        return({
            restrict: 'A',
            controller: 'toggleClassController',
            scope: {
                maxCycles: '@',
                interval: '@',
                initialDelay: '@'
            }
        });
    }]
);


utilityangular
    .directive('noContextMenu',function() {
        return function(scope, element, attrs) {
            element.bind('contextmenu', function(event) {
                event.preventDefault();
            });
        };
    })
    .directive('ngRightClick',['$parse', function($parse) {
        return function(scope, element, attrs) {
            var fn = $parse(attrs.ngRightClick);
            element.bind('contextmenu', function(event) {
                var func = function() {
                    event.preventDefault();
                    fn(scope, { e: {$event:event}});
                };
                if(scope.$$phase)
                    func();
                else
                    scope.$apply(func);

            });
        };
    }])
    /* Executes the given function upon reaching the last element in an ng-repeat */
    .directive('onRepeatFinished', ['$parse', function($parse) {
        return function(scope, element, attrs) {
            var fn = $parse(attrs.onRepeatFinished);
            if (scope.$last){
                fn(scope, { e: {index: scope.$index}});
            }
        };
    }])
    .directive('onRepeatItemClick', ['$parse', function($parse) {
        return function(scope, element, attrs) {
            var fn = $parse(attrs.onRepeatItemClick);
            element.bind('click', function(event) {
                var func = function() {
                    fn(scope, { e: {$event:event, index: scope.$index}});
                };
                if(scope.$$phase)
                    func();
                else
                    scope.$apply(func);
            });
        };
    }])
    /*
        Monitors the class on the element and runs the "action" function when it changes.

        As argument to directive, either takes a single function or json such as { action: action(), className: className }
        className is optional.

        If className is provided, the event arguments to "action" will include "addedClass" and "removedClass" indicating whether
        the class was added or removed since the change.
     */
    .directive('onClassChange', ['$parse', function($parse) {
        return function(scope, element, attrs) {
            var options = scope.$eval(attrs.onClassChange);

            var fn = $parse(options.action ? options.action : options);
            var className = options.className;
            scope.$watch(function() {
                    return element.attr('class');
                },
                function(newValue, oldValue) {
                    var callFunc = function() {
                        var eventArgs = {
                            e: {
                                newValue: newValue,
                                oldValue: oldValue
                            }
                        };
                        if(className) {
                            var isClassInNewValue = angular.isDefined(newValue) ? newValue.indexOf(className) != -1 : false;
                            var isClassInOldValue = angular.isDefined(newValue) ? oldValue.indexOf(className) != -1 : false;

                            eventArgs.e.className = className;
                            eventArgs.e.addedClass = isClassInNewValue && !isClassInOldValue;
                            eventArgs.e.removedClass = isClassInOldValue && !isClassInNewValue;
                        }

                        angular.extend(eventArgs.e, scope);
                        fn(scope, eventArgs);
                    };

                    if(scope.$$phase)
                        callFunc();
                    else
                        scope.$apply(callFunc);
                });
        };
    }])
    .directive('addClassOnListItemClick', [function() {
        return function(scope, element, attrs) {
            var className = attrs.addClassOnListItemClick;

            var listItems = $(element).find('li');
            angular.forEach(listItems, function(listItem, index) {
                var $listItem = $(listItem);
                $listItem.on('click', function() {
                    angular.forEach(listItems, function(innerListItem, innerIndex) {
                        $(innerListItem).removeClass(className);
                    });
                    $listItem.addClass(className);
                });
            });
        };
    }]);

utilityangular.directive('uiFocus', ['$timeout', '$parse', function($timeout, $parse) {
    return {
        link: function(scope, element, attrs) {
            if(attrs.uiFocus) {
                var model = $parse(attrs.uiFocus);
                scope.$watch(model, function(value) {
                    if(value === true) {
                        $timeout(function() {
                            element.focus();
                        });
                    }
                });
                // set attribute value to 'false' on blur event:
                element.bind('blur', function() {
                    scope.$apply(model.assign(scope, false));
                });
            }
            else {
                $timeout(function() {
                    element.focus();
                });
            }
        }
    };
}]);



