angular.module('cdefault.Controllers')
    .controller('cdefaultPostController', ['$scope', '$location', 'postService', function($scope, $location, postService) {

        $scope.initialized = function() {
        };

        $scope.postService = postService;
    }]);