angular.module('app.Directives')
    .directive('belowHeader', ['$rootScope', 'accountService', 'navigationService', 'communityService', function($rootScope, accountService, navigationService, communityService) {
        return {
            restrict: 'E',
            replace: 'true',
            template:
                '<div>' +
                    '<div ng-if="isUnconfirmed">' +
                        '<unconfirmed-account></unconfirmed-account>' +
                    '</div>' +
                    '<div id="page-content-wrapper" class="ease-transition">' +
                        '<div id="page-content">' +

                            // We will handle the view of all community pages by passing on the
                            // responsibility of the community page to the community's index.html file
                            // We store it so high in the html chain so that the community's controllers
                            // can also be high and don't have to reinitialize every time we switch pages
                            '<div ng-show="communityService.page.isCommunityPage">' +
                                '<div ng-if="communityService.communityOptions && communityService.communityOptions.indexFilePath">' +
                                    '<div ng-include="communityService.communityOptions.indexFilePath"></div>' +
                                '</div>' +
                            '</div>' +

                            // ng-view is used for all non-community pages
                            '<ng-view></ng-view>' +

                        '</div>' +
                        '<div ng-include="\'app-templates/footer.tpl.html\'"></div>' +
                    '</div>' +
                '</div>',
            link: function(scope, elem, attrs) {
                scope.communityService = communityService;
                scope.isUnconfirmed = false;
                scope.updateIsConfirmed = function() {
                    scope.isUnconfirmed = accountService.isLoggedIn() && !accountService.isConfirmed();

                    if(scope.isUnconfirmed && navigationService.isCurrentRoute('/login')) {
                        scope.isUnconfirmed = false;
                    }
                };
                scope.updateIsConfirmed();
                $rootScope.$on('sessionCreate', function(event, account) {
                    scope.updateIsConfirmed();
                });
                $rootScope.$on('sessionDestroy', function(event, account) {
                    scope.updateIsConfirmed();
                });
                $rootScope.$on('$locationChangeSuccess', function(event) {
                    scope.updateIsConfirmed();
                });

            }
        };
    }])
    .directive('loading', [function() {
        return {
            restrict: 'E',
            replace: 'true',
            template:
                '<img src="/images/ajax-loader.gif" alt="Please Wait...">',
            link: function(scope, elem, attrs) {
            }
        };
    }]);