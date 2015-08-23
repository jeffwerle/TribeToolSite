angular.module('app.Controllers')
    .controller('sideMenuController', ['$scope', 'accountService', 'communityService', 'navigationService', '$ionicSideMenuDelegate', function($scope, accountService, communityService, navigationService, $ionicSideMenuDelegate) {
        $scope.accountService = accountService;
        $scope.communityService = communityService;

        $scope.logout = function() {
            navigationService.logout();
            $scope.toggleMenu();
        };

        $scope.toggleMenu = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };
    }]);