angular.module('app.Controllers')
    .controller('loginController', ['$scope', 'accountService', 'commService', 'navigationService', 'communityService', function($scope, accountService, commService, navigationService, communityService) {
        $scope.options = {
            onGoToSignUp: function() {
                navigationService.goToPath('register');
            },
            onSuccess: function() {
                accountService.navigateUponLogin(navigationService, communityService);
            }
        };
    }])
    .controller('loginDialogController', ['$scope', 'accountService', 'commService', 'navigationService', '$modalInstance', 'communityService', 'items', '$timeout', function($scope, accountService, commService, navigationService, $modalInstance, communityService, items, $timeout) {

        $timeout(function() {
            navigationService.scrollToHash('loginDialogBox');
        });

        $scope.options = items[0];
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.communityName = communityService.getNameWithoutThe();

        $scope.goToLogin = function() {
            $scope.options.stage = 'Login';
        };
        $scope.goToSignUp = function() {
            $scope.options.stage = 'SignUp';
        };


        $scope.signUpSuccessButtonClicked = function() {
            $scope.cancel();
            navigationService.goToLogin();
        };

        $scope.signUpSuccess = false;
        $scope.signUpOptions = {
            onGoToLogin: function() {
                $scope.goToLogin();
            },
            onSuccess: function() {
                $scope.signUpSuccess = true;
            },
            onConfirmationLinkFailure: function() {
                $scope.goToLogin();
            },
            onCancel: function() {
                $scope.cancel();
            }
        };

        $scope.loginOptions = {
            onGoToSignUp: function() {
                $scope.goToSignUp();
            },
            onSuccess: function() {
                $scope.cancel();
                if(navigationService.getCurrentRoute().indexOf('/landing') === 0) {
                    accountService.navigateUponLogin(navigationService, communityService);
                }
                else {
                    navigationService.refreshRoute();
                }

            },
            onCancel: function() {
                $scope.cancel();
            }
        };

        if(!angular.isDefined($scope.options.stage)) {
            $scope.goToLogin();
        }
    }]);