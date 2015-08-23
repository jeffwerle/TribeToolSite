angular.module('app.Services')
    .factory('mapTourService', ['$rootScope', 'commService', 'mapService', 'toolbarService', 'tagPageService', 'cookiesService', '$timeout', function($rootScope, commService, mapService, toolbarService, tagPageService, cookiesService, $timeout) {
        return {
            callbacks: [],
            removeCallback: function(callbackObject) {
                var i = this.callbacks.indexOf(callbackObject);
                if(i >= 0) {
                    this.callbacks.splice(i, 1);
                }
            },
            triggerEvent: function(eventName, data) {
                for(var i = 0; i < this.callbacks.length; i++) {
                    if(this.callbacks[i][eventName])
                        this.callbacks[i][eventName](data);
                }
            },
            tourStop: null, // The current tour stop
            tour: null,
            visitedLocations: [], // an array of MapLocation Ids
            clear: function() {
                this.tourStop = null;
                this.tour = null;
                this.visitedLocations = [];
            },
            saveState: function() {
                cookiesService.setMapTourState(this.getState());
            },
            getState: function() {
                var tour = angular.extend({}, this.tour);
                if(this.tour) {
                    for(var i = 0; i < tour.tourStops.length; i++) {
                        delete tour.tourStops[i].mapLocation;
                    }
                }
                var tourStop = angular.extend({}, this.tourStop);
                delete tourStop.mapLocation;
                return {
                    tourStop: tourStop,
                    tour: tour,
                    visitedLocations: this.visitedLocations,
                    mapId: mapService.currentMap.Id
                };
            },
            setState: function(state) {
                var map = mapService.currentMap;
                var i = 0; j = 0;
                this.tour = null;
                if(state.tour && state.tour.tourStops) {
                    this.tour = state.tour;
                    var finalTourStops = [];
                    for(i = 0; i < this.tour.tourStops.length; i++) {
                        var tourStop = this.tour.tourStops[i];
                        for(j = 0; j < map.MapLocations.length; j++) {
                            if(tourStop.id === map.MapLocations[j].Id) {
                                tourStop.mapLocation = map.MapLocations[j];
                                finalTourStops.push(tourStop);
                                break;
                            }
                        }
                    }
                    this.tour.tourStops = finalTourStops;
                }
                if(state.tourStop && state.tourStop.id) {
                    for(var j = 0; j < this.tour.tourStops.length; j++) {
                        if(state.tourStop.id === this.tour.tourStops[j].id) {
                            this.tourStop = this.tour.tourStops[j];
                            break;
                        }
                    }
                }
                this.visitedLocations = state.visitedLocations;

                if(this.tour)
                    this.loadTagPagesForTour();
            },
            loadState: function() {
                var self = this;
                cookiesService.getMapTourState().then(function(state) {
                    if(state && state.mapId === mapService.currentMap.Id)
                        self.setState(state);
                });
            },
            loadTagPagesForTour: function() {
                // Load only one at a time (and trigger the next upon
                // completion) so that we're not bombarding requests
                var self = this;
                var mapLocation = null;
                for(var i = 0; i < this.tour.tourStops.length; i++) {
                    var tourStop = this.tour.tourStops[i];
                    if(!tourStop.mapLocation.TagPage) {
                        mapLocation = tourStop.mapLocation;
                        break;
                    }
                }

                if(mapLocation) {
                    tagPageService.getTagPage(mapLocation.Tag, {
                        GetFinalRedirect: true
                    }, function(data) {
                        // Success
                        mapLocation.TagPage = data.TagPage;
                        self.loadTagPagesForTour();
                    }, function(data) {
                        // Failure
                    });
                }
            },
            loadTour: function(tour) {
                this.tour = tour;
                this.loadTourStop(this.tour.tourStops[0]);
                this.loadTagPagesForTour();
            },
            createTour: function(tourOptions) {
                var map = mapService.currentMap;
                if(!tourOptions) {
                    tourOptions = { };
                }

                if(!tourOptions.startMapLocation) {
                    // Start at a random map location
                    tourOptions.startMapLocation = map.MapLocations[Math.floor(Math.random()*map.MapLocations.length)];
                }

                var tour = {
                    tourStops: []
                };

                var distanceLocations = mapService.getMapLocationsByDistance(map, tourOptions.startMapLocation.Coordinate);
                for(var i = 0; i < distanceLocations.length; i++) {
                    var distanceLocation = distanceLocations[i];
                    var mapLocation = distanceLocation.mapLocation;
                    tour.tourStops.push({
                        id: mapLocation.Id,
                        mapLocation: mapLocation,
                        selected: false
                    });
                }

                return tour;
            },
            getNextTourStop: function() {
                var mapLocationIndex = this.tour.tourStops.indexOf(this.tourStop);
                if(mapLocationIndex >= 0) {
                    if(mapLocationIndex + 1 < this.tour.tourStops.length)
                        return this.tour.tourStops[mapLocationIndex + 1];
                }

                return this.tour.tourStops[this.tour.tourStops.length - 1];
            },
            loadTourStopMedia: function() {
                var mapLocation = this.tourStop.mapLocation;
                // Create a playlist from the playlist items we have at our disposal
                var playlist = {
                    Title: mapLocation.Name,
                    Items: []
                };


                var allPlaylists = mapLocation.Playlists || [];
                if(mapLocation.TagPage) {
                    allPlaylists = allPlaylists.concat(mapLocation.TagPage.Playlists || []);
                }
                var allPlaylistItems = [];
                for(var i = 0; i < allPlaylists.length; i++) {
                    for(var j = 0; j < allPlaylists[i].Items.length; j++) {
                        allPlaylistItems.push(allPlaylists[i].Items[j]);
                    }
                }

                // Select some playlist items
                allPlaylistItems = commService.shuffle(allPlaylistItems);
                playlist.Items = allPlaylistItems;

                if(allPlaylistItems.length <= 0) {
                    commService.showErrorAlert('The ' + mapLocation.Name + ' Map Location does not yet have any Playlists.');
                }
                else {
                    toolbarService.startPlaylist(playlist);
                }

            },
            loadTourStopFromMapLocation: function(mapLocation) {

                if(this.tour && this.tour.tourStops) {
                    for(var i = 0; i < this.tour.tourStops.length; i++) {
                        var tourStop = this.tour.tourStops[i];
                        if(tourStop.mapLocation.Id === mapLocation.Id) {
                            this.triggerEvent('onLoadTourStopFromMapLocation', mapLocation);
                            this.loadTourStop(tourStop);
                            return this.tour;
                        }
                    }
                }

                // The map location was not contained in the loaded tour. Create
                // a new tour for this map location
                var tour = this.createTour({
                    startMapLocation: mapLocation
                });
                this.loadTour(tour);
                this.triggerEvent('onLoadTourStopFromMapLocation', mapLocation);
                return tour;
            },
            loadNextTourStop: function() {
                this.loadTourStop(this.getNextTourStop());
            },
            loadTourStop: function(tourStop) {
                // unselect all other tour stops
                var i = 0;
                for(i = 0; i < this.tour.tourStops.length; i++) {
                    this.tour.tourStops[i].selected = false;
                }

                tourStop.selected = true;
                this.tourStop = tourStop;
                var mapLocation = this.tourStop.mapLocation;

                var containsVisitedLocation = false;
                for(i = 0; i < this.visitedLocations.length; i++) {
                    if(this.visitedLocations[i] === mapLocation.Id) {
                        containsVisitedLocation = true;
                        break;
                    }
                }
                if(!containsVisitedLocation)
                    this.visitedLocations.push(mapLocation.Id);

                // Get the playlists from the associated tag
                var self = this;
                if(!mapLocation.TagPage) {
                    tagPageService.getTagPage(mapLocation.Tag, {
                        GetFinalRedirect: true
                    }, function(data) {
                        // Success
                        mapLocation.TagPage = data.TagPage;
                        self.loadTourStopMedia();
                    }, function(data) {
                        // Failure
                        commService.showErrorAlert('Tag Playlists could not be loaded.');
                        self.loadTourStopMedia();
                    });
                }
                else {
                    self.loadTourStopMedia();
                }

                this.triggerEvent('onLoadTourStop', tourStop);
                mapService.glideToClickLocation(mapLocation.Coordinate);

            }
        };
    }]);