angular.module('app.Directives')
    .directive('checkStrength', ['accountService', function (accountService) {
        return {
            replace: false,
            restrict: 'A',
            template: '<li class="password-strength-point"></li><li class="password-strength-point"></li><li class="password-strength-point"></li><li class="password-strength-point"></li><li class="password-strength-point"></li>',
            scope: {
                pw: '='
            },
            link: function (scope, iElement, iAttrs) {

                var strength = {
                    colors: ['#F00', '#F90', '#FF0', '#9F0', '#0F0'],
                    mesureStrength: accountService.measurePasswordStrength,
                    getColor: function (s) {

                        var idx = 0;
                        if (s <= 10) { idx = 0; }
                        else if (s <= 20) { idx = 1; }
                        else if (s <= 30) { idx = 2; }
                        else if (s <= 40) { idx = 3; }
                        else { idx = 4; }

                        return { idx: idx + 1, col: this.colors[idx] };

                    }
                };

                scope.$watch('pw', function () {

                    if (scope.pw === '') {
                        iElement.css({ "display": "none"  });
                    } else {
                        var c = strength.getColor(strength.mesureStrength(scope.pw));
                        iElement.css({ "display": "inline" });
                        iElement.children('li')
                            .css({ "background": "#DDD" })
                            .slice(0, c.idx)
                            .css({ "background": c.col });
                    }
                });

            }
        };
    }]);