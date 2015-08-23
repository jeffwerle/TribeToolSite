angular.module('app.Controllers')
    .controller('selectPictureController', ['$scope', 'commService', 'modalService', function($scope, commService, modalService) {

        $scope.modalEntry = modalService.getOpenModal();

        $scope.cancel = function () {
            modalService.cancel($scope.modalEntry);
        };

        $scope.selectFileOptions = $scope.modalEntry.options;
        $scope.selectFileOptions.onSelected = function(imageFileEntry, imageFileComponentEntry) {
            modalService.ok($scope.modalEntry, {
                imageFileEntry: imageFileEntry,
                imageFileComponentEntry: imageFileComponentEntry
            });
        };
        $scope.selectFileOptions.onCancelled = function() {
            $scope.cancel();
        };
    }]);