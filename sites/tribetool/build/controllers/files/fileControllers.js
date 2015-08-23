angular.module('app.Controllers')
    .controller('selectFileController', ['$scope', 'commService', '$modalInstance', 'items', function($scope, commService, $modalInstance, items) {

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.selectFileOptions = items[0];
        $scope.selectFileOptions.onSelected = function(filEntry) {
            $modalInstance.close({
                filEntry: filEntry
            });
        };
        $scope.selectFileOptions.onCancelled = function() {
            $scope.cancel();
        };
    }]);