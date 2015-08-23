angular.module('cdefault.Controllers')
    .controller('cdefaultHomeController', ['$rootScope', '$scope', 'navigationService', function($rootScope, $scope, navigationService) {

        $scope.initialized = function() {

        };

        $scope.communityViewPath = 'sites/default/app-templates/router.html';

        $rootScope.$broadcast('communityControllerLoaded', this);
    }]);