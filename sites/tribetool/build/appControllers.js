angular.module('app.Controllers', [])
    .controller('appController', ['$rootScope', '$scope', '$window', '$socket', '$location', '$timeout', 'socketService', 'metaService', 'mediaService', 'cookiesService', 'commService', 'navigationService', 'accountService', 'communityService', 'OPTIONS', 'tagPageService', 'sessionService', 'messageService', 'profileService', 'mapService', 'marketingService', '$cordovaGoogleAnalytics', '$ionicPlatform', 'ionicHelperService', function($rootScope, $scope, $window, $socket, $location, $timeout, socketService, metaService, mediaService, cookiesService, commService, navigationService, accountService, communityService, OPTIONS, tagPageService, sessionService, messageService, profileService, mapService, marketingService, $cordovaGoogleAnalytics, $ionicPlatform, ionicHelperService) {


        $scope.onSessionCreate = function(account) {

            // connect our socket using this account
            if(account)
                socketService.connectAccount(account);

            $scope.setAccount(account);


            if($window.ga && account && account.Id)
                $window.ga('set', '&uid', account.Id); // Set the user ID using signed-in user_id.

            if(OPTIONS.isMobile && ionicHelperService.isWebView()) {
                $ionicPlatform.ready(function() {
                    $cordovaGoogleAnalytics.setUserId(account.Id);
                });
            }


            accountService.navigateUponLogin(navigationService, communityService);

        };

        $rootScope.$on('sessionCreate', function(event, account) {
            $scope.onSessionCreate(account);
        });

        $rootScope.$on('sessionDestroy', function(event, account) {
            if(account && account.Session) {
                // Destroy the session
                sessionService.destroySession(account.Session, function(data) {
                    // Success
                }, function(data) {
                    // Failure
                });
            }
            if(account)
                socketService.disconnectAccount(account);

            $scope.setAccount(null);
            communityService.setAccountCommunity(null);

            cookiesService.setLastRememberedPage(null);
        });

        $scope.setAccount = function(account) {
            accountService.account = account;
            $scope.account = account;
            $scope.isLoggedIn = accountService.isLoggedIn($scope.account);

            accountService.saveState();
        };

        $socket.on('message', function(arg) {
            var data = arg.data;

            if(arg.communityId) {
                // Is this message applicable?
                if(!communityService.community ||
                    communityService.community.Id !== arg.communityId) {
                    return;
                }
            }

            // Show the message
            commService.showInfoAlert(data.Message);
        });

        $socket.on('disconnect', function() {
            console.log('Socket Disconnected');
        });
        $socket.on('connect', function() {
            console.log('Socket Connected');

            // We may have been previously disconnected so let's make sure the server
            // still knows we're here!
            if(accountService.account) {
                socketService.connectAccount(accountService.account);
            }
        });
        $socket.on('reconnecting', function() {
            console.log('Socket Reconnecting...');
        });


        $rootScope.$on('accountCommunityChanged', function(event, accountCommunity) {
            $scope.account.AccountCommunity = accountCommunity;
        });



        $scope.alertOptions = {
            show: false,
            message: '',
            id: ''
        };

        $scope.initialized = function() {
            navigationService.initialize();
            tagPageService.initialize();
            communityService.initialize();
            messageService.initialize();
            profileService.initialize();
            mapService.initialize();
            marketingService.initialize();
            socketService.initialize();


            if(OPTIONS.isMobile && ionicHelperService.isWebView()) {
                $ionicPlatform.ready(function() {
                    $cordovaGoogleAnalytics.startTrackerWithId(OPTIONS.mobile.analyticsId);
                });
            }


            var onDatabaseInitialized = function() {

                /* If we're requesting somewhere other than the root page, store that page since it's
                 being requested.
                 */
                if($location.url().length > 1) {
                    cookiesService.setLastRememberedPage($location.url());
                }

                accountService.getAccountFromState().then(function(accountFromState) {
                    if(accountFromState && accountFromState.Id) {

                        // If we have the account from the cookies then let's "login"
                        // and we'll get the account info from the service later
                        $rootScope.$broadcast('sessionCreate', accountFromState);

                        // Get the account information
                        accountService.getAccount(function(result) {
                            if(result.Account) {
                                var account = result.Account;

                                $rootScope.$broadcast('sessionCreate', account);
                            }
                            else {
                                $scope.logout();
                            }
                        }, function(result) {
                            // Failure, couldn't retrieve the session.
                            $scope.logout();
                        });
                    }
                });
            };

            if(cookiesService.databaseInitialized) {
                onDatabaseInitialized();
            }
            else {
                $scope.$on('cookiesService:databaseInitialized', function() {
                    onDatabaseInitialized();
                });
            }




        };

        $scope.debugInitialized = function(isMobile) {
            OPTIONS.isMobile = !!isMobile;
            OPTIONS.isDebug = true;
            $scope.initialized();
        };
        $scope.productionInitialized = function(isMobile) {
            OPTIONS.isMobile = !!isMobile;
            OPTIONS.isDebug = false;
            $scope.initialized();
        };

        $scope.isLoggedIn = accountService.isLoggedIn($scope.account);

        /* returns true if aborting */
        $scope.abortIfNotLoggedIn = function() {
            if(!$scope.isLoggedIn) {
                $scope.go('login');
                return true;
            }

            return false;
        };

        $scope.logout = function() {
            navigationService.logout();
        };



        $scope.goToTop = function (){
            navigationService.goToTop();
        };

        $scope.scrollToHash = function(hash) {
            navigationService.scrollToHash(hash);
        };

        $scope.goToPath = function(path) {
            navigationService.goToPath(path);
        };
        $scope.go = function(pageName) {
            navigationService.go(pageName, navigationService.getPagesForAccount($scope.account));
        };

        mediaService.initialize();



        $scope.repopulateAccessibleCommunities = function() {
            $scope.accessibleCommunities = communityService.getAccessibleCommunities();
        };
        $scope.$on('communitiesRecached', function() {
            $scope.repopulateAccessibleCommunities();
        });
        $scope.repopulateAccessibleCommunities();






    }]);