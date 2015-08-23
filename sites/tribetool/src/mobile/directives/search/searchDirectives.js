angular.module('app.Directives')
    .directive('searchPage', ['commService', 'searchService', 'headerService', 'profileService', 'postService', 'communityService', 'navigationService', 'route', '$timeout', function(commService, searchService, headerService, profileService, postService, communityService, navigationService, route, $timeout) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-show="processing"><loading></loading> Performing Search...</div>' +
                    '<div class="list">' +
                        '<div ng-show="(!items || items.length <= 0) && !processing">No Search Results</div>' +
                        '<a class="item item-thumbnail-left pointer" ng-repeat="item in items" ng-click="goToItem(item)">' +
                            '<img ng-src="{{item.imageUrl}}">' +
                            '<h2>{{item.title}}</h2>' +
                            '<p>{{item.description}}</p>' +
                        '</a>' +
                    '</div>' +
                '</div>',
            scope: {
            },
            controller: ['$scope', function($scope) {
                $scope.headerService = headerService;


                $scope.onStreamPageLoaded = function() {
                    if(route.routeParams.searchText)
                        headerService.options.searchText = route.routeParams.searchText;
                };
                $scope.onStreamPageLoaded();

                $scope.$on('router:streamPageLoaded', function() {
                    $scope.onStreamPageLoaded();
                });
            }],
            link: function (scope, element, attrs) {


                scope.goToItem = function(item) {
                    if(item.ItemType === 'Post') {
                        var post = item.Post;
                        navigationService.goToPost(post, communityService.community);
                    }
                    else if(item.ItemType === 'AccountCommunity') {
                        var accountUrl = navigationService.getProfileUrl(item.Account, communityService.community);
                        navigationService.goToPath(accountUrl);
                    }
                };

                scope.initiateSearch = function() {
                    scope.processing = false;
                    if(headerService.options.searchText.length >= 1) {
                        searchService.search(headerService.options.searchText, function(data) {
                            // Success
                            scope.items = data.SearchResult.Items;

                            for(var i = 0; i < scope.items.length; i++) {
                                var item = scope.items[i];
                                if(item.ItemType === 'AccountCommunity') {
                                    item.imageUrl = profileService.getProfilePictureUrl(item.AccountCommunity);
                                    item.title = profileService.getProfileFullName(item.Account);
                                    item.description = 'Level ' + item.AccountCommunity.Level.Level;
                                }
                                else if(item.ItemType === 'Post') {
                                    item.imageUrl = postService.getPostImage(item.Post);

                                    item.title = item.Post.Title;
                                    item.description = item.Post.Description;
                                }
                            }
                        }, function(data) {
                            // Failure
                            commService.showErrorAlert(data);
                        });
                    }
                };

                scope.timeoutIdPromise = null;
                scope.processing = false;
                scope.$watch('headerService.options.searchText', function(newValue) {
                    if(!newValue) {
                        return;
                    }
                    scope.processing = true;
                    if(scope.timeoutIdPromise)
                        $timeout.cancel(scope.timeoutIdPromise);
                    scope.timeoutIdPromise = $timeout(scope.initiateSearch, 1000);
                });
            }
        };
    }]);