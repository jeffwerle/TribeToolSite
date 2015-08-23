angular.module('app.Directives')
    .directive('signUpInline', ['navigationService', 'communityService', 'accountService', function (navigationService, communityService, accountService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="col-sm-offset-3 col-sm-6">' +
                    '<div class="centered" style="margin-top: 10px;">' +
                        '<social-login-buttons-vertical></social-login-buttons-vertical>' +
                    '</div>' +
                    '<div class="sign-up-well">' +
                        '<sign-up options="signUpOptions"></sign-up>' +
                    '</div>' +
                '</div>',
            scope: {
            },
            controller: ['$scope', function($scope) {

                $scope.signUpOptions = {
                    onGoToLogin: function() {
                        navigationService.goToPath('login');
                    },
                    onSuccess: function() {
                        accountService.navigateUponLogin(navigationService, communityService);
                    },
                    onConfirmationLinkFailure: function() {
                        navigationService.goToPath('login');
                    },
                    preventAutofocus: true
                };
            }],
            link: function (scope, element, attrs) {

            }
        };
    }])
    .directive('signUp', ['marketingService', function (marketingService) {
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
                        '<div ng-show="!forgotPasswordEmailSent">'+
                            '<form name="registerForm" ng-submit="submit()" ng-show="!processingForm && !emailSent" style="margin-top: 20px;">'+

                                '<div style="margin-top: 20px;">'+
                                    '<div class="col-xs-6" style="padding-left: 0px;">'+
                                        //'<label>First Name <span class="required-star">*</span></label>'+
                                        '<input class="form-control" placeholder="First Name" ng-autofocus="form.firstNameFocused" required ng-model="form.FirstName" type="text">'+
                                    '</div>'+
                                    '<div class="col-xs-6" style="padding-right: 0px;">'+
                                        //'<label>Last Name <span class="required-star">*</span></label>'+
                                        '<input class="form-control" placeholder="Last Name" required ng-model="form.LastName" type="text">'+
                                    '</div>'+
                                '</div>'+
                                '<div class="clearfix"></div>'+
                                '<div style="margin-top: 20px; margin-bottom: 5px;">'+
                                    //'<label style="margin-bottom: 0px;">Your E-mail Address <span class="required-star">*</span></label>'+
                                    '<div style="font-weight: 300;font-size: 12px; margin-bottom: 5px;">We will never share your e-mail address. Ever.</div>' +
                                    '<div class="input-group margin-bottom-sm">'+
                                        '<span class="input-group-addon"><i class="fa fa-envelope-o fa-fw"></i></span><input class="form-control" placeholder="E-mail Address" required ng-model="form.Email" type="email" ng-change="emailChanged()">'+
                                    '</div>'+
                                '</div>'+
                                '<password-entry ng-show="form.Email" options="passwordOptions" password="form.Password" password2="form.Password2"></password-entry>'+

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
                                    //'<button tabindex="7" ng-if="options.onCancel" class="btn btn-warning pull-right" style="margin-right: 20px;" type="button" ng-click="cancel()">Cancel</button>' +
                                    '<button class="btn btn-primary" style="margin-right: 20px;">Submit</button>'+
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
            controller: ['$scope', 'accountDirectiveService', function($scope, accountDirectiveService) {
                accountDirectiveService.initializeSignUpScope($scope);
            }],
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('login', ['communityService', function (communityService) {
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
                        '<div ng-show="!unconfirmed">'+
                            '<div class="clear-both text-center" ng-show="!processingForm && !forgotPasswordEmailSent">'+
                                '<h3 style="margin-top: 0px;">Login <happy-face></happy-face></h3>'+
                            '</div>'+

                            '<div ng-show="forgotPasswordEmailSent" class="clear-both text-center" style="color: green">'+
                                '<h3>A Password Reset Link has been e-mailed to you!</h3>'+
                                '<h4>Please check your e-mail.</h4>'+
                            '</div>'+
                            '<div class="clear-both" ng-show="!forgotPasswordEmailSent">'+
                                '<form name="loginForm" ng-submit="submit()" ng-show="!processingForm && !emailSent" style="margin-top: 20px;">'+
                                    '<div>'+
                                        //'<label>E-mail Address</label>'+
                                        '<div class="input-group margin-bottom-sm">'+
                                            '<span class="input-group-addon"><i class="fa fa-envelope-o fa-fw"></i></span><input class="form-control" ng-autofocus="form.emailFocused" placeholder="E-mail Address" required ng-model="form.Email" type="email" id="email" name="email">'+
                                        '</div>'+
                                    '</div>'+
                                    '<div ng-show="invalidEmail" style="color: red;">'+
                                        '<div>Invalid Email</div>'+
                                    '</div>'+
                                    '<div style="margin-top: 20px;">'+
                                        //'<label>Password</label>'+
                                        '<div class="input-group margin-bottom-sm">'+
                                            '<span class="input-group-addon"><i class="fa fa-key fa-fw"></i></span><input class="form-control" type="password" name="password" ng-autofocus="form.passwordFocused" placeholder="Password" required ng-model="form.Password">'+
                                        '</div>'+
                                    '</div>'+
                                    '<div ng-show="invalidPassword" style="color: red;">'+
                                        '<div>Invalid Password</div>'+
                                    '</div>'+
                                    '<div ng-show="forgotPassword" class="col-sm-9" style="margin-top: 10px;">'+
                                        '<div>'+
                                            '<a class="pointer" ng-click="emailForgotPassword()">Forgot your password?</a>'+
                                        '</div>'+
                                        '<div>'+
                                            'Get a <a class="pointer" ng-click="emailForgotPassword()">Password Reset Link.</a>'+
                                        '</div>'+
                                    '</div>'+


                                    '<div class="centered" style="margin-top: 20px;">'+
                                        //'<button tabindex="7" ng-if="options.onCancel" class="btn btn-warning pull-right" style="margin-right: 20px;" type="button" ng-click="cancel()">Cancel</button>' +
                                        '<button class="btn btn-primary" style="margin-right: 20px;">Login</button>'+
                                    '</div>'+

                                    '<div class="centered" style="clear: both; margin-top: 20px;">'+
                                        '<span>Don\'t have an account? <a class="pointer" ng-click="signUp()">Sign-Up</a></span>'+
                                    '</div>'+

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
                    '<div class="clearfix">' +
                        '<div class="col-md-6">' +
                            '<facebook-login></facebook-login>' +
                        '</div>' +
                        '<div class="col-md-6">' +
                            '<g-plus-login></g-plus-login>' +
                        '</div>' +
                    '<div>' +
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
                    '<div class="clearfix">' +
                         '<facebook-login></facebook-login>' +
                         '<g-plus-login></g-plus-login>' +
                    '<div>' +
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
            controller: ['$rootScope', '$scope', 'Facebook', 'accountService', 'commService', 'navigationService', 'communityService', function($rootScope, $scope, Facebook, accountService, commService, navigationService, communityService) {
                $scope.clicked = false;

                $scope.$on('loggingIn', function(event, authenticationType) {
                    $scope.clicked = true;
                });

                $scope.login = function() {
                    $scope.clicked = true;
                    $timeout(function() {
                        // From now on you can use the Facebook service just as Facebook api says

                        $scope.facebookLogin = function() {
                            $window.location.href = 'https://www.facebook.com/dialog/oauth?response_type=code&redirect_uri=' + commService.getDomain() + '/login-authorization/facebook' + '&client_id=' + Facebook.appId;
                        };

                        $rootScope.$broadcast('loggingIn', 'Facebook');
                        // We CANNOT wrap this in a $timeout (for some reason it causes the Facebook
                        // login process to fail on iOS and OSX).
                        $scope.$apply(function() {
                            Facebook.login(function() {
                            }, {scope: 'email'})
                                .then(function(response) {
                                    if(response.status !== 'connected') {
                                        // The user is not logged into Facebook
                                        $scope.facebookLogin();
                                    }
                                    else {
                                        Facebook.api('/me', function(user) {
                                            $scope.user = user;

                                            // Login (the account will be created from our authentication
                                            // data if it does not yet exist).
                                            accountService.facebookLogin(response, user, navigationService, communityService);
                                        });
                                    }
                                })
                                .catch(function(err) {
                                    $scope.facebookLogin();
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
            controller: ['$rootScope', '$scope', 'GooglePlus', 'accountService', 'commService', 'navigationService', 'communityService', function($rootScope, $scope, GooglePlus, accountService, commService, navigationService, communityService) {
                $scope.clicked = false;

                $scope.$on('loggingIn', function(event, authenticationType) {
                    $scope.clicked = true;
                });

                $scope.login = function () {
                    $scope.clicked = true;
                    $timeout(function() {
                        // The information that we're requesting is specified in the app.config
                        // in GooglePlusProvider.setScopes
                        $rootScope.$broadcast('loggingIn', 'Google');

                        $scope.googleLogin = function() {
                            // Let's login!
                            var scopes = '';
                            var scopesArray = GooglePlus.getScopes();
                            for(var i = 0; i < scopesArray.length; i++) {
                                scopes += scopesArray[i] + ' ';
                            }
                            $window.location.href = 'https://accounts.google.com/o/oauth2/auth?response_type=token&client_id=' + GooglePlus.getClientId() + '&redirect_uri=' + commService.getDomain() + '/login-authorization/google&scope=' + scopes + '&include_granted_scopes=true';
                        };

                        $timeout(function() {
                            GooglePlus.checkAuth().then(function(authResult) {
                                if(!authResult.status.signed_in) {
                                    // The user is not logged into Google
                                    $scope.googleLogin();
                                    return;
                                }

                                GooglePlus.getUser().then(function (user) {

                                    accountService.googleLogin(authResult.access_token, user, navigationService, communityService);
                                })
                                .catch(function (err) {
                                    commService.showErrorAlert(err);
                                    $rootScope.$broadcast('loggingInComplete', 'Google');
                                });
                            })
                            .catch(function(err) {
                                $scope.googleLogin();
                            });

                        });
                    });
                };
            }],
            link: function(scope, element, attributes) {
            }
        };
    }]);