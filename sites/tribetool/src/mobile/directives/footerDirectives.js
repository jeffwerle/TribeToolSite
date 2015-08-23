angular.module('app.Directives')
    .directive('footerNavButton', ['navigationService', 'communityService', 'accountService', function (navigationService, communityService, accountService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="footer-nav-button">' +
                    '<div class="circle-menu button-circle button button-positive icon white" ng-click="menuToggled()" ng-class="{\'inactive\': !menuOpen, \'active\': menuOpen}">' +
                        '<div class="transform circle-menu-btn trigger">' +
                            '<span class="line white"></span>' +
                        '</div>' +
                        '<div class="icons">' +
                            // Use rotator-left-4 for 4 menu options
                            '<div class="rotator-left-3">' +
                                '<a class="transform circle-menu-btn circle-menu-btn-icon button button-positive" ng-href="#/community/{{communityService.community.Url}}">' +
                                    '<i class="transform icon fa fa-users" style="margin-top: 3px;"></i>' +
                                '</a>' +
                            '</div>' +
                            // Use rotator-left-4 for 4 menu options
                            '<div class="rotator-left-3">' +
                                '<a class="transform circle-menu-btn circle-menu-btn-icon button button-positive" ng-href="#/stream/{{communityService.community.Url}}">' +
                                    '<i class="transform icon fa fa-newspaper-o" style="margin-top: 4px;"></i>' +
                                '</a>' +
                            '</div>' +
                            // Use rotator-left-4 for 4 menu options
                            '<div class="rotator-left-3">' +
                                '<a class="transform circle-menu-btn circle-menu-btn-icon button button-positive" ng-href="#/profile/{{communityService.community.Url}}/{{accountService.account.Username}}">' +
                                    '<i class="transform icon fa fa-user" style="margin-top: 2px;"></i>' +
                                '</a>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {

            },
            controller: [function() {

            }],
            link: function (scope, element, attrs) {
                scope.navigationService = navigationService;
                scope.communityService = communityService;
                scope.accountService = accountService;

                scope.menuOpen = false;
                var backdrop = $('<div style="z-index: 1; position:absolute; top: 0;left: 0;height:100%;width: 100%; background-color: black; color: black; opacity: 0.7;"></div>');
                backdrop.click(function() {
                    scope.$apply(function() {
                        scope.menuToggled();
                    });
                });

                var footer = $('.footer-nav-button');
                scope.menuToggled = function() {
                    scope.menuOpen = !scope.menuOpen;

                    if(scope.menuOpen) {
                        footer.detach();
                        var body = $('body');
                        body.append(backdrop);
                        body.append(footer);
                    }
                    else {
                        element.append(footer);
                        backdrop.detach();
                    }
                };


            }
        };
    }]);