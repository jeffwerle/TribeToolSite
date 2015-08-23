angular.module('app.Services')
    .factory('tourService', ['$rootScope', 'commService', 'accountService', 'communityService', function($rootScope, commService, accountService, communityService) {
        return {
            callbacks: [],
            removeCallback: function(callbackObject) {
                var i = this.callbacks.indexOf(callbackObject);
                if(i >= 0) {
                    this.callbacks.splice(i, 1);
                }
            },
            triggerEvent: function(eventName, data) {
                for(var i = 0; i < this.callbacks.length; i++) {
                    if(this.callbacks[i][eventName])
                        this.callbacks[i][eventName](data);
                }
            },
            startTour: function(tourName) {
                this.triggerEvent('onStartTour', tourName);
            },
            completeTour: function(tourName, onSuccess, onFailure) {
                commService.postWithParams('tour', {
                    Credentials: accountService.getCredentials(communityService.community),
                    TourName: tourName,
                    RequestType: 'CompleteTour'
                }, function(data) {
                    if(!accountService.account.AccountTours) {
                        accountService.account.AccountTours = { };
                    }
                    if(!accountService.account.AccountTours.CompletedTours) {
                        accountService.account.AccountTours.CompletedTours = [];
                    }

                    accountService.account.AccountTours.CompletedTours.push(tourName);

                    if(onSuccess) {
                        onSuccess();
                    }
                }, onFailure);
            },
            resetTour: function(tourName, onSuccess, onFailure) {
                commService.postWithParams('tour', {
                    Credentials: accountService.getCredentials(communityService.community),
                    TourName: tourName,
                    RequestType: 'ResetTour'
                }, onSuccess, onFailure);
            },
            /* Indicates whether the currently logged-in account has completed the specified tour */
            isTourCompleted: function(tourName) {
                if(!accountService.account || !accountService.account.AccountTours || !accountService.account.AccountTours.CompletedTours) {
                    return false;
                }

                var completedTours = accountService.account.AccountTours.CompletedTours;
                for(var i = 0; i < completedTours.length; i++) {
                    if(completedTours[i] === tourName) {
                        return true;
                    }
                }

                return false;
            },
            subscribeToCallbacks: function($scope) {
                $scope.callbacks = {
                    onStartTour: function(tourName) {
                        $scope.createTour(tourName);
                    }
                };
                this.callbacks.push($scope.callbacks);

                var self = this;
                $scope.$on('$destroy', function() {
                    self.removeCallback($scope.callbacks);
                });
            },
            getTourOptions: function(steps) {
                return {
                    steps: steps,
                    showStepNumbers: false,
                    showBullets: false,
                    exitOnOverlayClick: true,
                    exitOnEsc:true,
                    nextLabel: '<strong>Next!</strong>',
                    prevLabel: '<span>Previous</span>',
                    skipLabel: 'Exit Tour',
                    doneLabel: 'Done!'
                };
            }
        };
    }]);