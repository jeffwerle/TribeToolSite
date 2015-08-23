angular.module('cthemouselanding.Controllers')
    .controller('cthemouselandingHomeController', ['$rootScope', '$scope', 'navigationService', 'accountService', 'marketingService', 'communityService', function($rootScope, $scope, navigationService, accountService, marketingService, communityService) {
        // This controller is only called once in the community's life (it will be called again
        // if a different community is loaded and then this one is reloaded).

        $scope.initialized = function() {
        };

        $scope.communityViewPath = 'sites/themouselanding/app-templates/router.html';

        communityService.communityOptions.style = {
            logoClass: 'mouse-landing-logo'
        };

        if(marketingService.popup) {
            marketingService.popup.text = 'Discover other Disneylanders';
            marketingService.popup.videoId = 'e0272e0qwgc';
        }

        $rootScope.$broadcast('communityControllerLoaded', this);
    }]);