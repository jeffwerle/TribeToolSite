angular.module('app.Directives')
    .directive('passwordEntry', ['accountService', function (accountService) {
        return {
            replace: false,
            restrict: 'E',
            template:
            '<div>' +
                '<div>' +
                    '<label>{{options.passwordTitle}} <span class="required-star">*</span></label>' +
                    '<div class="input-group margin-bottom-sm">' +
                        '<span class="input-group-addon"><i class="fa fa-key fa-fw"></i></span><input class="form-control" ng-focus="showConfirmationPassword = true" type="password" name="pw" placeholder="Password" required ng-model="password">' +
                    '</div>' +
                    '<ul ng-show="password" class="password-strength" check-strength pw="password"></ul>' +
                    '<div ng-show="options.weakPassword">' +
                        '<span style="color: red;">' +
                            '{{weakPasswordMessage}}' +
                        '</span>' +
                    '</div>' +
                '</div>' +
                '<div style="margin-top: 10px;">' +
                    '<label ng-show="showConfirmationPassword" >{{options.confirmPasswordTitle}} <span class="required-star">*</span></label>' +
                    '<div ng-show="showConfirmationPassword" class="input-group margin-bottom-sm">' +
                        '<span class="input-group-addon"><i class="fa fa-key fa-fw"></i></span><input class="form-control" type="password" placeholder="Password" required ng-model="password2">' +
                    '</div>' +
                    '<div ng-show="password && password2">' +
                        '<span style="color: red;" ng-show="password !== password2">' +
                            "Passwords don't yet match." +
                        '</span>' +
                        '<span style="color: green;" ng-show="password === password2">' +
                            'Passwords match!' +
                        '</span>' +
                    '</div>' +
                '</div>' +
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