angular.module('app.Controllers')
    .controller('accountSettingsController', ['$scope', 'billingService', 'accountService', 'commService', 'navigationService', function($scope, billingService, accountService, commService, navigationService) {
        if(!accountService.isLoggedInAndConfirmed()) {
            navigationService.goToLogin();
            return;
        }

        $scope.editBilling = function() {
            billingService.goToBilling(function(data) {
                // Selected
            }, {
                // Options
            });
        };

    }])
    .controller('basicAccountInfoController', ['$scope', 'commService', 'accountService', 'navigationService', function($scope, commService, accountService, navigationService) {
        if(!accountService.isLoggedInAndConfirmed()) {
            navigationService.goToLogin();
            return;
        }

        $scope.form = {
            FirstName: accountService.account.FirstName,
            LastName: accountService.account.LastName
        };

        $scope.passwordOptions = {
            passwordTitle: 'New Password',
            confirmPasswordTitle: 'Confirm New Password',
            weakPassword: false
        };

        $scope.updateName = function() {
            if($scope.form.FirstName === null || $scope.form.FirstName === '')
                return;

            $scope.nameError = null;
            $scope.nameSuccess = null;

            var account = angular.copy(accountService.account, { });

            // If nothing has changed, don't update
            if(account.FirstName === $scope.form.FirstName &&
                account.LastName === $scope.form.LastName) {
                commService.showErrorAlert('Name has not changed.');
                return;
            }

            account.FirstName = $scope.form.FirstName;
            account.LastName = $scope.form.LastName;

            $scope.processingName = true;
            accountService.updateAccountBasicInfo(account,
                function(data) {
                    // success
                    accountService.account.FirstName = account.FirstName;
                    accountService.account.LastName = account.LastName;
                    $scope.account = accountService.account;
                    $scope.processingName = false;
                    $scope.nameSuccess = 'Name has been changed successfully!';
                    commService.showSuccessAlert($scope.nameSuccess);
                },
                function(data) {
                    // failure
                    $scope.nameError = data.ErrorReason;
                    $scope.processingName = false;
                    commService.showErrorAlert($scope.nameError);
                });
        };

        $scope.changePassword = function() {
            // Make sure the new passwords match
            if($scope.form.NewPassword !== $scope.form.NewPasswordConfirmed)
                return;

            if(!$scope.form.NewPassword)
                return;

            $scope.passwordError = null;
            $scope.passwordSuccess = null;

            $scope.processingPassword = true;
            accountService.updateAccountPassword($scope.form.OldPassword,
                $scope.form.NewPassword,
                function(data) {
                    // success
                    $scope.processingPassword = false;
                    $scope.passwordSuccess = 'Password has been changed successfully!';
                    commService.showSuccessAlert($scope.passwordSuccess);

                    $scope.form.OldPassword = '';
                    $scope.form.NewPassword = '';
                    $scope.form.NewPasswordConfirmed = '';
                },
                function(data) {
                    // failure
                    $scope.processingPassword = false;
                    $scope.passwordError = data.ErrorReason;
                    commService.showErrorAlert($scope.passwordError);
                });
        };
    }]);

