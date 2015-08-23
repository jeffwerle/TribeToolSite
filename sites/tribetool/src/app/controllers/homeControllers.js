angular.module('app.Controllers')
    .controller('homeController', ['$scope', '$location', 'navigationService', 'commService', 'communityService', '$routeParams', function($scope, $location, navigationService, commService, communityService, $routeParams) {

        $scope.initialized = function() {
        };

        $scope.carouselInterval = 7500;


        $scope.message = 'Find others who enjoy your obsessions as much as you do.';
        $scope.signUpMessage = 'Free Sign-Up';
        $scope.searchPlaceholder = 'Search for a Community...';

        $scope.communityClicked = function(community) {
            navigationService.goToCommunity(community.Url);
        };

        $scope.viewNiche = function() {
            /* $scope.accessibleCommunities is set in appController */
            if($scope.accessibleCommunities && $scope.accessibleCommunities.length > 0) {
                var community = $scope.accessibleCommunities[Math.floor(Math.random()*$scope.accessibleCommunities.length)];
                navigationService.goToCommunity(community.Url);
            }
            else {
                navigationService.goToPath('/community');
            }
        };

        $scope.goToRegister = function() {
            navigationService.goToPath('/register');
        };
    }]);

