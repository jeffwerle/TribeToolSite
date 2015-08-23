angular.module('app.Services')
    .factory('marketingService', ['$rootScope', 'commService', 'accountService', 'communityService', 'cookiesService', '$timeout', function($rootScope, commService, accountService, communityService, cookiesService, $timeout) {
        return {
            state: {
                userClosedPopup: false
            },
            popup: {
                suppress: false, // If set to true, the popup will not show
                show: false,
                text: 'Ready to Join the Community?'
            },
            initialize: function() {
                var self = this;
                this.loadState();

                // If the user has already seen the popup and closed it or if
                // they are logged in then don't show the popup
                if(self.state.userClosedPopup || accountService.isLoggedIn()) {
                    return;
                }


                // Show the popup after the user has been on the site for a specific
                // amount of time
                var delayToShow = 1000 * 60 * 1;
                var timerStarted = false;
                var startTimer = function() {
                    if(!accountService.isLoggedIn() &&
                        communityService.community &&
                        communityService.page.name !== 'community') {
                        timerStarted = true;
                        $timeout(function() {
                            if(!self.popup.suppress)
                                self.popup.show = true;
                        }, delayToShow);
                    }
                };
                startTimer();

                $rootScope.$on('communityChanged', function(event, community) {
                    self.resetForCommunity();
                });
                $rootScope.$on('communityPageLoaded', function(event, page) {
                    if(!timerStarted) {
                        startTimer();
                    }
                });




            },
            resetForCommunity: function() {
                this.popup.text = 'Ready to Join the ' + communityService.getNameWithoutThe() + ' Community?';
                this.popup.videoId = null;
            },
            saveState: function() {
                cookiesService.setMarketingState(this.state);
            },
            loadState: function() {
                var self = this;
                cookiesService.getMarketingState().then(function(state) {
                    if(state) {
                        self.state = state;
                    }
                });
            },
            logMarketingAction: function(marketingAction, onSuccess, onFailure) {
                commService.postWithParams('marketing', {
                    Credentials: accountService.getCredentials(communityService.community),
                    MarketingAction: marketingAction,
                    RequestType: 'LogMarketingAction'
                }, onSuccess, onFailure);
            }
        };
    }]);