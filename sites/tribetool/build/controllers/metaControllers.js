angular.module('app.Controllers')
    .controller('metaController', ['$scope', '$routeParams', '$route', 'commService', 'metaService', function($scope, $routeParams, $route, commService, metaService) {
        metaService.initialize();
        var updatePrerenderInfo = function() {
            $scope.prerenderInfo = metaService.prerenderInfo;
        };
        metaService.registerStatusCallback(updatePrerenderInfo);

        var updateSocialInfo = function() {
            $scope.socialInfo = metaService.socialInfo;
        };
        metaService.registerSocialCallback(updateSocialInfo);

        updatePrerenderInfo();
        updateSocialInfo();

        $scope.$on('$routeChangeSuccess', function() {
            var metaData = metaService.getMetaDataFromCurrentRoute(/*fromCommunityPageLoaded*/false);
            if(metaData)
                $scope.setMetaData(metaData);
        });
        $scope.$on('communityPageLoaded', function(event, page) {
            $scope.setMetaData(metaService.getMetaDataFromCurrentRoute(/*fromCommunityPageLoaded*/true));
        });

        $scope.$on('$routeChangeStart', function() {
            metaService.setPrerenderInfo(null);
        });

        $scope.setMetaData = function(metaData) {
            if(metaData) {
                $scope.setTitle(metaData.title);
                $scope.setDescription(metaData.description);
                metaService.setSocialInfo(metaData.socialInfo);
                metaService.setOtherMetaData(metaData);
            }
        };

        $scope.setTitle = function(title) {
            metaService.setTitle(title);
        };
        $scope.setDescription = function(description) {
            metaService.setDescription(description);
        };


        $scope.socialLinksChanged = function() {
        };
    }]);