angular.module('app.Directives')
    .directive('passwordEntry', ['accountService', function (accountService) {
        return {
            replace: false,
            restrict: 'E',
            template:
                '<div class="list">' +
                    '<label class="item item-input item-floating-label">' +
                        '<span class="input-label">{{options.passwordTitle}} <span class="required-star">*</span></span>' +
                        '<input class="form-control" ng-focus="showConfirmationPassword = true" type="password" name="pw" placeholder="Password" required ng-model="password">' +
                        '<ul ng-show="password" class="password-strength" check-strength pw="password"></ul>' +
                        '<div ng-show="options.weakPassword">' +
                            '<span style="color: red;">' +
                                '{{weakPasswordMessage}}' +
                            '</span>' +
                        '</div>' +
                    '</label>' +
                    '<label ng-show="showConfirmationPassword" class="item item-input item-floating-label">' +
                        '<span class="input-label">{{options.confirmPasswordTitle}} <span class="required-star">*</span></span>' +
                        '<input class="form-control" type="password" placeholder="Password" required ng-model="password2">' +
                        '<div ng-show="password && password2">' +
                            '<span style="color: red;" ng-show="password !== password2">' +
                                "Passwords don't yet match." +
                            '</span>' +
                            '<span style="color: green;" ng-show="password === password2">' +
                                'Passwords match!' +
                            '</span>' +
                        '</div>' +
                    '</label>' +
                '</div>',
            scope: {
                options: '=',
                password: '=',
                password2: '='
            },
            link: function (scope, iElement, iAttrs) {
                scope.weakPasswordMessage = accountService.weakPasswordMessage;
            }
        };
    }]);