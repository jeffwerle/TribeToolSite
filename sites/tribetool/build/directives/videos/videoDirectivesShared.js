angular.module('app.Directives')
    .filter('trusted', ['$sce', function($sce) {
        return function(val) {
            return $sce.trustAsResourceUrl(val);
        };
    }])
    .directive('videoToolbar', ['toolbarService', function (toolbarService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<span>' +
                    '<span ng-if="showToolbar">' +
                        '<button type="button" class="btn toolbar-button toolbar-button-hoverable video-play-link" ng-class="{\'btn-success\': playing}" ng-click="play()"><i class="fa fa-play"></i></button>' +
                        '<button type="button" class="btn toolbar-button toolbar-button-hoverable video-play-link" ng-class="{\'btn-success\': playing}" ng-click="addToQueue()"><i class="fa fa-plus"></i></button>' +
                        '<pin-link-inline ng-if="!hidePin" formatted-text="youtubeUrl" type="\'Video\'"></pin-link-inline>' +
                        '<share-link formatted-text="youtubeUrl"></share-link>' +
                    '</span>' +
                '</span>',
            scope: {
                videoId: '@?'
            },
            controller: ['$scope', 'mediaService', 'OPTIONS',function($scope, mediaService, OPTIONS) {
                $scope.showToolbar = !OPTIONS.isMobile;

                $scope.playlistItem = {
                    VideoId: $scope.videoId
                };

                $scope.playing = false;
                $scope.play = function() {
                    toolbarService.startPlaylistItem($scope.playlistItem);
                    $scope.playing = true;
                };
                $scope.addToQueue = function() {
                    toolbarService.addPlaylistItem($scope.playlistItem);
                    $scope.playing = true;
                };
            }],
            link: function (scope, element, attrs) {


            }
        };
    }])
    .directive('youtube', ['mediaService', 'OPTIONS', function (mediaService, OPTIONS) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<youtube-desktop ng-if="!isMobile" video-id="{{videoId}}" hide-pin="hidePin" max-height="maxHeight"></youtube-desktop>' +
                    '<youtube-mobile ng-if="isMobile" video-id="{{videoId}}" hide-pin="hidePin" max-height="maxHeight"></youtube-mobile>' +
                '</div>',
            scope: {
                videoId: '@?',
                hidePin: '=?',
                maxHeight: '=?'
            },
            link: function (scope, element, attrs) {
                scope.isMobile = OPTIONS.isMobile;
            }
        };
    }])
    .directive('youtubeDesktop', ['toolbarService', 'formatterService', '$timeout', 'videoService', function (toolbarService, formatterService, $timeout, videoService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="video-container">' +
                    '<iframe ng-src="{{youtubeUrl | trusted}}" ng-style="{\'width\': width, \'height\': height}" scrolling="no" frameborder="0" allowfullscreen="1" autohide="1" webkitallowfullscreen="1"></iframe>' +
                    '<div style="margin-bottom:10px; margin-top: -5px;">' +
                        '<video-toolbar video-id="{{videoId}}"></video-toolbar>' +
                    '</div>' +
                '</div>',
            scope: {
                videoId: '@?',
                hidePin: '=?',
                maxHeight: '=?'
            },
            link: function (scope, element, attrs) {

                scope.calculateDimensions = function() {
                    var dimensions = videoService.calculateDimension(element, scope.maxHeight);
                    scope.width = dimensions.width;
                    scope.height = dimensions.height;
                };
                // Wait until we have rendered the directive before we calculate the dimensions or else
                // we won't have element.parent()'s width which we'll need
                $timeout(function() {
                    scope.calculateDimensions();
                });


                scope.youtubeUrl = formatterService.getYouTubeUrl(scope.videoId);
            }
        };
    }]);