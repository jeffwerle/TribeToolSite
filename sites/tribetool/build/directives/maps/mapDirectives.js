angular.module('app.Directives')
    .directive('mapsPage', ['mediaService', function (mediaService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="!mediaService.isPhone" class="col-xs-12">' +
                        '<community-cover-photo></community-cover-photo>' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                    '<div class="col-sm-offset-2 col-sm-8">' +
                        '<wiki-browsing-page-map-area></wiki-browsing-page-map-area>' +
                    '</div>' +
                '</div>',
            scope: {
            },
            link: function (scope, element, attrs) {
                scope.mediaService = mediaService;
            }
        };
    }])
    .directive('mapPage', ['$routeParams', 'mapService', 'commService', 'accountService', 'communityService', 'navigationService', '$timeout', function ($routeParams, mapService, commService, accountService, communityService, navigationService, $timeout) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="!isMap">' +
                        '<submit-map ng-if="canCreateMap" map="map"></submit-map>' +
                    '</div>' +
                    '<div ng-if="isMap">' +
                        '<div ng-show="processing"><loading></loading> Loading Map...</div>' +
                        '<div ng-if="map">' +
                            '<map-content-page map="map"></map-content-page>' +
                            '<map-page-tour></map-page-tour>' +
                        '</div>' +

                    '</div>' +
                '</div>',
            scope: {
                mapUrl: '='
            },
            link: function (scope, element, attrs) {
                scope.update = function() {
                    scope.isMap = true;
                    scope.map = null;
                    $timeout(function() {
                        if(scope.$$destroyed) {
                            return;
                        }

                        scope.mapUrl = $routeParams.mapUrl;
                        scope.isMap = angular.isDefined(scope.mapUrl);
                        scope.map = null;

                        if(!scope.isMap) {
                            scope.isLoggedIn = accountService.isLoggedInAndConfirmed();
                            scope.accountLevel = communityService.accountCommunity ? communityService.accountCommunity.Level.Level : null;
                            scope.canCreateMap = communityService.isModerator() || (scope.accountLevel && scope.accountLevel >= mapService.minimumLevelToEdit);

                            if(!scope.canCreateMap) {
                                commService.showErrorAlert('You must be at least level ' + mapService.minimumLevelToEdit + ' before you can create a Map.');
                                navigationService.goToWiki(communityService.community);
                                return;
                            }
                        }
                        else {
                            scope.processing = true;
                            mapService.getMap(scope.mapUrl, function(data) {
                                // Success
                                scope.map = data.Map;
                                if(!scope.map.MapLocations) {
                                    scope.map.MapLocations = [];
                                }
                                scope.processing = false;
                            }, function(data) {
                                // Failure
                                scope.processing = false;
                                commService.showErrorAlert(data);
                            });
                        }
                    });
                };
                scope.update();

                scope.$on('$routeChangeSuccess', function() {
                    scope.update();
                });

            }
        };
    }])
    .directive('submitMap', ['accountService', 'mapService', 'communityService', 'commService', 'navigationService', function (accountService, mapService, communityService, commService, navigationService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="col-xs-12">' +
                    '<div class="col-xs-7">' +

                        '<div ng-show="processing"><loading></loading> Submitting...</div>' +
                        '<div ng-show="!processing">' +
                            '<h2>Create a Map <excited-face-animation></excited-face-animation></h2>' +
                            '<form ng-submit="submit()">' +
                                '<label>Name <span class="required-star">*</span></label>' +
                                '<input class="form-control" placeholder="Map Name" required ng-model="form.Name">' +

                                '<button class="btn btn-primary pull-right" type="submit" style="margin-top: 20px;">Submit</button>' +

                            '</form>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                map: '='
            },
            link: function (scope, element, attrs) {
                scope.form = {
                };

                // Is the user allowed to create a map?
                scope.isLoggedIn = accountService.isLoggedInAndConfirmed();
                scope.accountLevel = communityService.accountCommunity ? communityService.accountCommunity.Level.Level : null;

                if(!scope.isLoggedIn) {
                    // We're not logged in, abort
                    commService.showErrorAlert('Please login in order to create a Map.');
                    navigationService.goToWiki(communityService.community);
                    return;
                }
                else if(scope.accountLevel < mapService.minimumLevelToEdit && !communityService.isModerator()) {
                    commService.showErrorAlert('You must be at least level ' + mapService.minimumLevelToEdit + ' before you can create a Map.');
                    navigationService.goToWiki(communityService.community);
                    return;
                }

                scope.submit = function() {
                    var map = {
                        Name: scope.form.Name
                    };

                    scope.processing = true;
                    mapService.createMap(map, function(data) {
                        // Success
                        scope.map = data.Map;
                        commService.showSuccessAlert('Map "' + scope.map.Name + '" created successfully!');
                        navigationService.goToMap(scope.map, communityService.community);
                        scope.processing = false;
                    }, function(data) {
                        // Failure
                        scope.processing = false;
                        commService.showErrorAlert(data);
                    });
                };
            }
        };
    }])

    .directive('mapContentPage', ['mapService', 'communityService', 'accountService', 'commService', function (mapService, communityService, accountService, commService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="!map.MainImage" class="centered">' +
                        '<div ng-if="!canEdit">' +
                            '<h4>You must be at least level {{minLevelToEdit}} to edit a Map. The current Map hasn\'t yet had an image selected.</h4>' +
                            '<h3>Please consider <a ng-href="wiki/{{community.Url}}">viewing a different map.</a></h3>' +
                        '</div>' +
                        '<div ng-if="canEdit">' +
                            '<h4>Please select a background image for the "{{map.Name}}" Map.</h4>' +
                            '<file-dropzone file-options="fileDropzoneOptions" on-file-dropped="onFileDropped()">' +
                                '<img ng-click="selectImage()" class="wiki-page-main-image pointer" ng-src="{{mainImagePreviewUrl | trusted}}">' +
                            '</file-dropzone>' +
                            '<button class="btn btn-primary" style="margin-top: 10px;" ng-click="selectImage()">Select Image</button>' +
                        '</div>' +
                    '</div>' +
                    '<div ng-if="map.MainImage">' +
                        '<div ng-show="processing"><loading></loading> Submitting...</div>' +
                        '<div ng-show="!processing">' +
                            '<map map="map" options="mapOptions"></map>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                map: '='
            },
            link: function (scope, element, attrs) {
                scope.mainImagePreviewUrl = scope.map && scope.map.MainImage ? scope.map.MainImage.Medium.Url : 'images/silhouette-medium.png';

                scope.community = communityService.community;
                scope.minLevelToEdit = mapService.minimumLevelToEdit;
                scope.isLoggedIn = accountService.isLoggedInAndConfirmed();
                scope.accountLevel = communityService.accountCommunity ? communityService.accountCommunity.Level.Level : null;
                scope.hasWriteAccess = communityService.hasWriteAccess();
                scope.canEdit = scope.hasWriteAccess && scope.accountLevel && scope.accountLevel >= mapService.minimumLevelToEdit;

                scope.mapOptions = {
                    onClick: function() {

                    },
                    canEdit: scope.canEdit
                };

                scope.fileDropzoneOptions = { };
                scope.onFileDropped = function() {
                    scope.selectImage(scope.fileDropzoneOptions);
                };

                /* Shows a dialog box to select an image for the map and then
                 * sets it as the main image. */
                scope.selectImage = function(fileOptions) {
                    mapService.selectPicture(function(imageFileEntry) {
                            // Set this image as the main image of the map
                            scope.processing = true;
                            mapService.setMainImage(scope.map, imageFileEntry,
                                function(data) {
                                    // success
                                    scope.processing = false;
                                    scope.map.MainImage = imageFileEntry;
                                }, function(data) {
                                    // Failure
                                    scope.processing = false;
                                    commService.showErrorAlert(data);
                                });
                        }, scope.map, /*allowImageSizeSelection*/false, /*selectUploadedImage*/true,
                        /*albumType*/ 'ProfilePicture',
                        /*fileOptions*/fileOptions);
                };


            }
        };
    }])
    .directive('mapImageCarousel', ['mapTourService', function (mapTourService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div class="cover-photo-carousel-container">' +
                        '<carousel class="cover-photo-carousel" interval="2000">' +
                            '<slide class="cover-photo-carousel-slide" ng-repeat="image in tourStop.mapLocation.images" active="image.active">' +
                                '<div class="pointer">' +
                                    '<div class="cover-photo-container cover-photo-flip">' +
                                        '<img class="cover-photo cover-photo-flip" ng-src="{{image.url | trusted}}">' +
                                    '</div>' +
                                    '<div style="position:relative" class="carousel-caption">' +
                                        '<p class="covert-photo-carousel-caption">{{tourStop.mapLocation.TagPage.Tag}}</p>' +
                                    '</div>' +
                                '</div>' +
                            '</slide>' +
                        '</carousel>' +
                    '</div>' +
                '</div>',
            scope: {
            },
            link: function (scope, element, attrs) {
                scope.mapTourCallbacks = {
                    onLoadTourStop: function(tourStop) {
                        scope.tourStop = tourStop;
                    }
                };
                mapTourService.callbacks.push(scope.mapTourCallbacks);


                scope.$on('$destroy', function() {
                    mapTourService.removeCallback(scope.mapTourCallbacks);
                });
            }
        };
    }])
    /*
     Attributes:
     options
     {
     onClick: the function to run when the user clicks on a click location. Takes "clickLocation" as a parameter.
     }
     */
    .directive('map', ['mapImageService', '$rootScope', '$timeout', '$window', 'mapService', 'commService', 'tagPageService', 'toolbarService', 'mapTourService', 'lockService', 'communityService', 'mediaService', 'accountService', function(mapImageService, $rootScope, $timeout, $window, mapService, commService, tagPageService, toolbarService, mapTourService, lockService, communityService, mediaService, accountService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div class="col-sm-9 text-center center-block">' +
                        '<div id="mapContainer">' +
                            '<img no-context-menu style="height: 600px;" id="map" ng-src="{{map.MainImage.Full.Url | trusted}}">' +
                        '</div>' +

                        /* Show images under map if not on mobile */
                        '<div ng-if="!mediaService.isPhone" ng-show="tourStop">' +
                            '<map-image-carousel></map-image-carousel>' +

                            '<div>' +
                                '<tour-stop-images></tour-stop-images>' +
                            '</div>' +
                        '</div>' +

                    '</div>' +
                    '<div class="col-sm-3">' +
                        /* Only allow map editing if we're not on mobile--and if we're logged in */
                        '<div ng-if="!mediaService.isPhone && isLoggedIn && hasWriteAccess">' +
                            '<div class="pull-right">' +
                                '<span ng-show="!options.canEdit"><i class="fa fa-lock"></i> Locked <span ng-show="levelTooLow" style="font-size:9px; font-weight: bold;">(You must be at least level {{minimumLevelToEdit}} to edit a Map)</span></span>' +
                                '<span ng-show="hasLock && options.canEdit"><i class="fa fa-unlock-alt"></i> Unlocked For You</span>' +
                                '<span ng-show="!hasLock && options.canEdit"><i class="fa fa-unlock"></i> Public</span>' +
                            '</div>' +
                            '<div ng-show="options.canEdit">' +
                                '<div ng-show="isEditing">' +
                                    '<edit-lock-area map="map"></edit-lock-area>' +
                                '</div>' +
                                '<a ng-show="!isEditing" class="action-link" ng-click="setEditMode(true)">Edit Map</a>' +
                                '<button ng-show="isEditing" style="clear:both;" class="btn btn-warning pull-left" ng-click="setEditMode(false)">Stop Editing</button>' +
                            '</div>' +
                        '</div>' +

                        '<div class="clearfix" style="clear:both;"></div>' +
                        '<map-tour-panel map="map" tour="tour"></map-tour-panel>' +

                        /* Show images underneath tour if on mobile */
                        '<div ng-if="mediaService.isPhone" ng-show="tourStop">' +
                            '<map-image-carousel></map-image-carousel>' +

                            '<div>' +
                                '<tour-stop-images></tour-stop-images>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                options: '=',
                map: '='
            },
            link: function(scope, element, attrs, controller) {
                scope.isLoggedIn = accountService.isLoggedIn();
                scope.hasWriteAccess = communityService.hasWriteAccess();
                scope.mediaService = mediaService;
                var defaults = {
                    zoom: 0.10
                };

                if(!scope.hasWriteAccess && scope.options.canEdit) {
                    scope.options.canEdit = false;
                }

                scope.setEditMode = function(isEditing) {
                    scope.isEditing = isEditing;
                };


                scope.levelTooLow = false;
                scope.minimumLevelToEdit = mapService.minimumLevelToEdit;
                scope.hasLock = lockService.hasLock(scope.map.Lock);
                if(scope.options.canEdit) {
                    if(scope.hasLock) {
                        // There is a lock--can we make it passed?
                        scope.options.canEdit = lockService.canBypassLock(scope.map.Lock);
                    }
                    else {
                        if(communityService.accountCommunity.Level.Level < scope.minimumLevelToEdit && !communityService.isModerator()) {
                            scope.options.canEdit = false;
                            scope.levelTooLow = true;
                        }
                    }
                }


                scope.mapTourCallbacks = {
                    onLoadTourStop: function(tourStop) {
                        scope.tourStop = tourStop;
                    }
                };
                mapTourService.callbacks.push(scope.mapTourCallbacks);



                mapTourService.clear();
                var goToNextTourStop = function() {
                    mapTourService.loadNextTourStop();
                };
                scope.toolbarCallbacks = {
                    onToolbarClosed: function() {
                    },
                    onPlaylistDone: function() {
                        goToNextTourStop();
                    },
                    onPlaylistItemDone: function() {
                        goToNextTourStop();
                    }
                };

                toolbarService.callbacks.push(scope.toolbarCallbacks);
                scope.$on('$destroy', function() {
                    toolbarService.removeCallback(scope.toolbarCallbacks);
                    mapTourService.removeCallback(scope.mapTourCallbacks);

                    mapService.saveState();
                    mapTourService.saveState();
                });


                scope.startTour = function(startMapLocation) {

                    scope.tour = mapTourService.loadTourStopFromMapLocation(startMapLocation);
                };

                var mapContainer = $('#mapContainer');
                var $imgElement = $('#map');
                var imgElement = $imgElement[0];

                $imgElement.width(mapContainer.width());

                scope.mapOptions = angular.extend(defaults, scope.options); // Copy all properties from options to defaults
                scope.mapOptions.onClick = function(clickLocation) {
                    if(scope.options.onClick) {
                        scope.options.onClick(clickLocation);
                    }

                    var closestMapLocation = mapService.getClosestMapLocation(clickLocation);
                    if(scope.isEditing) {
                        var addMapLocation = function() {
                            // Ask whether the user wants to add a click location
                            mapService.pauseMap();
                            var highlightArea = mapService.addHighlightArea(clickLocation);
                            mapService.openMapLocationDialog({
                                clickLocation: clickLocation,
                                map: scope.map
                            }, function() {
                                mapService.refreshMap();
                                mapService.resumeMap();
                            });
                        };

                        // Are we sufficiently close to the map location? If so, we should
                        // ask whether to remove it.
                        if(closestMapLocation !== null) {
                            // Edit the map location
                            var distance = mapService.getDistance(clickLocation, closestMapLocation.Coordinate);
                            if(distance <= 5) {
                                mapService.pauseMap();
                                mapService.openMapLocationDialog({
                                    mapLocation: closestMapLocation,
                                    map: scope.map
                                }, function() {
                                    mapService.resumeMap();
                                    mapImageService.refreshMap(scope.mapProperties);
                                });
                            }
                            else {
                                addMapLocation();
                            }
                        }
                        else {
                            addMapLocation();
                        }


                    }
                    else {
                        // Go to the closest attraction
                        if(closestMapLocation !== null) {
                            if(!mapTourService.tour) {
                                // Start a tour beginning at this map location
                                scope.startTour(closestMapLocation);
                            }
                            else {
                                mapTourService.loadTourStopFromMapLocation(closestMapLocation);
                                scope.tour = mapTourService.tour;
                            }

                            return false;
                        }
                    }

                    // Move to map location
                    return true;
                };

                var wheelEventName;
                if ( document.onmousewheel !== undefined ) { // Webkit/Opera/IE
                    wheelEventName = 'onmousewheel';
                }
                else if ( document.onwheel !== undefined) { // FireFox 17+
                    wheelEventName = 'onwheel';
                }

                if (!wheelEventName || !('backgroundSize' in imgElement.style)) { // IE8-
                    return;
                }

                scope.mapProperties = {
                    dragProperties: { },
                    tourProperties: { },
                    options: scope.mapOptions,
                    highlightAreas: [],
                    element: imgElement,
                    $element: $imgElement,
                    mapPaused: false,
                    scope: scope,
                    map: scope.map
                };
                mapImageService.mapProperties = scope.mapProperties;

                function loaded() {
                    mapImageService.initializeMapProperties(imgElement, $imgElement, scope.mapProperties, function() {

                        imgElement[wheelEventName] = function (e) {
                            mapImageService.onWheelMove(e);
                        };

                        // Make the background draggable
                        scope.mapProperties.dragProperties.isMouseDown = false;
                        scope.mapProperties.dragProperties.didDrag = false;

                        mapImageService.subscribeToMapEvents($imgElement, scope.mapProperties);


                        mapService.loadMap(scope.map, function() {
                            // Load state after we load the map so we know for which map the tour applies
                            mapTourService.loadState();
                            scope.tour = mapTourService.tour;

                            $timeout(function() {
                                $rootScope.$broadcast('mapRendered', scope.map);
                            });
                        });


                    });


                }

                $timeout(function() {
                    loaded();
                });

                if(mediaService.isDesktop) {
                    angular.element($window).bind('resize', function() {
                        $imgElement.width(mapContainer.width());
                        mapImageService.setMapSize();
                        mapImageService.refreshMap();
                    });
                }


            }
        };
    }])
    .directive('mapTourPanel', ['mapService', 'communityService', 'accountService', 'mapTourService', 'mapImageService', '$timeout', 'navigationService', 'mediaService', function (mapService, communityService, accountService, mapTourService, mapImageService, $timeout, navigationService, mediaService) {
        var callsToAction =
            '<social-login-buttons-vertical ng-if="!isLoggedIn"></social-login-buttons-vertical>' +
            '<div class="centered"><button class="btn btn-primary" ng-click="goToCommunity()">View {{topic}} Posts!</button></div>' +
            '<div class="centered"><button class="btn btn-primary" style="margin-top: 10px;" ng-click="goToMaps()">Explore More Maps</button></div>';
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div style="margin-top: 5px;" class="centered" ng-if="mediaService.isPhone">' +
                         callsToAction +
                    '</div>' +
                    '<h2 id="mapTourPanelTitle" class="centered" ng-show="tour">Tour</h2>' +
                    '<div infinite-scroll="getMoreItems()" infinite-scroll-disabled="scrollingDone || processing" infinite-scroll-distance="2">' +
                        '<div class="tour-stop pointer" ng-class="{\'selected\': tourStop.selected}" ng-click="tourStopClicked(tourStop)" ng-repeat="tourStop in tourStops">' +
                            '<a id="{{tourStop.mapLocation.Id}}"></a>' +
                            '<div ng-if="tourStop.mapLocation.TagPage && tourStop.mapLocation.TagPage.MainImage" style="float: left; margin-right: 20px;">' +
                                '<tag-picture options="tagPictureOptions" tag-page="tourStop.mapLocation.TagPage"></tag-picture>' +
                            '</div>' +
                            '<div><span style="font-weight: bold;">Name:</span> <span>{{tourStop.mapLocation.Name}}</span></div>' +
                            '<div><span style="font-weight: bold;">Tag:</span> <span>{{tourStop.mapLocation.Tag}}</span></div>' +

                            '<div ng-if="tourStop.selected">' +

                                '<div ng-repeat="image in tourStop.mapLocation.images" ng-if="$index < 2" class="centered">' +
                                    '<img ng-src="{{image.tbUrl}}" show-light-box fit-image-width-to-parent class="pointer light-boxable-image"/>' +
                                '</div>' +



                                '<div style="clear:both;" class="centered">' +
                                    '<button class="btn btn-info" ng-click="goToTagPage(tourStop)">Go To {{tourStop.mapLocation.TagPage.Tag}} Page</button>' +
                                '</div>' +

                            '</div>' +
                            '<div class="clearfix"></div>' +

                        '</div>' +
                    '</div>' +
                    '<div ng-show="processing"><loading></loading> Loading...</div>' +
                    '<div style="margin-top: 5px;" class="centered" ng-if="!mediaService.isPhone">' +
                        callsToAction +
                    '</div>' +
                '</div>',
            scope: {
                map: '=',
                tour: '='
            },
            link: function (scope, element, attrs) {
                scope.mediaService = mediaService;
                scope.community = communityService.community;
                scope.communityName = communityService.getNameWithoutThe();
                scope.topic = communityService.community.Options.Topic;
                scope.isLoggedIn = accountService.isLoggedIn();


                scope.$watch('tour', function(newValue) {
                    if(newValue) {
                        // Set the height of the tour panel to the same as the map if we're not on mobile.
                        if(!mediaService.isPhone) {
                            var $imgElement = mapImageService.mapProperties.$element;
                            $('#tourPanelPerfectScrollbar').height($imgElement.height());
                        }
                    }
                });

                scope.goToTagPage = function(tourStop) {
                    navigationService.goToPath('/wiki/' + communityService.community.Url +'/' + tourStop.mapLocation.TagPage.Tag);
                };

                scope.tourStopClicked = function(tourStop) {
                    if(mapTourService.tourStop !== tourStop)
                        mapTourService.loadTourStop(tourStop);
                };

                scope.goToMaps = function() {
                    navigationService.goToPath('/maps');
                };
                scope.goToCommunity = function() {
                    navigationService.goToCommunity(scope.community.Url);
                };

                scope.tagPictureOptions = {
                    onClick: function() {

                    },
                    // Don't allow redirecting to tag page from tag page picture (by giving an empty Url
                    // for the picture)
                    constructUrl: function(tag, tagPage) {
                        return '';
                    }
                };

                scope.callbacks = {
                    // Create a new tour when the user clicks on a map location
                    onLoadTourStopFromMapLocation: function(mapLocation) {
                        $timeout(function() {
                            scope.startTour(mapLocation);
                        });
                    }
                };

                mapTourService.callbacks.push(scope.callbacks);
                scope.$on('$destroy', function() {
                    mapTourService.removeCallback(scope.callbacks);
                });


                var countToLoadFromCache = 4;
                scope.tourCache = [];
                scope.tourStops = [];
                scope.scrollingDone = false;
                scope.getMoreItems = function() {
                    if(scope.processing || scope.scrollingDone) {
                        return;
                    }

                    scope.processing = true;
                    // Timeout so we can give the loading gif time to render
                    $timeout(function() {

                        // Retrieve the items from the cache
                        var cacheLength = scope.tourCache.length;
                        for(var i = 0; i < cacheLength && i < countToLoadFromCache; i++) {
                            var tourStop = scope.tourCache.shift();
                            scope.tourStops.push(tourStop);
                        }
                        if(scope.tourCache.length <= 0) {
                            scope.processing = false;
                            scope.scrollingDone = true;
                        }
                        else {
                            $timeout(function() {
                                scope.processing = false;
                            });
                        }
                    });
                };


                scope.startTour = function(startMapLocation) {
                    scope.tour = mapTourService.createTour({
                        startMapLocation: startMapLocation
                    });
                    mapTourService.loadTour(scope.tour);

                    scope.tourStops = [];
                    scope.tourCache = [].concat(scope.tour.tourStops);
                    scope.scrollingDone = false;
                    scope.getMoreItems();
                };


            }
        };
    }])
    .directive('tourStopImages', ['mapTourService', 'communityService', 'googleService', 'navigationService', 'mediaService', function (mapTourService, communityService, googleService, navigationService, mediaService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<span ng-repeat="image in tourStop.mapLocation.images" class="centered">' +
                        '<img ng-src="{{image.url}}" show-light-box interactive-image fit-image-width-to-parent class="pointer light-boxable-image" style="margin-bottom: 5px; max-width: {{mediaService.isPhone ? 200 : 2000}};" />' +
                    '</span>' +

                    '<div style="clear: both;">' +
                        '<button class="btn btn-info centered" ng-click="goToTagPage()">Go To {{tourStop.mapLocation.TagPage.Tag}} Page</button>' +
                    '</div>' +
                '</div>',
            scope: {
                tourStop: '='
            },
            link: function (scope, element, attrs) {
                scope.mediaService = mediaService;
                scope.images = [];
                scope.googleService = googleService;
                scope.tourStop = null;

                scope.callbacks = {
                    onLoadTourStop: function(tourStop) {
                        scope.tourStop = tourStop;
                        if(!scope.tourStop.mapLocation.images ||
                            scope.tourStop.mapLocation.images.length <= 0) {
                            scope.initialize();
                        }


                    }
                };
                mapTourService.callbacks.push(scope.callbacks);
                scope.$on('$destroy', function() {
                    mapTourService.removeCallback(scope.callbacks);
                });

                scope.loadImages = function() {
                    if(scope.tourStop) {
                        if(!scope.imageSearcher) {
                            scope.imageSearcher = googleService.getImageSearcher();
                        }

                        scope.imageSearcher.setSearchCompleteCallback(this, function() {

                            googleService.makeImagesSecure(scope.imageSearcher);
                            scope.$apply(function() {
                                scope.tourStop.mapLocation.images = scope.imageSearcher.results;
                            });



                        }, []);

                        scope.imageSearcher.execute(scope.tourStop.mapLocation.Tag + ' ' + communityService.community.Options.ImageSearchTopic);

                    }
                };

                scope.initialize = function() {
                    if(!scope.googleService.isReady) {
                        googleService.readyCallbacks.push(function() {
                            scope.loadImages();
                        });
                    }
                    else {
                        scope.loadImages();
                    }
                };

                scope.goToTagPage = function() {
                    navigationService.goToPath('/wiki/' + communityService.community.Url +'/' + scope.tourStop.mapLocation.TagPage.Tag);
                };


            }
        };
    }])
    /* The comment picture of a MapEntry */
    .directive('mapPicture', ['mapService', 'communityService', 'accountService', function (mapService, communityService, accountService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<span><a class="map-picture-container" ng-href="map/{{communityUrl}}/{{map.Url}}" ng-click="pictureClicked()"><img class="map-picture" ng-src="{{mapPictureUrl | trusted}}"></a></span>',
            scope: {
                /* MapEntry */
                map: '=',
                /* {
                 onClick()
                 * } */
                options: '=?'
            },
            link: function (scope, element, attrs) {
                scope.communityUrl = communityService.community.Url;

                scope.mapPictureUrl = mapService.getMapImageUrl(scope.map);

                scope.pictureClicked = function() {
                    if(scope.options && scope.options.onClick) {
                        scope.options.onClick();
                    }
                };
            }
        };
    }])
    .directive('mapStrip', ['communityService', 'mapService','commService', function (communityService, mapService, commService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div class="centered" style="height: 50px; overflow: hidden;">' +
                        '<span ng-repeat="map in maps">' +
                            '<map-picture style="margin-right: 5px;" map="map"></map-picture>' +
                        '</span>' +
                    '</div>' +
                '</div>',
            scope: {
            },
            link: function (scope, element, attrs) {
                if(!mapService.maps || mapService.maps.length <= 0) {
                    scope.$on('mapsChanged', function(event, maps) {
                        scope.updateMaps();
                    });
                }

                scope.updateMaps = function() {
                    scope.maps = [];
                    var maxTags = 10;
                    if(mapService.maps && mapService.maps.length > 0) {
                        // Get pictures from random maps
                        var shuffledMaps = commService.shuffle(mapService.maps);
                        for(var i = 0; i < shuffledMaps.length && i < maxTags; i++) {
                            var map = shuffledMaps[i];
                            if(map.MainImage) {
                                scope.maps.push(map);
                            }
                        }
                    }
                };
                scope.updateMaps();

            }
        };
    }]);