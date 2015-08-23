angular.module('app.Controllers')
    .controller('navigationController', ['$rootScope', '$scope', '$window',  '$location', '$anchorScroll', 'commService', 'navigationService', 'OPTIONS', '$timeout', 'ionicHelperService', '$ionicPlatform', '$cordovaGoogleAnalytics', function($rootScope, $scope, $window, $location, $anchorScroll, commService, navigationService, OPTIONS, $timeout, ionicHelperService, $ionicPlatform, $cordovaGoogleAnalytics) {

        /* Make sure Google Analytics sees route changes and counts them */
        $scope.$on('routeChangeSuccess', function() {
            $scope.path = $location.path();
            if($window.ga) {
                $window.ga('send', 'pageview', $scope.path);

                $timeout(function() {
                    navigationService.registerEvent('Page View', $scope.path, $scope.path);
                }, 100);
            }
            if(OPTIONS.isMobile && ionicHelperService.isWebView()) {
                $ionicPlatform.ready(function() {
                    $cordovaGoogleAnalytics.trackView($scope.path);
                });
            }
        });

        $scope.getRoute = function(path) {
            return navigationService.getRoute(path);
        };


        $scope.isActive = function(viewLocation) {
            var page = navigationService.getPage(viewLocation, navigationService.getPagesForAccount($scope.account));

            var path = $location.path();

            if($scope.isAnyActive(path, [page])) {
                return true;
            }

            if(page && page.sub) {
                // Are any of the sub pages active?
                if($scope.isAnyActive(path, page.sub))
                    return true;
            }

            return false;
        };

        $scope.isAnyActive = function(path, pages) {
            if(!pages || pages.length <= 0 || pages[0] === null)
                return false;

            for(var i = 0; i < pages.length; i++) {
                var page = pages[i];
                // If the path has a second "/" then let's make sure it simply
                // starts with the viewLocation (since "/tutorial/chordname" is valid
                // for 'tutorial').
                if(path.substr(1).indexOf('/') !== -1) {
                    if(path.indexOf(page.path + '/') === 0)
                        return true;
                }
                else {
                    if(page && path === page.path)
                        return true;
                }

                if(page && page.sub) {
                    if($scope.isAnyActive(path, page.sub))
                        return true;
                }
            }

            return false;
        };


    }]);