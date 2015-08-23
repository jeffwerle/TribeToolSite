angular.module('cmusictheorynotes.Controllers')
    .controller('cmusictheorynotesPostController', ['$scope', '$location', 'postService', function($scope, $location, postService) {

        $scope.initialized = function() {
        };

        $scope.postService = postService;
    }]);