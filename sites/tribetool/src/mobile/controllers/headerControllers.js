angular.module('app.Controllers')
    .controller('headerController', ['$scope', '$rootScope', '$timeout', 'modalService', 'notificationService', 'communityService', 'accountService', '$socket', 'commService', 'formatterService', 'socketService', function($scope, $rootScope, $timeout, modalService, notificationService, communityService, accountService, $socket, commService, formatterService, socketService) {

        $scope.communityService = communityService;

        $scope.initialized = function() {
        };

        $scope.recache = function() {
            socketService.recache();
        };

        var onCommunityChanged = function(community) {
            $scope.community = community;

            formatterService.updateMarkdownCommunityReferences();
            $scope.recache();
        };

        $rootScope.$on('communityChanged', function(event, community) {
            onCommunityChanged(community);
        });
        if(communityService.community) {
            onCommunityChanged(communityService.community);
        }



        $scope.recache();




    }]);