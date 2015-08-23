angular.module('app.Controllers')
    .controller('footerController', ['$scope', '$rootScope', 'communityService', function($scope, $rootScope, communityService) {

        $scope.updateLinks = function() {
            $scope.facebookLink = 'https://www.facebook.com/TribeTool';
            $scope.twitterLink = 'https://twitter.com/tribetool';
            $scope.youtubeLink = 'https://www.youtube.com/channel/UCPGrSPqamhANwMZanacBY5Q';
            $scope.googlePlusLink = 'https://plus.google.com/+TribeToolSite';
            $scope.instagramLink = null;//'https://instagram.com/TribeTool_Disneyland';

            var community = communityService.community;
            if(community && community.Options) {
                if(community.Options.FacebookUrl) {
                    $scope.facebookLink = community.Options.FacebookUrl;
                }
                if(community.Options.TwitterUrl) {
                    $scope.twitterLink = community.Options.TwitterUrl;
                }
                if(community.Options.YouTubeUrl) {
                    $scope.youtubeLink = community.Options.YouTubeUrl;
                }
                if(community.Options.GooglePlusUrl) {
                    $scope.googlePlusLink = community.Options.GooglePlusUrl;
                }
                if(community.Options.InstagramUrl) {
                    $scope.instagramLink = community.Options.InstagramUrl;
                }

            }
        };

        $rootScope.$on('communityChanged', function(event, community) {
            $scope.updateLinks();
        });
        $scope.updateLinks();

    }]);