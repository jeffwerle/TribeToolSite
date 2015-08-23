angular.module('cthemouselanding.Controllers')
    .controller('cthemouselandingPostController', ['$scope', '$location', 'postService', function($scope, $location, postService) {

        $scope.initialized = function() {
        };

        $scope.postService = postService;
    }]);