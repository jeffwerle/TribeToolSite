angular.module('app.Controllers')
    .controller('accountConfirmationController', ['$scope', '$location', 'accountService', 'commService', 'navigationService', 'communityService', 'route', function($scope, $location, accountService, commService, navigationService, communityService, route) {

        $scope.expired = false;
        $scope.valid = false;
        $scope.confirmed = false;
        if(route.routeParams.sessionId && route.routeParams.email) {
            $scope.email = route.routeParams.email;

            // Determine if the session is valid and not expired.
            accountService.confirmAccount(route.routeParams.sessionId,
                route.routeParams.email,
                function(result) {
                    $scope.valid = result.IsValid;
                    $scope.expired = result.HasExpired;
                    $scope.used = result.IsUsed;
                    if(!$scope.valid) {
                        navigationService.goToPath('/home');
                    }

                    if(result.AccountConfirmed) {
                        commService.showSuccessAlert('Account Confirmed! Please login.');
                        $scope.confirmed = true;
                    }
                },
                function(result) {
                    // General error
                    if(result.ErrorReason) {
                        commService.showErrorAlert(result.ErrorReason);
                        $scope.goToTop();
                    }
                    navigationService.goToLogin();
                });

            $scope.confirmationEmailSent = false;
            $scope.emailConfirmationLink = function() {
                $scope.processingForm = true;
                accountService.newAccountConfirmationSession($scope.email, function() {
                    $scope.processingForm = false;
                    // Success
                    $scope.confirmationEmailSent = true;
                }, function(result) {
                    // Failure
                    $scope.processingForm = false;
                    $scope.confirmationEmailSent = false;
                    commService.showErrorAlert(result.ErrorReason);
                    $scope.goToTop();
                });
            };
        }
        else {
            $scope.go('home');
        }


        $scope.loginOptions = {
            onGoToSignUp: function() {
                navigationService.goToPath('/register');
            },
            onSuccess: function() {
                accountService.navigateUponLogin(navigationService, communityService);
            }
        };
    }]);