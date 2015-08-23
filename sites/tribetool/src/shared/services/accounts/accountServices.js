angular.module('app.Services')
    .factory('accountService', ['$rootScope', 'commService', 'cookiesService', 'modalService', 'mediaService', '$timeout', 'OPTIONS', 'route', function($rootScope, commService, cookiesService, modalService, mediaService, $timeout, OPTIONS, route) {
        return {
            account: null, // The currently logged-in account, if applicable

            /* all accounts--not community-specific These accounts will only have their basic fields populated. */
            accounts: [],
            saveState: function() {
                cookiesService.setAccountState(this.account ? {
                    Id: this.account.Id,
                    Confirmed: this.account.Confirmed,
                    PreferredCommunityUrl: this.account.PreferredCommunityUrl,
                    Session: this.account.Session
                } : null);
            },
            /* Returns a promise */
            getAccountFromState: function() {
                return cookiesService.getAccountState();
            },
            getCredentials: function(community) {
                return {
                    AccountId: this.account ? this.account.Id : null,
                    SessionId: this.getSessionId(),
                    CommunityId: community ? community.Id : null
                };
            },
            getSessionId: function() {
                return this.account && this.account.Session ? this.account.Session.Id : null;
            },
            getReferralLink: function(community) {
                return commService.getDomain() + '/register?refererId=' + this.account.Id + '&refererCommunityId=' + community.Id;
            },
            updateAccountBasicInfo: function(account, onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('account', {
                    Credentials: my.getCredentials(null),
                    Account: account,
                    AccountRequestType: 'UpdateBasicInfo'
                }, onSuccess, onFailure);
            },
            updateAccountPassword: function(oldPassword, newPassword, onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('account', {
                    Credentials: my.getCredentials(null),
                    Account: my.account,
                    OldPassword: oldPassword,
                    NewPassword: newPassword,
                    AccountRequestType: 'UpdatePassword'
                }, onSuccess, onFailure);
            },
            addAccountDevice: function(deviceToken, deviceType, onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('account', {
                    Credentials: my.getCredentials(null),
                    Account: my.account,
                    AddAccountDeviceOptions: {
                        DeviceToken: deviceToken,
                        DeviceType: deviceType
                    },
                    AccountRequestType: 'AddDevice'
                }, onSuccess, onFailure);
            },
            /* Gets the specified account from the cache, if available. Retrieves from the
            * service if the account is not in the cache.*/
            getAccountFromCache: function(accountId, onSuccess, onFailure) {
                if(this.account && this.account.Id === accountId) {
                    if(onSuccess)
                        onSuccess({
                            Account: this.account
                        });
                    return;
                }

                if(this.accounts) {
                    for(var i = 0; i < this.accounts.length; i++) {
                        var account = this.accounts[i];
                        if(account.Id === accountId) {
                            if(onSuccess)
                                onSuccess({
                                    Account: account
                                });
                            return;
                        }
                    }
                }

                return this.getOtherAccount(accountId, onSuccess, onFailure);
            },
            /* Used to get the information on any account */
            getOtherAccount: function(accountId, onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('account', {
                    RequestedAccountId: accountId,
                    Credentials: my.getCredentials(null),
                    AccountRequestType: 'GetOtherAccount'
                }, onSuccess, onFailure);
            },
            /* Used to get the account information for the currently logged-in account */
            getAccount: function(onSuccess, onFailure) {
                var my = this;
                var credentials = my.getCredentials(null);
                commService.postWithParams('account', {
                    Credentials: credentials,
                    AccountRequestType: 'GetAccount'
                }, onSuccess, onFailure);
            },
            getAccounts: function(onSuccess, onFailure) {
                var self = this;
                commService.postWithParams('account', {
                    Credentials: self.getCredentials(null),
                    AccountRequestType: 'GetAccounts'
                }, function(data) {
                    if(data.Accounts)
                        self.accounts = data.Accounts;

                    if(onSuccess) {
                        onSuccess(data);
                    }
                }, onFailure);
            },
            getAccountList: function(accounts, community, onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('account', {
                    Credentials: my.getCredentials(community),
                    Accounts: accounts,
                    AccountRequestType: 'GetAccountList'
                }, onSuccess, onFailure);
            },
            insertAccount: function(account, recaptchaCode, refererId, refererCommunityId, community, onSuccess, onFailure, compatibilityService) {
                var answersState = null;

                var call = function() {
                    var my = this;
                    commService.postWithParams('account', {
                        account: account,
                        Credentials: my.getCredentials(community),
                        AccountRequestType: 'InsertAccount',
                        InsertAccountOptions: {
                            RefererAccountId: refererId,
                            RefererCommunityId: refererCommunityId,
                            Answers: answersState ? answersState.answers : null,
                            AnswersCommunityId: answersState ? answersState.communityId : null,
                            RecaptchaCode: recaptchaCode
                        }
                    }, onSuccess, onFailure);
                };

                if(compatibilityService && compatibilityService.compatibilityQuizState) {
                    answersState = compatibilityService.compatibilityQuizState;
                    call();
                }
                else {
                    cookiesService.getCompatibilityAnswersState().then(function(state) {
                        answersState = state;
                        call();
                    }, function(err) {
                        call();
                    });
                }
            },
            login: function(email, password, authenticationOptions, community, onSuccess, onFailure) {
                if(authenticationOptions)
                    authenticationOptions.IsMobile = OPTIONS.isMobile;
                var my = this;
                commService.postWithParams('login', {
                    Email: email,
                    Password: password,
                    Credentials: my.getCredentials(community),
                    AuthenticationOptions: authenticationOptions
                }, function(result) {

                    if(result.LoginSuccess) {
                        // Login success, set the account and session
                        my.account = result.Account;

                        $rootScope.$broadcast('sessionCreate', my.account);
                    }

                    if(onSuccess)
                        onSuccess(result);
                }, onFailure);
            },
            googleLogin: function(accessToken, user, navigationService, communityService) {
                // Login (the account will be created from our authentication
                // data if it does not yet exist).
                var self = this;
                this.login(user.email, null,
                    {
                        AuthenticationType: 'Google',
                        Email: user.email,
                        UserId: user.id,
                        AccessToken: accessToken,
                        FirstName: user.given_name,
                        LastName: user.family_name
                    },
                    communityService.community,
                    function(result) {
                        var account = result.Account;
                        self.navigateUponLogin(navigationService, communityService);
                        $rootScope.$broadcast('loggingInComplete', 'Google');
                    }, function(result) {
                        // Failure (error)
                        commService.showErrorAlert(result.ErrorReason);
                        $rootScope.$broadcast('loggingInComplete', 'Google');
                    });
            },
            facebookLogin: function(response, user, navigationService, communityService) {
                var self = this;
                this.login(user.email, null,
                    {
                        AuthenticationType: 'Facebook',
                        Email: user.email,
                        UserId: response.authResponse.userID,
                        AccessToken: response.authResponse.accessToken,
                        FirstName: user.first_name,
                        LastName: user.last_name
                    },
                    communityService.community,
                    function(result) {
                        var account = result.Account;
                        self.navigateUponLogin(navigationService, communityService);
                        $rootScope.$broadcast('loggingInComplete', 'Facebook');
                    }, function(result) {
                        // Failure (error)
                        commService.showErrorAlert(result.ErrorReason);
                        $rootScope.$broadcast('loggingInComplete', 'Facebook');
                    });
            },
            newPasswordResetSession: function(email, onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('passwordreset', {
                    Email: email,
                    RequestingNew: true
                }, function(result) {
                    if(onSuccess)
                        onSuccess(result);
                }, onFailure);
            },
            isPasswordResetSessionValid: function(sessionId, email, onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('passwordreset', {
                    PasswordResetSessionId: sessionId,
                    Email: email,
                    RequestingNew: false
                }, function(result) {
                    if(onSuccess)
                        onSuccess(result);
                }, onFailure);
            },
            resetPassword: function(sessionId, email, newPassword, onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('passwordreset', {
                    PasswordResetSessionId: sessionId,
                    Email: email,
                    NewPassword: newPassword,
                    RequestingNew: false
                }, function(result) {
                    if(onSuccess)
                        onSuccess(result);
                }, onFailure);
            },
            confirmAccount: function(sessionId, email, onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('accountconfirmation', {
                    AccountConfirmationSessionId: sessionId,
                    Email: email,
                    RequestingNew: false
                }, function(result) {
                    if(onSuccess)
                        onSuccess(result);
                }, onFailure);
            },
            newAccountConfirmationSession: function(email, onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('accountconfirmation', {
                    Email: email,
                    RequestingNew: true
                }, function(result) {
                    if(onSuccess)
                        onSuccess(result);
                }, onFailure);
            },
            tourNames: {
                compatibilityRedirect: 'CompatibilityPageRedirectOnFirstLogin'
            },
            shouldNavigateToCompatibilityPage: function(accountCommunity) {
                if(!accountCommunity || !this.account || !this.account.Confirmed) {
                    return false;
                }

                var hasCompletedTour = false;
                if(this.account.AccountTours && this.account.AccountTours.CompletedTours) {
                    for(var i = 0; i < this.account.AccountTours.CompletedTours.length; i++) {
                        var accountTour = this.account.AccountTours.CompletedTours[i];
                        if(this.tourNames.compatibilityRedirect === accountTour) {
                            hasCompletedTour = true;
                            break;
                        }
                    }
                }

                return !hasCompletedTour && accountCommunity.CompatibilityAnswers &&
                    accountCommunity.CompatibilityAnswers.length > 0;
            },
            navigateUponLogin: function(navigationService, communityService) {

                cookiesService.getLastRememberedPage().then(function(lastRememberedPage) {
                    if(lastRememberedPage && lastRememberedPage !== '/login') {
                        if(!navigationService.isCurrentUrl(lastRememberedPage))
                            navigationService.goToPath(lastRememberedPage);
                    }
                    else {
                        navigationService.goToPath('/community');
                    }
                });
            },
            weakPasswordMessage: 'The selected password is not strong enough. Please include numbers, lower case letters, upper case letters, and symbols (such as "#").',
            isPasswordStrongEnough: function(p) {
                return this.measurePasswordStrength(p) >= 30;
            },
            measurePasswordStrength: function (p) {
                if(!p)
                    return 0;

                var _force = 0;
                var _regex = /[$-/:-?{-~!"^_`\[\]]/g;

                var _lowerLetters = /[a-z]+/.test(p);
                var _upperLetters = /[A-Z]+/.test(p);
                var _numbers = /[0-9]+/.test(p);
                var _symbols = _regex.test(p);

                var _flags = [_lowerLetters, _upperLetters, _numbers, _symbols];
                var _passedMatches = $.grep(_flags, function (el) { return el === true; }).length;

                _force += 2 * p.length + ((p.length >= 10) ? 1 : 0);
                _force += _passedMatches * 10;

                // penalty (short password)
                _force = (p.length <= 6) ? Math.min(_force, 10) : _force;

                // penalty (poor variety of characters)
                _force = (_passedMatches == 1) ? Math.min(_force, 10) : _force;
                _force = (_passedMatches == 2) ? Math.min(_force, 20) : _force;
                _force = (_passedMatches == 3) ? Math.min(_force, 40) : _force;

                if(p.length >= 7 && _force < 20)
                    _force = 20;
                if(p.length >= 10 && _force < 30)
                    _force = 30;
                if(p.length >= 14 && _force < 40)
                    _force = 40;
                if(p.length >= 17 && _force < 50)
                    _force = 50;

                return _force;

            },
            isSuperAdmin: function(account) {
                return this.isLoggedIn(account) && account.AccountType === 'SuperAdmin';
            },
            isAdmin: function(account) {
                return this.isLoggedIn(account) && account.AccountType === 'Admin';
            },
            isAdminOrSuperAdmin: function(account) {
                return this.isAdmin(account) || this.isSuperAdmin(account);
            },
            isLoggedIn: function(account) {
                if(!account)
                    account = this.account;
                if(account && account.Id && account.Session && account.Session.Id)
                    return true;

                return false;
            },
            isConfirmed: function(account) {
                if(!account)
                    account = this.account;
                return account.Confirmed;
            },
            isLoggedInAndConfirmed: function(account) {
                return this.isLoggedIn(account) && this.isConfirmed(account);
            },
            /* Indicates whether the given account is a teacher (uses this.account if none provided) */
            isTeacher: function(account) {
                if(!account)
                    account = this.account;
                return this.isLoggedInAndConfirmed(account) && angular.isDefined(account.TeachingInfo);
            },
            isTeacherOfSpecialization: function(specializationId, account) {
                if(!account)
                    account = this.account;
                if(!this.isTeacher(account) || !angular.isDefined(account.TeachingInfo.Specializations))
                    return false;

                for(var i = 0; i < account.TeachingInfo.Specializations.length; i++) {
                    var specialization = account.TeachingInfo.Specializations[i];
                    if(specialization.SpecializationId === specializationId) {
                        return true;
                    }
                }

                return false;
            },
            /* Gets the AccountSpecialization (if applicable) for the given specializationId for the current account */
            getAccountSubscription: function(specializationId) {
                var account = this.account;
                if(!account.Billing && !account.Billing.Subscriptions) {
                    return null;
                }

                for(var i = 0; i < account.Billing.Subscriptions.length; i++) {
                    var subscription = account.Billing.Subscriptions[i];
                    if(subscription.LessonSubscription &&
                        subscription.LessonSubscription.SpecializationId === specializationId) {
                        return subscription;
                    }
                }

                return null;
            },
            /*
            * options: {
            *   marketingAction: MarketingActionEntry to log
            *   skipMarketingAction: bool  // true to skip logging MarketingAction
            * }
            * */
            showSignupDialog: function(navigationService, marketingService, options) {
                if(!options) {
                    options = { };
                }
                options.stage = 'SignUp';

                this.showLoginDialog(navigationService, options);

                if(marketingService && (!options || !options.skipMarketingAction)) {
                    $timeout(function() {
                        var marketingAction = options && options.marketingAction ? options.marketingAction : {
                            Action: 'SocialInteractionLeadingToSignUpDialog'
                        };
                        marketingService.logMarketingAction(marketingAction);
                    });
                }

            },
            showLoginDialog: function(navigationService, options) {
                if(!options) {
                    options = { };
                }

                // On mobile go to the login page instead of opening the dialog box.
                if(mediaService.isPhone) {
                    if(options.stage === 'SignUp') {
                        navigationService.goToSignUp();
                    }
                    else {
                        navigationService.goToLogin();
                    }

                    commService.showInfoAlert('You\'re one login away from interacting with the community!');
                    return;
                }

                modalService.open({
                    templateUrl: 'app-templates/accounts/login-dialog.html',
                    controller: 'loginDialogController',
                    windowClass: 'login-dialog-modal',
                    resolve: {
                        items: function () {
                            return [options];
                        }
                    }
                }, function (data) {
                    // Modal OK
                }, function () {
                    // Modal dismissed
                });
            },
            showAccountList: function(options) {
                modalService.open({
                    templateUrl: 'app-templates/accounts/account-list.html',
                    controller: 'accountListController',
                    windowClass: 'account-list-modal',
                    resolve: {
                        items: function () {
                            return [options];
                        }
                    }
                }, function (data) {
                    // Modal OK
                }, function () {
                    // Modal dismissed
                });
            }
        };
    }]);