angular.module('app.Controllers')
    .controller('loginAuthorizationController', ['$scope', 'accountService', 'commService', 'navigationService', 'communityService', '$routeParams', 'Facebook', 'GooglePlus', '$location', '$window', '$timeout', 'route', function($scope, accountService, commService, navigationService, communityService, $routeParams, Facebook, GooglePlus, $location, $window, $timeout, route) {

        var fail = null, login = null;
        if($routeParams.authorizer === 'google') {

            fail = function() {
                commService.showErrorAlert('Please login to Google+ first.');
                navigationService.goToPath('/login');
            };

            login = function() {
                var accessToken = null;
                var hash = $location.hash();
                var keyValues = hash.split('&');
                for(var i = 0; i < keyValues.length; i++) {
                    var keyValue = keyValues[i].split('=');
                    var key = keyValue[0];
                    var value = keyValue[1];
                    if(key === 'access_token') {
                        accessToken = value;
                        break;
                    }
                }
                if(!accessToken) {
                    commService.showErrorAlert('Invalid Access Token.');
                    navigationService.goToPath('/login');
                }

                var googleLogin = function() {
                    GooglePlus.checkAuth().then(function(authResult) {
                        if(!authResult.status.signed_in) {
                            // The user is not logged into Google
                            fail();
                            return;
                        }

                        GooglePlus.getUser().then(function (user) {

                            accountService.googleLogin(authResult.access_token, user, navigationService, communityService);
                        })
                            .catch(function (err) {
                                fail();
                            });
                    })
                    .catch(function(err) {
                        fail();
                    });
                };

                if(!$window.gapi.auth) {
                    var count = 0;
                    commService.autoRefresh($scope, $timeout, 200, function() {
                        if(count >= 10) {
                            return false;
                        }
                        if($window.gapi.auth) {
                            googleLogin();
                            return false;
                        }
                        count++;
                    });
                }
                else {
                    googleLogin();
                }

            };


            if(!$window.gapi) {
                $scope.$on('Google:load', function() {
                    login();
                });
            }
            else {
                login();
            }

        }
        else if($routeParams.authorizer === 'facebook') {
            fail = function() {
                commService.showErrorAlert('Please login to Facebook first.');
                navigationService.goToPath('/login');
            };

            // Login with Facebook (we should now be authorized).
            login = function() {
                var accessToken = route.routeParams.code;

                $scope.$apply(function() {
                    Facebook.login(function() {}, {scope: 'email'})
                        .then(function(response) {
                            if(response.status !== 'connected') {
                                // The user is not logged into Facebook
                                fail();
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
                            fail();
                        });
                });

            };
            if(!Facebook.isReady()) {
                $scope.$on('Facebook:load', function() {
                    login();
                });
            }
            else {
                login();
            }

        }
        else {
            commService.showErrorAlert('Invalid Authorizer.');
            navigationService.goToPath('/login');
        }

    }]);