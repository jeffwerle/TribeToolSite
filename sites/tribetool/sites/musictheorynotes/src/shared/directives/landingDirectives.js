angular.module('cmusictheorynotes.Directives')
    .directive('cmusictheorynotesLandingPage', ['navigationService', 'accountService', '$timeout', 'marketingService', 'mapService', function(navigationService, accountService, $timeout, marketingService, mapService) {
        return {
            restrict: 'E',
            replace: 'true',
            template:
                '<div>' +
                    '<div class="community-landing-page col-sm-offset-2 col-sm-8">' +
                        '<h1 class="landing-page-title">{{title}}</h1>' +
                        '<h3 class="landing-page-description">{{description}}</h3>' +

                        '<div class="centered" style="margin-top: 10px;">' +
                            '<a ng-click="signUp()" class="btn btn-call-to-action btn-lg">{{buttonText}}</a>' +
                        '</div>' +
                    '</div>' +
                    '<div class="clear-both">' +

                        '<tag-strip class="centered"></tag-strip>' +
                        '<div ng-if="mapService.maps && mapService.maps.length > 0" style="margin-top: 10px;">' +
                            '<map-strip></map-strip>' +
                            '<div class="centered">' +
                                '<button class="btn btn-primary" style="margin-top: 10px;" ng-click="goToMaps()">Explore Maps</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            controller: ['$scope', function($scope) {

                var descriptions = ['Share your Music Theory Love', 'Learn Music Theory, The Simple Way'];
                var buttonTexts = ['Join Now', 'Join Free', 'Start Sharing'];

                $scope.title = 'Music Theory Notes';
                $scope.buttonText = buttonTexts[Math.floor(Math.random()*buttonTexts.length)];
                $scope.description = descriptions[Math.floor(Math.random()*descriptions.length)];
                $scope.signUp = function() {
                    accountService.showSignupDialog(navigationService, marketingService, {
                        skipMarketingAction: true
                    });

                    $timeout(function() {
                        var marketingActionEntry = {
                            Action: 'CommunityLandingPageSignUpDialog',
                            Data: [{
                                Key: 'Title',
                                Value: $scope.title
                            }, {
                                Key: 'Description',
                                Value: $scope.description
                            }, {
                                Key: 'ButtonText',
                                Value: $scope.buttonText
                            }]
                        };
                        marketingService.logMarketingAction(marketingActionEntry);
                    });

                };
                $scope.goToMaps = function() {
                    navigationService.goToPath('/maps');
                };
            }],
            link: function(scope, elem, attrs) {
                scope.mapService = mapService;

            }
        };
    }]);