angular.module('app.Controllers')
    .controller('loginController', ['$scope', 'accountService', 'communityService', 'commService', 'navigationService', function($scope, accountService, communityService, commService, navigationService) {

        $scope.accountService = accountService;

        $scope.options = {
            onGoToSignUp: function() {
                navigationService.goToPath('register');
            },
            onSuccess: function() {
                accountService.navigateUponLogin(navigationService, communityService);
            }
        };

    }]);