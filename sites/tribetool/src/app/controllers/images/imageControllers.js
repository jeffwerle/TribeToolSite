angular.module('app.Controllers')
    .controller('selectPictureController', ['$scope', 'commService', '$modalInstance', 'items', function($scope, commService, $modalInstance, items) {

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.selectFileOptions = items[0];
        $scope.selectFileOptions.onSelected = function(imageFileEntry, imageFileComponentEntry) {
            $modalInstance.close({
                imageFileEntry: imageFileEntry,
                imageFileComponentEntry: imageFileComponentEntry
            });
        };
        $scope.selectFileOptions.onCancelled = function() {
            $scope.cancel();
        };
    }]);