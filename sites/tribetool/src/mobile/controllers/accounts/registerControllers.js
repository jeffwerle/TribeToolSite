angular.module('app.Controllers')
    .controller('registerController', ['$scope', 'accountService', 'communityService', 'commService', 'navigationService', function($scope, accountService, communityService, commService, navigationService) {

        $scope.accountService = accountService;

        $scope.goToLogin = function() {
            navigationService.goToLogin();
        };
        $scope.options = {
            onGoToLogin: function() {
                $scope.goToLogin();
            },
            onSuccess: function() {
                // Don't go anywhere, let the user see the success message and go where they will
            },
            onConfirmationLinkFailure: function() {
                $scope.goToLogin();
            }
        };

    }]);