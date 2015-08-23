angular.module('app.Directives')
    .directive('marketingPopup', ['commService', '$window', 'marketingService', 'navigationService', 'mediaService', '$timeout', function (commService, $window, marketingService, navigationService, mediaService, $timeout) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div id="marketingPopup" ng-if="marketingService.popup.show" class="marketing-popup">' +
                        '<div class="landing-page-description" style="font-size: 25px;">{{marketingService.popup.text}}</div>' +
                        '<youtube ng-if="marketingService.popup.videoId" max-height="150" video-id="{{marketingService.popup.videoId}}" class="centered"></youtube>' +

                        '<div>' +
                            '<a ng-click="signUp()" class="btn btn-call-to-action btn-lg">{{buttonText}}</a> <a class="btn btn-lg btn-light pointer" ng-click="close()">Close</a>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
            },
            link: function (scope, element, attrs) {
                scope.buttonText = 'Free Sign-Up';
                scope.mediaService = mediaService;
                scope.marketingService = marketingService;

                scope.close = function() {
                    marketingService.popup.show = false;
                    marketingService.state.userClosedPopup = true;
                    marketingService.saveState();
                    navigationService.registerEvent('MarketingPopup', 'Closed', marketingService.popup.text, scope.buttonText);
                };

                var clickNamespace = 'click.marketingpopup';
                scope.$watch('marketingService.popup.show', function(newValue) {
                    if(newValue) {
                        navigationService.registerEvent('MarketingPopup', 'Opened', marketingService.popup.text, scope.buttonText);
                        // https://css-tricks.com/dangers-stopping-event-propagation/
                        $(document).on(clickNamespace, function(event) {
                            if (!$(event.target).closest('#marketingPopup').length) {
                                // Click was outside of the marketing popup
                                scope.$apply(function() {
                                    scope.close();
                                });
                            }
                            else {
                                // Click was inside the marketing popup
                            }
                        });
                    }
                    else {
                        $(document).off(clickNamespace);
                    }
                });

                scope.$on('$destroy', function() {
                    $(document).off(clickNamespace);
                });

                scope.signUp = function() {
                    scope.close();
                    navigationService.goToPath('/register');
                    $timeout(function() {
                        var marketingActionEntry = {
                            Action: 'MarketingPopupSignUpButtonClicked',
                            Data: [{
                                Key: 'PopupText',
                                Value: marketingService.popup.text
                            }, {
                                Key: 'VideoId',
                                Value: marketingService.popup.videoId
                            }, {
                                Key: 'ButtonText',
                                Value: scope.buttonText
                            }]
                        };
                        marketingService.logMarketingAction(marketingActionEntry);
                    });

                };

            }
        };
    }]);