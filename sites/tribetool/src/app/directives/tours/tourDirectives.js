angular.module('app.Directives')
    .directive('communityPageTour', ['accountService', function (accountService) {
        return {
            replace: true,
            restrict: 'E',
            templateUrl: '/app-templates/tours/community-tour.html',
            link: function (scope, element, attrs) {

            }
        };
    }])
    .directive('postPageTour', ['accountService', function (accountService) {
        return {
            replace: true,
            restrict: 'E',
            templateUrl: '/app-templates/tours/post-tour.html',
            link: function (scope, element, attrs) {

            }
        };
    }])
    .directive('streamTour', ['accountService', function (accountService) {
        return {
            replace: true,
            restrict: 'E',
            templateUrl: '/app-templates/tours/stream-tour.html',
            link: function (scope, element, attrs) {

            }
        };
    }])
    .directive('profileTour', ['accountService', function (accountService) {
        return {
            replace: true,
            restrict: 'E',
            templateUrl: '/app-templates/tours/profile-tour.html',
            link: function (scope, element, attrs) {

            }
        };
    }])
    .directive('tagPageTour', ['accountService', function (accountService) {
        return {
            replace: true,
            restrict: 'E',
            templateUrl: '/app-templates/tours/tag-page-tour.html',
            link: function (scope, element, attrs) {

            }
        };
    }])
    .directive('tagPageEditTour', ['accountService', function (accountService) {
        return {
            replace: true,
            restrict: 'E',
            templateUrl: '/app-templates/tours/tag-page-edit-tour.html',
            link: function (scope, element, attrs) {

            }
        };
    }])
    .directive('mapPageTour', ['accountService', function (accountService) {
        return {
            replace: true,
            restrict: 'E',
            templateUrl: '/app-templates/tours/map-tour.html',
            link: function (scope, element, attrs) {

            }
        };
    }]);