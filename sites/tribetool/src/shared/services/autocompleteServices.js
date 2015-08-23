angular.module('app.Services')
    .factory('autoCompleteService', ['$rootScope', 'tagPageService', 'commService', 'navigationService', 'communityService', 'profileService', function($rootScope, tagPageService, commService, navigationService, communityService, profileService) {
        return {

            populateTerms: function(scope) {
                var i = 0;
                scope.terms = [];
                scope.data = [];

                if(scope.communities) {
                    for(i = 0; i < scope.communities.length; i++) {
                        var community = scope.communities[i];
                        // Don't include redirects
                        if(community.Redirect) {
                            continue;
                        }
                        this.addTerm(scope, community.Name, community.Url, null, 'community', 'fa-users', community);

                        // Include the community's topic if it's available and different than the name
                        if(community.Options && community.Options.Topic &&
                            community.Options.Topic.toLowerCase() !== community.Name.toLowerCase()) {
                            this.addTerm(scope, community.Options.Topic, community.Options.Topic + community.Url, null, 'community', 'fa-users', community);
                        }
                    }
                }
                if(scope.tagPages) {
                    for(i = 0; i < scope.tagPages.length; i++) {
                        var tagPage = scope.tagPages[i];
                        var tag = tagPage.Tag;
                        this.addTerm(scope, tag, tag, tagPage.MainImage ? tagPage.MainImage.Small.Url : null, 'tagpage', null, tagPage);
                    }
                }
                if(scope.maps) {
                    for(i = 0; i < scope.maps.length; i++) {
                        var map = scope.maps[i];
                        this.addTerm(scope, map.Name, map.Url, map.MainImage ? map.MainImage.Small.Url : null, 'map', null, map);
                    }
                }
                if(scope.accountCommunities) {
                    for(i = 0; i < scope.accountCommunities.length; i++) {
                        var accountCommunity = scope.accountCommunities[i];
                        var account = accountCommunity.Account;
                        if(account) {

                            var url = accountCommunity.ProfileImage ? accountCommunity.ProfileImage.Small.Url : null;
                            var fullName = profileService.getProfileFullName(account);

                            this.addTerm(scope, account.Username, account.Username, url, 'account', null, accountCommunity);

                            this.addTerm(scope, fullName, account.Username, url, 'account', null, accountCommunity);

                        }
                    }
                }
            },
            addTerm: function(scope, text, identifier, url, type, icon, item) {
                var term = identifier + type;
                if(!scope.data[term]) {
                    scope.terms.push(term);
                    scope.data[term] = {
                        term: term,
                        text: text,
                        url: url,
                        entities: [],
                        icon: icon
                    };
                }

                scope.data[term].entities.push({
                    identifier: identifier,
                    type: type,
                    item: item // AccountCommunityEntry, CommunityEntry, TagPageEntry, MapEntry etc
                });
            }
        };
    }]);