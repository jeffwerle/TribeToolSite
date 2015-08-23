angular.module('app.Controllers')
    .controller('notificationsController', ['$scope', 'commService', 'modalService', function($scope, commService, modalService) {

        $scope.modalEntry = modalService.getOpenModal();

        $scope.cancel = function () {
            modalService.cancel($scope.modalEntry);
        };

        $scope.notificationOptions = {
            onCancel: $scope.cancel,
            onOkay: function() {
                modalService.ok($scope.modalEntry, {
                });
            },
            notificationCount: $scope.modalEntry.options.notificationCount
        };
    }]);