angular.module('app.Directives')
    .directive('profilePage', ['imageService', 'profileService', '$routeParams', 'Lightbox', 'metaService', 'communityService', 'mediaService', 'headerService', '$timeout', 'profileDirectiveService', function (imageService, profileService, $routeParams, Lightbox, metaService, communityService, mediaService, headerService, $timeout, profileDirectiveService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="profileService.currentProfile">' +
                        '<div ng-if="mediaService.isPhone">' +
                            '<profile-page-header class="underneath-phone-header"></profile-page-header>' +
                            '<universal-search-bar ng-if="showSearchBar" id="universalSearchBar" class="nav-search-bar universal-search-bar phone-universal-search-bar"></universal-search-bar>' +

                            '<profile-page-router style="margin-top: 10px;"></profile-page-router>' +
                        '</div>' +
                        '<div ng-if="!mediaService.isPhone">' +
                            '<div class="col-sm-4">' +
                                '<profile-page-profile-picture></profile-page-profile-picture>' +

                                '<profile-left-sidebar></profile-left-sidebar>' +
                            '</div>' +
                            '<div class="col-sm-8">' +
                                '<profile-page-header></profile-page-header>' +
                                '<profile-page-router></profile-page-router>' +
                            '</div>' +
                            '<profile-tour></profile-tour>' +
                        '</div>' +
                    '</div>' +

                    '<div ng-show="!profileService.currentProfile">' +
                        '<loading></loading> Loading Profile...' +
                    '</div>' +
                '</div>',
            link: function (scope, element, attrs) {
                $timeout(function() {
                    scope.showSearchBar = mediaService.isPhone;
                    scope.$watch('mediaService.isPhone', function(newValue) {
                        scope.showSearchBar = mediaService.isPhone;
                    });
                });

                scope.profileService = profileService;
                scope.mediaService = mediaService;
                headerService.options.showSearchBar = !mediaService.isPhone;

                scope.onRouteChange = function() {
                    if(scope.$$destroyed) {
                        return;
                    }

                    headerService.options.showSearchBar = !mediaService.isPhone;
                    if($routeParams.image) {
                        imageService.getImage({
                            Id: $routeParams.image
                        }, function(data) {
                            // Only show the image if we're on the image owner's profile
                            if(data.ImageFileEntry.AccountId === profileService.currentProfile.Id) {
                                // Success--Show the image
                                Lightbox.openModal([{
                                    imageFileEntry: data.ImageFileEntry
                                }], /*index*/0);
                            }
                        }, function(data) {
                            // Failure
                        });
                    }
                };
                scope.onRouteChange();

                scope.$on('$routeChangeSuccess', function() {
                    scope.onRouteChange();
                });

                profileDirectiveService.initializeProfilePageScope(scope);

            }
        };
    }])
    .directive('profilePageHeader', ['$routeParams', 'profileService', 'accountService', 'mediaService', function ($routeParams, profileService, accountService, mediaService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<nav class="navbar navbar-default sub-navbar" style="margin-bottom: 0px;" role="navigation">' +
                        '<div>' +
                            '<div class="collapse navbar-collapse" collapse="isCollapsed">' +
                                '<div ng-if="mediaService.isPhone">' +
                                    '<a id="profileStreamHeader" ng-class="{ active: !profileRoute}" ng-href="{{profileUrl}}" class="navbar-mobile-item pointer" title="Profile"><i class="fa fa-newspaper-o"></i></a>' +
                                    '<a id="profileFriendsHeader" ng-class="{ active: profileRoute === \'friends\'}" ng-href="{{profileUrl}}/friends" class="navbar-mobile-item pointer" title="Friends"><i class="fa fa-users"></i></a>' +
                                    '<a id="profileImagesHeader" ng-show="isLoggedIn" ng-class="{ active: profileRoute === \'images\'}" ng-href="{{profileUrl}}/images" class="navbar-mobile-item pointer" title="Images"><i class="fa fa-picture-o"></i></a>' +
                                    '<a id="profileAchievementsHeader" ng-show="isLoggedIn" ng-class="{ active: profileRoute === \'achievements\'}" ng-href="{{profileUrl}}/achievements" class="navbar-mobile-item pointer" title="Achievements"><i class="fa fa-certificate"></i></a>' +
                                    '<a id="profileCommentsHeader" ng-class="{ active: profileRoute === \'comments\'}" ng-href="{{profileUrl}}/comments" class="navbar-mobile-item pointer" title="Comments"><i class="icon ion-chatbox"></i></a>' +
                                    '<a id="profilePinHeader" ng-class="{ active: profileRoute === \'pin\'}" ng-href="{{profileUrl}}/pin" class="navbar-mobile-item pointer" title="Pinned Items"><i class="fa fa-thumb-tack"></i></a>' +
                                    '<a id="profileCompatibilityHeader" ng-class="{ active: profileRoute === \'compatibility\'}" ng-href="{{profileUrl}}/compatibility" class="navbar-mobile-item pointer" title="Compatibility Questions"><i class="fa fa-puzzle-piece"></i></a>' +
                                '</div>' +

                                '<ul ng-if="!mediaService.isPhone" class="nav navbar-nav">' +

                                    '<li id="profileStreamHeader" ng-class="{ active: !profileRoute}"><a ng-href="{{profileUrl}}" class="pointer" title="Profile"><i class="fa fa-newspaper-o"></i></a></li>' +
                                    '<li id="profileFriendsHeader" ng-class="{ active: profileRoute === \'friends\'}"><a ng-href="{{profileUrl}}/friends" class="pointer" title="Friends"><i class="fa fa-users"></i></a></li>' +
                                    '<li id="profileImagesHeader" ng-class="{ active: profileRoute === \'images\'}" ng-show="isLoggedIn"><a ng-href="{{profileUrl}}/images" class="pointer" title="Images"><i class="fa fa-picture-o"></i></a></li>' +
                                    '<li id="profileAchievementsHeader" ng-class="{ active: profileRoute === \'achievements\'}" ng-show="isLoggedIn"><a ng-href="{{profileUrl}}/achievements" class="pointer" title="Achievements"><i class="fa fa-certificate"></i></a></li>' +
                                    '<li id="profileCommentsHeader" ng-class="{ active: profileRoute === \'comments\'}"><a ng-href="{{profileUrl}}/comments" class="pointer" title="Comments"><i class="icon ion-chatbox"></i></a></li>' +
                                    '<li id="profilePinHeader" ng-class="{ active: profileRoute === \'pin\'}"><a ng-href="{{profileUrl}}/pin" class="pointer" title="Board"><i class="fa fa-thumb-tack"></i></a></li>' +
                                    '<li id="profileCompatibilityHeader" ng-class="{ active: profileRoute === \'compatibility\'}"><a ng-href="{{profileUrl}}/compatibility" class="pointer" title="Compatibility Questions"><i class="fa fa-puzzle-piece"></i></a></li>' +

                                '</ul>' +
                            '</div>' +
                        '</div>' +
                    '</nav>' +
                '</div>',
            link: function (scope, element, attrs) {
                scope.mediaService = mediaService;
                scope.profileRoute = $routeParams.profileRoute;
                scope.profileUrl = profileService.getProfileUrl();
                scope.isSelfProfile = profileService.isSelfProfile();
                scope.isLoggedIn = accountService.isLoggedIn();
            }
        };
    }])
    .directive('profileLeftSidebar', ['profileService', 'accountService', 'communityService', '$timeout', 'navigationService', function (profileService, accountService, communityService, $timeout, navigationService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div class="profile-sidebar centered">' +
                        '<div ng-if="isSelfProfile" style="margin-bottom: 20px;">' +
                            '<div><a class="action-link" id="getReferralLink" ng-show="!showReferralLink" ng-click="showReferralLink = true;getReferral()">Get Referral Link</a></div>' +
                            '<div ng-show="showReferralLink">' +
                                '<div style="font-weight: bold;">Send this link to your friends to get an XP bonus when they sign-up!</div>' +
                                '<input id="referralLinkInput" ng-model="referralLink" readonly="true" />' +
                            '</div>' +
                        '</div>' +

                        '<div>' +
                            '<div ng-if="!isSelfProfile && accountCommunity.Compatibility.LowestPossibleCompatibility > 0" ng-click="compatibilityClicked()" class="pointer" style="margin-bottom: 5px;"><span class="bold">Compatibility</span> {{::accountCommunity.Compatibility.LowestPossibleCompatibility}}%</div>' +
                            '<div><label>Total XP</label> {{::accountCommunity.Level.XP}}</div>' +
                            '<div><label>XP to Next Level</label> {{::accountCommunity.Level.NextLevelXP - accountCommunity.Level.XP}}</div>' +
                        '</div>' +

                        '<profile-friend-request-area style="margin-top: 10px;" ng-if="!isSelfProfile"></profile-friend-request-area>' +

                        '<div ng-if="isLoggedIn && !isSelfProfile" class="centered" style="margin-top: 20px;">' +
                            '<div><i class="fa fa-envelope-o"></i></div>' +
                            '<a class="post-action-link" ng-href="/messages?newConversation={{::profile.Id}}">Send Message</a>' +
                        '</div>' +

                        '<div ng-if="!isInUserCommunity" class="centered" style="margin-top: 20px;">' +
                            '<div><i class="fa fa-users"></i></div>' +
                            '<a class="post-action-link" ng-href="{{userCommunityUrlFull}}">Go To {{profile | profileName}}\'s Community</a>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            link: function (scope, element, attrs) {
                scope.isSelfProfile = profileService.isSelfProfile();
                scope.profile = profileService.currentProfile;
                scope.isLoggedIn = accountService.isLoggedIn();
                scope.userCommunityUrl = profileService.getUserCommunityUrl();
                scope.userCommunityUrlFull = '/community/' + scope.userCommunityUrl;
                scope.isInUserCommunity = scope.userCommunityUrl.toLowerCase() === communityService.community.Url.toLowerCase();

                if(scope.isSelfProfile) {
                    $timeout(function() {
                        scope.inputField = element.find("#referralLinkInput");
                        scope.inputField.on('click', function () {
                            $(this).select();
                        });
                    });

                    scope.getReferral = function() {
                        $timeout(function() {
                            scope.inputField.select();
                        });
                    };
                    scope.referralLink = accountService.getReferralLink(communityService.community);
                }
                else {
                    scope.compatibilityClicked = function() {
                        navigationService.goToPath(navigationService.getCompatibilityUrl(scope.profile, communityService.community));
                    };
                }



            }
        };
    }])
    .directive('profilePageProfilePicture', ['profileDirectiveService', function (profileDirectiveService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div id="profilePageProfilePicture" class="centered">' +
                    '<h4>{{fullName}}</h4>' +
                    '<div ng-show="settingProfilePicture"><loading></loading> Setting Profile Picture...</div>' +
                    '<div ng-show="!settingProfilePicture">' +
                        '<file-dropzone disabled="!canChangeProfilePicture" file-options="fileDropzoneOptions" on-file-dropped="onFileDropped()">' +
                            '<div class="profile-picture-container">' +
                                '<img show-light-box="showLightBoxOptions" class="profile-picture" ng-src="{{profilePictureUrl | trusted}}" ng-click="profilePictureClicked()">' +

                                '<div id="profilePageProfilePictureProgress" class="profile-picture-width centered">' +
                                    '<profile-picture-level-progress class="" show-level="showLevel" account-community="accountCommunity"></profile-picture-level-progress>' +
                                    '<div style="font-weight: bold;">Level {{accountCommunity.Level.Level}}</div>' +

                                '</div>' +
                            '</div>' +

                            '<div ng-show="canChangeProfilePicture">' +
                                '<a ng-show="accountCommunity.ProfileImage" class="post-action-link" ng-click="changeProfilePicture()">Change Profile Picture</a>' +
                                '<a ng-show="!accountCommunity.ProfileImage" style="color: blue; font-weight: bolder; font-size:20px;" class="post-action-link" ng-click="changeProfilePicture()">Add Profile Picture</a>' +
                            '</div>' +
                        '</file-dropzone>' +

                    '</div>' +
                '</div>',
            link: function (scope, element, attrs) {
                profileDirectiveService.initializeProfilePageProfilePictureScope(scope);
            }
        };
    }])
    .directive('profilePageRouter', ['$routeParams', 'communityService', 'profileService', 'accountService', function ($routeParams, communityService, profileService, accountService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="!profileRoute">' +
                        '<profile-default-page></profile-default-page>' +
                    '</div>' +
                    '<div ng-if="profileRoute === \'achievements\'" && isLoggedIn>' +
                        '<profile-achievements-page></profile-achievements-page>' +
                    '</div>' +
                    '<div ng-if="profileRoute === \'friends\'">' +
                        '<profile-friends-page></profile-friends-page>' +
                    '</div>' +
                    '<div ng-if="profileRoute === \'comments\'">' +
                        '<profile-comments-page></profile-comments-page>' +
                    '</div>' +
                    '<div ng-if="profileRoute === \'images\' && isLoggedIn">' +
                        '<profile-images-page></profile-images-page>' +
                    '</div>' +
                    '<div ng-if="profileRoute === \'pin\'">' +
                        '<profile-pin-page></profile-pin-page>' +
                    '</div>' +
                    '<div ng-if="profileRoute === \'compatibility\'">' +
                        '<profile-compatibility-page></profile-compatibility-page>' +
                    '</div>' +
                '</div>',
            link: function (scope, element, attrs) {
                scope.isLoggedIn = accountService.isLoggedIn();
                scope.profileRoute = $routeParams.profileRoute;

                if(scope.profileRoute &&
                    scope.profileRoute !== 'achievements' &&
                    scope.profileRoute !== 'comments' &&
                    scope.profileRoute !== 'friends' &&
                    scope.profileRoute !== 'images' &&
                    scope.profileRoute !== 'pin' &&
                    scope.profileRoute !== 'compatibility')
                    scope.profileRoute = null;
            }
        };
    }])
    .directive('profileDefaultPage', ['$routeParams', 'communityService', 'profileService', 'accountService', 'mediaService', function ($routeParams, communityService, profileService, accountService, mediaService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="mediaService.isPhone">' +
                        '<profile-page-profile-picture></profile-page-profile-picture>' +
                        '<profile-left-sidebar></profile-left-sidebar>' +
                    '</div>' +
                    '<stream class="col-xs-12"></stream>' +
                    '<div ng-if="!isLoggedIn" class="centered">' +
                        '<h3>We want to see {{fullName}}\'s profile too! Login now to check it out <happy-face></happy-face></h3>' +
                        '<sign-up-inline></sign-up-inline>' +
                    '</div>' +
                '</div>',
            link: function (scope, element, attrs) {
                scope.mediaService = mediaService;
                scope.fullName = profileService.getProfileFullName(profileService.currentProfile);
                scope.username = profileService.currentProfile.Username;
                scope.accountCommunity = profileService.accountCommunity;
                scope.profilePictureUrl = scope.accountCommunity && scope.accountCommunity.ProfileImage ? scope.accountCommunity.ProfileImage.Url : 'images/silhouette-medium.png';
                scope.isLoggedIn = accountService.isLoggedIn();
            }
        };
    }])
    .directive('profileAchievementsPage', ['$routeParams', '$timeout', 'achievementService', 'profileService', 'commService', 'navigationService', 'communityService', function ($routeParams, $timeout, achievementService, profileService, commService, navigationService, communityService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<h3 class="centered">{{fullName}}\'s {{communityName}} Achievements</h3>' +
                    '<div ng-show="processing">' +
                        '<loading></loading> Loading Achievements...' +
                    '</div>' +
                    '<div ng-show="!processing">' +
                        '<div ng-repeat="achievement in achievements" class="achievement-well">' +
                            '<achievement achievement="achievement"></achievement>' +
                            '<div class="clearfix"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            link: function (scope, element, attrs) {
                scope.communityName = communityService.getNameWithoutThe();
                scope.fullName = profileService.getProfileFullName(profileService.currentProfile);

                // Get the achievements
                scope.processing = true;
                achievementService.getAchievements(profileService.currentProfile, function(data) {
                    // Success
                    scope.achievements = data.Achievements;

                    if($routeParams.achievement) {
                        $timeout(function() {
                            navigationService.scrollToAchievement($routeParams.achievement);
                        });
                    }
                    scope.processing = false;
                }, function(data) {
                    // Failure
                    scope.processing = false;
                    commService.showErrorAlert(data);
                });
            }
        };
    }])
    .directive('profileImagesPage', ['commentService', 'communityService', 'profileService', 'commService', 'accountService', function (commentService, communityService, profileService, commService, accountService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<h3 class="centered">{{fullName}}\'s {{communityName}} Images</h3>' +
                    '<div ng-show="processing">' +
                        '<loading></loading> Loading Images...' +
                    '</div>' +
                    '<div ng-show="!processing">' +
                        '<button ng-show="isSelfProfile" class="btn btn-primary pull-right" type="button" ng-click="imageButtonClicked()"><i class="fa fa-picture-o"></i> Edit Images</button>' +
                        '<album-stack album-stack="accountCommunity.AlbumStack"></album-stack>' +
                    '</div>' +
                '</div>',
            link: function (scope, element, attrs) {
                scope.isLoggedIn = accountService.isLoggedIn();
                if(!scope.isLoggedIn) {
                    return;
                }

                scope.fullName = profileService.getProfileFullName(profileService.currentProfile);
                scope.isSelfProfile = profileService.isSelfProfile();
                scope.communityName = communityService.getNameWithoutThe();
                scope.accountCommunity = profileService.accountCommunity;


                scope.imageButtonClicked = function() {
                    var onSelect = function(imageFileEntry, imageFileComponentEntry) {

                    };
                    // Uploading image to account
                    profileService.selectPicture(onSelect, /*allowImageSizeSelection*/ false,
                        /*selectUploadedImage*/false,
                        /*albumType*/'Any');
                };
            }
        };
    }])
    .directive('profileCommentsPage', ['commentService', 'communityService', 'profileService', 'commService', '$timeout', 'accountService', function (commentService, communityService, profileService, commService, $timeout, accountService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="isLoggedIn">' +
                        '<h3 style="text-align: center;">{{fullName}}\'s {{communityName}} Comments</h3>' +
                        '<div ng-if="comments.length > 0">' +
                            '<div id="commentsContainer" infinite-scroll="getMoreComments()" infinite-scroll-disabled="scrollingDone || processing" infinite-scroll-distance="1">' +
                                '<div ng-repeat="comment in comments">' +
                                    '<comment-entry ng-if="!comment.IsTrashed" use-comment-well="true" comment="comment" options="comment.commentOptions" disable-interaction="true"></comment-entry>' +
                                    '<div class="clearfix"></div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div ng-if="!processing && comments.length <= 0">' +
                            '<div>{{fullName}} hasn\'t yet made any comments in the {{communityName}} community.</div>' +
                        '</div>' +

                        '<div ng-show="processing">' +
                            '<loading></loading> Loading Comments...' +
                        '</div>' +
                    '</div>' +

                    '<div ng-if="!isLoggedIn" class="centered">' +
                        '<h3>We want to see {{fullName}}\'s comments too! Login now to check them out <happy-face></happy-face></h3>' +
                        '<sign-up-inline></sign-up-inline>' +
                    '</div>' +
                '</div>',
            link: function (scope, element, attrs) {
                scope.isLoggedIn = accountService.isLoggedIn();
                if(!scope.isLoggedIn) {
                    return;
                }

                scope.communityName = communityService.getNameWithoutThe();
                scope.fullName = profileService.getProfileFullName(profileService.currentProfile);
                scope.pageNumber = 1;
                scope.countPerPage = 10;
                scope.scrollingDone = false;
                scope.serviceRetrievalDone = scope.scrollingDone;
                scope.commentsCache = [];
                scope.comments = [];
                var countToLoadFromCache = 3;

                scope.getMoreComments = function() {
                    if(scope.processing || scope.scrollingDone) {
                        return;
                    }

                    var pullFromCache = function() {
                        // Retrieve the items from the cache
                        var cacheLength = scope.commentsCache.length;
                        for(var i = 0; i < cacheLength && i < countToLoadFromCache; i++) {
                            scope.comments.push(scope.commentsCache.shift());
                        }
                        if(scope.commentsCache.length <= 0 && scope.serviceRetrievalDone) {
                            scope.scrollingDone = true;
                        }
                    };

                    if(scope.commentsCache.length < countToLoadFromCache && !scope.serviceRetrievalDone) {
                        scope.processing = true;
                        commentService.getComments(scope.pageNumber, scope.countPerPage,
                            profileService.currentProfile.Id,
                            function(data) {
                                // Success


                                if(data.Comments && data.Comments.length > 0)
                                {
                                    for(var i = 0; i < data.Comments.length; i++) {
                                        var comment = data.Comments[i];
                                        comment.commentOptions = commentService.getCommentOptions(comment);
                                    }

                                    scope.commentsCache = scope.commentsCache.concat(data.Comments);
                                }

                                scope.serviceRetrievalDone = !data.Comments || data.Comments.length < scope.countPerPage;
                                pullFromCache();

                                $timeout(function() {
                                    scope.processing = false;
                                });

                                scope.pageNumber++;

                            }, function(data) {
                                // Failure
                                commService.showErrorAlert(data);
                            });
                    }
                    else {
                        scope.processing = true;
                        $timeout(function() {
                            pullFromCache();
                            scope.processing = false;
                        });
                    }
                };
                scope.getMoreComments();

            }
        };
    }])
    .directive('profilePinPage', ['pinService', 'communityService', 'profileService', 'commService', '$timeout', 'accountService', '$routeParams', function (pinService, communityService, profileService, commService, $timeout, accountService, $routeParams) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="isLoggedIn">' +
                        '<h3 style="text-align: center;">{{fullName}}\'s {{communityName}} Board</h3>' +

                        '<div ng-if="isSelfProfile" class="pin-well">' +
                            '<div ng-show="!pinning">' +
                                '<form ng-submit="pin()">' +
                                    '<content-editor is-required="true" show-toolbar="false" options="formattingHelperOptions" text="pinnedItem.formattedText" placeholder="\'What would you like to pin?\'"></content-editor>' +
                                    '<button class="btn btn-primary pull-right" type="submit">Pin</button>' +
                                '</form>' +
                            '</div>' +
                            '<div ng-show="pinning"><loading></loading> Pinning...</div>' +
                            '<div class="clearfix"></div>' +
                        '</div>' +


                        '<div infinite-scroll="getMorePinnedItems()" infinite-scroll-disabled="scrollingDone || processing" infinite-scroll-distance="1">' +
                            '<div ng-repeat="pinnedItem in pinnedItems">' +
                                '<pinned-item pinned-item="pinnedItem"></pinned-item>' +
                                '<div class="clearfix"></div>' +
                            '</div>' +
                        '</div>' +
                        '<div ng-if="!processing && pinnedItems.length <= 0">' +
                            '<div>{{fullName}} hasn\'t yet pinned anything in the {{communityName}} community.</div>' +
                        '</div>' +

                        '<div ng-show="processing">' +
                            '<loading></loading> Loading Pinned Items...' +
                        '</div>' +

                    '</div>' +

                    '<div ng-if="!isLoggedIn" class="centered">' +
                        '<h3>We want to see {{fullName}}\'s pinned items too! Login now to check them out <happy-face></happy-face></h3>' +
                        '<sign-up-inline></sign-up-inline>' +
                    '</div>' +
                '</div>',
            link: function (scope, element, attrs) {
                scope.isSelfProfile = profileService.isSelfProfile();
                scope.isLoggedIn = accountService.isLoggedIn();
                if(!scope.isLoggedIn) {
                    return;
                }

                scope.pinnedItem = {
                    formattedText: '',
                    type: 'Other'
                };

                scope.formattingHelperOptions = {
                    markdownOptions: {
                        infobox: false
                    },
                    autofocus: false
                };

                scope.pin = function() {
                    scope.pinning = true;
                    pinService.pinItem(scope.pinnedItem, function(data) {
                        // Success
                        scope.pinnedItem.formattedText = '';

                        // Insert the PinnedItem at the top
                        scope.pinnedItems.splice(0, 0, data.PinnedItems[0]);

                        scope.pinning = false;
                        scope.formattingHelperOptions.hidePreview();
                    }, function(data) {
                        // Failure
                        commService.showErrorAlert(data);
                        scope.pinning = false;
                    });
                };

                scope.communityName = communityService.getNameWithoutThe();
                scope.fullName = profileService.getProfileFullName(profileService.currentProfile);
                scope.pageNumber = 1;
                scope.countPerPage = 10;
                scope.scrollingDone = false;
                scope.serviceRetrievalDone = scope.scrollingDone;
                scope.pinnedItemsCache = [];
                scope.pinnedItems = [];
                var countToLoadFromCache = 3;

                scope.getMorePinnedItems = function() {
                    if(scope.processing || scope.scrollingDone) {
                        return;
                    }

                    var pullFromCache = function() {
                        // Retrieve the items from the cache
                        var cacheLength = scope.pinnedItemsCache.length;
                        for(var i = 0; i < cacheLength && i < countToLoadFromCache; i++) {
                            var pinnedItem = scope.pinnedItemsCache.shift();

                            // Does our collection already have the item?
                            var alreadyContained = false;
                            for(var j = 0; j < scope.pinnedItems.length; j++) {
                                if(scope.pinnedItems[j].Id === pinnedItem.Id) {
                                    // Don't add it
                                    alreadyContained = true;
                                    break;
                                }
                            }
                            if(!alreadyContained)
                                scope.pinnedItems.push(pinnedItem);
                        }
                        if(scope.pinnedItemsCache.length <= 0 && scope.serviceRetrievalDone) {
                            scope.scrollingDone = true;
                        }
                    };

                    if(scope.pinnedItemsCache.length < countToLoadFromCache && !scope.serviceRetrievalDone) {
                        scope.processing = true;
                        pinService.getPinnedItems(scope.pageNumber, scope.countPerPage,
                            profileService.currentProfile.Id,
                            function(data) {
                                // Success


                                if(data.PinnedItems && data.PinnedItems.length > 0)
                                    scope.pinnedItemsCache = scope.pinnedItemsCache.concat(data.PinnedItems);

                                scope.serviceRetrievalDone = !data.PinnedItems || data.PinnedItems.length < scope.countPerPage;
                                pullFromCache();

                                $timeout(function() {
                                    scope.processing = false;
                                });

                                scope.pageNumber++;

                            }, function(data) {
                                // Failure
                                commService.showErrorAlert(data);
                                scope.processing = false;
                            });
                    }
                    else {
                        scope.processing = true;
                        $timeout(function() {
                            pullFromCache();
                            scope.processing = false;
                        });
                    }
                };
                if($routeParams.pinnedItem) {
                    // Get the pinned item
                    scope.processing = true;
                    pinService.getPinnedItem($routeParams.pinnedItem, function(data) {
                        // Success
                        scope.pinnedItems.push(data.PinnedItems[0]);

                        scope.processing = false;
                        $timeout(function() {
                            scope.getMorePinnedItems();
                        });
                    }, function(data) {
                        // Failure
                        commService.showErrorAlert(data);
                        scope.processing = false;
                        $timeout(function() {
                            scope.getMorePinnedItems();
                        });
                    });
                }
                else {
                    scope.getMorePinnedItems();
                }


            }
        };
    }])
    .directive('profileFriendsPage', ['friendService', 'commService', 'profileService', 'communityService', function (friendService, commService, profileService, communityService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<h3 class="centered">{{fullName}}\'s {{communityName}} Friends</h3>' +
                    '<div ng-show="processing">' +
                        '<loading></loading> Loading Friends...' +
                    '</div>' +
                    '<div ng-show="!processing">' +
                        '<div ng-if="friends && friends.length > 0">' +
                            '<div ng-repeat="friend in friends" class="friend-preview-well col-sm-3 centered">' +
                                '<friend friend-account-community="friend" friend-account="friend.Account"></friend>' +
                                '<div class="clearfix"></div>' +
                            '</div>' +
                        '</div>' +
                        '<div ng-if="!friends || friends.length <= 0" style="margin-top: 20px;">' +
                            '<div ng-show="isSelfProfile">You haven\'t yet made any friends in the {{communityName}} community. <a href="/community">Find some friends in the community!</a></div>' +
                            '<div ng-show="!isSelfProfile">{{fullName}} hasn\'t yet sent any friend requests in the {{communityName}} community.</div>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            link: function (scope, element, attrs) {
                scope.isSelfProfile = profileService.isSelfProfile();
                scope.communityName = communityService.getNameWithoutThe();
                scope.fullName = profileService.getProfileFullName(profileService.currentProfile);
                friendService.getFriends(profileService.currentProfile.Id,
                    function(data) {
                        // Success
                        scope.friends = data.Friends;
                        for(var i = 0; i < scope.friends.length; i++) {
                            var friend = scope.friends[i];
                            friend.Account.AccountCommunity = friend;
                        }
                    }, function(data) {
                        // Failure
                        commService.showErrorAlert(data);
                    });
            }
        };
    }])
    .directive('profileCompatibilityPage', ['compatibilityService', 'commService', 'profileService', 'communityService', 'navigationService', 'accountService', function (compatibilityService, commService, profileService, communityService, navigationService, accountService) {
        var viewBestMatchesHtml = '<div class="centered">' +
                '<button class="btn btn-primary" ng-click="goToMatches()">View Best Matches</button>' +
            '</div>';
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="isLoggedIn">' +
                        '<div ng-if="isSelfProfile">' +
                            '<h3 class="centered">Your {{topic}} Compatibility Questions</h3>' +
                            viewBestMatchesHtml +
                            '<compatibility-questionnaire style="margin-top: 5px;"></compatibility-questionnaire>' +
                        '</div>' +
                        '<div ng-if="!isSelfProfile">' +
                            '<h3 class="centered">{{fullName}}\'s {{topic}} Compatibility</h3>' +
                            viewBestMatchesHtml +
                            '<compatibility-comparison style="margin-top: 5px;"></compatibility-comparison>' +
                        '</div>' +
                    '</div>' +


                    '<div ng-if="!isLoggedIn" class="centered">' +
                        '<h3>We want to see your compatibility with {{fullName}} too! Login now to check it out <happy-face></happy-face></h3>' +
                        '<sign-up-inline></sign-up-inline>' +
                    '</div>' +
                '</div>',
            link: function (scope, element, attrs) {
                scope.isLoggedIn = accountService.isLoggedIn();
                scope.isSelfProfile = profileService.isSelfProfile();
                scope.topic = communityService.community.Options.Topic;
                scope.communityName = communityService.getNameWithoutThe();
                scope.fullName = profileService.getProfileFullName(profileService.currentProfile);

                scope.goToMatches = function() {
                    navigationService.goToPath('/compatibility');
                };
            }
        };
    }]);