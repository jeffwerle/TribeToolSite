angular.module('youtube')
    .service('youtubeService', ['$window', '$rootScope', '$log', 'commService', '$q', '$timeout', '$http', function ($window, $rootScope, $log, commService, $q, $timeout, $http) {
        var service = $rootScope.$new(true);


        // Youtube callback when API is ready
        $window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
            service.ready = true;
            $rootScope.$broadcast('youtubeReady', { });
        };

        service.ready = $window.YT && $window.YT.loaded ? true : false;
        service.playerId = null;
        service.player = null;
        service.videoId = null;
        service.playerHeight = '390';
        service.playerWidth = '640';

        service.bindVideoPlayer = function (elementId) {
            $log.info('Binding to player ' + elementId);
            service.playerId = elementId;
        };

        service.createPlayer = function (elementId, options) {
            return new YT.Player(elementId, options);
        };

        service.loadPlayer = function () {
            // API ready?
            if (this.ready && this.playerId && this.videoId) {
                if(this.player) {
                    this.player.destroy();
                }

                this.player = this.createPlayer();
            }
        };


        return service;
    }]);