angular.module('app.Services')
    .factory('billingService', ['$rootScope', 'commService', 'accountService', 'communityService', 'modalService', function($rootScope, commService, accountService, communityService, modalService) {
        return {
            getActiveSubscriptions: function(onSuccess, onFailure) {
                commService.postWithParams('billing', {
                    Credentials: accountService.getCredentials(communityService.community),
                    GetSubscriptionsOptions: {
                        OnlyGetActive: true
                    },
                    RequestType: 'GetSubscriptions'
                }, onSuccess, onFailure);
            },
            /* options: {
                    specialization: [] // optional. If provided, the user will be signing up for this specialization.
            * }*/
            goToBilling: function(onSelect, options) {
                modalService.open({
                    templateUrl: 'app-templates/billing/billing.html',
                    controller: 'billingController',
                    windowClass: 'billing-modal',
                    resolve: {
                        items: function () {
                            return [options];
                        }
                    }
                }, function (data) {
                    // Modal OK
                    if(onSelect)
                        onSelect(data);
                }, function () {
                    // Modal dismissed
                });

            },
            selectFreeLesson: function(onSuccess, onDismissed, options) {
                modalService.open({
                    templateUrl: 'app-templates/billing/free-lesson.html',
                    controller: 'freeLessonController',
                    windowClass: 'free-lesson-modal',
                    resolve: {
                        items: function () {
                            return [options];
                        }
                    }
                }, function (data) {
                    // Modal OK
                    if(onSuccess)
                        onSuccess(data);
                }, function () {
                    // Modal dismissed
                    if(onDismissed)
                        onDismissed();
                });
            }
        };
    }]);