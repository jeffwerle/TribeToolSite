angular.module('app.Services')
    // $socket will serve as our socket that we can access across the app
    .factory('$socket', ['socketFactory', 'commService', function(socketFactory, commService) {
        // https://github.com/btford/angular-socket-io
        // Initialize our socket (connect to the server)

        // io() defaults to trying to connect to the host that serves the page
        // but this won't work for our mobile app since the host that serves the page (i.e.
        // the file system) isn't the same as our node server which will host our socket.io.
        var ioSocket = io('https://tribetool.com');

        var service = socketFactory({
            ioSocket: ioSocket
        });

        return service;
    }])
    .factory('socketService', ['$socket', 'commService', 'communityService', 'tagPageService', 'mapService', 'postService', '$ionicPlatform', function($socket, commService, communityService, tagPageService, mapService, postService, $ionicPlatform) {
        return {
            /* tells the server that our currently logged-in account is connecting */
            connectAccount: function(account) {
                $socket.emit('login', account.Id);
            },
            disconnectAccount: function(account) {
                if(account)
                    $socket.emit('logout', account.Id);
            },
            recache: function() {

                if(communityService.community) {
                    tagPageService.recache();
                    mapService.recache();
                }
                communityService.recache();
            },
            initialize: function() {
                var self = this;
                $ionicPlatform.ready(function() {

                    $socket.on('liveevent', function(arg) {
                        var data = arg.data;

                        // Is this notification applicable?
                        if(communityService.community &&
                            communityService.community.Id !== arg.communityId) {
                            return;
                        }

                        var postContent = data.PostContent;
                        var postId = data.PostId;
                        if(!postContent || !postId)
                            return;

                        // Are we currently viewing this post?
                        // Perhaps the postService should have one single callback that is
                        // populated by the postPage directive and then we can call that callback
                        // here if this post is applicable (i.e. if we're viewing that post). The postService
                        // can also, perhaps, keep track of the PostId that is being viewed.

                        // The callback will be postService.updatePostCallback and it will be
                        // set in the postPage directive
                        if(communityService.page.name &&
                            communityService.page.name === 'post' && postService.post &&
                            postService.post.Id === postId) {

                            if(postService.updatePostCallback)
                                postService.updatePostCallback(null, postContent);
                        }


                    });

                    $socket.on('recache', function(arg) {
                        var data = arg.data;
                        // Is this notification applicable?
                        if(arg.communityId) {
                            if(!communityService.community ||
                                communityService.community.Id !== arg.communityId) {
                                return;
                            }
                        }

                        console.log('Recache request received. Recaching...');
                        self.recache();
                    });
                });

            }
        };
    }]);