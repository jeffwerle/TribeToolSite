angular.module('app.Controllers')
    .controller('resetPasswordController', ['$scope', '$route', '$routeParams', 'accountService', 'commService', function($scope, $route, $routeParams, accountService, commService) {

        $scope.form = {

        };
        $scope.passwordOptions = {
            passwordTitle: 'New Password',
            confirmPasswordTitle: 'Confirm New Password',
            weakPassword: false
        };

        $scope.expired = false;
        $scope.valid = false;
        if($routeParams.sessionId && $routeParams.email) {
            $scope.email = $routeParams.email;

            $scope.submit = function() {
                if($scope.form.Password !== $scope.form.Password2)
                {
                    commService.showErrorAlert('Please ensure that the passwords match.');
                    $scope.goToTop();
                    return;
                }

                if(!accountService.isPasswordStrongEnough($scope.form.Password)) {
                    $scope.passwordOptions.weakPassword = true;
                    return;
                }
                else {
                    $scope.passwordOptions.weakPassword = false;
                }

                $scope.processingForm = true;


                var onFailure = function(result) {
                    // Failure
                    commService.showErrorAlert(result.ErrorReason);
                    $scope.processingForm = false;
                    $scope.goToTop();
                };
                var account = $scope.form;

                // Update the password
                accountService.resetPassword($routeParams.sessionId,
                    $routeParams.email, account.Password, function(result) {
                    // Success
                    if(!result.IsValid || result.HasExpired || result.IsUsed) {
                        $route.reload();
                    }
                    else {
                        commService.showSuccessAlert('Password Reset Successfully!');
                        $scope.go('login');
                    }
                }, onFailure);
            };

            // Determine if the session is valid and not expired.
            accountService.isPasswordResetSessionValid($routeParams.sessionId,
                $routeParams.email,
            function(result) {
                $scope.valid = result.IsValid;
                $scope.expired = result.HasExpired;
                $scope.used = result.IsUsed;
                if(!$scope.valid) {
                    $scope.go('home');
                }
            },
            function(result) {
                // General error
                if(result.ErrorReason) {
                    commService.showErrorAlert(result.ErrorReason);
                    $scope.goToTop();
                }
                $scope.go('home');
            });

            $scope.forgotPasswordEmailSent = false;
            $scope.emailForgotPassword = function() {
                $scope.processingForm = true;
                accountService.newPasswordResetSession($scope.email, function() {
                    $scope.processingForm = false;
                    // Success
                    $scope.forgotPasswordEmailSent = true;
                }, function(result) {
                    // Failure
                    $scope.processingForm = false;
                    $scope.forgotPasswordEmailSent = false;
                    commService.showErrorAlert(result.ErrorReason);
                    $scope.goToTop();
                });
            };
        }
        else {
            $scope.go('home');
        }


    }]);