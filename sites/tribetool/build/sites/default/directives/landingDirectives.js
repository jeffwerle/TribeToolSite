angular.module('cdefault.Directives')
    .directive('cdefaultLandingPage', ['navigationService', 'accountService', '$timeout', 'marketingService', 'mapService', 'communityService', function(navigationService, accountService, $timeout, marketingService, mapService, communityService) {
        return {
            restrict: 'E',
            replace: 'true',
            template:
                '<div>' +
                    '<div class="well col-sm-offset-3 col-sm-6 community-landing-page" style="margin-top: 20px;">' +
                        '<h1 class="landing-page-title" style="margin-top:0px; margin-bottom: 0px;">{{title}}</h1>' +
                        '<h3 class="landing-page-description">{{description}}</h3>' +

                        '<tag-strip class="centered"></tag-strip>' +
                        '<div class="centered" style="margin-top: 10px;">' +
                            '<a ng-click="signUp()" class="btn btn-call-to-action btn-lg">{{buttonText}}</a>' +
                        '</div>' +
                    '</div>' +
                    '<div class="col-sm-offset-3 col-sm-6" ng-if="mapService.maps && mapService.maps.length > 0">' +
                        '<map-strip></map-strip>' +
                        '<div class="centered">' +
                            '<button class="btn btn-primary" style="margin-top: 10px;" ng-click="goToMaps()">Explore Maps</button>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            controller: ['$scope', function($scope) {

                var descriptions = ['Share your ' + communityService.community.Name + ' Love'];
                var buttonTexts = ['Join Now', 'Join Free', 'Start Sharing'];

                $scope.title = communityService.community.Name + ' Central';
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