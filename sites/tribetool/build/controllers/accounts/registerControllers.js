angular.module('app.Controllers')
    .controller('registerController', ['$scope', 'accountService', 'commService', 'navigationService', function($scope, accountService, commService, navigationService) {

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