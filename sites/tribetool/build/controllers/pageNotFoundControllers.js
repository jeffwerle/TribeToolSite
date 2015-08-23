angular.module('app.Controllers')
    .controller('pageNotFoundController', ['$scope', '$location', '$timeout', 'navigationService', 'metaService', function($scope, $location, $timeout, navigationService, metaService) {
        metaService.setPrerenderInfo({
            status: 404
        });
        $location.search(navigationService.redirectTo404OnNotFoundSearchParam, null);

        $timeout(function() {
            if(angular.isDefined(window.prerenderReady)) {
                window.prerenderReady = true;
            }
        }, 0);

    }]);