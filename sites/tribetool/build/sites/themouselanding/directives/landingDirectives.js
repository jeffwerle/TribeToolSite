angular.module('cthemouselanding.Directives')
    .directive('cthemouselandingLandingPage', ['navigationService', 'accountService', '$timeout', 'marketingService', function(navigationService, accountService, $timeout, marketingService) {
        return {
            restrict: 'E',
            replace: 'true',
            template:
                '<div>' +
                    '<div class="community-landing-page col-sm-offset-2 col-sm-8">' +
                        '<h1 class="landing-page-title">{{title}}</h1>' +
                        '<div class="landing-page-description">{{description}}</div>' +
                        '<youtube class="centered" video-id="{{videoId}}"></youtube>' +

                        '<div class="centered clear-both" style="padding-top: 10px;">' +
                            '<social-login-buttons-vertical></social-login-buttons-vertical>' +
                        '</div>' +
                        '<div class="centered clear-both">' +
                            '<a ng-click="signUp()" class="btn btn-call-to-action btn-lg">{{buttonText}}</a>' +
                        '</div>' +
                    '</div>' +
                    /*
                    '<div class="clear-both">' +
                        '<tag-strip class="centered"></tag-strip>' +
                        '<div style="margin-top: 10px;">' +
                            '<map-strip></map-strip>' +
                            '<div class="centered">' +
                                '<button class="btn btn-primary" style="margin-top: 10px;" ng-click="goToMaps()">Explore Maps</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    */
                '</div>',
            controller: ['$scope', function($scope) {

                var descriptions = ['Share your Disney Love', 'Discover other Disneylanders', 'Disneyland\'s First Social Network', 'The Fastest Way To Meet New Disneyland Friends'];
                var buttonTexts = ['Join Now', 'Join Free', 'Start Sharing'];

                $scope.title = 'The Mouse Landing';
                $scope.buttonText = buttonTexts[Math.floor(Math.random()*buttonTexts.length)];
                $scope.description = descriptions[Math.floor(Math.random()*descriptions.length)];
                $scope.videoId = 'e0272e0qwgc';
                $scope.signUp = function() {
                    accountService.showSignupDialog(navigationService, marketingService, {
                        skipMarketingAction: true
                    });

                    if(marketingService.logMarketingAction) {
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
                    }

                };
                $scope.goToMaps = function() {
                    navigationService.goToPath('/maps');
                };
            }],
            link: function(scope, elem, attrs) {


            }
        };
    }])
    .directive('cthemouselandingCompatibilityLandingPage', ['navigationService', 'accountService', '$timeout', 'marketingService', '$routeParams', function(navigationService, accountService, $timeout, marketingService, $routeParams) {
        return {
            restrict: 'E',
            replace: 'true',
            template:
                '<div>' +
                    '<div class="community-landing-page clearfix" style="background-color: rgb(238, 238, 238);">' +


                        '<h1 class="landing-page-title">{{title}}</h1>' +
                        '<div class="landing-page-description">{{description}}</div>' +

                        '<div class="col-sm-offset-2 col-sm-8" style="margin-top: 10px;">' +
                            '<compatibility-quiz quiz-url="quizUrl"></compatibility-quiz>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            controller: ['$scope', function($scope) {
                if(marketingService.popup)
                    marketingService.popup.suppress = true;
                $scope.quizUrl = $routeParams.landingRouteData1;

                var descriptions = ['Find your Disneyland Soul Mate', 'Find your Disneyland Partner', 'Find the Disneylander you\'re most compatible with.', 'Find More Disneyland Friends', 'The Fastest Way To Meet New Disneyland Friends'];


                $scope.title = 'The Mouse Landing';

                $scope.description = descriptions[Math.floor(Math.random()*descriptions.length)];
                $scope.videoId = 'e0272e0qwgc';

                $scope.goToMaps = function() {
                    navigationService.goToPath('/maps');
                };
            }],
            link: function(scope, elem, attrs) {


            }
        };
    }]);