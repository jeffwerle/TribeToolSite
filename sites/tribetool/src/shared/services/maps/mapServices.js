angular.module('app.Services')
    .factory('mapService', ['$rootScope', 'accountService', 'commService', 'mapImageService', 'communityService', 'imageService', 'modalService', 'cookiesService', function($rootScope, accountService, commService, mapImageService, communityService, imageService, modalService, cookiesService) {
        return {
            maps: [], // Map cache (all MapEntries in the community)
            currentMap: null,
            minimumLevelToEdit: 5,
            initialize: function() {
                var self = this;
                $rootScope.$on('communityChanged', function(event, community) {
                    self.maps = [];
                });
            },
            saveState: function() {
                cookiesService.setMapState(this.getState());
            },
            getState: function() {
                var mapProperties = angular.extend({}, mapImageService.mapProperties);
                delete mapProperties.scope;
                delete mapProperties.element;
                delete mapProperties.$element;
                delete mapProperties.highlightAreas;
                delete mapProperties.map;
                delete mapProperties.dragProperties;
                delete mapProperties.tourProperties;
                delete mapProperties.options;
                delete mapProperties.height;
                delete mapProperties.width;
                return {
                    mapProperties: mapProperties,
                    mapId: this.currentMap.Id
                };
            },
            setState: function(state, onSuccess) {
                angular.extend(mapImageService.mapProperties, state.mapProperties);
                mapImageService.setMapSize(function() {
                    mapImageService.refreshMap();
                    if(onSuccess) {
                        onSuccess();
                    }
                });
            },
            loadMap: function(map, onSuccess) {
                this.currentMap = map;

                var self = this;
                var onStateRetrieved = function(state) {
                    var refresh = function() {
                        self.refreshMap();
                        if(onSuccess)
                            onSuccess();
                    };

                    if(state && state.mapId === map.Id)
                        this.setState(state, refresh);
                    else {
                        refresh();
                    }
                };

                cookiesService.getMapState().then(function(state) {
                    onStateRetrieved(state);
                }, function(err) {
                    onStateRetrieved(null);
                });



            },
            recache: function() {
                this.populateMaps();
            },
            /* populates this.maps. This will be called whenever the community
             * changes. */
            populateMaps: function() {
                var my = this;
                this.getMaps(function(data) {
                    // Success
                    my.maps = data.Maps;
                    $rootScope.$broadcast('mapsChanged', my.maps);
                }, function(data) {
                    // Failure
                });
            },
            getMaps: function(onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('map', {
                    Credentials: accountService.getCredentials(communityService.community),
                    GetMapsOptions: {
                        RequestType: 'Cache'
                    },
                    RequestType: 'GetMaps'
                }, onSuccess, onFailure);
            },
            getRecentlyUpdatedMaps: function(pageNumber, countPerPage, onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('map', {
                    Credentials: accountService.getCredentials(communityService.community),
                    GetMapsOptions: {
                        RequestType: 'RecentlyUpdated',
                        PageNumber: pageNumber,
                        CountPerPage: countPerPage
                    },
                    RequestType: 'GetMaps'
                }, onSuccess, onFailure);
            },
            getMap: function(mapUrl, onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('map', {
                    Credentials: accountService.getCredentials(communityService.community),
                    GetMapOptions: {
                        Url: mapUrl
                    },
                    RequestType: 'GetMap'
                }, onSuccess, onFailure);
            },
            getMapById: function(mapId, onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('map', {
                    Credentials: accountService.getCredentials(communityService.community),
                    GetMapOptions: {
                        Id: mapId
                    },
                    RequestType: 'GetMap'
                }, onSuccess, onFailure);
            },
            createMap: function(map, onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('map', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Map: map,
                    RequestType: 'CreateMap'
                }, onSuccess, onFailure);
            },
            createMapLocation: function(mapLocation, onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('maplocation', {
                    Credentials: accountService.getCredentials(communityService.community),
                    MapLocation: mapLocation,
                    RequestType: 'CreateMapLocation'
                }, onSuccess, onFailure);
            },
            editMapLocation: function(mapLocation, onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('maplocation', {
                    Credentials: accountService.getCredentials(communityService.community),
                    MapLocation: mapLocation,
                    RequestType: 'EditMapLocation'
                }, onSuccess, onFailure);
            },
            removeMapLocation: function(mapLocation, onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('maplocation', {
                    Credentials: accountService.getCredentials(communityService.community),
                    MapLocation: {
                        Id: mapLocation.Id,
                        MapId: mapLocation.MapId
                    },
                    RequestType: 'RemoveMapLocation'
                }, onSuccess, onFailure);
            },
            setMainImage: function(map, mainImage, onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('map', {
                    Credentials: accountService.getCredentials(communityService.community),
                    MainImage: mainImage,
                    Map: {
                        Id: map.Id
                    },
                    RequestType: 'SetMainImage'
                }, onSuccess, onFailure);
            },
            addMapLocations: function(map, mapLocations, onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('map', {
                    Credentials: accountService.getCredentials(communityService.community),
                    map: map.MapIdentifier,
                    mapLocations: mapLocations,
                    RequestType: 'AddMapLocation'
                }, onSuccess, onFailure);
            },
            removeMapLocations: function(map, mapLocations, onSuccess, onFailure) {
                var my = this;

                commService.postWithParams('map', {
                    Credentials: accountService.getCredentials(communityService.community),
                    map: map.MapIdentifier,
                    mapLocations: mapLocations,
                    RequestType: 'RemoveMapLocation'
                }, onSuccess, onFailure);
            },
            requestLock: function(lock, map, onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('map', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Lock: lock,
                    Map: {
                        Id: map.Id
                    },
                    RequestType: 'RequestLock'
                }, onSuccess, onFailure);
            },
            removeLock: function(map, onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('map', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Map: {
                        Id: map.Id
                    },
                    RequestType: 'RemoveLock'
                }, onSuccess, onFailure);
            },
            hasImage: function(map) {
                return map && map.MainImage && map.MainImage.Small;
            },
            getMapImageUrl: function(map) {
                return this.hasImage(map) ? map.MainImage.Small.Url : 'images/silhouette-small.png';
            },
            /* Shows a dialog box to select and/or upload an image
             onSelect(imageFileEntry) */
            selectPicture: function(onSelect, map, allowImageSizeSelection, selectUploadedImage, albumType, fileOptions) {
                imageService.selectPicture(onSelect,
                    {
                        getAlbumStack: function(onSuccess, onFailure, community) {
                            onSuccess({
                                AlbumStack: map.AlbumStack
                            });
                        },
                        allowImageSizeSelection: allowImageSizeSelection,
                        selectUploadedImage: selectUploadedImage,
                        albumType: albumType,
                        map: map,
                        fileOptions: fileOptions,
                        allowCropping: false
                    });
            },
            glideToClickLocation: function(clickLocation) {
                mapImageService.glideToClickLocation(clickLocation);
            },
            refreshMap: function() {
                mapImageService.refreshMap();
            },
            /*
             Pauses the default map
             */
            pauseMap: function() {
                mapImageService.pauseMap();
            },
            /*
             Unpauses the default map
             */
            resumeMap: function() {
                mapImageService.resumeMap();
            },
            clearAllHighlightAreas: function() {
                mapImageService.clearAllHighlightAreas();
            },
            /*
             Returns the created highlightArea
             */
            addHighlightArea: function(mapCoordinate) {
                return mapImageService.addHighlightArea(mapCoordinate);
            },
            removeHighlightArea: function(highlightArea) {
                mapImageService.removeHighlightAreaFromDefaultMap(highlightArea);
            },
            getDistance: function(coordinateOne, coordinateTwo) {
                // Convert the percent x left of click to pixels (same with y)
                var x = coordinateOne.PercentXLeftOfClick * mapImageService.mapProperties.BgWidth;
                var y = coordinateOne.PercentYAboveClick * mapImageService.mapProperties.BgHeight;
                var x2 = coordinateTwo.PercentXLeftOfClick * mapImageService.mapProperties.BgWidth;
                var y2 = coordinateTwo.PercentYAboveClick * mapImageService.mapProperties.BgHeight;
                return Math.sqrt(Math.pow((x - x2), 2) + (Math.pow((y - y2), 2)));
            },
            /*
             Returns an array of MapLocations (sorted from closest to farthest).
             Each element consists of {
             distance: distance,
             mapLocation: mapLocation
             }
             */
            getMapLocationsByDistance: function(map, originCoordinate) {

                var mapLocations = map.MapLocations;
                var distanceLocations = [];
                for(var i = 0; i < mapLocations.length; i++) {
                    var mapLocation = mapLocations[i];

                    var distance = this.getDistance(originCoordinate, mapLocation.Coordinate);

                    distanceLocations.push({
                        distance: distance,
                        mapLocation: mapLocation
                    });
                }
                distanceLocations.sort(commService.sortBy('distance', true, parseFloat));
                return distanceLocations;
            },
            /*
             maximumCountToReturn: The maximum number of nearby elements to return. (optional)
             Returns an array of map locations.
             */
            getNearbyMapLocations: function(originCoordinate, maximumCountToReturn) {
                var distanceLocations = this.getMapLocationsByDistance(this.currentMap, originCoordinate);
                var locations = [];
                if(!angular.isDefined(maximumCountToReturn)) {
                    maximumCountToReturn = distanceLocations.length;
                }
                for(var i = 0; i < maximumCountToReturn; i++) {
                    if(i >= distanceLocations.length)
                        break;

                    var distanceLocation = distanceLocations[i];
                    locations.push(distanceLocation.mapLocation);
                }
                return locations;
            },
            getClosestMapLocation: function(originCoordinate) {
                var result = this.getNearbyMapLocations(originCoordinate, 1);
                if(result === null || result.length <= 0)
                    return null;

                return result[0];
            },
            openMapLocationDialog: function(options, onFinished) {
                modalService.open({
                    templateUrl: 'app-templates/maps/edit-map-location.html',
                    controller: 'editMapLocationController',
                    windowClass: 'edit-map-location-modal',
                    resolve: {
                        items: function () {
                            return [options];
                        }
                    }
                }, function (data) {
                    if(onFinished)
                        onFinished();
                }, function () {
                    // Modal dismissed
                    if(onFinished)
                        onFinished();
                });

            }
        };
    }])
    .factory('mapImageService', ['$rootScope', '$timeout', '$window', 'mediaService', function($rootScope, $timeout, $window, mediaService) {
        return {
            transparentPNG: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==",
            /*
             The map properties for the default map

             mapProperties: {
                 naturalWidth: natural width of the image
                 naturalHeight: natural height of the image
                 BgWidth: the background width of the image, i.e. the width of the displayed image
                 BgHeight: the background height of the image, i.e. the height of the displayed image
                 height: the height of the img that stores the image (i.e. the viewport height),
                 width: the width of the img that stores the image (i.e. the viewport width),
                 BgPosX: the x offset of the background image in pixels.
                 BgPosY: the y offset of the background image in pixels.
             }

             */
            mapProperties: null,
            /*
             Pauses the default map
             */
            pauseMap: function() {
                this.mapProperties.mapPaused = true;
            },
            /*
             Unpauses the default map
             */
            resumeMap: function() {
                this.mapProperties.mapPaused = false;
            },
            reset: function(mapElement, mapProperties) {
                mapProperties.BgWidth = mapProperties.width;
                mapProperties.BgHeight = mapProperties.height;

                mapProperties.BgPosX = mapProperties.BgPosY = 0;
                this.updateBgStyle(mapElement);
            },
            drag: function(e, mapElement, mapProperties) {
                // Don't process movements if the map is paused
                if(mapProperties.mapPaused)
                    return;

                mapProperties.dragProperties.didDrag = true;
                //e.preventDefault();
                mapProperties.BgPosX += (e.pageX - mapProperties.dragProperties.lastDragEventArgs.pageX);
                mapProperties.BgPosY += (e.pageY - mapProperties.dragProperties.lastDragEventArgs.pageY);
                mapProperties.dragProperties.lastDragEventArgs = e;
                this.updateBgStyle(mapElement);
            },
            getHighlightAreaId: function(mapElement, mapCoordinate) {
                return mapElement.id + mapCoordinate.X.toString() + mapCoordinate.Y.toString();
            },
            clearAllHighlightAreas: function() {
                var mapProperties = this.mapProperties;
                for(var i = 0; i < mapProperties.highlightAreas.length; i++) {
                    mapProperties.highlightAreas[i].$element.remove();
                }
                mapProperties.highlightAreas = [];
            },
            /*
             Returns the created highlightArea
             */
            addHighlightArea: function(mapCoordinate) {
                var mapProperties = this.mapProperties;
                var mapElement = this.mapProperties.element;
                var id = this.getHighlightAreaId(mapElement, mapCoordinate);
                var parentElement = mapElement.parentElement;
                var $highlightAreaElement = $('<div id="' + id + '" class="map-highlight-area"></div>');
                $(parentElement).append($highlightAreaElement);
                var highlightArea = {
                    $element: $highlightAreaElement,
                    coordinate: mapCoordinate,
                    height: 20,
                    width: 20
                };
                mapProperties.highlightAreas.push(highlightArea);

                this.subscribeToMapEvents($highlightAreaElement, mapProperties);

                return highlightArea;
            },
            removeHighlightAreaFromDefaultMap: function(highlightArea) {
                this.removeHighlightArea(this.mapProperties.element, this.mapProperties, highlightArea);
            },
            removeHighlightArea: function(mapElement, mapProperties, highlightArea) {
                var id = this.getHighlightAreaId(mapElement, highlightArea.coordinate);
                for(var i = 0 ; i < mapProperties.highlightAreas.length; i++) {
                    var area = mapProperties.highlightAreas[i];
                    if(area.$element[0].id === id) {
                        mapProperties.highlightAreas.splice(i, 1);
                        break;
                    }
                }
                highlightArea.$element.remove();
            },
            subscribeToMapEvents: function($element, mapProperties) {
                var element = $element[0];
                var my = this;
                var dragOnMouseMove = function(e) {
                    my.drag(e, element, mapProperties);
                };


                var self = this;
                //var hammertime = new Hammer(element, {prevent_default:true});
                var hammertime = new Hammer(element, {});
                hammertime.add( new Hammer.Pinch({ threshold: 0 }) );

                hammertime.on('pinchin', function(e) {
                    self.onPinch(e);
                });
                hammertime.on('pinchout', function(e) {
                    self.onPinch(e);
                });


                hammertime.on('tap', function(e) {

                    // User left-clicked on a location
                    var clickLocation = my.getClickLocation(mapProperties, e.srcEvent);
                    var options = mapProperties.options;
                    if(angular.isDefined(options.onClick)) {
                        if(!options.onClick(clickLocation))
                            return false;
                    }

                    my.glideToClickLocationForMap(clickLocation, element, mapProperties);

                });


                hammertime.add( new Hammer.Pan({ direction: Hammer.DIRECTION_ALL, threshold: 0 }) );
                hammertime.on("panstart", function(e) {

                    mapProperties.dragProperties.touchEventArgs = e;
                    mapProperties.dragProperties.isTouching = true;
                    mapProperties.dragProperties.lastTouchEventArgs = e;

                });
                hammertime.on("panmove", function(e) {

                    //var touch = e.changedPointers[0];

                    if(mapProperties.mapPaused)
                        return;

                    var prev = mapProperties.dragProperties.lastTouchEventArgs;

                    mapProperties.dragProperties.didTouch = true;

                    var totalDeltaX = (e.deltaX - prev.deltaX);
                    var totalDeltaY = (e.deltaY - prev.deltaY);
                    mapProperties.BgPosX += totalDeltaX;
                    mapProperties.BgPosY +=  totalDeltaY;


                    mapProperties.dragProperties.lastTouchEventArgs = e;

                    var result = self.updateBgStyle(self.mapProperties.element);
                    var $$window;
                    if(result.clippedY !== 0) {
                        // We did not move the total y amount we requested. Move the window the extra amount
                        $$window = $($window);
                        $$window.scrollTop($$window.scrollTop() + result.clippedY);
                    }
                    if(result.clippedX !== 0) {
                        // We did not move the total x amount we requested. Move the window the extra amount
                        $$window = $($window);
                        $$window.scrollLeft($$window.scrollLeft() + result.clippedX);
                    }


                });

                hammertime.on("panend", function(e) {

                    mapProperties.dragProperties.didTouch = false;
                    mapProperties.dragProperties.isTouching = false;
                });


                /*
                 hammertime.get('tap').set({ enable: true });
                 hammertime.on('tap', function(e) {
                 self.onWheelMove(e, self.mapProperties.element, self.mapProperties.$element, self.mapProperties);
                 });
                 */

                /*
                $element
                    .on('mousedown', function(e) {
                        mapProperties.dragProperties.mouseDownEventArgs = e;
                        mapProperties.dragProperties.isMouseDown = true;
                        mapProperties.dragProperties.lastDragEventArgs = e;
                        //e.preventDefault();
                    })
                    .on('mousemove', function(e) {
                        // Only process dragging if a button is currently pressed
                        // and if we have moved from the mouse down position
                        if(e.which !== 0) {
                            var e2 = mapProperties.dragProperties.mouseDownEventArgs;
                            if(e2 && (e2.pageX !== e.pageX || e2.pageY !== e.pageY)) {
                                dragOnMouseMove(e);
                            }
                        }
                        else {
                            mapProperties.dragProperties.didDrag = false;
                            //$element.unbind('mousemove', dragOnMouseMove);
                        }
                    })
                    .on('mouseup', function (e) {

                        if(!mapProperties.dragProperties.didDrag) {
                            // Don't process clicks if the map is paused
                            if(!mapProperties.mapPaused) {
                                if(e.which === 1) {
                                    // User left-clicked on a location
                                    var clickLocation = my.getClickLocation(mapProperties, e);
                                    var options = mapProperties.options;
                                    if(angular.isDefined(options.onClick)) {
                                        if(!options.onClick(clickLocation))
                                            return false;
                                    }

                                    my.glideToClickLocationForMap(clickLocation, element, mapProperties);

                                }
                            }

                        }

                        mapProperties.dragProperties.didDrag = false;
                        mapProperties.dragProperties.isMouseDown = false;
                        //$element.unbind('mousemove', dragOnMouseMove);
                    });
                    */
/*
                    .on("touchstart", function (e) {
                        var touch = e.originalEvent.changedTouches[0];


                        mapProperties.dragProperties.touchEventArgs = touch;
                        mapProperties.dragProperties.isTouching = true;
                        mapProperties.dragProperties.lastTouchEventArgs = touch;

                    })
                    .on("touchmove", function (e) {
                        if (e.originalEvent.changedTouches.length === 1) {
                            if(mapProperties.mapPaused)
                                return;

                            var touch = e.originalEvent.changedTouches[0];

                            var previousTouch = mapProperties.dragProperties.lastTouchEventArgs;
                            if(previousTouch && (previousTouch.pageX !== touch.pageX || previousTouch.pageY !== touch.pageY)) {
                                mapProperties.dragProperties.didTouch = true;

                                mapProperties.BgPosX += (touch.pageX - previousTouch.pageX);
                                mapProperties.BgPosY += (touch.pageY - previousTouch.pageY);
                                mapProperties.dragProperties.lastTouchEventArgs = touch;
                                self.updateBgStyle(self.mapProperties.element);

                                 //e.preventDefault();
                             }
                        }
                    }).on("touchend", function (e) {

                        mapProperties.dragProperties.didTouch = false;
                        mapProperties.dragProperties.isTouching = false;
                    });
                    */



            },
            drawHighlightArea: function(mapElement, mapProperties, highlightArea) {
                var $highlightAreaElement = highlightArea.$element;
                var mapCoordinate = highlightArea.coordinate;
                var imageCoordinate = this.toImageCoordinates(mapCoordinate);

                var top = mapElement.offsetTop - imageCoordinate.BgPosY + mapProperties.BgPosY - (highlightArea.height/2);
                var left = mapElement.offsetLeft - imageCoordinate.BgPosX + mapProperties.BgPosX - (highlightArea.width/2);


                $highlightAreaElement.css({
                    background: highlightArea.color,
                    height: highlightArea.height.toString() + 'px',
                    width: highlightArea.width.toString() + 'px',
                    position:'absolute',
                    top: top.toString() + 'px',
                    left: left.toString() + 'px',
                    opacity: highlightArea.opacity,
                    zIndex: highlightArea.zIndex,
                    display: top < mapElement.offsetTop ||
                        left < mapElement.offsetLeft ||
                        (top + highlightArea.height) > (mapElement.offsetTop + mapElement.height) ||
                        (left + highlightArea.width) > (mapElement.offsetLeft + mapElement.width) ? 'none' : 'block'
                });
            },
            refreshMap: function() {
                var mapProperties = this.mapProperties;
                var map = mapProperties.map;

                this.clearAllHighlightAreas();
                // Load all of the highlight areas
                for(var i = 0; i < map.MapLocations.length; i++) {
                    var mapLocation = map.MapLocations[i];
                    this.addHighlightArea(mapLocation.Coordinate);
                }

                this.updateBgStyle(mapProperties.element);
            },
            updateBgStyle: function(mapElement) {
                var mapProperties = this.mapProperties;

                var result = {
                    clippedX : 0,
                    clippedY: 0
                };

                var oldBgPosX = mapProperties.BgPosX;
                var newBgPosX = mapProperties.BgPosX;
                if (mapProperties.BgPosX > 0) {
                    newBgPosX = 0;
                } else if (mapProperties.BgPosX < mapProperties.width - mapProperties.BgWidth) {
                    newBgPosX = mapProperties.width - mapProperties.BgWidth;
                }
                mapProperties.BgPosX = newBgPosX;
                result.clippedX = newBgPosX - oldBgPosX;

                var oldBgPosY = mapProperties.BgPosY;
                var newBgPosY = mapProperties.BgPosY;
                if (mapProperties.BgPosY > 0) {
                    newBgPosY = 0;
                } else if (mapProperties.BgPosY < mapProperties.height - mapProperties.BgHeight) {
                    newBgPosY = mapProperties.height - mapProperties.BgHeight;
                }
                mapProperties.BgPosY = newBgPosY;
                result.clippedY = newBgPosY - oldBgPosY;

                mapElement.style.backgroundSize = mapProperties.BgWidth + 'px ' + mapProperties.BgHeight + 'px';
                mapElement.style.backgroundPosition =
                    (mapProperties.BgPosX+mapProperties.offsetPaddingX) + 'px ' +
                        (mapProperties.BgPosY+mapProperties.offsetPaddingY) + 'px';

                for(var i = 0; i < mapProperties.highlightAreas.length; i++) {
                    var highlightArea = mapProperties.highlightAreas[i];
                    this.drawHighlightArea(mapElement, mapProperties, highlightArea);
                }

                return result;

            },
            onPinch: function(e) {
                var mapProperties = this.mapProperties;
                // Don't process movements if the map is paused
                if(mapProperties.mapPaused)
                    return;

                var mapElement = mapProperties.element;
                var $mapElement = mapProperties.$element;

                e.pageX = e.center.x;
                e.pageY = e.center.y;

                // As far as I know, there is no good cross-browser way to get the cursor position relative to the event target.
                // We have to calculate the target element's position relative to the document, and subtrack that from the
                // cursor's position relative to the document.
                var offsetParent = $mapElement.offset();
                var offsetX = e.pageX - offsetParent.left - mapProperties.offsetBorderX - mapProperties.offsetPaddingX;
                var offsetY = e.pageY - offsetParent.top - mapProperties.offsetBorderY - mapProperties.offsetPaddingY;

                // Record the offset between the bg edge and cursor:
                var bgCursorX = offsetX - mapProperties.BgPosX;
                var bgCursorY = offsetY - mapProperties.BgPosY;

                // Use the previous offset to get the percent offset between the bg edge and cursor:
                var bgRatioX = bgCursorX/mapProperties.BgWidth;
                var bgRatioY = bgCursorY/mapProperties.BgHeight;

                var zoom = 0.01;
                // Update the bg size:
                if(e.type==='pinchout') {
                    mapProperties.BgWidth += mapProperties.BgWidth* zoom;
                    mapProperties.BgHeight += mapProperties.BgHeight* zoom;
                }
                else {
                    mapProperties.BgWidth -= mapProperties.BgWidth* zoom;
                    mapProperties.BgHeight -= mapProperties.BgHeight* zoom;
                }

                // Take the percent offset and apply it to the new size:
                mapProperties.BgPosX = offsetX - (mapProperties.BgWidth * bgRatioX);
                mapProperties.BgPosY = offsetY - (mapProperties.BgHeight * bgRatioY);

                // Prevent zooming out beyond the starting size
                if (mapProperties.BgWidth <= mapProperties.width || mapProperties.BgHeight <= mapProperties.height) {
                    this.reset(mapElement, mapProperties);
                } else {
                    this.updateBgStyle(mapElement);
                }
            },
            onWheelMove: function(e) {
                var mapProperties = this.mapProperties;
                // Don't process movements if the map is paused
                if(mapProperties.mapPaused)
                    return;

                var mapElement = mapProperties.element;
                var $mapElement = mapProperties.$element;

                var deltaY = 0;


                if (e.deltaY) { // FireFox 17+
                    deltaY = e.deltaY;
                } else if (e.wheelDelta) {
                    deltaY = -e.wheelDelta;
                }

                // As far as I know, there is no good cross-browser way to get the cursor position relative to the event target.
                // We have to calculate the target element's position relative to the document, and subtrack that from the
                // cursor's position relative to the document.
                var offsetParent = $mapElement.offset();
                var offsetX = e.pageX - offsetParent.left - mapProperties.offsetBorderX - mapProperties.offsetPaddingX;
                var offsetY = e.pageY - offsetParent.top - mapProperties.offsetBorderY - mapProperties.offsetPaddingY;

                // Record the offset between the bg edge and cursor:
                var bgCursorX = offsetX - mapProperties.BgPosX;
                var bgCursorY = offsetY - mapProperties.BgPosY;

                // Use the previous offset to get the percent offset between the bg edge and cursor:
                var bgRatioX = bgCursorX/mapProperties.BgWidth;
                var bgRatioY = bgCursorY/mapProperties.BgHeight;

                // Update the bg size:
                if (deltaY < 0) {
                    mapProperties.BgWidth += mapProperties.BgWidth*mapProperties.options.zoom;
                    mapProperties.BgHeight += mapProperties.BgHeight*mapProperties.options.zoom;
                } else {
                    mapProperties.BgWidth -= mapProperties.BgWidth*mapProperties.options.zoom;
                    mapProperties.BgHeight -= mapProperties.BgHeight*mapProperties.options.zoom;
                }

                // Take the percent offset and apply it to the new size:
                mapProperties.BgPosX = offsetX - (mapProperties.BgWidth * bgRatioX);
                mapProperties.BgPosY = offsetY - (mapProperties.BgHeight * bgRatioY);

                // Prevent zooming out beyond the starting size
                if (mapProperties.BgWidth <= mapProperties.width || mapProperties.BgHeight <= mapProperties.height) {
                    this.reset(mapElement, mapProperties);

                    // Notice that we do not prevent the default event so we will scroll down the window

                } else {
                    this.updateBgStyle(mapElement);

                    // Don't scroll down the window
                    e.preventDefault();
                }
            },
            setMapSize: function(onSuccess) {
                var mapProperties = this.mapProperties;
                mapProperties.mapPaused = true;
                var mapElement = mapProperties.element;
                var $mapElement = mapProperties.$element;

                var self = this;
                var onImgLoaded = function(){



                    // Viewport width and height
                    mapProperties.width = $mapElement.width();
                    mapProperties.height = $mapElement.height();

                    var imgWidth, imgHeight;
                    if(mapElement.src === self.transparentPNG) {
                        // We've already set the image to its transparent PNG
                        // so use the original natural height and width
                        imgWidth = mapProperties.naturalWidth;
                        imgHeight = mapProperties.naturalHeight;
                    }
                    else {
                        imgWidth = mapProperties.naturalWidth = mapElement.naturalWidth;
                        imgHeight = mapProperties.naturalHeight = mapElement.naturalHeight;

                        // Explicitly set the size to the current dimensions,
                        // as the src is about to be changed to a 1x1 transparent png.
                        mapElement.width = mapElement.width || mapElement.naturalWidth;
                        mapElement.height = mapElement.height || mapElement.naturalHeight;
                    }


                    // We want to use the image's native dimensions so we'll set the background height to the height
                    // of the viewport (i.e. the height of the height of the image element $mapElement) then we'll use
                    // the equation bgHeight / bgWidth = imgHeight / imgWidth which, solving for bgWidth, is
                    // (bgHeight * imgWidth) / imgHeight = bgWidth where imgWidth and imgHeight are the width and height of
                    // the $mapElement, respectively (i.e. the width and height of the img element that holds the image).
                    // We know the natural height and width of the image (which is the height and
                    // width of the IMAGE, not the img element that holds the image--$mapElement is the img that holds the image).

                    // Alternatively we could start with BgWidth which would make the resulting equation
                    // bgHeight = (imgHeight * bgWidth) / imgWidth
                    //mapProperties.BgHeight = mapProperties.height;
                    //mapProperties.BgWidth = (mapProperties.BgHeight * imgWidth) / imgHeight;
                    mapProperties.BgWidth = mapProperties.width;
                    mapProperties.BgHeight = (imgHeight * mapProperties.BgWidth) / imgWidth;

                    mapElement.src = self.transparentPNG;

                    $mapElement.css({
                        backgroundSize: mapProperties.BgWidth+'px ' + mapProperties.BgHeight+'px'
                    });

                    // We determind the height of the background image using the fixed width of the viewport. Given
                    // this, if the background image height was found to be less than the viewport height (using the source
                    // image's natural dimensions--which we did) then we can safely lower the height
                    // of the viewport to fit the dimensions of the background image.
                    if(mapProperties.BgHeight < mapProperties.height) {
                        mapElement.style.height = mapProperties.BgHeight + 'px';
                        mapProperties.height = mapProperties.BgHeight;
                    }

                    //mapElement.style.width = mapProperties.BgWidth + 'px ';


                    mapProperties.mapPaused = false;

                    $mapElement.off('load');

                    if(onSuccess) {
                        onSuccess();
                    }
                };

                if(mapElement.naturalHeight || mapElement.naturalWidth) {
                    onImgLoaded();
                }
                else {
                    $mapElement.load(onImgLoaded);
                }


            },
            initializeMapProperties: function(mapElement, $mapElement, mapProperties, onSuccess) {

                mapProperties.BgPosX = 0;
                mapProperties.BgPosY = 0;
                mapProperties.offsetBorderX = parseInt($mapElement.css('border-left-width'),10);
                mapProperties.offsetBorderY = parseInt($mapElement.css('border-top-width'),10);
                mapProperties.offsetPaddingX = parseInt($mapElement.css('padding-left'),10);
                mapProperties.offsetPaddingY = parseInt($mapElement.css('padding-top'),10);


                $mapElement.css({
                    background: "url("+mapElement.src+") 0 0 no-repeat",
                    //backgroundSize: mapProperties.width+'px '+mapProperties.height+'px',
                    backgroundPosition: mapProperties.offsetPaddingX+'px '+mapProperties.offsetPaddingY+'px'
                }).bind('wheelzoom.reset', this.reset);

                this.setMapSize(onSuccess);
            },
            /*
             Returns the clickLocation in map coordinates
             */
            getClickLocation: function(mapProperties, clickEventArgs) {
                var mapElement = mapProperties.element;

                var pageX = clickEventArgs.pageX;
                var pageY = clickEventArgs.pageY;
                if(clickEventArgs.changedTouches) {
                    pageX = clickEventArgs.changedTouches[0].pageX;
                    pageY = clickEventArgs.changedTouches[0].pageY;
                }

                // Calculate the click offset (since the offsetX and offsetY may not be valid due to the
                // fact that this may be a child element within the map image).
                var offsetX = pageX - mapElement.offsetLeft - mapProperties.offsetBorderX - mapProperties.offsetPaddingX;
                var offsetY = pageY - mapElement.offsetTop  - mapProperties.offsetBorderY - mapProperties.offsetPaddingY;

                var offsetParent = mapElement.offsetParent;
                while(true) {
                    if(offsetParent) {
                        offsetX -= offsetParent.offsetLeft;
                        offsetY -= offsetParent.offsetTop;
                    }
                    else {
                        break;
                    }

                    offsetParent = offsetParent.offsetParent;
                }

                return this.toMapCoordinates(mapProperties, offsetX, offsetY);
            },
            glideToClickLocation: function(clickLocation) {
                this.glideToLocation(clickLocation, this.mapProperties.element, this.mapProperties);
                return clickLocation;
            },
            glideToClickLocationForMap: function(clickLocation, mapElement, mapProperties) {
                this.glideToLocation(clickLocation, mapElement, mapProperties);
                return clickLocation;
            },
            /* Gets a normalized coordinate given that the viewport dimensions at the time of the
            * creation of the given map coordinate may be different than the current viewport dimensions */
            getNormalizedCoordinateForLocation: function(mapCoordinate) {

                var mapProperties = this.mapProperties;
                /*
                var newCoordinate = {
                    // (bgWidth old * width new) / (width old) = bgWidth new.
                    // (bgHeight old * height new) / (height old) = bgHeight new.
                    BgWidth: (mapCoordinate.BgWidth * mapProperties.width) / mapCoordinate.Width,
                    BgHeight: (mapCoordinate.BgHeight * mapProperties.height) / mapCoordinate.Height,

                    // (bgPosX old * bgWidth new) / (bgWidth old) = bgPosX new.
                    // (bgPosY old * bgHeight new) / (bgHeight old) = bgPosX new.
                    BgPosX: (mapCoordinate.BgPosX * mapProperties.BgWidth) / mapCoordinate.BgWidth,
                    BgPosY: (mapCoordinate.BgPosY * mapProperties.BgHeight) / mapCoordinate.BgHeight,

                    Width: mapProperties.width,
                    Height: mapProperties.height
                };
                */

                var newCoordinate = {
                    // (bgWidth old * width new) / (width old) = bgWidth new.
                    // (bgHeight old * height new) / (height old) = bgHeight new.
                    BgWidth: (mapCoordinate.BgWidth * mapProperties.width) / mapCoordinate.Width,
                    BgHeight: (mapCoordinate.BgHeight * mapProperties.height) / mapCoordinate.Height,

                    Width: mapProperties.width,
                    Height: mapProperties.height
                };

                // (bgPosX old * bgWidth new) / (bgWidth old) = bgPosX new.
                // (bgPosY old * bgHeight new) / (bgHeight old) = bgPosX new.
                newCoordinate.BgPosX = (mapCoordinate.BgPosX * newCoordinate.BgWidth) / mapCoordinate.BgWidth;
                newCoordinate.BgPosY = (mapCoordinate.BgPosY * newCoordinate.BgHeight) / mapCoordinate.BgHeight;

                newCoordinate.BgPosXCentered = newCoordinate.BgPosX;
                newCoordinate.BgPosYCentered = newCoordinate.BgPosY;

                return newCoordinate;
            },
            goToLocation: function(mapCoordinate, mapElement, mapProperties) {
                var newCoordinate = this.getNormalizedCoordinateForLocation(mapCoordinate);

                mapProperties.BgWidth = newCoordinate.BgWidth;
                mapProperties.BgHeight = newCoordinate.BgHeight;
                mapProperties.BgPosX = newCoordinate.BgPosX;
                mapProperties.BgPosY = newCoordinate.BgPosY;

                this.updateBgStyle(mapElement);
            },
            areCoordinatesEqual: function(coordinateOne, coordinateTwo) {
                return coordinateOne.BgPosX === coordinateTwo.BgPosX &&
                    coordinateOne.BgPosY === coordinateTwo.BgPosY &&
                    coordinateOne.BgWidth === coordinateTwo.BgWidth &&
                    coordinateOne.BgHeight === coordinateTwo.BgHeight &&
                    coordinateOne.Width === coordinateTwo.Width &&
                    coordinateOne.Height === coordinateTwo.Height;
            },
            glideToLocation: function(mapCoordinate, mapElement, mapProperties) {
                var endLocation = this.getNormalizedCoordinateForLocation(mapCoordinate);

                // Don't process a new tour for a place that we're already going
                if(mapProperties.tourProperties.destination &&
                    this.areCoordinatesEqual(mapProperties.tourProperties.destination, endLocation)) {
                    return;
                }

                endLocation.XPixelsLeftOfCenteredViewport = mapCoordinate.XPixelsLeftOfCenteredViewport;
                endLocation.YPixelsAboveCenteredViewport = mapCoordinate.YPixelsAboveCenteredViewport;

                var currentLocation = this.getCurrentCenteredMapCoordinates(mapProperties);

                // We really need to judge based on the number of pixels that need to be
                // traversed (thus taking the zoom into account). This will be to determine the number of
                // "steps" we take to get to our final destination
                var xDifference = currentLocation.XPixelsLeftOfCenteredViewport - endLocation.XPixelsLeftOfCenteredViewport;
                var yDifference = currentLocation.YPixelsAboveCenteredViewport - endLocation.YPixelsAboveCenteredViewport;
                var distance = Math.sqrt(Math.pow(xDifference, 2) + (Math.pow(yDifference, 2)));
                var steps = distance/5;
                var maxSteps = 15;
                if(steps > maxSteps) {
                    steps = maxSteps;
                }
                else if(steps <= 0) {
                    steps = 1;
                }


                mapProperties.tourProperties.destination = endLocation;
                mapProperties.tourProperties.isOnTour = true;
                mapProperties.tourProperties.tourStops = [];


                // Calculate the steps for the tour
                var xPosIncrement = (endLocation.BgPosX - currentLocation.BgPosX)/steps;
                var yPosIncrement = (endLocation.BgPosY - currentLocation.BgPosY)/steps;
                var BgWidthIncrement = (endLocation.BgWidth - currentLocation.BgWidth)/steps;
                var BgHeightIncrement = (endLocation.BgHeight - currentLocation.BgHeight)/steps;
                var previousStop = currentLocation;
                for(var i = 0; i < steps; i++) {
                    var tourStop = angular.extend({ }, previousStop);


                    tourStop.BgPosX = previousStop.BgPosX + xPosIncrement;
                    tourStop.BgPosY = previousStop.BgPosY + yPosIncrement;
                    tourStop.BgWidth = previousStop.BgWidth + BgWidthIncrement;
                    tourStop.BgHeight = previousStop.BgHeight + BgHeightIncrement;
                    tourStop.BgPosXCentered = tourStop.BgPosX;
                    tourStop.BgPosYCentered = tourStop.BgPosY;

                    mapProperties.tourProperties.tourStops.push(tourStop);
                    previousStop = tourStop;
                }

                // Ensure that the last stop is the requested end coordinate
                mapProperties.tourProperties.tourStops[mapProperties.tourProperties.tourStops.length - 1] = endLocation;


                var intervalBetweenStops = 5;
                // Cycle through the tour stops until we're done
                var self = this;
                var processTourStop = function() {
                    if(mapProperties.tourProperties.tourStops.length > 0) {
                        // If we're no longer heading to the location for which we planned then abort
                        if(mapProperties.tourProperties.destination !== endLocation) {
                            return;
                        }

                        var tourStop = mapProperties.tourProperties.tourStops[0];

                        mapProperties.BgWidth = tourStop.BgWidth;
                        mapProperties.BgHeight = tourStop.BgHeight;

                        //mapProperties.BgPosX = tourStop.BgPosXCentered;
                        //mapProperties.BgPosY = tourStop.BgPosYCentered;
                        mapProperties.BgPosX = tourStop.BgPosX;
                        mapProperties.BgPosY = tourStop.BgPosY;

                        self.updateBgStyle(mapElement);


                        // Remove the first tour stop since we're done with it
                        mapProperties.tourProperties.tourStops.shift();

                        $timeout(function() {
                            processTourStop();
                        }, intervalBetweenStops);

                    }
                    else {
                        mapProperties.tourProperties.destination = false;
                        mapProperties.tourProperties.isOnTour = false;
                    }
                };
                $timeout(function() {
                    processTourStop();
                });

            },

            getCurrentMapCoordinates: function(mapProperties) {
                return this.toMapCoordinates(mapProperties, null, null);
            },
            getCurrentCenteredMapCoordinates: function(mapProperties) {
                return this.toMapCoordinates(mapProperties, mapProperties.width/2, mapProperties.height/2);
            },
            toImageCoordinates: function(mapCoordinate) {
                var mapProperties = this.mapProperties;
                // We need to convert the x,y of the map coordinates the x,y for the image
                // Note that the x,y for the image may not even be displayed on the screen (we're really doing
                // the BgPosX,BgPosY of the background image at the current zoom level (i.e. BgWidth and BgHeight).
                // So given an x,y, we must calculate BgPosX,BgPosY at BgWidth and BgHeight

                // We use mapProperties to get the current zoom level (i.e. BgWidth and BgHeight)

                //var XPixelsLeftOfViewport = -(mapProperties.width * percentToLeftOfViewport);
                //var YPixelsAboveViewport = -(mapProperties.height * percentAboveViewport);
                //var percentToLeftOfViewport = (mapProperties.BgPosX/mapProperties.BgWidth);
                //var percentAboveViewport = (mapProperties.BgPosY/mapProperties.BgHeight);

                var percentToLeftOfViewport = (-mapCoordinate.X)/mapCoordinate.Width;
                var percentAboveViewport = (-mapCoordinate.Y)/mapCoordinate.Height;
                var BgPosX = percentToLeftOfViewport*mapProperties.BgWidth;
                var BgPosY = percentAboveViewport*mapProperties.BgHeight;

                return {
                    X: BgPosX,
                    Y: BgPosY,
                    BgPosX: BgPosX,
                    BgPosY: BgPosY
                };

            },
            toMapCoordinates: function(mapProperties, ClickOffsetX, ClickOffsetY) {
                if(ClickOffsetX === null)
                    ClickOffsetX = 0;
                if(ClickOffsetY === null)
                    ClickOffsetY = 0;

                // NOTE: "xPixels" refers to map pixels, not image pixels
                var PercentXOfImageShown = mapProperties.width/mapProperties.BgWidth;
                var PercentYOfImageShown = mapProperties.height/mapProperties.BgHeight;


                var XPixelsInViewport = mapProperties.width*PercentXOfImageShown;
                var YPixelsInViewport = mapProperties.height*PercentYOfImageShown;
                //var NormalizedOffsetX = (ClickOffsetX * XPixelsInViewport) / mapProperties.width;
                //var NormalizedOffsetY = (ClickOffsetY * YPixelsInViewport) / mapProperties.height;
                var NormalizedOffsetX = ClickOffsetX * PercentXOfImageShown;
                var NormalizedOffsetY = ClickOffsetY * PercentYOfImageShown;


                var percentToLeftOfViewport = (mapProperties.BgPosX/mapProperties.BgWidth);
                var percentAboveViewport = (mapProperties.BgPosY/mapProperties.BgHeight);
                var XPixelsLeftOfViewport = -(mapProperties.width * percentToLeftOfViewport);
                var YPixelsAboveViewport = -(mapProperties.height * percentAboveViewport);

                // We have to calculate where the left viewport would be if the click location were
                // at the center of the viewport and then we will have the BgPosXIfCenteredOnClick

                // so find out how many pixels are to the left of the click
                // then find out how many pixels are in the entire viewport and then divide by 2
                // then subtract how many pixels are to the left of the click and the pixels
                // in half of the viewport and take the absolute value
                // then add that value to the pixels left of viewport
                // that will give us the center as a map coordinate, then we will need to
                // convert that to an image coordinate to get the centered BgPosX and BgPosY (i.e. BgPosXIfCenteredOnClick)

                // still valid but not used: var xPixelsRightOfClick = XPixelsInViewport-NormalizedOffsetX;
                //  xPixelsLeftOfClick = NormalizedOffsetX;
                // var yPixelsAboveClick = NormalizedOffsetY;
                var xPixelsToAddToCenterViewport = NormalizedOffsetX - (XPixelsInViewport/2);
                var yPixelsToAddToCenterViewport = NormalizedOffsetY - (YPixelsInViewport/2);
                var XPixelsLeftOfCenteredViewport = XPixelsLeftOfViewport + xPixelsToAddToCenterViewport;
                var YPixelsAboveCenteredViewport = YPixelsAboveViewport + yPixelsToAddToCenterViewport;
                var percentToLeftOfCenteredViewport = (-XPixelsLeftOfCenteredViewport)/mapProperties.width;
                var percentAboveCenteredViewport = (-YPixelsAboveCenteredViewport)/mapProperties.height;
                var BgPosXCentered = percentToLeftOfCenteredViewport * mapProperties.BgWidth;
                var BgPosYCentered = percentAboveCenteredViewport * mapProperties.BgHeight;

                var PercentXLeftOfClick = (Math.abs(mapProperties.BgPosX) + ClickOffsetX)/mapProperties.BgWidth; // The percentage of the total image that is to the left of the clicked location.
                var PercentYAboveClick = (Math.abs(mapProperties.BgPosY) + ClickOffsetY)/mapProperties.BgHeight; // The percentage of the total image that is above the clicked location.

                return {
                    X: Math.abs(mapProperties.BgPosX) < 1 ? NormalizedOffsetX : XPixelsLeftOfViewport + NormalizedOffsetX, // The map x coordinate
                    Y: Math.abs(mapProperties.BgPosY) < 1 ? NormalizedOffsetY : YPixelsAboveViewport + NormalizedOffsetY, // The map y coordinate
                    XPixelsLeftOfViewport: XPixelsLeftOfViewport,
                    YPixelsAboveViewport: YPixelsAboveViewport,
                    XPixelsLeftOfCenteredViewport: XPixelsLeftOfCenteredViewport,
                    YPixelsAboveCenteredViewport: YPixelsAboveCenteredViewport,
                    NormalizedOffsetX: NormalizedOffsetX,
                    NormalizedOffsetY: NormalizedOffsetY,
                    BgWidth: mapProperties.BgWidth,
                    BgHeight: mapProperties.BgHeight,
                    BgPosX: mapProperties.BgPosX, // The BgPosX of the image from the image coordinates
                    BgPosY: mapProperties.BgPosY, // The BgPosY of the image from the image coordinates
                    BgPosXCentered: BgPosXCentered, // The BgPosX if the image were centered on the click location
                    BgPosYCentered: BgPosYCentered, // The BgPosY if the image were centered on the click location
                    XPixelsInViewport: XPixelsInViewport,
                    YPixelsInViewport: YPixelsInViewport,
                    PercentXOfImageShown: PercentXOfImageShown,
                    PercentYOfImageShown: PercentYOfImageShown,
                    ClickOffsetX: ClickOffsetX, // The original ClickOffsetX of the image coordinates
                    ClickOffsetY: ClickOffsetY,  // The original ClickOffsetY of the image coordinates,
                    Height: mapProperties.height,
                    Width: mapProperties.width,
                    PercentXLeftOfClick: PercentXLeftOfClick,
                    PercentYAboveClick: PercentYAboveClick

                };

            }
        };
    }]);