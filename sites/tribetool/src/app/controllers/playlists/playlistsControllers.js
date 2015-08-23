angular.module('app.Controllers')
    .controller('editPlaylistsController', ['$scope', 'commService', '$modalInstance', 'items', function($scope, commService, $modalInstance, items) {

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.editPlaylistsOptions = items[0];
        $scope.editPlaylistsOptions.onCancelled = function() {
            $scope.cancel();
        };
    }]);