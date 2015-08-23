angular.module('app.Controllers')
    .controller('notificationController', ['$scope', 'commService', '$modalInstance', 'notificationService', 'items', function($scope, commService, $modalInstance, notificationService, items) {

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.options = items[0];
        $scope.notificationOptions = {
            onCancel: $scope.cancel,
            notificationCount: $scope.options.notificationCount
        };




    }]);