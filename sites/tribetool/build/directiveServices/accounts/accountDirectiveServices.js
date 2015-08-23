angular.module('app.Services')
    .factory('accountDirectiveService', ['accountService', 'commService', 'communityService', 'compatibilityService', 'vcRecaptchaService', 'modalService', 'marketingService', 'route', '$ionicLoading', function(accountService, commService, communityService, compatibilityService, vcRecaptchaService, modalService, marketingService, route, $ionicLoading) {
        return {
            initializeLoginScope: function($scope) {
                $scope.unconfirmed = false;

                $scope.$on('loggingIn', function(event, authenticationType) {
                    $scope.processingForm = true;
                });
                $scope.$on('loggingInComplete', function(event, authenticationType) {
                    $scope.processingForm = false;
                });
                $scope.$on('sessionCreate', function(event, authenticationType) {
                    modalService.closeAll();
                });

                $scope.cancel = function() {
                    $scope.options.onCancel();
                };


                $scope.signUp = function() {
                    $scope.options.onGoToSignUp();
                };

                // Are we already logged in?
                if(accountService.isLoggedIn()) {
                    // Are we confirmed?
                    if(accountService.isConfirmed()) {
                        $scope.options.onSuccess();
                        return;
                    }
                    else {
                        $scope.unconfirmed = true;
                    }
                }
                else {
                    $scope.form = {
                        Email: $scope.email
                    };
                    $scope.form.passwordFocused = !!$scope.form.Email;
                    $scope.form.emailFocused = !$scope.form.passwordFocused;

                    $scope.processingForm = false;
                    $scope.forgotPassword = false;
                    $scope.invalidPassword = false;
                    $scope.invalidEmail = false;
                    $scope.submit = function() {

                        $scope.processingForm = true;
                        $scope.invalidPassword = false;
                        $scope.invalidEmail = false;

                        $ionicLoading.show({
                            template: '<loading></loading> Logging In...'
                        });
                        accountService.login($scope.form.Email, $scope.form.Password, /*authentication options*/ null,
                            communityService.community,
                            function(result) {
                                var account = result.Account;

                                // Success
                                $ionicLoading.hide();
                                $scope.processingForm = false;
                                $scope.invalidEmail = false;
                                $scope.invalidPassword = false;
                                if(result.LoginSuccess) {
                                    if(account.Confirmed) {
                                        $scope.options.onSuccess();
                                    }
                                    else {
                                        $scope.unconfirmed = true;
                                    }
                                }
                                else {
                                    if(result.InvalidEmail) {
                                        $scope.invalidEmail = true;
                                    }
                                    else {
                                        $scope.invalidPassword = result.InvalidPassword;
                                        $scope.forgotPassword = true;
                                        $scope.form.passwordFocused = true;

                                    }
                                }
                            }, function(result) {
                                // Failure (error)
                                commService.showErrorAlert(result.ErrorReason);
                                $scope.processingForm = false;
                                $ionicLoading.hide();
                            });
                    };

                    $scope.forgotPasswordEmailSent = false;
                    $scope.emailForgotPassword = function() {
                        $scope.processingForm = true;
                        $ionicLoading.show({
                            template: '<loading></loading> Sending Password Reset Link...'
                        });
                        accountService.newPasswordResetSession($scope.form.Email, function() {
                            $scope.processingForm = false;
                            $ionicLoading.hide();
                            // Success
                            $scope.forgotPasswordEmailSent = true;
                        }, function(result) {
                            // Failure
                            $scope.processingForm = false;
                            $ionicLoading.hide();
                            $scope.forgotPasswordEmailSent = false;
                            commService.showErrorAlert(result.ErrorReason);
                        });
                    };
                }

                $scope.confirmationEmailSent = false;
                $scope.emailConfirmationLink = function() {
                    $scope.processingForm = true;
                    $ionicLoading.show({
                        template: '<loading></loading> Sending Account Confirmation Link...'
                    });
                    accountService.newAccountConfirmationSession(
                        $scope.form && $scope.form.Email ? $scope.form.Email : $scope.account.Email,
                        function() {
                            $scope.processingForm = false;
                            $ionicLoading.hide();
                            // Success
                            $scope.confirmationEmailSent = true;
                        }, function(result) {
                            // Failure
                            $scope.processingForm = false;
                            $ionicLoading.hide();
                            $scope.confirmationEmailSent = false;
                            commService.showErrorAlert(result.ErrorReason);
                        });
                };
            },
            initializeSignUpScope: function($scope) {
                $scope.$on('loggingIn', function(event, authenticationType) {
                    $scope.processingForm = true;
                });
                $scope.$on('loggingInComplete', function(event, authenticationType) {
                    $scope.processingForm = false;
                });

                $scope.$on('sessionCreate', function(event, authenticationType) {
                    modalService.closeAll();
                });

                $scope.refererId = route.routeParams.refererId;
                $scope.refererCommunityId = route.routeParams.refererCommunityId;

                $scope.processingFormMessage = 'The hamsters are working! Please wait...';
                $scope.form = {
                    firstNameFocused: !$scope.options.preventAutofocus
                };

                $scope.cancel = function() {
                    $scope.options.onCancel();
                };

                $scope.passwordOptions = {
                    passwordTitle: 'Password',
                    confirmPasswordTitle: 'Confirm Password',
                    weakPassword: false
                };

                $scope.goToLogin = function() {
                    $scope.options.onGoToLogin();
                };

                $scope.form.marketingActionSent = false;
                $scope.emailChanged = function() {
                    if($scope.form.marketingActionSent) {
                        return;
                    }

                    if(marketingService.logMarketingAction) {
                        if($scope.form.Email && $scope.form.Email.indexOf('@') > 0) {
                            var marketingActionEntry = {
                                Action: 'SignUpFormEmailFilledOut',
                                Data: [{
                                    Key: 'Email',
                                    Value: $scope.form.Email
                                }, {
                                    Key: 'FirstName',
                                    Value: $scope.form.FirstName
                                }, {
                                    Key: 'LastName',
                                    Value: $scope.form.LastName
                                }]
                            };
                            marketingService.logMarketingAction(marketingActionEntry);
                            $scope.form.marketingActionSent = true;
                        }
                    }
                };

                $scope.processingForm = false;
                $scope.forgotPassword = false;
                $scope.accountCreated = false;
                $scope.submit = function() {
                    if($scope.form.Password !== $scope.form.Password2)
                    {
                        commService.showErrorAlert('Please ensure that the passwords match.');
                        return;
                    }

                    if(!accountService.isPasswordStrongEnough($scope.form.Password)) {
                        $scope.passwordOptions.weakPassword = true;
                        return;
                    }
                    else {
                        $scope.passwordOptions.weakPassword = false;
                    }

                    var recaptchaCode = vcRecaptchaService.getResponse();
                    if(!recaptchaCode) {
                        commService.showErrorAlert('Please confirm that you are not a robot!');
                        return;
                    }

                    $scope.forgotPassword = false;
                    $scope.processingForm = true;
                    var account = $scope.form;

                    $scope.signUpError = null;
                    var onFailure = function(result) {
                        // Failure
                        $scope.signUpError = result.ErrorReason;
                        commService.showErrorAlert(result.ErrorReason);
                        $scope.processingForm = false;
                        $ionicLoading.hide();
                    };

                    $ionicLoading.show({
                        template: '<loading></loading> Creating Account...'
                    });
                    accountService.insertAccount(account, recaptchaCode, $scope.refererId,
                        $scope.refererCommunityId, communityService.community, function(result) {
                            // Success

                            // Send the account confirmation to the user.
                            $scope.accountCreated = true;
                            accountService.newAccountConfirmationSession($scope.form.Email, function() {
                                // Success
                                $scope.processingForm = false;
                                $ionicLoading.hide();
                                $scope.options.onSuccess();

                            }, function(result) {
                                // Failure
                                $scope.processingForm = false;
                                $ionicLoading.hide();
                                commService.showErrorAlert('Error Sending Account Confirmation: ' + result.ErrorReason);
                                $scope.options.onConfirmationLinkFailure();
                            });


                        }, function(result) {
                            if(result.DuplicateAccount) {
                                $scope.processingForm = false;
                                $ionicLoading.hide();
                                $scope.forgotPassword = true;
                                commService.showErrorAlert('It appears that there is already an account using this e-mail address.');
                            }
                            else {
                                onFailure(result);
                            }


                        }, compatibilityService);
                };

                $scope.forgotPasswordEmailSent = false;
                $scope.emailForgotPassword = function() {
                    $scope.processingForm = true;
                    $ionicLoading.show({
                        template: '<loading></loading> Sending Password Reset Link...'
                    });
                    accountService.newPasswordResetSession($scope.form.Email, function() {
                        $scope.processingForm = false;
                        $ionicLoading.hide();
                        // Success
                        $scope.forgotPasswordEmailSent = true;
                    }, function(result) {
                        // Failure
                        $scope.processingForm = false;
                        $ionicLoading.hide();
                        $scope.forgotPasswordEmailSent = false;
                        commService.showErrorAlert(result.ErrorReason);
                    });
                };
            },
            initializeUnconfirmedAccountScope: function($scope) {
                $scope.confirmationEmailSent = false;
                $scope.emailConfirmationLink = function() {
                    $scope.processing = true;
                    $ionicLoading.show({
                        template: '<loading></loading> Sending Confirmation Link...'
                    });
                    var email = $scope.form && $scope.form.Email ? $scope.form.Email : $scope.account ? $scope.account.Email : accountService.account.Email;

                    accountService.newAccountConfirmationSession(email,
                        function() {
                            $scope.processing = false;
                            $ionicLoading.hide();
                            // Success
                            $scope.confirmationEmailSent = true;
                        }, function(result) {
                            // Failure
                            $scope.processing = false;
                            $ionicLoading.hide();
                            $scope.confirmationEmailSent = false;
                            commService.showErrorAlert(result.ErrorReason);
                        });
                };
            }
        };
    }]);