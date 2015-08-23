angular.module('app.Controllers')
    .controller('friendRequestsController', ['$scope', 'commService', '$modalInstance', 'friendService', function($scope, commService, $modalInstance, friendService) {

        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.friendRequestOptions = {
            onCancel: $scope.cancel
        };

        // Get the pending friend requests
        $scope.loading = true;
        friendService.getPendingFriendRequests(/*populateRequesterData*/true,
            /*populateRecipientData*/false,
            function(data) {
                // Success
                $scope.friendRequests = data.RecipientFriendRequests;
                $scope.loading = false;
            }, function(data) {
                // Failure
                $scope.loading = false;
                commService.showErrorAlert(data);
            });

    }]);
