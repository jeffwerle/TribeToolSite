angular.module('app.Services')
    .factory('toolbarService', ['playlistService', 'cookiesService', 'mediaService', 'navigationService', function(playlistService, cookiesService, mediaService, navigationService) {
        return {
            sidebarWidth: 0,
            getClosedWidth: function() {
                return mediaService.isPhone ? 170 : 270;
            },
            getOpenWidth: function() {
                return mediaService.isPhone ? 200 : 360;
            },
            getOpenHeight: function() {
                return mediaService.isPhone ? 200 : 240;
            },
            aspectRatio: 360/240,
            callbacks: [],
            /* The current playlist that is loaded */
            playlist: null,
            /* The current playlist item that is loaded/being played */
            playlistItem: null,
            /* The index of the current playlist item that is loaded/being played. */
            playlistItemIndex: -1,
            /* If true, we are playing a playlist and videos will begin playing as soon as they are loaded. */
            playing: true,
            getState: function() {
                return {
                    playlist: this.playlist,
                    playlistItem: this.playlistItem,
                    playlistItemIndex: this.playlistItemIndex,
                    playing: this.playing
                };
            },
            setState: function(state) {
                this.playlist = state.playlist;
                this.playlistItem = state.playlistItem;
                this.playlistItemIndex = state.playlistItemIndex;
                this.playing = state.playing;
                this.refresh(/*skipSaveState*/true);
            },
            removeCallback: function(callbackObject) {
                var i = this.callbacks.indexOf(callbackObject);
                if(i >= 0) {
                    this.callbacks.splice(i, 1);
                }
            },
            registerEventWithAnalytics: function(eventName) {
                var label = this.playlist && this.playlist.Title ? this.playlist.Title : '';
                label += this.playlistItem ? this.playlistItem.Title ? this.playlistItem.Title : this.playlistItem.VideoId : '';
                navigationService.registerEvent('Video Toolbar', eventName, label);
            },
            triggerEvent: function(eventName) {
                for(var i = 0; i < this.callbacks.length; i++) {
                    if(this.callbacks[i][eventName])
                        this.callbacks[i][eventName]();
                }
            },
            playIfNecessary: function() {
                if(!this.playing) {
                    this.play();
                }
            },
            stop: function() {
                this.playing = false;
                this.refresh(/*skipSaveStatus*/true);
            },
            play: function() {
                this.playPlaylistItem();
            },
            pause: function() {
                this.pausePlaylistItem();
            },
            playPlaylistItem: function() {
                if(!this.isOpened)
                    this.onToolbarOpened();
                this.playing = true;
                this.registerEventWithAnalytics('playPlaylistItem');
                this.triggerEvent('playPlaylistItem');
                this.saveState();
            },
            pausePlaylistItem: function() {
                this.playing = false;
                this.triggerEvent('pausePlaylistItem');
                this.saveState();
            },
            onToolbarClosed: function() {
                this.isOpened = false;
                this.triggerEvent('onToolbarClosed');
            },
            onToolbarOpened: function() {
                this.isOpened = true;
                this.triggerEvent('onToolbarOpened');
            },
            onPlaylistDone: function() {
                this.playing = false;
                this.triggerEvent('onPlaylistDone');
            },
            onPlaylistItemDone: function() {
                this.triggerEvent('onPlaylistItemDone');
            },
            loadState: function() {
                var self = this;
                cookiesService.getPlaylistState().then(function(state) {
                    if(state)
                        self.setState(state);
                });
            },
            saveState: function() {
                cookiesService.setPlaylistState(this.getState());
            },
            /* Causes all listeners to refresh their playlist item to match
             this.playlistItem. */
            refresh: function(skipSaveState) {
                this.triggerEvent('refresh');
                if(!skipSaveState)
                    this.saveState();
            },
            playlistItemDone: function() {
                this.onPlaylistItemDone();
                if(this.canGetNext()) {
                    this.nextPlaylistItem();
                    this.playIfNecessary();
                }
                else {
                    // We're done with the playlist!
                    this.onPlaylistDone();
                }
            },
            canGetNext: function() {
                return this.playlistItemIndex + 1 < this.playlist.Items.length;
            },
            canGetPrevious: function() {
                return this.playlistItemIndex > 0;
            },
            nextPlaylistItem: function() {
                if(this.canGetNext()) {
                    this.setPlaylistItemFromIndex(this.playlistItemIndex + 1);
                }
                this.playIfNecessary();
            },
            previousPlaylistItem: function() {
                if(this.canGetPrevious()) {
                    this.setPlaylistItemFromIndex(this.playlistItemIndex - 1);
                }
                this.playIfNecessary();
            },
            setPlaylistItem: function(playlist, playlistItem) {
                this.playlistItemIndex = playlist.Items.indexOf(playlistItem);
                this.playlist = playlist;
                this.playlistItem = playlistItem;
                this.refresh();
            },
            setPlaylistItemFromIndex: function(playlistItemIndex) {
                this.playlistItemIndex = playlistItemIndex;
                this.playlistItem = this.playlist.Items[this.playlistItemIndex];
                this.refresh();
            },
            /* Sets but does not begin playing the specified playlist */
            setPlaylist: function(playlist) {
                this.playing = false;
                this.setPlaylistItem(playlist, playlist.Items[0]);
            },
            /* Sets and begins playing the specified playlist */
            startPlaylist: function(playlist) {
                if(!this.isOpened)
                    this.onToolbarOpened();
                this.playing = true;
                this.setPlaylistItem(playlist, playlist.Items[0]);
            },
            /* Loads and plays the given playlistItem on its own playlist. */
            startPlaylistItem: function(playlistItem) {
                this.startPlaylist({
                    Items: [playlistItem]
                });
            },
            addPlaylist: function(playlist) {
                if(this.playlist && this.playlist.Items) {
                    if(playlist.Items) {
                        for(var i = 0; i < playlist.Items.length; i++) {
                            // Ensure that we don't add duplicates
                            if(this.playlist.Items.indexOf(playlist.Items[i]) < 0) {
                                this.playlist.Items.push(playlist.Items[i]);
                            }
                        }
                    }
                }
                else {
                    this.setPlaylist(playlist);
                }
                this.refresh();
                this.playIfNecessary();
            },
            addPlaylistItem: function(playlistItem) {
                if(this.playlist) {
                    // Ensure that we don't add duplicates
                    if(this.playlist.Items.indexOf(playlistItem) < 0) {
                        this.playlist.Items.push(playlistItem);

                        if(this.playlist.Items.length === 1) {
                            this.setPlaylistItem(this.playlist, playlistItem);
                        }
                    }
                }
                else {
                    this.setPlaylist({
                        Items: [playlistItem]
                    });
                }
                this.playIfNecessary();
                this.refresh();
            },
            removePlaylistItem: function(playlistItem) {
                var indexOfPlaylistItem = this.playlist.Items.indexOf(playlistItem);


                if(this.playlistItem === playlistItem) {
                    // We're going to remove our playlist item, so let's find an alternative!
                    if(this.canGetNext()) {
                        this.nextPlaylistItem();
                    }
                    else if(this.canGetPrevious()) {
                        this.previousPlaylistItem();
                    }
                    else {
                        // This is our only playlist item, so the playlist will be empty
                        this.playlistItem = null;
                    }
                }

                if(indexOfPlaylistItem >= 0) {
                    if(indexOfPlaylistItem < this.playlistItemIndex) {
                        this.playlistItemIndex--;
                    }
                    this.playlist.Items.splice(indexOfPlaylistItem, 1);
                }

                this.refresh();

            },
            playRandomPlaylist: function(onSuccess, onFailure) {
                // get some playlists!
                var my = this;
                playlistService.getRandomPlaylists(1, function(data) {
                    // Success!
                    if(data.Playlists && data.Playlists.length > 0) {
                        // Only populate the playlist if the user hasn't already
                        my.setPlaylist(data.Playlists[0]);
                    }

                    if(onSuccess)
                        onSuccess(data);
                }, function(data) {
                    // Failure
                    if(onFailure)
                        onFailure();
                });
            },
            movePlaylistItem: function(oldIndex, newIndex) {
                this.playlist.Items.move(oldIndex, newIndex);

                this.playlistItemIndex = this.playlist.Items.indexOf(this.playlistItem);
                this.refresh();
            }
        };
    }]);