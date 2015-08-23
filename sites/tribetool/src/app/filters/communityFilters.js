angular.module('app.Filters')
    .filter('excludeLoadedCommunity', ['communityService', function (communityService) {
        return function (input) {
            var communities = input;
            var finalCommunities = [];
            for(var i = 0; i < communities.length; i++) {
                var community = communities[i];
                if(!community.Redirect  && community.Id &&
                    !communityService.isEqualToCurrentCommunity(community)) {
                    finalCommunities.push(community);
                }
            }

            return finalCommunities;
        };
    }])
    .filter('excludeRedirectCommunities', ['communityService', function (communityService) {
        return function (input) {
            var communities = input;
            var finalCommunities = [];
            for(var i = 0; i < communities.length; i++) {
                var community = communities[i];
                if(!community.Redirect && community.Id) {
                    finalCommunities.push(community);
                }
            }

            return finalCommunities;
        };
    }])
    .filter('communityNameWithTopic', ['communityService', function (communityService) {
        return function (input) {
            var community = input;
            if(!community.Options || community.Name === community.Options.Topic) {
                return community.Name;
            }
            else {
                return community.Name + ' (' + community.Options.Topic + ')';
            }
        };
    }]);