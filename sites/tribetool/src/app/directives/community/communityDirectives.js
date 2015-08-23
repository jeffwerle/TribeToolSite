angular.module('app.Directives')
    .directive('communityPage', ['mediaService', 'headerService', '$timeout', function (mediaService, headerService, $timeout) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="community-page">' +
                    '<video-or-photo-header ng-if="!hideBanner" class="hidden-xs"></video-or-photo-header>' +
                    '<div class="col-md-3 col-sm-2"></div>' +
                    '<div style="padding-right: 0px;" class="col-md-6 col-sm-8">' +
                        //'<community-nav-header class="underneath-phone-header visible-xs-block"></community-nav-header>' +
                        '<universal-search-bar ng-if="showSearchBar" id="universalSearchBar" class="nav-search-bar universal-search-bar phone-universal-search-bar" ng-class="{\'underneath-phone-header\': mediaService.isPhone}"></universal-search-bar>' +
                        //'<community-cover-photo ng-if="!hideBanner" class="hidden-xs"></community-cover-photo>' +
                        '<div>' +
                            '<community-posts></community-posts>' +
                        '</div>' +
                        '<div class="clearfix"></div>' +
                    '</div>' +
                    /*
                    '<div class="col-sm-4 hidden-sm">' +
                        '<div class="dark-well community-sidebar" style="margin-top: 10px;">' +
                            '<community-sidebar></community-sidebar>' +
                        '</div>' +
                    '</div>' +
                    */
                    '<community-page-tour ng-if="showTour"></community-page-tour>' +
                '</div>',
            scope: {
                hideBanner: '='
            },
            controller: ['$scope', function($scope) {
                headerService.options.showSearchBar = !mediaService.isPhone;
                $scope.showTour = !mediaService.isPhone;
                $scope.mediaService = mediaService;
            }],
            link: function (scope, element, attrs) {
                $timeout(function() {
                    scope.showSearchBar = mediaService.isPhone;
                    scope.$watch('mediaService.isPhone', function(newValue) {
                        scope.showSearchBar = mediaService.isPhone;
                    });
                });

            }
        };
    }])
    .directive('communityCoverPhoto', ['tagPageService', 'navigationService', 'postService', 'communityService', '$timeout', 'commService', function (tagPageService, navigationService, postService, communityService, $timeout, commService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="community-cover-photo-carousel cover-photo-carousel-container" ng-show="slides && slides.length > 0" ng-swipe-right="swipeRight($event)" ng-swipe-left="swipeLeft($event)">' +
                    '<carousel  class="cover-photo-carousel" interval="4000">' +
                        '<slide class="cover-photo-carousel-slide" ng-repeat="slide in slides" active="slide.active">' +
                            '<div ng-click="imageClicked(slide)" class="pointer">' +
                                '<div class="cover-photo-container cover-photo-flip">' +
                                    '<img class="cover-photo cover-photo-flip" ng-src="{{slide.image | trusted}}">' +
                                '</div>' +
                                '<div style="position:relative" class="carousel-caption">' +
                                    '<p class="covert-photo-carousel-caption">{{slide.text}}</p>' +
                                '</div>' +
                            '</div>' +
                        '</slide>' +
                    '</carousel>' +
                '</div>',
            scope: {
            },
            link: function (scope, element, attrs) {
                scope.posts = null;
                if(communityService.page.name === 'community') {
                    scope.posts = postService.posts;
                    scope.$on('postsSet', function(event, posts) {
                        scope.posts = [].concat(postService.posts);
                        scope.updateSlides();
                    });
                }
                else {
                    scope.$on('tagPagesChanged', function(event, tagPages) {
                        scope.updateSlides();
                    });
                }





                scope.updateSlides = function() {
                    var maxSlides = 10;
                    scope.slides = [];

                    var i = 0, slide = null;
                    if(scope.posts && scope.posts.length > 0) {
                        var tags = [];
                        // Get the pictures from the tags of the posts
                        var shuffledPosts = commService.shuffle(scope.posts);
                        for(i = 0; i < shuffledPosts.length && i < maxSlides; i++) {
                            var post = shuffledPosts[i];
                            if(post.Tags && post.Tags.length > 0) {
                                for(var j = 0; j < post.Tags.length; j++) {
                                    var tag = post.Tags[j];
                                    if(tag && tag.MainImage) {

                                        // Make sure we haven't already added a post
                                        // for this tag
                                        var containsTag = false;
                                        for(var k = 0; k < tags.length; k++) {
                                            if(tags[k] === tag.Tag) {
                                                containsTag = true;
                                                break;
                                            }
                                        }

                                        if(!containsTag) {
                                            slide = {
                                                image: tag.MainImage.Full.Url,
                                                text: tag.Tag,
                                                url: navigationService.getTagPageUrlFromTag(tag.Tag, communityService.community),//navigationService.getPostUrl(post, communityService.community),
                                                id: tag.Id
                                            };

                                            scope.slides.push(slide);
                                            tags.push(tag.Tag);
                                        }
                                    }

                                }
                            }
                        }
                    }

                    if(scope.slides.length <= 0) {
                        if(tagPageService.tagPages && tagPageService.tagPages.length > 0) {
                            // Get pictures from random tag pages
                            var shuffledTagPages = commService.shuffle(tagPageService.tagPages);
                            for(i = 0; i < shuffledTagPages.length && i < maxSlides; i++) {
                                var tagPage = shuffledTagPages[i];
                                if(tagPage.MainImage && !tagPage.Redirect) {
                                    slide = {
                                        image: tagPage.MainImage.Full.Url,
                                        text: tagPage.Tag,
                                        url: navigationService.getTagPageUrl(tagPage, communityService.community)
                                    };

                                    scope.slides.push(slide);
                                }
                            }
                        }
                    }

                    // Disable image dragging (so that we can swipe the carousel)
                    $timeout(function() {
                        $('.cover-photo-container > img').on('dragstart',
                            function(event) {
                                event.preventDefault();
                            });
                    });


                };
                scope.updateSlides();

                scope.imageClicked = function(slide) {
                    navigationService.goToPath(slide.url);
                };

                scope.getActiveSlide = function() {
                    var activeSlides = scope.slides.filter(function (s) { return s.active; });
                    if(activeSlides && activeSlides.length > 0) {
                        return activeSlides[0];
                    }

                    return null;
                };

                scope.swipeRight = function(e) {
                    if(e) {
                        e.preventDefault();
                    }

                    var activeSlide = scope.getActiveSlide();
                    activeSlide.active = false;
                    var indexOfActiveSlide = scope.slides.indexOf(activeSlide);
                    if(indexOfActiveSlide === 0) {
                        scope.slides[scope.slides.length - 1].active = true;
                    }
                    else {
                        scope.slides[indexOfActiveSlide - 1].active = true;
                    }
                };

                scope.swipeLeft = function(e) {
                    if(e) {
                        e.preventDefault();
                    }

                    var activeSlide = scope.getActiveSlide();
                    activeSlide.active = false;
                    var indexOfActiveSlide = scope.slides.indexOf(activeSlide);
                    if(indexOfActiveSlide >= scope.slides.length - 1) {
                        scope.slides[0].active = true;
                    }
                    else {
                        scope.slides[indexOfActiveSlide + 1].active = true;
                    }
                };
            }
        };
    }])
    .directive('videoOrPhotoHeader', ['tagPageService', 'commService', 'mediaService', function (tagPageService, commService, mediaService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="backgroundVideoId" class="clearfix">' +
                        '<background-video class="community-background-video" video-id="backgroundVideoId" mute="true" options="videoOptions" hide-controls="true">' +
                            '<div class="background-video-caption">{{::tagPage.Tag}}</div>' +
                        '</background-video>' +
                    '</div>' +
                    '<div ng-if="!backgroundVideoId">' +
                        '<community-cover-photo></community-cover-photo>' +
                    '</div>' +
                '</div>',
            link: function (scope, element, attrs) {

                if(!mediaService.isMobileHardware) {



                    scope.updateVideo = function() {
                        if(tagPageService.tagPages && tagPageService.tagPages.length > 0) {
                            // Get pictures from random tag pages
                            var shuffledTagPages = commService.shuffle(tagPageService.tagPages);
                            for(var i = 0; i < shuffledTagPages.length; i++) {
                                var tagPage = shuffledTagPages[i];

                                if(tagPage.Playlists && tagPage.Playlists.length > 0) {
                                    var randomPlaylist = tagPage.Playlists[Math.floor(Math.random()*tagPage.Playlists.length)];
                                    if(randomPlaylist.Items && randomPlaylist.Items.length > 0) {
                                        var randomPlaylistItem = randomPlaylist.Items[Math.floor(Math.random()*randomPlaylist.Items.length)];
                                        scope.backgroundVideoId = randomPlaylistItem.VideoId;
                                        scope.tagPage = tagPage;
                                        break;
                                    }
                                }
                            }
                        }
                    };
                    scope.updateVideo();
                }
            }
        };
    }])
    .directive('communityNavHeader', ['$routeParams', 'profileService', 'accountService', 'mediaService', function ($routeParams, profileService, accountService, mediaService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<nav class="navbar navbar-default sub-navbar" style="margin-bottom: 0px;" role="navigation">' +
                        '<div>' +
                            '<div class="collapse navbar-collapse" collapse="isCollapsed">' +
                                '<div ng-if="mediaService.isPhone">' +
                                    '<a ng-if="isLoggedIn" ng-href="/compatibility" class="navbar-mobile-item pointer" title="Compatibility"><i class="fa fa-puzzle-piece"></i></a>' +
                                    '<a ng-href="/maps" class="navbar-mobile-item pointer" title="Maps"><i class="fa fa-map-marker"></i></a>' +
                                    '<a ng-href="/playlists" class="navbar-mobile-item pointer" title="Playlists"><i class="fa fa-video-camera"></i></a>' +
                                '</div>' +

                                '<ul ng-if="!mediaService.isPhone" class="nav navbar-nav">' +
                                    '<li ng-if="isLoggedIn"><a ng-href="/compatibility" class="pointer" title="Compatibility"><i class="fa fa-puzzle-piece"></i></a></li>' +
                                    '<li><a ng-href="/maps" class="pointer" title="Maps"><i class="fa fa-map-marker"></i></a></li>' +
                                    '<li><a ng-href="/playlists" class="pointer" title="Playlists"><i class="fa fa-video-camera"></i></a></li>' +
                                '</ul>' +
                            '</div>' +
                        '</div>' +
                    '</nav>' +
                '</div>',
            link: function (scope, element, attrs) {
                scope.mediaService = mediaService;
                scope.isLoggedIn = accountService.isLoggedIn();
            }
        };
    }]);