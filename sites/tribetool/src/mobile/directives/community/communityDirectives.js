angular.module('app.Directives')
    .directive('communityPage', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div>' +
                        '<community-posts></community-posts>' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                '</div>',
            scope: {
            },
            controller: ['$scope', function($scope) {
            }],
            link: function (scope, element, attrs) {

            }
        };
    }]);