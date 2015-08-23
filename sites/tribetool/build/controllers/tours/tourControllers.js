angular.module('app.Controllers')
    .controller('communityTourController', ['$scope', '$timeout', 'communityService', 'tourService', 'accountService', 'mediaService', function($scope, $timeout, communityService, tourService, accountService, mediaService) {

        // Don't do tours on mobile
        if(mediaService.isPhone) {
            return;
        }


        $scope.communityTourName = 'community';
        $scope.videoTourName = 'video';

        $scope.createCommunityTour = function() {
            if($scope.resetCommunityTourOptions()) {
                $timeout(function() {
                    $scope.startCommunityTour();
                });
                return true;
            }

            return false;
        };

        $scope.monitorTourStart = function() {
            $scope.$on('postsSet', function(event, posts) {
                $timeout(function() {
                    if(!tourService.isTourCompleted($scope.communityTourName)) {
                        if($scope.createCommunityTour())
                            return;
                    }

                    if(!tourService.isTourCompleted($scope.videoTourName)) {
                        // Either the community tour is already done or we are not
                        // in a positition to create the community tour
                        // Attempt the video tour
                        if($scope.resetVideoTourOptions()) {
                            $timeout(function() {
                                $scope.startVideoTour();
                            });
                        }
                    }
                });
            });
        };

        if(accountService.account &&
            (!tourService.isTourCompleted($scope.communityTourName) ||
                !tourService.isTourCompleted($scope.videoTourName))) {
            $scope.monitorTourStart();
        }
        else if(!accountService.account) {
            $scope.$on('sessionCreate', function(event, account) {
                if(!tourService.isTourCompleted($scope.communityTourName) ||
                    !tourService.isTourCompleted($scope.videoTourName))
                    $scope.monitorTourStart();
            });
        }

        $scope.completeVideoTour = function() {
            tourService.completeTour($scope.videoTourName);
        };

        $scope.videoCompletedEvent = function () {
            $scope.completeVideoTour();
        };

        $scope.videoExitEvent = function () {
            $scope.completeVideoTour();
        };

        $scope.completeCommunityTour = function() {
            tourService.completeTour($scope.communityTourName);
        };

        $scope.communityCompletedEvent = function () {
            $scope.completeCommunityTour();
        };

        $scope.communityExitEvent = function () {
            $scope.completeCommunityTour();
        };


        $scope.resetCommunityTourOptions = function() {
            var postSummaryContainer = $('.post-summary-container');

            var steps = [];

            if(postSummaryContainer.length > 0) {
                steps.push({
                    element: postSummaryContainer[0],
                    intro: 'Welcome to the ' + communityService.getNameWithoutThe() + ' community!</br></br>This is a post. Posts are shared with the entire community and can be viewed by anyone.'
                });

                steps.push({
                    element: postSummaryContainer.find('.vote-mechanism')[0],
                    intro: 'You can click on the up arrow to vote up a post. Vote up a post if you think others should see it.',
                    position: 'right'
                });

                steps.push({
                    element: postSummaryContainer.find('.emotion-vote-mechanism')[0],
                    intro: 'The smileys indicate how the community feels about a post. Click on the appropriate emotion to indicate how the post makes you feel :)'
                });

                var tagPicture = $('.tag-picture');
                if(tagPicture.length > 0) {
                    steps.push({
                        element: tagPicture[0],
                        intro: 'Here you can see the topics tagged in this post.',
                        position: 'left'
                    });
                }

            }
            else {
                // no posts--don't do the tour
                return false;
            }

            steps.push({
                element: '#submitNewPostButton',
                intro: 'Click here to submit a new post to the community.',
                position: 'right'
            });

            steps.push({
                element: '#universalSearchBar',
                intro: 'Finally, you can search for hashtags, people, and communities here.</br></br>And that\'s all for this page, folks!'
            });

            $scope.communityIntroOptions = tourService.getTourOptions(steps);
            return true;
        };

        // video-container
        // video-play-link
        //
        $scope.resetVideoTourOptions = function() {
            var videoContainer = $('.video-container');

            var steps = [];

            if(videoContainer.length > 0) {

                steps.push({
                    element: '#toolbar',
                    intro: 'Your video player will open when you start a video. Continue browsing on the site like normal while the video keeps playing.',
                    position: 'top'
                });

                var playLink = videoContainer.find('.video-play-link');
                steps.push({
                    element: playLink[0],
                    intro: 'Click "Play" below any video to play the video while browsing the site.',
                    position: 'right'
                });

                var addToQueueLink = videoContainer.find('.video-add-to-queue-link');
                steps.push({
                    element: addToQueueLink[0],
                    intro: 'Click "Add To Queue" to add the video to your playlist.',
                    position: 'right'
                });


            }
            else {
                // no videos--don't do the tour
                return false;
            }

            $scope.videoIntroOptions = tourService.getTourOptions(steps);
            return true;
        };

        $timeout(function() {
            $scope.communityCallbacks = {
                onStartTour: $scope.createCommunityTour
            };
            tourService.callbacks.push($scope.communityCallbacks);
            $scope.$on('$destroy', function() {
                tourService.removeCallback($scope.communityCallbacks);
            });
        });



    }])
    .controller('postTourController', ['$scope', '$timeout', 'communityService', 'tourService', 'accountService', 'mediaService', function($scope, $timeout, communityService, tourService, accountService, mediaService) {

        // Don't do tours on mobile
        if(mediaService.isPhone) {
            return;
        }

        $scope.tourName = 'post';

        $scope.createTour = function() {
            $timeout(function() {
                if($scope.resetOptions()) {
                    $timeout(function() {
                        $scope.startTour();
                    });
                }

            });
        };

        if(accountService.account && !tourService.isTourCompleted($scope.tourName)) {
            $scope.createTour();
        }
        else if(!accountService.account) {
            $scope.$on('sessionCreate', function(event, account) {
                if(!tourService.isTourCompleted($scope.tourName))
                    $scope.monitorTourStart();
            });
        }



        $scope.completeTour = function() {
            tourService.completeTour($scope.tourName);
        };

        $scope.completedEvent = function () {
            $scope.completeTour();
        };

        $scope.exitEvent = function () {
            $scope.completeTour();
        };

        $scope.changeEvent = function (targetElement) {
        };

        $scope.beforeChangeEvent = function (targetElement) {
        };

        $scope.afterChangeEvent = function (targetElement) {
        };

        $scope.resetOptions = function() {
            var postContentWell = $('.post-content-container');
            var steps = [];

            if(postContentWell.length > 0) {
                /*
                steps.push({
                    element: postContentWell[0],
                    intro: 'Here are the post contents. This is what everyone\'s talking about!'
                });
                */
                var postContentTagArea = postContentWell.find('.post-content-tag-area');
                if(postContentTagArea.length > 0) {
                    steps.push({
                        element: postContentTagArea[0],
                        intro: 'These are the hashtags mentioned in the post. Vote on which are most applicable to the post.'
                    });
                }

                steps.push({
                    element: $('.comment-input-container')[0],
                    intro: 'Reply to the post here. Your comment will show up below.'
                });

                var comments = $('.comment-entry');
                if(comments.length > 0) {
                    var replyLink = comments.find('.comment-reply-link');
                    steps.push({
                        element: replyLink[0],
                        intro: 'Reply directly to a comment by clicking here.',
                        position: 'right'
                    });

                    var quoteLink = comments.find('.comment-quote-link');
                    if(quoteLink.length > 0) {
                        steps.push({
                            element: quoteLink[0],
                            intro: 'Click "Quote" to include the quoted comment in your comment.',
                            position: 'right'
                        });
                    }

                    var permalinkLink = comments.find('.comment-permalink-link');
                    steps.push({
                        element: permalinkLink[0],
                        intro: 'Click "Permalink" to get the URL of the comment that you can share.',
                        position: 'right'
                    });
                }
                else {
                    // No comments--we won't do the tour;
                    return false;
                }



                steps.push({
                    element: '#postVoteMechanism',
                    intro: 'Click on the up arrow to vote up this post. Vote up a post if you think others should see it.',
                    position: 'right'
                });

            }
            else {
                // No post well
                return false;
            }

            $scope.introOptions = tourService.getTourOptions(steps);
            return true;
        };

        $timeout(function() {
            tourService.subscribeToCallbacks($scope);
        });

    }])
    .controller('streamTourController', ['$scope', '$timeout', 'communityService', 'tourService', 'accountService', 'mediaService', function($scope, $timeout, communityService, tourService, accountService, mediaService) {
        // Don't do tours on mobile
        if(mediaService.isPhone) {
            return;
        }

        $scope.tourName = 'stream';

        $scope.createTour = function() {
            $timeout(function() {
                if($scope.resetOptions()) {
                    $timeout(function() {
                        $scope.startTour();
                    });
                }
            });
        };
        $scope.monitorTourStart = function() {
            $scope.$on('streamRetrieved', function(event, streamItems) {
                $scope.createTour();
            });
        };

        if(accountService.account && !tourService.isTourCompleted($scope.tourName)) {
            $scope.monitorTourStart();
        }
        else if(!accountService.account) {
            $scope.$on('sessionCreate', function(event, account) {
                if(!tourService.isTourCompleted($scope.tourName))
                    $scope.monitorTourStart();
            });
        }

        $scope.completeTour = function() {
            tourService.completeTour($scope.tourName);
        };

        $scope.completedEvent = function () {
            $scope.completeTour();
        };

        $scope.exitEvent = function () {
            $scope.completeTour();
        };

        $scope.resetOptions = function() {
            var steps = [];

            var statuses = $('.status-entry');
            if(statuses.length <= 0)
                return false;

            steps.push({
                element: statuses[0],
                intro: 'Welcome to the Stream!</br></br>Statuses are used to share with only your friends in the community.'
            });

            var replyLink = statuses.find('.status-reply-link');
            steps.push({
                element: replyLink[0],
                intro: 'Reply directly to a status by clicking here.',
                position: 'right'
            });

            var permalinkLink = statuses.find('.status-permalink-link');
            steps.push({
                element: permalinkLink[0],
                intro: 'Click "Permalink" to get the URL of the status that you can share.',
                position: 'right'
            });

            var statusInput = $('.status-input');
            steps.push({
                element: statusInput[0],
                intro: 'Write your own status for your friends to see.'
            });


            $scope.introOptions = tourService.getTourOptions(steps);
            return true;
        };

        $timeout(function() {
            tourService.subscribeToCallbacks($scope);
        });

    }])
    .controller('profileTourController', ['$scope', '$timeout', 'communityService', 'tourService', 'accountService', 'mediaService', function($scope, $timeout, communityService, tourService, accountService, mediaService) {

        // Don't do tours on mobile
        if(mediaService.isPhone) {
            return;
        }

        $scope.tourName = 'profile';


        $scope.createTour = function() {
            $timeout(function() {
                if($scope.resetOptions()) {
                    $timeout(function() {
                        $scope.startTour();
                    });
                }

            });
        };

        if(accountService.account && !tourService.isTourCompleted($scope.tourName)) {
            $scope.createTour();
        }
        else if(!accountService.account) {
            $scope.$on('sessionCreate', function(event, account) {
                if(!tourService.isTourCompleted($scope.tourName))
                    $scope.createTour();
            });
        }

        $scope.completeTour = function() {
            tourService.completeTour($scope.tourName);
        };

        $scope.completedEvent = function () {
            $scope.completeTour();
        };

        $scope.exitEvent = function () {
            $scope.completeTour();
        };

        $scope.resetOptions = function() {
            var steps = [];

            // Ensure that we're on the profile stream before giving the tour
            var statusInput = $('.status-input');
            if(statusInput.length <= 0)
                return false;

            steps.push({
                element: '#profilePageProfilePicture',
                intro: 'Welcome to a profile! All profiles are specific to the current community. This one\'s for ' + communityService.community.Name + '!'
            });

            steps.push({
                element: '#profilePageProfilePictureProgress',
                intro: 'Everyone has a level. Higher levels mean that you\'re more active in the community.'
            });

            steps.push({
                element: statusInput[0],
                intro: 'Write on someone\'s profile here. These statuses will show up in the stream.'
            });

            steps.push({
                element: '#getReferralLink',
                intro: 'Use this link to share the community with your friends and get an XP bonus.'
            });


            steps.push({
                element: '#profileFriendsHeader',
                intro: 'Check out the profiles\' friends in the ' + communityService.getNameWithoutThe() + ' community here.'
            });

            steps.push({
                element: '#profileImagesHeader',
                intro: 'Pictures uploaded by the profile can be found here.'
            });


            $scope.introOptions = tourService.getTourOptions(steps);
            return true;
        };

        $timeout(function() {
            tourService.subscribeToCallbacks($scope);
        });

    }])
    .controller('tagPageTourController', ['$scope', '$timeout', 'communityService', 'tourService', 'accountService', 'mediaService', function($scope, $timeout, communityService, tourService, accountService, mediaService) {

        // Don't do tours on mobile
        if(mediaService.isPhone) {
            return;
        }

        $scope.tourName = 'tagpage';

        $scope.createTour = function(tourName) {
            if(tourName && $scope.tourName !== tourName) {
                return;
            }

            $timeout(function() {
                if($scope.resetOptions()) {
                    $timeout(function() {
                        $scope.startTour();
                    });
                }

            });
        };

        if(accountService.account && !tourService.isTourCompleted($scope.tourName)) {
            $scope.createTour();
        }
        else if(!accountService.account) {
            $scope.$on('sessionCreate', function(event, account) {
                if(!tourService.isTourCompleted($scope.tourName))
                    $scope.createTour();
            });
        }


        $scope.completeTour = function() {
            tourService.completeTour($scope.tourName);
        };

        $scope.completedEvent = function () {
            $scope.completeTour();
        };

        $scope.exitEvent = function () {
            $scope.completeTour();
        };

        $scope.resetOptions = function() {
            var steps = [];



            steps.push({
                element: $('.tag-page-title-tag')[0],
                intro: 'Welcome to a Tag Page! These pages are used to organize information in the ' + communityService.getNameWithoutThe() + ' community.'
            });

            var tableOfContents = $('.wiki-page-table-of-contents');
            if(tableOfContents.length <= 0)
                return false;
            steps.push({
                element: tableOfContents[0],
                intro: 'Much like a Wikipedia page, you can navigate the Tag Page using the table of contents.',
                position: 'right'
            });

            steps.push({
                element: '#playlistsContainer',
                intro: 'Click on videos in the Playlists section to bring them up in your video player.'
            });


            var discussionPostsTitle = $('#discussionPostsContainer');
            if(discussionPostsTitle.length > 0) {
                steps.push({
                    element: discussionPostsTitle[0],
                    intro: 'See popular posts about this tag under the "Discussion Posts" section.'
                });
            }
            else {
                // See if there are any question posts
                var questionPostsTitle = $('#questionPostsContainer');
                if(questionPostsTitle.length > 0) {
                    steps.push({
                        element: questionPostsTitle[0],
                        intro: 'See popular questions involving this tag under the "Question Posts" section.'
                    });
                }
            }

            steps.push({
                element: '#imagesContainer',
                intro: 'Find other pictures of the tag down here.'
            });


            $scope.introOptions = tourService.getTourOptions(steps);
            return true;
        };

        $timeout(function() {
            tourService.subscribeToCallbacks($scope);
        });

    }])
    .controller('tagPageEditTourController', ['$scope', '$timeout', 'communityService', 'tourService', 'accountService', 'mediaService', function($scope, $timeout, communityService, tourService, accountService, mediaService) {

        // Don't do tours on mobile
        if(mediaService.isPhone) {
            return;
        }

        $scope.tourName = 'tagpageedit';


        $scope.createTour = function(tourName) {
            if(tourName && $scope.tourName !== tourName) {
                return;
            }
            $timeout(function() {
                if($scope.resetOptions()) {
                    $timeout(function() {
                        $scope.startTour();
                    });
                }
            });
        };

        if(accountService.account && !tourService.isTourCompleted($scope.tourName)) {
            $scope.createTour();
        }
        else if(!accountService.account) {
            $scope.$on('sessionCreate', function(event, account) {
                if(!tourService.isTourCompleted($scope.tourName))
                    $scope.createTour();
            });
        }



        $scope.completeTour = function() {
            tourService.completeTour($scope.tourName);
        };

        $scope.completedEvent = function () {
            $scope.completeTour();
        };

        $scope.exitEvent = function () {
            $scope.completeTour();
        };

        $scope.resetOptions = function() {
            var steps = [];

            steps.push({
                element: '#wikiPageEditAreaContentEditor',
                intro: 'Editing a tag page is like editing a wiki page. Text is entered using markup and will be formatted upon rendering.'
            });

            var formattingHelpLink = $('.formatting-help-link');
            steps.push({
                element: formattingHelpLink[0],
                intro: 'Click here to learn more about how your text will format the page.',
                position: 'right'
            });

            var previewLink = $('.preview-link');
            steps.push({
                element: previewLink[0],
                intro: '"Preview" will show you what your text will look like when it\'s rendered.',
                position: 'right'
            });


            steps.push({
                element: '#talkPageButton',
                intro: 'Always consider proposing your change on the Talk Page before making an edit.'
            });

            steps.push({
                element: '#mainImageContainer',
                intro: 'The main image for a Tag Page can be changed here.',
                position: 'right'
            });

            steps.push({
                element: '#editPlaylistsAreaEditButton',
                intro: 'Add videos to the Tag Page down here by clicking the "Edit" button.',
                position: 'right'
            });

            steps.push({
                element: '#editImagesAreaEditButton',
                intro: 'Additional pictures can be uploaded to the Tag Page. These pictures will not show as the main image.',
                position: 'right'
            });

            var createRedirectLink = $('.create-redirect-link');
            if(createRedirectLink.length > 0) {
                steps.push({
                    element: createRedirectLink[0],
                    intro: 'Tags can be redirected to other tags using the "Create Redirect" link.',
                    position: 'left'
                });
            }

            var requestLockLink = $('.request-lock-link');
            if(requestLockLink.length > 0) {
                steps.push({
                    element: requestLockLink[0],
                    intro: 'Tag Pages can be locked up to your current level. This will prevent others from editing the Tag Page until they reach the requested level.',
                    position: 'left'
                });
            }

            $scope.introOptions = tourService.getTourOptions(steps);
            return true;
        };

        $timeout(function() {
            tourService.subscribeToCallbacks($scope);
        });

    }])
    .controller('mapTourController', ['$scope', '$timeout', 'communityService', 'tourService', 'accountService', 'mediaService', function($scope, $timeout, communityService, tourService, accountService, mediaService) {

        // Don't do tours on mobile
        if(mediaService.isPhone) {
            return;
        }

        $scope.tourName = 'map';

        $scope.createTour = function() {
            $timeout(function() {
                if($scope.resetOptions()) {
                    $timeout(function() {
                        $scope.startTour();
                    });
                }
            });
        };

        $scope.monitorTourStart = function() {
            $scope.$on('mapRendered', function(event, streamItems) {
                $scope.createTour();
            });
        };

        if(accountService.account && !tourService.isTourCompleted($scope.tourName)) {
            $scope.monitorTourStart();
        }
        else if(!accountService.account) {
            $scope.$on('sessionCreate', function(event, account) {
                if(!tourService.isTourCompleted($scope.tourName))
                    $scope.monitorTourStart();
            });
        }


        $scope.completeTour = function() {
            tourService.completeTour($scope.tourName);
        };

        $scope.completedEvent = function () {
            $scope.completeTour();
        };

        $scope.exitEvent = function () {
            $scope.completeTour();
        };

        $scope.resetOptions = function() {
            var steps = [];

            steps.push({
                element: null,
                intro: 'Welcome to a map! Maps are a way to view videos of #tags in the ' + communityService.getNameWithoutThe() + ' community.'
            });

            var highlightAreas = $('.map-highlight-area');
            if(highlightAreas.length <= 0) {
                return false;
            }

            steps.push({
                element: highlightAreas[0],
                intro: 'Click on a map location to begin playing videos.'
            });

            steps.push({
                element: '#mapTourPanelTitle',
                intro: 'Clicking on a map location will bring up a tour. A tour is a playlist of map locations.'
            });


            var tourStops = $('.tour-stop');
            if(tourStops.length > 0) {
                steps.push({
                    element: tourStops[0],
                    intro: 'Click a tour item to go to the map location.'
                });
            }


            $scope.introOptions = tourService.getTourOptions(steps);
            return true;
        };

        $timeout(function() {
            tourService.subscribeToCallbacks($scope);
        });

    }]);