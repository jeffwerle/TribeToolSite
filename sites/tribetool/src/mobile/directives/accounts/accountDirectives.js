angular.module('app.Directives')
    .directive('signUp', ['accountService', function (accountService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div class="text-center clear-both" ng-show="!processingForm && !forgotPasswordEmailSent && !accountCreated">'+
                        '<h3 style="margin-top: 0px;">Sign Up <happy-face></happy-face></h3>' +
                    '</div>' +

                    '<div ng-if="!accountCreated" class="clear-both;" style="text-align:left;">'+
                        '<div ng-show="forgotPasswordEmailSent" class="text-center" style="color: green">'+
                            '<h3>A Password Reset Link has been e-mailed to you!</h3>'+
                            '<h4>Please check your e-mail.</h4>'+
                        '</div>'+
                        '<div ng-show="!forgotPasswordEmailSent && !accountService.account">'+
                            '<form name="registerForm" ng-submit="submit()" ng-show="!processingForm && !emailSent" style="margin-top: 20px;" novalidate="novalidate">'+

                                '<div class="list" style="white-space: normal;">' +
                                    '<label class="item item-input item-floating-label">' +
                                        '<span class="input-label">First Name</span>' +
                                        '<input placeholder="First Name" ng-autofocus="form.firstNameFocused" required ng-model="form.FirstName" type="text">'+
                                    '</label>' +
                                    '<label class="item item-input item-floating-label">' +
                                        '<span class="input-label">Last Name</span>' +
                                        '<input placeholder="Last Name" required ng-model="form.LastName" type="text">'+
                                    '</label>' +

                                    '<label class="item item-input item-floating-label">' +
                                        '<span class="input-label">E-mail Address</span>' +
                                        '<input placeholder="E-mail Address" required ng-model="form.Email" type="email" ng-change="emailChanged()">'+
                                    '</label>' +

                                    '<password-entry ng-show="form.Email" options="passwordOptions" password="form.Password" password2="form.Password2"></password-entry>'+
                                '</div>' +


                                '<div ng-show="form.Email" style="margin-top: 10px;" vc-recaptcha key="\'6LcwhQYTAAAAAK7yUhDc6BkZQozFR3023fNT579W\'"></div>' +

                                '<div ng-show="forgotPassword" class="text-center">'+
                                    '<div style="color: red;">'+
                                        'It appears that there is already an account using this e-mail address.'+
                                    '</div>'+
                                    '<div>'+
                                        'Forgot your password? Let us <a class="pointer" ng-click="emailForgotPassword()">e-mail you a Password Reset link.</a>'+
                                    '</div>'+
                                '</div>'+

                                '<div ng-show="signUpError" style="color: red;">' +
                                    '<p>{{signUpError}}</p>' +
                                '</div>' +

                                '<div class="centered" style="margin-top: 20px; clear:both;">'+
                                    '<button class="button button-block button-positive" type="submit">Submit</button>' +
                                '</div>'+
                                '<div class="centered" style="clear:both; margin-top: 20px;">'+
                                    'Have an account? <a class="pointer" ng-click="goToLogin()">Login</a>'+
                                '</div>'+

                            '</form>'+
                        '</div>'+
                    '</div>'+
                    '<div class="clear-both" ng-if="accountCreated && !processingForm">'+
                        '<div class="text-center" style="color: green">'+
                            '<h2>Your Account Has Been Created!</h2>'+
                            '<h3>An Account Confirmation Link has been e-mailed to you!</h3>'+
                            '<h4>Please check your e-mail.</h4>'+
                            '<button class="button button-block button-positive" type="button" ng-click="goToCommunity()">Okay</button>' +
                        '</div>'+
                    '</div>'+

                    '<div ng-show="processingForm" class="text-center clear-both">'+
                        '<h3>{{processingFormMessage}}</h3>'+
                        '<div>'+
                            '<loading></loading>'+
                        '</div>'+
                    '</div>'+
                    '<div class="clearfix"></div>' +
                '</div>',
            scope: {
                /*
                 {
                 onCancel(),
                 onGoToLogin(),
                 onSuccess(), // sign-up success, logged-in, and account confirmation link sent,
                 onConfirmationLinkFailure(), // sign-up success but failure to send account confirmation
                 preventAutofocus: bool,
                 }
                 */
                options: '='
            },
            controller: ['$scope', 'accountDirectiveService', 'navigationService', function($scope, accountDirectiveService, navigationService) {
                $scope.accountService = accountService;
                accountDirectiveService.initializeSignUpScope($scope);

                $scope.goToCommunity = function() {
                    navigationService.goToPath('/community');
                };
            }],
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('login', ['accountService', function (accountService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-show="processingForm" class="text-center">' +
                        '<h3>The hamsters are working! Please wait...</h3>'+
                        '<div>'+
                            '<loading></loading>'+
                        '</div>'+
                    '</div>'+

                    '<div ng-show="!processingForm">'+
                        '<div ng-show="unconfirmed">'+
                            '<unconfirmed-account form="form" account="account"></unconfirmed-account>' +
                        '</div>'+
                        '<div ng-show="!unconfirmed && !accountService.account">'+
                             '<div class="clear-both text-center" ng-show="!processingForm && !forgotPasswordEmailSent">'+
                                '<h3 style="margin-top: 0px;">Login <happy-face></happy-face></h3>'+
                            '</div>'+

                            '<div ng-show="forgotPasswordEmailSent" class="clear-both text-center" style="color: green">'+
                                '<h3>A Password Reset Link has been e-mailed to you!</h3>'+
                                '<h4>Please check your e-mail.</h4>'+
                            '</div>'+
                            '<div class="clear-both" ng-show="!forgotPasswordEmailSent">'+
                                '<social-login-buttons-vertical></social-login-buttons-vertical>' +
                                '<form name="loginForm" ng-submit="submit()" ng-show="!processingForm && !emailSent" style="margin-top: 20px;" novalidate="novalidate">'+

                                    '<div class="list" style="white-space: normal;">' +
                                        '<label class="item item-input item-floating-label">' +
                                            '<span class="input-label">E-mail Address</span>' +
                                            '<input ng-autofocus="form.emailFocused" placeholder="E-mail Address" required ng-model="form.Email" type="email" id="email" name="email">'+
                                            '<div ng-show="invalidEmail" style="color: red;">'+
                                                '<div>Invalid Email</div>'+
                                            '</div>'+
                                        '</label>' +
                                        '<label class="item item-input item-floating-label">' +
                                            '<span class="input-label">Password</span>' +
                                            '<input type="password" name="password" ng-autofocus="form.passwordFocused" placeholder="Password" required ng-model="form.Password">'+
                                            '<div ng-show="invalidPassword" style="color: red;">'+
                                                '<div>Invalid Password</div>'+
                                            '</div>'+
                                        '</label>' +
                                    '</div>' +


                                    '<div ng-show="forgotPassword" class="col-sm-9" style="margin-top: 10px;">'+
                                        '<div>'+
                                            '<a class="pointer" ng-click="emailForgotPassword()">Forgot your password?</a>'+
                                        '</div>'+
                                        '<div>'+
                                            'Get a <a class="pointer" ng-click="emailForgotPassword()">Password Reset Link.</a>'+
                                        '</div>'+
                                    '</div>'+


                                    '<div class="centered" style="margin-top: 20px;">'+
                                        '<button class="button button-block button-positive" type="submit">Login</button>' +
                                    '</div>'+

                                    '<div class="centered" style="clear: both; margin-top: 20px;">' +
                                        '<span>Don\'t have an account? <a class="pointer" ng-click="signUp()">Sign-Up</a></span>' +
                                    '</div>' +

                                '</form>'+


                                '<div ng-show="processingForm" class="clear-both text-center">'+
                                    '<h3>The hamsters are working! Please wait...</h3>'+
                                    '<div>'+
                                        '<loading></loading>'+
                                    '</div>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                    '<div class="clearfix"></div>' +

                '</div>',
            scope: {
                /*
                 {
                 onCancel(),
                 onGoToSignUp(),
                 onSuccess(), // on logged-in
                 }
                 */
                options: '=',
                /* The e-mail address to auto-fill, if applicable */
                email: '='
            },
            controller: ['$scope', 'accountDirectiveService', function($scope, accountDirectiveService) {
                $scope.accountService = accountService;
                accountDirectiveService.initializeLoginScope($scope);
            }],
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('unconfirmedAccount', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-show="processing" class="centered">' +
                        '<h3>Sending Link...</h3>'+
                        '<div>'+
                            '<loading></loading>'+
                        '</div>'+
                    '</div>' +
                    '<div ng-show="!processing" class="centered">' +
                        '<h3 ng-style="{\'color\': confirmationEmailSent ? \'black\' : \'red\'}">Your Account Has Not Yet Been Confirmed</h3>'+
                        '<div ng-show="!confirmationEmailSent">'+
                            '<h4>Please check your e-mail for a link to confirm your account.</h4>'+
                            '<h4><a class="pointer" ng-click="emailConfirmationLink()">Click here to get another Account Confirmation Link</a>.</h4>'+
                        '</div>'+
                        '<div ng-show="confirmationEmailSent" style="color: green">'+
                            '<h3>A new Account Confirmation Link has been e-mailed to you!</h3>'+
                            '<h4>Please check your e-mail.</h4>'+
                        '</div>'+
                    '</div>' +
                '</div>',
            scope: {
                form: '=?',
                account: '=?'

            },
            controller: ['$scope', 'accountDirectiveService', function($scope, accountDirectiveService) {
                accountDirectiveService.initializeUnconfirmedAccountScope($scope);
            }],
            link: function (scope, element, attrs) {

            }
        };
    }])
    .directive('socialLoginButtons', [function() {
        return {
            restrict: 'E',
            replace: true,
            template:
                '<div>' +
                    '<div class="col-md-6">' +
                        '<facebook-login></facebook-login>' +
                    '</div>' +
                    '<div class="col-md-6">' +
                        '<g-plus-login></g-plus-login>' +
                    '</div>' +
                '</div>',
            scope: {
            },
            link: function(scope, element, attributes) {

            }
        };
    }])
    .directive('socialLoginButtonsVertical', [function() {
        return {
            restrict: 'E',
            replace: true,
            template:
                '<div>' +
                    '<facebook-login></facebook-login>' +
                    '<g-plus-login></g-plus-login>' +
                '</div>',
            scope: {
            },
            link: function(scope, element, attributes) {

            }
        };
    }])
    .directive('facebookLogin', ['$timeout', '$window', function($timeout, $window) {
        return {
            restrict: 'E',
            replace: true,
            template:
                '<div>' +
                    '<div ng-show="!clicked" class="social-wrap a">' +
                        '<button class="facebook centered" ng-click="login()">Login with Facebook</button>' +
                    '</div>' +
                    '<div ng-show="clicked">' +
                        '<loading></loading>' +
                    '</div>' +
                '</div>',
            scope: {
            },
            controller: ['$rootScope', '$scope', 'accountService', 'commService', 'navigationService', 'communityService', '$cordovaOauth', 'OPTIONS', '$http', function($rootScope, $scope, accountService, commService, navigationService, communityService, $cordovaOauth, OPTIONS, $http) {
                $scope.clicked = false;

                $scope.$on('loggingIn', function(event, authenticationType) {
                    $scope.clicked = true;
                });

                $scope.login = function() {
                    $scope.clicked = true;
                    $timeout(function() {
                        // From now on you can use the Facebook service just as Facebook api says


                        $rootScope.$broadcast('loggingIn', 'Facebook');
                        // We CANNOT wrap this in a $timeout (for some reason it causes the Facebook
                        // login process to fail on iOS and OSX).
                        $scope.$apply(function() {
                            $cordovaOauth.facebook(OPTIONS.facebook.clientId, ["email"])
                            .then(function(response) {
                                    //commService.showInfoAlert(JSON.stringify(response));
                                    //console.log('TRIBETOOL: ' + JSON.stringify(response));


                                    // http://scottsnider.azurewebsites.net/facebook-and-google-oauth-with-ionic-2/
                                    var accessToken = response.access_token;
                                    var term=null;
                                    //  alert("getting user data="+accessToken);
                                    $http({
                                        url:'https://graph.facebook.com/me?access_token=' + accessToken,
                                        method:'GET',
                                        data:term,
                                        headers: {
                                            'Content-Type': 'application/json'
                                        }})
                                        .success(function(user) {
                                            //commService.showInfoAlert(JSON.stringify(user));
                                            //console.log('TRIBETOOL: ' + JSON.stringify(user));
                                            $scope.user = user;


                                            var resp = {
                                                authResponse: {
                                                    userID: user.id,
                                                    accessToken: accessToken
                                                }
                                            };

                                            // Login (the account will be created from our authentication
                                            // data if it does not yet exist).
                                            accountService.facebookLogin(resp, user, navigationService, communityService);
                                        })
                                        .error(function(data, status, headers, config) {
                                            commService.showErrorAlert(data);
                                            $rootScope.$broadcast('loggingInComplete', 'Facebook');
                                            $scope.clicked = false;
                                        });


                            }, function(error) {
                                $rootScope.$broadcast('loggingInComplete', 'Facebook');
                                $scope.clicked = false;
                            });
                        });

                    });
                };

            }],
            link: function(scope, element, attributes) {

            }
        };
    }])
    .directive('gPlusLogin', ['$timeout', '$window', function($timeout, $window) {
        return {
            restrict: 'E',
            replace: true,
            template:
                '<div>' +
                    '<div ng-show="!clicked" class="social-wrap a">' +
                    '<button class="googleplus centered" ng-click="login()">Login with Google</button>' +
                    '</div>' +
                    '<div ng-show="clicked">' +
                    '<loading></loading>' +
                    '</div>' +
                '</div>',
            scope: {
            },
            controller: ['$rootScope', '$scope', 'accountService', 'commService', 'navigationService', 'communityService', '$cordovaOauth', 'OPTIONS', '$http', function($rootScope, $scope, accountService, commService, navigationService, communityService, $cordovaOauth, OPTIONS, $http) {
                $scope.clicked = false;

                $scope.$on('loggingIn', function(event, authenticationType) {
                    $scope.clicked = true;
                });


                $scope.login = function () {
                    $scope.clicked = true;
                    $timeout(function() {
                        $rootScope.$broadcast('loggingIn', 'Google');


                        $cordovaOauth.google(OPTIONS.google.clientId, OPTIONS.google.scopes)
                        .then(function(authResult) {
                            //console.log('TRIBETOOL: ' + JSON.stringify(authResult));

                            var accessToken = authResult.access_token;

                            var term=null;
                            //  alert("getting user data="+accessToken);
                            $http({
                                url:'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + accessToken,
                                method:'GET',
                                data:term,
                                headers: {
                                    'Content-Type': 'application/json'
                                    }
                                })
                                .success(function(user) {
                                    //console.log('TRIBETOOL: ' + JSON.stringify(user));
                                    //commService.showInfoAlert(JSON.stringify(user));

                                    accountService.googleLogin(accessToken, user, navigationService, communityService);
                                })
                                .error(function(data, status, headers, config) {
                                    commService.showErrorAlert(JSON.stringify(data));
                                    $rootScope.$broadcast('loggingInComplete', 'Google');
                                    $scope.clicked = false;
                                });
                        })
                        .catch(function(err) {
                            commService.showErrorAlert(JSON.stringify(err));
                            $rootScope.$broadcast('loggingInComplete', 'Google');
                                $scope.clicked = false;
                        });
                    });
                };
            }],
            link: function(scope, element, attributes) {
            }
        };
    }]);