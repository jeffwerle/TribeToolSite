angular.module('app.Directives')
    .directive('wikiPage', ['$timeout', '$routeParams', 'communityService', function ($timeout, $routeParams, communityService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="!isTagPage">' +
                        '<div class="col-xs-12">' +
                            '<community-cover-photo></community-cover-photo>' +
                        '</div>' +
                        '<div class="clearfix"></div>' +
                        '<wiki-browsing-page></wiki-browsing-page>' +
                    '</div>' +
                    '<div ng-if="isTagPage && tag">' +
                        '<tag-page tag="tag"></tag-page>' +
                    '</div>' +
                '</div>',
            scope: {
            },
            link: function (scope, element, attrs) {
                scope.update = function() {
                    scope.isTagPage = true;
                    scope.tag = null;
                    $timeout(function() {
                        if(scope.$$destroyed) {
                            return;
                        }

                        scope.tag = $routeParams.tag;
                        scope.isTagPage = angular.isDefined(scope.tag);
                        scope.communityUrl = communityService.community.Url;
                    });
                };
                scope.update();

                scope.$on('$routeChangeSuccess', function() {
                    scope.update();
                });

            }
        };
    }])
    .directive('wikiBrowsingPage', ['tagPageService', 'commService', 'navigationService', 'mediaService', function (tagPageService, commService, navigationService, mediaService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div class="col-sm-6">' +
                        '<button ng-if="mediaService.isPhone" class="btn btn-primary pull-right" ng-click="goToMapArea()">Go To Maps</button>' +
                        '<wiki-browsing-page-tag-page-area></wiki-browsing-page-tag-page-area>' +
                    '</div>' +
                    '<div class="col-sm-6">' +
                        '<button ng-if="mediaService.isPhone" class="btn btn-primary pull-right" ng-click="goToTagPageArea()">Go To Tags</button>' +
                        '<wiki-browsing-page-map-area></wiki-browsing-page-map-area>' +
                    '</div>' +
                '</div>',
            scope: {
            },
            link: function (scope, element, attrs) {
                scope.mediaService = mediaService;
                scope.goToMapArea = function() {
                    navigationService.scrollToHash('wikiBrowsingPageMapArea');
                };
                scope.goToTagPageArea = function() {
                    navigationService.scrollToHash('wikiBrowsingPageTagPageArea');
                };


            }
        };
    }])
    .directive('wikiBrowsingPageTagPageArea', ['tagPageService', 'commService', 'navigationService', 'communityService', 'mapService', 'accountService', '$timeout', 'mediaService', function (tagPageService, commService, navigationService, communityService, mapService, accountService, $timeout, mediaService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<a id="wikiBrowsingPageTagPageArea"></a>' +
                    '<h1 class="wiki-header wiki-header-1">Tag Pages</h1>' +
                    '<div class="row">' +
                        '<div class="centered col-xs-12">' +
                            '<label>Search for a tag:</label>' +
                            '<tag-page-search-bar></tag-page-search-bar>' +
                            '<button style="margin-top: 10px;" class="btn btn-primary pull-right" ng-click="viewAllPlaylists()">View All Playlists</button>' +
                        '</div>' +
                    '</div>' +
                    '<div style="margin-top: 20px;" ng-show="tagPages && tagPages.length > 0">' +
                        '<h2 class="wiki-header wiki-header-3 centered">Recently Updated Tag Pages</h2>' +
                        '<div id="tagPagesContainer" infinite-scroll="getMoreTagPages()" infinite-scroll-disabled="tagPageScrollingDone || tagPageProcessing || mediaService.isPhone">' +
                            '<div ng-repeat="tagPage in tagPages">' +
                                '<div class="row">' +
                                    '<div class="col-xs-offset-1 col-xs-10 tag-page-preview-well pointer" ng-click="goToTagPage(tagPage)">' +
                                        '<tag-picture tag-page="tagPage" style="margin-right: 20px;"></tag-picture>' +
                                        '<tag tag="tagPage.Tag"></tag>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div ng-if="mediaService.isPhone && !tagPageScrollingDone">' +
                            '<button class="btn btn-primary" ng-click="getMoreTagPages()">Load More Tags</button>' +
                        '</div>' +
                        '<div ng-show="tagPageProcessing"><loading></loading> Retrieving Tags...</div>' +
                    '</div>' +
                '</div>',
            scope: {
            },
            link: function (scope, element, attrs) {
                scope.mediaService = mediaService;
                scope.tagPagePageNumber = 1;
                scope.tagPageCountPerPage = 10;
                scope.tagPageScrollingDone = false;
                scope.tagPages = [];

                scope.getMoreTagPages = function() {
                    if(scope.tagPageProcessing || scope.tagPageScrollingDone) {
                        return;
                    }

                    scope.tagPageProcessing = true;
                    tagPageService.getRecentlyUpdatedTagPages(scope.tagPagePageNumber, scope.tagPageCountPerPage, function(data) {
                        if(data.TagPages && data.TagPages.length > 0)
                            scope.tagPages = scope.tagPages.concat(data.TagPages);

                        scope.tagPageScrollingDone = !data.TagPages || data.TagPages.length < scope.tagPageCountPerPage;

                        $timeout(function() {
                            scope.tagPageProcessing = false;
                        });

                        scope.tagPagePageNumber++;

                    }, function(data) {
                        scope.tagPageProcessing = false;
                    });
                };
                scope.getMoreTagPages();

                scope.goToTagPage = function(tagPage) {
                    navigationService.goToTagPage(tagPage.Tag, communityService.community);
                };




                scope.viewAllPlaylists = function() {
                    navigationService.goToPath('/playlists/' + communityService.community.Url);
                };
            }
        };
    }])
    .directive('wikiBrowsingPageMapArea', ['tagPageService', 'commService', 'navigationService', 'communityService', 'mapService', 'accountService', '$timeout', 'mediaService', function (tagPageService, commService, navigationService, communityService, mapService, accountService, $timeout, mediaService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<a id="wikiBrowsingPageMapArea"></a>' +
                    '<h1 class="wiki-header wiki-header-1">Maps</h1>' +
                    '<div class="row">' +
                        '<div class="centered col-xs-12">' +
                            '<label>Search for a map:</label>' +
                            '<map-search-bar></map-search-bar>' +
                            // Don't let mobile users create maps--it's just not feasible.
                            '<button ng-show="canCreateMap && !mediaService.isPhone" style="margin-top: 10px;" class="btn btn-primary pull-right" ng-click="createMap()">Create Map</button>' +
                        '</div>' +
                    '</div>' +
                    '<div style="margin-top: 20px;" ng-show="maps && maps.length > 0">' +
                        '<h2 class="wiki-header wiki-header-3 centered">Recently Updated Maps</h2>' +
                        '<div id="mapsContainer" infinite-scroll="getMoreMaps()" infinite-scroll-disabled="mapScrollingDone || mapProcessing || mediaService.isPhone">' +
                            '<div ng-repeat="map in maps">' +
                                '<div class="row">' +
                                    '<div class="col-xs-offset-1 col-xs-10 map-preview-well pointer" ng-click="goToMap(map)">' +
                                        '<map-picture map="map" style="margin-right: 20px;"></map-picture>' +
                                        '<a ng-href="{{::map.fullUrl}}">{{::map.Name}}</a>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div ng-if="mediaService.isPhone && !mapScrollingDone">' +
                            '<button class="btn btn-primary" ng-click="getMoreMaps()">Load More Maps</button>' +
                        '</div>' +
                        '<div ng-show="mapProcessing"><loading></loading> Retrieving Maps...</div>' +
                    '</div>' +
                '</div>',
            scope: {
            },
            link: function (scope, element, attrs) {
                scope.mediaService = mediaService;
                scope.mapPageNumber = 1;
                scope.mapCountPerPage = 10;
                scope.mapScrollingDone = false;
                scope.maps = [];
                scope.getMoreMaps = function() {
                    scope.mapProcessing = true;
                    mapService.getRecentlyUpdatedMaps(scope.mapPageNumber, scope.mapCountPerPage, function(data) {
                        for(var i = 0; i < data.Maps.length; i++) {
                            var map = data.Maps[i];
                            map.fullUrl = navigationService.getMapUrl(map, communityService.community);
                        }

                        if(data.Maps && data.Maps.length > 0)
                            scope.maps = scope.maps.concat(data.Maps);

                        scope.mapScrollingDone = !data.Maps || data.Maps.length < scope.mapCountPerPage;

                        $timeout(function() {
                            scope.mapProcessing = false;
                        });

                        scope.mapPageNumber++;

                    }, function(data) {
                        scope.mapProcessing = false;
                    });
                };
                scope.getMoreMaps();

                scope.createMap = function() {
                    navigationService.goToPath('/map/' + communityService.community.Url);
                };

                scope.goToMap = function(map) {
                    navigationService.goToMap(map, communityService.community);
                };

                scope.isLoggedIn = accountService.isLoggedInAndConfirmed();
                scope.accountLevel = communityService.accountCommunity ? communityService.accountCommunity.Level.Level : null;
                scope.canCreateMap = communityService.hasWriteAccess() && (communityService.isModerator() || (scope.accountLevel && scope.accountLevel >= mapService.minimumLevelToEdit));

            }
        };
    }])
    .directive('wikiPageMainImage', ['commService', 'tagPageService', 'stepPageService', 'wikiPageService', function (commService, tagPageService, stepPageService, wikiPageService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-show="settingMainImage"><loading></loading> Setting Image...</div>' +
                    '<div ng-show="!settingMainImage" style="clear:both;">' +
                        '<div ng-if="wikiPage.MainImage">' +
                            '<img show-light-box="showLightBoxOptions" class="wiki-page-main-image light-boxable-image" ng-src="{{::wikiPage.MainImage.Medium.Url | trusted}}" alt="{{wikiPage.MainImage.Alt}}" title="{{wikiPage.MainImage.Title}}">' +
                            '<div ng-show="wikiPage.MainImage.Title" class="centered">{{::wikiPage.MainImage.Title}}</div>' +
                        '</div>' +
                        '<div ng-if="!wikiPage.MainImage">' +
                            '<file-dropzone disabled="!allowEditing" file-options="fileDropzoneOptions" on-file-dropped="onFileDropped()">' +
                                '<img class="wiki-page-main-image" ng-src="{{wikiPage.mainImageUrl | trusted}}">' +
                            '</file-dropzone>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                wikiPage: '=',
                allowEditing: '=',
                specialization: '=?' // SpecializationEntry (for StepPage)
            },
            link: function (scope, element, attrs) {
                scope.fileDropzoneOptions = { };
                scope.onFileDropped = function() {
                    scope.selectImage(scope.fileDropzoneOptions);
                };

                scope.$watch('wikiPage', function(newValue) {
                    if(newValue) {
                        scope.tagPage = scope.specialization ? null : scope.wikiPage;
                        scope.stepPage = scope.specialization ? scope.wikiPage : null;

                        scope.showLightBoxOptions = {
                            tagPage: scope.tagPage,
                            stepPage: scope.stepPage,
                            specialization: scope.specialization,
                            imageFileEntry: scope.wikiPage.MainImage
                        };
                    }
                });


                /* Shows a dialog box to select an image for the tag page and then
                 * sets it as the main image if applicable. */
                scope.selectImage = function(fileOptions) {
                    wikiPageService.selectPicture(function(imageFileEntry) {
                            // Set the image as the main image of the tag page
                            scope.settingMainImage = true;
                            if(scope.wikiPage) {
                                if(angular.isDefined(scope.wikiPage.Tag)) {
                                    tagPageService.setMainImage(imageFileEntry, scope.wikiPage.Tag,
                                        scope.wikiPage, function(data) {
                                            // success
                                            // Load the profile picture!
                                            scope.settingMainImage = false;
                                            scope.wikiPage.MainImage = imageFileEntry;
                                            scope.wikiPage.mainImageUrl = imageFileEntry.Medium.Url;
                                        }, function(data) {
                                            // Failure
                                            commService.showErrorAlert(data);
                                            scope.settingMainImage = false;
                                        });
                                }
                                else {
                                    stepPageService.setMainImage(imageFileEntry,
                                        scope.wikiPage, function(data) {
                                            // success
                                            // Load the profile picture!
                                            scope.settingMainImage = false;
                                            scope.wikiPage.MainImage = imageFileEntry;
                                            scope.wikiPage.mainImageUrl = imageFileEntry.Medium.Url;
                                        }, function(data) {
                                            // Failure
                                            commService.showErrorAlert(data);
                                            scope.settingMainImage = false;
                                        });
                                }
                            }
                        }, scope.wikiPage, scope.wikiPage, /*allowImageSizeSelection*/false, /*selectUploadedImage*/true,
                        /*albumType*/ 'ProfilePicture',
                        /*fileOptions*/fileOptions);
                };
            }
        };
    }])
    .directive('wikiPageEditImagesArea', ['wikiPageService', 'communityService', function (wikiPageService, communityService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div style="clear:both; padding-top:20px;">' +
                    '<a id="wikiPageEditImagesArea"></a>' +
                    '<h1 class="wiki-header wiki-header-1">Images</h1>' +
                    '<album-stack ng-if="wikiPage" album-stack="wikiPage.AlbumStack" options="albumStackOptions"></album-stack>' +
                    '<button ng-show="hasWriteAccess" id="editImagesAreaEditButton" style="margin-top:10px;" class="btn btn-primary" ng-click="editImages()">Edit</button>' +
                '</div>',
            scope: {
                tagPage: '=?',
                stepPage: '=?',
                /*
                 editImages() // This method will be set in options by this directive so that it can be called outside of this directive,
                 */
                options: '=?'
            },
            link: function (scope, element, attrs) {
                scope.hasWriteAccess = communityService.hasWriteAccess();
                scope.wikiPage = scope.tagPage || scope.stepPage;
                scope.editImages = function() {
                    wikiPageService.selectPicture(function(imageFileEntry) {

                        }, scope.tagPage, scope.stepPage,
                        /*allowImageSizeSelection*/false,
                        /*selectUploadedImage*/false,
                        /*albumType*/ 'Any');
                };
                if(!scope.options) {
                    scope.options = { };
                }
                scope.options.editImages = scope.editImages;
                scope.albumStackOptions = {
                    tagPage: scope.tagPage,
                    stepPage: scope.stepPage
                };
            }
        };
    }])
    .directive('wikiPageEditPlaylistArea', ['playlistService', 'communityService', function (playlistService, communityService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div style="clear:both; padding-top:20px;">' +
                    '<a id="wikiPageEditPlaylistArea"></a>' +
                    '<h1 class="wiki-header wiki-header-1">Playlists</h1>' +
                    '<playlists ng-show="wikiPage.Playlists && wikiPage.Playlists.length > 0" playlists="wikiPage.Playlists"></playlists>' +
                    '<button ng-show="hasWriteAccess" id="editPlaylistsAreaEditButton" style="margin-top:10px;" class="btn btn-primary" ng-click="editPlaylists()" >Edit</button>' +
                '</div>',
            scope: {
                tagPage: '=?',
                stepPage: '=?',
                /*
                    editPlaylists() // This method will be set in options by this directive so that it can be called outside of this directive,
                 */
                options: '=?'
            },
            link: function (scope, element, attrs) {
                scope.hasWriteAccess = communityService.hasWriteAccess();
                scope.wikiPage = scope.tagPage || scope.stepPage;
                scope.editPlaylists = function() {
                    playlistService.editPlaylists({
                        playlists: scope.wikiPage.Playlists || [],
                        tagPage: scope.tagPage,
                        stepPage: scope.stepPage,
                        onCancelled: function() {
                            // Exited
                        }
                    });
                };
                if(!scope.options) {
                    scope.options = { };
                }
                scope.options.editPlaylists = scope.editPlaylists;
            }
        };
    }])
    .directive('wikiPageTalkPageArea', ['tagPageService', 'stepPageService', 'communityService', 'commService', 'markdownConverter', 'formatterService', '$compile', '$timeout', 'wikiPageService', 'mediaService', function (tagPageService, stepPageService, communityService, commService, markdownConverter, formatterService, $compile, $timeout, wikiPageService, mediaService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div ng-show="hasWriteAccess">' +
                    '<h1 class="wiki-header wiki-header-1" style="margin-top: 0px;" ng-class="{\'clear-both\': mediaService.isPhone}">{{::pageName}} Talk Page</h1>' +

                    '<tabset>' +
                        '<tab active="tab.viewing" select="goToViewTab()">' +
                            '<tab-heading  style="cursor: pointer;">' +
                                'View' +
                            '</tab-heading>' +

                            '<div class="row">' +
                                '<div >' +
                                    '<div class="talk-page-table-of-contents" ng-class="{\'col-xs-6\': !mediaService.isPhone, \'centered\': mediaService.isPhone}"></div>' +
                                '</div>' +
                            '</div>' +
                            '<div ng-show="wikiPage && (!wikiPage.CurrentTalkPageVersion || !wikiPage.CurrentTalkPageVersion.FormattedText)" class="centered">' +
                                '<p>Nobody has started the discussion yet! <sad-face></sad-face></p>' +
                                '<p>Begin the discussion and let everyone know what you think should be on the "{{::pageName}}" page.</p>' +
                                '<div><button class="btn btn-primary" ng-click="goToEditTab()">Start The Discussion</button></div>' +
                            '</div>' +
                            '<div class="talk-page-contents" style="max-width; 350px;"></div>' +


                        '</tab>' +
                        '<tab active="tab.editing" select="goToEditTab()">' +
                            '<tab-heading  style="cursor: pointer;">' +
                                'Edit' +
                            '</tab-heading>' +

                            '<div class="col-xs-12 well" style="margin-top: 20px;">' +
                                '<form style="padding-top:20px; clear: both;" ng-show="!processing" ng-submit="submitEdit()">' +

                                    '<p style="font-weight: bold;" ng-if="tagPage">Please remember that the information for "{{::tagPage.Tag}}" should be in the context of "{{::community.Options.Topic}}".</p>' +
                                    '<p style="font-weight: bold;">Discuss and propose changes to the {{::pageName}} page here:</p>' +
                                    '<content-editor ng-if="wikiPage" tag-page="tagPage" step-page="stepPage" show-toolbar="true" text-area-height="200" text="$parent.$parent.wikiPageTalkText"></content-editor>' +
                                    '<div style="clear:both;">' +
                                        '<div class="pull-left"><button class="btn btn-primary" type="submit" style="margin-top: 10px; margin-right: 10px;">Save</button></div>' +
                                        '<div class="pull-left"><button class="btn btn-warning" type="button" ng-click="options.onDoneEditing()" style="margin-top: 10px;">Cancel</button></div>' +
                                    '</div>' +
                                '</form>' +
                            '</div>' +
                        '</tab>' +
                        '<tab active="tab.abouting" select="goToAboutTab()">' +
                            '<tab-heading  style="cursor: pointer;">' +
                                'About' +
                            '</tab-heading>' +

                            '<div>' +
                                '<p>The Talk Page is for discussing the edits that should be made to the Tag Page (i.e. the "{{::pageName}}" page).</p>' +
                                '<p>It\'s additionally a place to discuss any additional content that you believe should be added to the Tag Page or removed from the Tag Page.</p>' +
                            '</div>' +
                        '</tab>' +
                    '</tabset>' +


                    '<div class="clearfix"></div>' +

                '</div>',
            scope: {
                tagPage: '=?',
                stepPage: '=?',
                step: '=?',
                options: '='
            },
            link: function (scope, element, attrs) {
                scope.hasWriteAccess = communityService.hasWriteAccess();
                scope.mediaService = mediaService;
                scope.community = communityService.community;
                scope.wikiPage = scope.tagPage || scope.stepPage;
                if(!scope.wikiPage.CurrentTalkPageVersion) {
                    scope.wikiPage.CurrentTalkPageVersion = {
                        FormattedText: ''
                    };
                }
                scope.wikiPageTalkText = scope.wikiPage.CurrentTalkPageVersion.FormattedText;
                scope.pageName = scope.tagPage ? scope.tagPage.Tag : scope.step.Name;

                scope.tab = {
                    editing: false,
                    viewing: true
                };
                scope.goToViewTab = function() {
                    scope.tab.editing = false;
                    scope.tab.viewing = true;
                };
                scope.goToEditTab = function() {
                    scope.tab.editing = true;
                    scope.tab.viewing = false;
                };

                scope.submitEdit = function() {

                    scope.wikiPage.CurrentTalkPageVersion.FormattedText = scope.wikiPageTalkText;
                    scope.options.onProcessing();

                    var wikiPage = angular.copy(scope.wikiPage);
                    // We're not editing the standard version
                    wikiPage.CurrentVersion = null;

                    var onEditComplete = function() {
                        scope.goToViewTab();
                        scope.options.onDoneProcessing();
                        commService.showSuccessAlert('Talk Page edit submitted successfully!');

                        $timeout(function() {
                            scope.updateTableOfContents();
                        });
                    };

                    if(scope.tagPage) {
                        tagPageService.editTagPage(wikiPage, wikiPage.Tag, function(data) {
                            // success
                            data.TagPage.CurrentVersion = scope.tagPage.CurrentVersion;
                            scope.tagPage = data.TagPage;
                            scope.wikiPage = scope.tagPage;

                            scope.options.updateWikiPage(scope.tagPage);
                            onEditComplete();
                        }, function(data) {
                            // Failure
                            scope.options.onDoneProcessing();
                            commService.showErrorAlert(data);
                        });
                    }
                    else {
                        stepPageService.editStepPage(wikiPage, function(data) {
                            // success
                            data.StepPage.CurrentVersion = scope.stepPage.CurrentVersion;
                            scope.stepPage = data.StepPage;
                            scope.wikiPage = scope.stepPage;

                            scope.options.updateWikiPage(scope.stepPage);
                            onEditComplete();
                        }, function(data) {
                            // Failure
                            scope.options.onDoneProcessing();
                            commService.showErrorAlert(data);
                        });
                    }
                };


                scope.updateTableOfContents = function() {
                    if(!scope.wikiPage.CurrentTalkPageVersion) {
                        scope.wikiPage.CurrentTalkPageVersion = { };
                    }
                    if(!scope.wikiPage.CurrentTalkPageVersion.FormattedText)
                        scope.wikiPage.CurrentTalkPageVersion.FormattedText = '';

                    var compiledHtml = formatterService.getMarkdownElement(scope.wikiPage.CurrentTalkPageVersion.FormattedText, { }, scope);
                    // var html = $sanitize(markdownConverter.makeHtml(scope.wikiPage.CurrentTalkPageVersion.FormattedText));
                    // contents.html(html);
                    var contents = $('.talk-page-contents');
                    element.html('');
                    element.append(compiledHtml);


                    var tocHtml = wikiPageService.getTableOfContentsHtml(element);

                    var toc = $('.talk-page-table-of-contents');

                    var compiled = $compile(tocHtml);
                    var htmlCompiled = compiled(scope);
                    toc.html('');
                    toc.append(htmlCompiled);
                };

                // Make sure that the elements are all created before we update the table of contents
                $timeout(function() {
                    scope.updateTableOfContents();
                });


            }
        };
    }])

    .directive('wikiPageEditArea', ['tagPageService', 'stepPageService', 'wikiPageService', 'communityService', 'commService', '$timeout', 'tourService', 'mediaService', function (tagPageService, stepPageService, wikiPageService, communityService, commService, $timeout, tourService, mediaService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div ng-show="hasWriteAccess">' +
                    '<h1 class="wiki-header wiki-header-1" style="margin-top: 0px;" ng-class="{\'clear-both\': mediaService.isPhone}">{{::pageName}} Edit Page</h1>' +
                    '<div ng-if="tagPage">' +
                        '<button ng-if="!mediaService.isPhone" class="btn btn-primary" ng-click="startTour()">Take the Tour!</button>' +
                        '<tag-page-edit-redirect-area tag-page="tagPage"></tag-page-edit-redirect-area>' +
                        '<edit-lock-area tag-page="tagPage"></edit-lock-area>' +
                    '</div>' +


                    '<div style="clear:both;" class="wiki-page-main-image-container clearfix" ng-class="{\'pull-left\': !mediaService.isPhone}">' +
                        '<file-dropzone file-options="fileDropzoneOptions" on-file-dropped="onFileDropped()">' +
                            '<div id="mainImageContainer" ng-show="!settingMainImage">' +
                                '<a id="wikiPageEditAreaImage"></a>' +
                                // Don't allow "editing" by drag and drop on the image--we'll take care of it out here
                                '<wiki-page-main-image allow-editing="false" wiki-page="wikiPage" specialization="specialization"></wiki-page-main-image>' +
                                '<div><button ng-click="selectImage()" class="btn btn-primary">Select Image</button></div>' +
                            '</div>' +
                            '<div ng-show="settingMainImage"><loading></loading> Setting Image...</div>' +
                        '</file-dropzone>' +
                    '</div>' +

                    '<div class="col-xs-12 well" style="margin-top: 20px;">' +
                        '<a id="wikiPageEditAreaInput"></a>' +
                        '<form style="padding-top:20px; clear: both;" ng-show="!processing" ng-submit="submitEdit()">' +
                            '<p style="font-weight: bold;" ng-if="tagPage">Please remember that the information for "{{::tagPage.Tag}}" should be in the context of "{{::community.Options.Topic}}".</p>' +
                            '<p style="font-weight: bold;">Consider proposing or discussing your edit with the community on the <button id="talkPageButton" class="btn btn-primary" ng-click="options.goToTalkPage()">Talk Page</button></p>' +
                            '<content-editor id="wikiPageEditAreaContentEditor" ng-if="wikiPage" options="contentEditorOptions" tag-page="tagPage" step-page="stepPage" show-toolbar="true" text-area-height="200" text="$parent.wikiPageText"></content-editor>' +
                            '<div style="clear:both;">' +
                                '<div class="pull-left"><button class="btn btn-primary" type="submit" style="margin-top: 10px; margin-right: 10px;">Save</button></div>' +
                                '<div class="pull-left"><button class="btn btn-warning" type="button" ng-click="options.onDoneEditing()" style="margin-top: 10px;">Cancel</button></div>' +
                            '</div>' +
                        '</form>' +
                    '</div>' +
                    '<div class="clearfix"></div>' +

                    '<step-page-edit-file-area ng-if="stepPage"  options="options" step-page="stepPage"></step-page-edit-file-area>' +
                    '<wiki-page-edit-playlist-area options="options" tag-page="tagPage" step-page="stepPage"></wiki-page-edit-playlist-area>' +
                    '<wiki-page-edit-images-area ng-if="tagPage || stepPage" options="options" tag-page="tagPage" step-page="stepPage"></wiki-page-edit-images-area>' +

                    '<tag-page-edit-tour ng-if="tagPage && !mediaService.isPhone"></tag-page-edit-tour>' +
                '</div>',
            scope: {
                tagPage: '=?',
                stepPage: '=?',
                step: '=?',
                specialization: '=?', // SpecializationEntry
                /*
                * updateWikiPage(wikiPage),
                *
                * editPlaylists() // This method will be set in options by this directive so that it can be called outside of this directive,
                * editFiles() // Used to edit step pages. This method will be set in options by this directive so that it can be called outside of this directive,
                * focus(value) // This method will be set in options by this directive so that it can be called outside of this directive
                * selectImage() // This method will be set in options by this directive so that it can be called outside of this directive
                * */
                options: '='
            },
            link: function (scope, element, attrs) {
                scope.mediaService = mediaService;
                scope.community = communityService.community;
                scope.hasWriteAccess = communityService.hasWriteAccess();
                scope.wikiPage = scope.tagPage || scope.stepPage;
                scope.wikiPageText = scope.wikiPage.CurrentVersion.FormattedText;
                scope.pageName = scope.tagPage ? scope.tagPage.Tag : scope.step.Name;

                scope.fileDropzoneOptions = { };
                scope.onFileDropped = function() {
                    scope.selectImage(scope.fileDropzoneOptions);
                };

                scope.markdownOptions = {
                    tagPage: scope.tagPage,
                    stepPage: scope.stepPage,
                    step: scope.step
                };
                scope.contentEditorOptions = {
                    markdownOptions: scope.markdownOptions,
                    autofocus: false
                };

                /* Shows a dialog box to select an image for the tag page and then
                 * sets it as the main image if applicable. */
                scope.selectImage = function(fileOptions) {
                    wikiPageService.selectPicture(function(imageFileEntry) {
                            // Set the image as the main image of the tag page
                            scope.settingMainImage = true;
                            if(scope.tagPage) {
                                tagPageService.setMainImage(imageFileEntry, scope.tagPage.Tag,
                                    scope.tagPage, function(data) {
                                        // success
                                        // Load the profile picture!
                                        scope.settingMainImage = false;
                                        scope.tagPage.MainImage = imageFileEntry;
                                        scope.tagPage.mainImageUrl = imageFileEntry.Medium.Url;
                                    }, function(data) {
                                        // Failure
                                        commService.showErrorAlert(data);
                                        scope.settingMainImage = false;
                                    });
                            }
                            else if(scope.stepPage) {
                                stepPageService.setMainImage(imageFileEntry,
                                    scope.stepPage, function(data) {
                                        // success
                                        // Load the profile picture!
                                        scope.settingMainImage = false;
                                        scope.stepPage.MainImage = imageFileEntry;
                                        scope.stepPage.mainImageUrl = imageFileEntry.Medium.Url;
                                    }, function(data) {
                                        // Failure
                                        commService.showErrorAlert(data);
                                        scope.settingMainImage = false;
                                    });
                            }
                        }, scope.tagPage, scope.stepPage, /*allowImageSizeSelection*/false, /*selectUploadedImage*/true,
                        /*albumType*/ 'ProfilePicture',
                        /*fileOptions*/fileOptions);
                };


                scope.submitEdit = function() {

                    var onEditComplete = function() {
                        scope.options.updateWikiPage(scope.wikiPage);
                        scope.options.onDoneEditing();
                        commService.showSuccessAlert('Edit submitted successfully!');

                        $timeout(function() {
                            scope.options.updateTableOfContents();
                        }, 0);
                    };

                    scope.wikiPage.CurrentVersion.FormattedText = scope.wikiPageText;
                    scope.options.onProcessing();
                    var wikiPage = angular.copy(scope.wikiPage);
                    // We're not editing the talk page
                    wikiPage.CurrentTalkPageVersion = null;

                    if(scope.tagPage) {
                        tagPageService.editTagPage(wikiPage, wikiPage.Tag, function(data) {
                            // success
                            data.TagPage.CurrentTalkPageVersion = scope.wikiPage.CurrentTalkPageVersion;
                            scope.tagPage = data.TagPage;
                            scope.wikiPage = scope.tagPage;

                            onEditComplete();
                        }, function(data) {
                            // Failure
                            scope.options.onDoneProcessing();
                            commService.showErrorAlert(data);
                        });
                    }
                    else if(scope.stepPage) {
                        stepPageService.editStepPage(wikiPage, function(data) {
                            // success
                            data.StepPage.CurrentTalkPageVersion = scope.wikiPage.CurrentTalkPageVersion;
                            scope.stepPage = data.StepPage;
                            scope.wikiPage = scope.stepPage;

                            onEditComplete();
                        }, function(data) {
                            // Failure
                            scope.options.onDoneProcessing();
                            commService.showErrorAlert(data);
                        });
                    }
                };

                scope.options.focus = function(value) {
                    scope.contentEditorOptions.autofocus = value;
                };
                scope.options.selectImage = scope.selectImage;

                scope.startTour = function() {
                    tourService.startTour('tagpageedit');
                };

            }
        };
    }])
    .directive('tagPageEditRedirectArea', ['accountService', 'tagPageService', 'commService', 'communityService', function (accountService, tagPageService, commService, communityService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div ng-show="hasWriteAccess">' +
                    '<div ng-if="tagPage.Redirect" style="color:red;" class="centered"><h3>Please consider editing <tag tag="tagPage.Redirect.DestinationTag"></tag> instead.</h3></div>' +
                    '<div ng-if="isLoggedIn">' +

                        '<div ng-show="processing"><loading></loading> Submitting...</div>' +
                        '<div ng-show="!processing">' +
                            '<div ng-show="!isEditing">' +
                                '<div class="pull-right clearfix">' +
                                    '<a class="action-link create-redirect-link" style="margin-right: 10px;" ng-click="setIsEditing(true)"><span ng-show="tagPage.Redirect">Edit</span><span ng-show="!tagPage.Redirect">Create</span> Redirect</a>' +
                                '</div>' +
                            '</div>' +
                            '<div ng-show="isEditing">' +
                                '<div ng-show="isEditing" class="pull-right clearfix"><a class="action-link" style="margin-right: 10px;" ng-click="setIsEditing(false)">Cancel Editing Redirect</a></div>' +
                                '<div class="dark-well col-xs-12">' +
                                    '<h3 style="margin-top: 0px;">Redirect</h3>' +
                                    '<div ng-if="tagPage.Redirect">' +
                                        '<button class="btn btn-danger" type="button" ng-click="removeRedirect()"><i class="fa fa-times"></i> Remove Redirect</button>' +
                                    '</div>' +

                                    '<div style="color: red;">Caution: If a redirect is created, all requests to {{::tagPage.Tag}} will be redirected to the specified Destination Tag.</div>' +
                                    '<form ng-submit="setRedirect()">' +
                                        '<label>Destination Tag</label> (without #) <input required class="form-control comment-input"  ng-model="$parent.destinationTag" placeholder="Destination Tag">' +
                                        '<div ng-show="$parent.destinationTag" style="font-weight: bold;">Page to which {{::$parent.tagPage.Tag}} will redirect: <tag new-tab="true" tag="$parent.destinationTag"></tag></div>' +
                                        '<div class="clearfix">' +
                                            '<div class="pull-left"><button class="btn btn-primary" type="submit" style="margin-top: 10px; margin-right: 10px;">Save Redirect</button></div>' +
                                            '<div class="pull-left"><button class="btn btn-warning" type="button" ng-click="onCancel()" style="margin-top: 10px;">Cancel</button></div>' +
                                        '</div>' +
                                    '</form>' +
                                '</div>' +

                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                tagPage: '='
            },
            link: function (scope, element, attrs) {
                scope.isLoggedIn = accountService.isLoggedInAndConfirmed();
                scope.hasWriteAccess = communityService.hasWriteAccess();
                scope.isEditing = false;

                scope.destinationTag = '';
                if(scope.tagPage.Redirect) {
                    scope.destinationTag = scope.tagPage.Redirect.DestinationTag;
                }

                scope.setIsEditing = function(val) {
                    scope.isEditing = val;
                };

                scope.onCancel = function() {
                    scope.isEditing = false;
                };

                scope.setRedirect = function() {

                    if(scope.destinationTag.indexOf('#') === 0) {
                        scope.destinationTag = scope.destinationTag.substring(1);
                    }

                    var redirect = {
                        SourceTag: scope.tagPage.Tag,
                        SourceTagPageId: scope.tagPage.Id,
                        DestinationTag: scope.destinationTag
                    };

                    scope.processing = true;
                    tagPageService.setRedirect(scope.tagPage, redirect, function(data) {
                        // Success

                        commService.showSuccessAlert('Redirect saved successfully!');
                        scope.tagPage.Redirect = data.Redirect;
                        scope.processing = false;
                        scope.isEditing = false;
                    }, function(data) {
                        // Failure
                        commService.showErrorAlert(data);
                        scope.processing = false;
                    });
                };

                scope.removeRedirect = function() {
                    scope.processing = true;
                    tagPageService.removeRedirect(scope.tagPage, function(data) {
                        // Success

                        commService.showSuccessAlert('Redirect removed successfully!');
                        scope.tagPage.Redirect = null;
                        scope.processing = false;
                        scope.destinationTag = '';
                        scope.isEditing = false;
                    }, function(data) {
                        // Failure
                        commService.showErrorAlert(data);
                        scope.processing = false;
                    });
                };
            }
        };
    }])
    .directive('editLockArea', ['communityService', 'accountService', 'tagPageService', 'lockService', 'commService', 'mapService', function (communityService, accountService, tagPageService, lockService, commService, mapService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div ng-show="isLoggedIn && canAddLock && hasWriteAccess">' +
                    '<div style="clear:both;" class="pull-right">' +
                        '<span ng-show="canAddLock && !hasLock"><a class="action-link request-lock-link" style="margin-right: 10px;" ng-show="!showLockRequest" ng-click="setShowLockRequest(true)">Request Lock</a> <a class="action-link" style="margin-right: 10px;" ng-show="showLockRequest" ng-click="setShowLockRequest(false)">Cancel Request Lock</a></span>' +
                        '<span ng-show="canRemoveLock && hasLock"><a class="action-link" style="margin-right: 10px;" ng-show="!showLockRemoval" ng-click="setShowLockRemoval(true)">Remove Lock</a> <a class="action-link" style="margin-right: 10px;" ng-show="showLockRemoval" ng-click="setShowLockRemoval(false)">Cancel Lock Removal</a></span>' +
                    '</div>' +
                    '<div ng-show="processing"><loading></loading> Processing...</div>' +
                    '<div ng-show="!processing">' +

                        '<div ng-if="hasLock">' +
                            '<div>' +
                                'Current Lock: <span style="font-weight: bold;">Level {{::lockOwner.Lock.MinimumLevel}}</span>' +
                            '</div>' +
                        '</div>' +
                        '<div ng-if="showLockRequest && canAddLock && !hasLock">' +

                            '<div class="dark-well col-xs-12">' +
                                '<h3 style="margin-top: 0px;">Lock</h3>' +
                                '<div style="color: red;">Caution: If a lock is created, users below the specified Level will not be able to edit this {{tagPage ? \'Tag Page\' : \'Map\'}}. (You won\'t lock yourself out).</div>' +
                                '<form ng-submit="createLock()">' +
                                    '<label>Minimum Level Required to Bypass Lock</label> <input required class="form-control comment-input" min="{{::minLevelToEditLockOwner}}" max="{{::accountLevel}}" type="number" ng-model="minLevel" placeholder="Minimum Level Required to Bypass Lock" >' +
                                    '<div style="clear:both;">' +
                                        '<div class="pull-left"><button class="btn btn-primary" type="submit" style="margin-top: 10px; margin-right: 10px;">Create Lock</button></div>' +
                                        '<div class="pull-left"><button class="btn btn-warning" type="button" ng-click="onCancel()" style="margin-top: 10px;">Cancel</button></div>' +
                                    '</div>' +
                                '</form>' +
                            '</div>' +


                        '</div>' +
                        '<div ng-if="showLockRemoval && canRemoveLock && hasLock">' +
                            '<form ng-submit="removeLock()">' +
                            '<div style="clear:both;">' +
                                '<div class="pull-left"><button class="btn btn-danger" type="submit" style="margin-top: 10px; margin-right: 10px;">Remove Lock</button></div>' +
                                '<div class="pull-left"><button class="btn btn-warning" type="button" ng-click="onCancel()" style="margin-top: 10px;">Cancel</button></div>' +
                            '</div>' +
                            '</form>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                tagPage: '=?',
                map: '=?'
            },
            link: function (scope, element, attrs) {
                scope.lockOwner = scope.tagPage || scope.map;
                scope.hasWriteAccess = communityService.hasWriteAccess();
                scope.showLockRequest = false;
                scope.showLockRemoval = false;

                scope.setShowLockRequest = function(val) {
                    scope.showLockRequest = val;
                };
                scope.setShowLockRemoval = function(val) {
                    scope.showLockRemoval = val;
                };

                scope.isLoggedIn = accountService.isLoggedInAndConfirmed();

                var updateHasLock = function() {
                    scope.hasLock = lockService.hasLock(scope.lockOwner.Lock);
                };
                if(scope.tagPage) {
                    scope.$watch(scope.tagPage.Lock, function() {
                        updateHasLock();
                    });
                }
                if(scope.map) {
                    scope.$watch(scope.map.Lock, function() {
                        updateHasLock();
                    });
                }

                if(scope.isLoggedIn) {
                    scope.accountLevel = communityService.accountCommunity.Level.Level;
                    scope.minLevel = scope.accountLevel;
                    var minLevelToEditLock = scope.tagPage ? lockService.minLevelEditLockTagPage : lockService.minLevelEditLockMap;
                    scope.canRemoveLock = scope.accountLevel >= minLevelToEditLock;
                    scope.canAddLock = scope.accountLevel >= minLevelToEditLock;
                }
                scope.minLevelToEditLockOwner = scope.tagPage ? tagPageService.minimumLevelToEdit : mapService.minimumLevelToEdit;

                scope.onCancel = function() {
                    scope.setShowLockRequest(false);
                    scope.setShowLockRemoval(false);
                };

                scope.createLock = function() {
                    if(!scope.showLockRequest) {
                        return;
                    }

                    if(isNaN(parseFloat(scope.minLevel)) || !isFinite(scope.minLevel)) {
                        commService.showErrorAlert('The minimum level must be a valid number.');
                        return;
                    }
                    if(scope.minLevel <= scope.minLevelToEditLockOwner) {
                        commService.showErrorAlert('The minimum level must be at least Level ' + minLevelToEditLockOwner);
                        return;
                    }
                    if(scope.minLevel > scope.accountLevel) {
                        commService.showErrorAlert('The minimum level cannot be greater than your Level of ' + scope.accountLevel);
                        return;
                    }

                    var lock = {
                        LockType: 'Edit',
                        MinimumLevel: scope.minLevel
                    };
                    scope.processing = true;

                    if(scope.tagPage) {
                        tagPageService.requestLock(lock, scope.tagPage, function(data) {
                            // success
                            scope.processing = false;
                            scope.tagPage.Lock = lock;
                            scope.setShowLockRequest(false);
                            updateHasLock();

                            commService.showSuccessAlert('Lock created successfully!');
                        }, function(data) {
                            // Failure
                            scope.processing = false;
                            commService.showErrorAlert(data);
                        });
                    }
                    else {
                        mapService.requestLock(lock, scope.map, function(data) {
                            // success
                            scope.processing = false;
                            scope.map.Lock = lock;
                            scope.setShowLockRequest(false);
                            updateHasLock();

                            commService.showSuccessAlert('Lock created successfully!');
                        }, function(data) {
                            // Failure
                            scope.processing = false;
                            commService.showErrorAlert(data);
                        });
                    }
                };

                scope.removeLock = function() {
                    if(!scope.showLockRemoval) {
                        return;
                    }

                    scope.processing = true;

                    if(scope.tagPage) {
                        tagPageService.removeLock(scope.tagPage, function(data) {
                            // success
                            scope.processing = false;
                            scope.tagPage.Lock = null;
                            scope.setShowLockRemoval(false);
                            updateHasLock();

                            commService.showSuccessAlert('Lock removed successfully!');
                        }, function(data) {
                            // Failure
                            scope.processing = false;
                            commService.showErrorAlert(data);
                        });
                    }
                    else {
                        mapService.removeLock(scope.map, function(data) {
                            // success
                            scope.processing = false;
                            scope.map.Lock = null;
                            scope.setShowLockRemoval(false);
                            updateHasLock();

                            commService.showSuccessAlert('Lock removed successfully!');
                        }, function(data) {
                            // Failure
                            scope.processing = false;
                            commService.showErrorAlert(data);
                        });
                    }
                };



            }
        };
    }])
    .directive('tagPage', ['communityService', 'formatterService', 'markdownConverter', 'commService', 'tagPageService', 'accountService', 'navigationService', '$compile', '$timeout', 'tagService', 'lockService', 'wikiPageService', 'metaService', 'mediaService', 'marketingService', function (communityService, formatterService, markdownConverter, commService, tagPageService, accountService, navigationService, $compile, $timeout, tagService, lockService, wikiPageService, metaService, mediaService, marketingService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="tagPage && tagPage.Redirect">' +
                        '<div style="color:red;"><h2>This Page Redirects to <tag tag="tagPage.Redirect.DestinationTag"></tag></h2>.</div>' +
                    '</div>' +

                    '<div ng-if="!mediaService.isPhone && !isEditing && !isTalking && tagPage">' +
                        '<div ng-if="tagPage.backgroundVideoId">' +
                            '<background-video class="wiki-background-video" video-id="tagPage.backgroundVideoId" mute="true" options="videoOptions" hide-controls="true">' +
                                '<div class="background-video-caption">{{::tag}}</div>' +
                            '</background-video>' +
                        '</div>' +
                        '<div ng-if="!tagPage.backgroundVideoId && tagPage.MainImage" class="tag-page-cover-photo-container">' +
                            '<div>' +
                                '<div class="cover-photo-container cover-photo-flip">' +
                                    '<img class="cover-photo cover-photo-flip" ng-src="{{tagPage.MainImage.Full.Url | trusted}}">' +
                                '</div>' +
                                '<div style="position:relative" class="carousel-caption">' +
                                    '<p class="covert-photo-carousel-caption">{{::tag}}</p>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +

                    '<div class="col-xs-12">' +

                        '<div ng-show="processing"><loading></loading> Processing...</div>' +
                        '<div class="centered">' +
                            '<div ng-if="isLoggedIn && !isEditing && !isTalking && hasWriteAccess" ng-class="{\'pull-right\': !mediaService.isPhone}">' +
                                '<span style="margin-right: 20px;">' +
                                    '<span ng-show="!allowEditing"><i class="fa fa-lock"></i> Locked <span ng-show="levelTooLow" style="font-size:9px; font-weight: bold;">(You must be at least level {{::minimumLevelToEdit}} to edit a Tag Page)</span></span>' +
                                    '<span ng-show="hasLock && allowEditing"><i class="fa fa-unlock-alt"></i> Unlocked For You</span>' +
                                    '<span ng-show="!hasLock && allowEditing"><i class="fa fa-unlock"></i> Public</span>' +
                                '</span>' +

                                //'<button ng-show="allowEditing" class="btn btn-primary" style="margin-right: 10px;" ng-click="showTalkPage()">Talk Page</button>' +
                                //'<button  class="btn btn-primary" ng-click="showEdit()">Edit</button>' +
                                '<a ng-show="allowEditing" class="action-link" style="margin-right: 20px;" ng-click="showTalkPage()">Talk Page</a>' +
                                '<a ng-show="allowEditing" class="action-link" style="margin-right: 20px;" ng-click="showEdit()">Edit</a>' +

                            '</div>' +
                        '</div>' +

                        '<div ng-if="isTalking || isEditing">' +
                            '<div class="pull-right"><button class="btn btn-warning" type="button" ng-click="onCancel()">Done</button></div>' +
                        '</div>' +


                        '<div ng-if="isTalking && isLoggedIn">' +
                            '<wiki-page-talk-page-area tag-page="tagPage" options="editOptions" ></wiki-page-talk-page-area>' +
                        '</div>' +
                        '<div ng-if="isEditing && isLoggedIn && hasWriteAccess">' +
                            '<wiki-page-edit-area tag-page="tagPage" options="editOptions"></wiki-page-edit-area>' +
                        '</div>' +
                        '<div ng-show="!isEditing && !isTalking">' +

                            '<h1 ng-if="mediaService.isPhone || (!tagPage.backgroundVideoId && !tagPage.MainImage)" class="wiki-header wiki-header-1 tag-page-title-tag" style="margin-top: 0px;" ng-class="{\'clear-both\': mediaService.isPhone}">{{::tag}}</h1>' +


                            /* Table of Contents and Image */
                            /* If Phone */
                            '<div ng-if="mediaService.isPhone">' +
                                '<div class="wiki-page-main-image-container centered">' +
                                    '<wiki-page-main-image allow-editing="allowEditing" wiki-page="tagPage"></wiki-page-main-image>' +
                                    '<div ng-if="!tagPage.MainImage && allowEditing"><button ng-click="showEdit(\'image\')" class="btn btn-primary">Select Image</button></div>' +
                                '</div>' +
                                '<div class="wiki-page-table-of-contents centered"></div>' +
                            '</div>' +
                            /* If No Phone */
                            '<div ng-if="!mediaService.isPhone">' +
                                '<div class="pull-left">' +
                                    '<div class="wiki-page-table-of-contents" style="margin-right:10px; margin-bottom: 10px;"></div>' +
                                    '<div ng-if="!isLoggedIn" style="margin-top: 10px;"><button class="btn btn-primary" ng-click="goToCommunity()">Share in the Community</button></div>' +
                                '</div>' +
                                '<div class="pull-right" style="clear:right;">' +
                                    '<div class="wiki-page-main-image-container pull-right">' +
                                        '<wiki-page-main-image allow-editing="allowEditing" wiki-page="tagPage"></wiki-page-main-image>' +
                                        '<div ng-if="!tagPage.MainImage && allowEditing"><button ng-click="showEdit(\'image\')" class="btn btn-primary">Select Image</button></div>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +

                            '<div ng-show="tagPage && (!tagPage.CurrentVersion || !tagPage.CurrentVersion.FormattedText)" class="centered">' +
                                '<p>Nobody has written anything yet <sad-face></sad-face></p>' +
                                '<div ng-show="allowEditing"><button class="btn btn-primary" ng-click="showEdit(\'write\')">Write Something</button></div>' +
                                '<div ng-if="!isLoggedIn"><button class="btn btn-primary" ng-click="showLogin()">Login to Write Something!</button></div>' +
                            '</div>' +

                            '<div class="tag-page-contents" style="max-width; 350px;"></div>' +

                            '<div class="clearfix clear-both"></div>' +

                            '<div ng-if="newsItems && newsItems.length > 0 && newsItems.currentNews.length > 0">' +
                                '<h1 class="wiki-header wiki-header-1">Current News</h1>' +
                                '<div class="white-well" ng-repeat="newsItem in newsItems.currentNews">' +
                                    '<news-item id="{{::newsItem.newsItemElementId}}" news-item="newsItem" is-editing="false"></news-item>' +
                                '</div>' +
                            '</div>' +

                            '<div id="playlistsContainer" ng-if="tagPage">' +
                                '<h1 class="wiki-header wiki-header-1">Playlists</h1>' +
                                '<div ng-show="!tagPage.Playlists || tagPage.Playlists.length <= 0"><p>No one has created any playlists yet.</p><p>A playlist is a collection of videos related to the "{{::tag}}" tag.</p><div ng-show="allowEditing"><button class="btn btn-primary" ng-click="showEdit(\'playlists\')">Be the first!</button></div></div>' +

                                '<playlists ng-if="tagPage.Playlists && tagPage.Playlists.length > 0" playlists="tagPage.Playlists"></playlists>' +
                            '</div>' +

                            '<div ng-if="newsItems && newsItems.length > 0 && newsItems.nonCurrentNews.length > 0">' +
                                '<h1 class="wiki-header wiki-header-1">Non-Current News</h1>' +
                                '<div class="white-well" ng-repeat="newsItem in newsItems.nonCurrentNews">' +
                                    '<div style="font-weight: bold;">{{newsItem.CreationDate | dateRobust:\'medium\'}} to {{newsItem.DateDiscarded | dateRobust:\'medium\'}}</div>' +
                                    '<news-item id="{{::newsItem.newsItemElementId}}" news-item="newsItem" is-editing="false"></news-item>' +
                                '</div>' +
                            '</div>' +

                            '<div ng-if="relatedTags && relatedTags.length > 0">' +
                                '<h1 class="wiki-header wiki-header-1">Related Tags</h1>' +
                                '<div ng-repeat="tag in relatedTags">' +
                                    '<tag-picture ng-if="tag.hasImage" tag="tag"></tag-picture>' +
                                    '<tag id="{{::tag.tagElementId}}" tag="tag.FinalTag"></tag>' +
                                '</div>' +
                            '</div>' +

                            '<div ng-if="tagPage && tagPage.SourceRedirects && tagPage.SourceRedirects.length > 0">' +
                                '<h1 class="wiki-header wiki-header-1">Redirected Tags</h1>' +
                                '<div>The following tags redirect to this page:</div>' +
                                '<div ng-repeat="redirect in tagPage.SourceRedirects">' +
                                    '<tag ng-click="redirectTagClicked()" id="{{::redirect.redirectElementId}}" tag="redirect.SourceTag"></tag>' +
                                '</div>' +
                            '</div>' +


                            '<div id="imagesContainer" ng-if="tagPage && tagPage.AlbumStack">' +
                                '<div ng-if="tagPage.AlbumStack.ProfilePictures.Images.length > 0 || tagPage.CoverImages.Images.length > 0 || tagPage.ContentAlbums.length > 0">' +
                                    '<h1 class="wiki-header wiki-header-1">Images</h1>' +
                                    '<album-stack album-stack="tagPage.AlbumStack" options="albumStackOptions"></album-stack>' +
                                '</div>' +
                            '</div>' +

                            '<div>' +
                                '<h1 class="wiki-header wiki-header-1">Posts and Statuses</h1>' +

                                '<div ng-if="tagPage && !tagPage.Redirect">' +
                                    '<tag-stream tag="tag" options="tagStreamOptions"></tag-stream>' +

                                    '<div ng-if="tagStreamOptions.scrollingDone && tagStreamOptions.streamItems.length <= 0">' +
                                        '<h4>There have not yet been any (good) posts that have tagged "{{::tag}}" <sad-face></sad-face>. <a ng-show="isLoggedIn && hasWriteAccess" ng-href="submit/{{::communityUrl}}?tags={{::tag}}">Submit one! <excited-face-animation></excited-face-animation></a></h4>' +
                                        '<div ng-if="!isLoggedIn"><button class="btn btn-primary" ng-click="showLogin()">Login to Submit a Post!</button></div>' +
                                    '</div>' +
                                '</div>' +


                            '</div>' +


                            '<h1 class="wiki-header wiki-header-1">Other Images</h1>' +
                            '<tag-image-searcher tag="tag" ng-if="tagPage && tagStreamOptions.scrollingDone"></tag-image-searcher>' +
                        '</div>' +
                        '<tag-page-tour ng-if="tagPage && !mediaService.isPhone"></tag-page-tour>' +
                    '</div>' +
                '</div>',
            scope: {
                tag: '='
            },
            link: function (scope, element, attrs) {
                scope.mediaService = mediaService;
                scope.communityUrl = communityService.community.Url;
                scope.hasWriteAccess = communityService.hasWriteAccess();

                scope.tagStreamOptions = {

                };

                // If the tag page has spaces, redirect to one without spaces
                if(/\s/g.test(scope.tag)) {
                    navigationService.goToTagPage(scope.tag.replace(/\s/g, ""), communityService.community, {
                        replaceHistory: true
                    });
                    return;
                }


                scope.minimumLevelToEdit = tagPageService.minimumLevelToEdit;
                scope.isLoggedIn = accountService.isLoggedInAndConfirmed();

                scope.allowEditing = false;

                scope.hasLock = false;

                scope.isEditing = false;
                scope.isTalking = false;
                scope.processing = true;

                scope.showEdit = function(section) {
                    scope.isEditing = true;
                    wikiPageService.processShowEdit(section, scope.editOptions);
                };

                scope.showTalkPage = function() {
                    scope.isTalking = true;
                };

                scope.redirectTagClicked = function() {
                    tagPageService.performRedirects = false;
                };


                scope.status = {
                    tagPageLoaded: false,
                    postsLoaded: false,
                    readyIfLoaded: function() {
                        if(scope.status.tagPageLoaded && scope.status.postsLoaded) {
                            metaService.prerenderReady();
                        }
                    }
                };

                // Get the tag page from service
                tagPageService.getTagPage(scope.tag, {
                    GetFinalRedirect: false
                }, function(data) {
                    $timeout(function() {
                        scope.status.tagPageLoaded = true;
                        scope.status.readyIfLoaded();
                    });


                    // success
                    scope.tagPage = data.TagPage;

                    scope.tagPage.mainImageUrl = wikiPageService.getMainImageUrl(scope.tagPage);


                    metaService.setTitle(communityService.community.Name + ' - ' + scope.tagPage.Tag);

                    if(scope.tagPage) {
                        wikiPageService.showImageIfNecessary({
                            tagPage: scope.tagPage
                        });
                        scope.albumStackOptions = {
                            tagPage: scope.tagPage
                        };

                        if(scope.tagPage.Redirect && tagPageService.performRedirects) {
                            scope.allowEditing = false;
                            navigationService.goToTagPage(scope.tagPage.Redirect.DestinationTag, communityService.community,
                                {
                                    replaceHistory: true
                                });
                            return;
                        }

                        // performRedirects may have been turned off so that we could view
                        // this tag page which may have a redirect. Now that it's loaded,
                        // turn redirects back on!
                        tagPageService.performRedirects = true;

                        scope.levelTooLow = false;
                        scope.allowEditing = scope.hasWriteAccess;
                        scope.hasLock = lockService.hasLock(scope.tagPage.Lock);
                        if(!scope.hasWriteAccess || !accountService.isLoggedInAndConfirmed()) {
                            scope.allowEditing = false;
                        }
                        else {
                            if(scope.hasLock) {
                                // There is a lock--can we make it passed?
                                scope.allowEditing = lockService.canBypassLock(scope.tagPage.Lock);
                            }
                            else {
                                // Accounts must be at least level 1 to edit a Tag Page
                                if(communityService.accountCommunity.Level.Level < scope.minimumLevelToEdit && !communityService.isModerator()) {
                                    scope.allowEditing = false;
                                    scope.levelTooLow = true;
                                }
                            }
                        }


                        var i = 0;
                        // Only show video on desktop (can't autoplay on mobile)
                        if(!mediaService.isMobileHardware) {
                            if(scope.tagPage.Playlists && scope.tagPage.Playlists.length > 0) {
                                for(i = 0; i < scope.tagPage.Playlists.length; i++) {
                                    scope.tagPage.Playlists[i].playlistElementId = wikiPageService.getPlaylistElementId(scope.tagPage.Playlists[i]);
                                }

                                var randomPlaylist = scope.tagPage.Playlists[Math.floor(Math.random()*scope.tagPage.Playlists.length)];
                                if(randomPlaylist.Items && randomPlaylist.Items.length > 0) {
                                    var randomPlaylistItem = randomPlaylist.Items[Math.floor(Math.random()*randomPlaylist.Items.length)];
                                    scope.tagPage.backgroundVideoId = randomPlaylistItem.VideoId;
                                }
                            }
                        }


                        if(scope.tagPage.SourceRedirects) {
                            for(i = 0; i < scope.tagPage.SourceRedirects.length; i++) {
                                var redirect = scope.tagPage.SourceRedirects[i];
                                redirect.redirectElementId = wikiPageService.getRedirectElementId(redirect);
                            }
                        }
                    }

                    scope.updateTableOfContents();
                    scope.processing = false;

                }, function(data) {
                    // Failure
                    commService.showErrorAlert(data);
                    scope.processing = false;
                });

                tagPageService.getTagPageRelated(scope.tag, function(data) {
                        var i = 0;
                        // Success!
                        scope.relatedTags = data.RelatedTags;
                        if(scope.relatedTags) {
                            for(i = 0; i < scope.relatedTags.length; i++) {
                                scope.relatedTags[i].tagElementId = wikiPageService.getRelatedTagElementId(scope.relatedTags[i]);
                                scope.relatedTags[i].hasImage = tagService.hasImage(scope.relatedTags[i]);
                            }
                        }


                        scope.newsItems = data.NewsItems;
                        if(scope.newsItems) {
                            // Get the current news and non-current news
                            scope.newsItems.currentNews = [];
                            scope.newsItems.nonCurrentNews = [];
                            for(i = 0; i < scope.newsItems.length; i++) {
                                scope.newsItems[i].newsItemElementId = wikiPageService.getNewsItemElementId(scope.newsItems[i]);

                                var newsItem = scope.newsItems[i];
                                if(newsItem.IsDiscarded) {
                                    scope.newsItems.nonCurrentNews.push(newsItem);
                                }
                                else {
                                    scope.newsItems.currentNews.push(newsItem);
                                }
                            }
                        }

                        // Don't update the TOC until we've had time to change any
                        // ng-if's that may change (i.e. wait til the next render cycle)
                        $timeout(function() {
                            scope.updateTableOfContents();
                            scope.status.postsLoaded = true;
                            scope.status.readyIfLoaded();
                        }, 0);

                    }, function(data) {
                        // Failure
                        commService.showErrorAlert(data);
                    });

                scope.scrollTo = function(hash) {
                    navigationService.scrollToHash(hash);
                };

                scope.updateTableOfContents = function() {
                    if(!scope.tagPage) {
                        return;
                    }

                    if(!scope.tagPage.CurrentVersion) {
                        scope.tagPage.CurrentVersion = { };
                    }
                    if(!scope.tagPage.CurrentVersion.FormattedText)
                        scope.tagPage.CurrentVersion.FormattedText = '';


                    var compiledHtml = formatterService.getMarkdownElement(scope.tagPage.CurrentVersion.FormattedText, { }, scope);
                    /*
                    var html = $sanitize(markdownConverter.makeHtml(scope.tagPage.CurrentVersion.FormattedText));
                    var compiledHtml = $compile(html)(scope);
                    */
                    var contents = $('.tag-page-contents');
                    contents.html('');
                    contents.append(compiledHtml);


                    var tocHtml = wikiPageService.getTableOfContentsHtml(element, scope.tagPage.Playlists, scope.relatedTags, scope.newsItems, scope.tagPage);

                    var toc = $('.wiki-page-table-of-contents');

                    var compiledTocHtml = $compile(tocHtml)(scope);
                    toc.html('');
                    toc.append(compiledTocHtml);


                    // Add the main infobox to the appropriate location
                    $timeout(function() {
                        var mainInfobox = contents.find('.main-infobox');
                        if(mainInfobox.length > 0) {
                            // First remove any main info boxes that are in the spot we're going to take
                            var mainImageContainer = $('.wiki-page-main-image-container');
                            var mainInfoboxesToRemove = mainImageContainer.find('.main-infobox');
                            if(mainInfoboxesToRemove.length > 0)
                                mainInfoboxesToRemove.remove();

                            // Move the main info box up to the main image
                            mainInfobox.detach().appendTo(mainImageContainer);
                        }

                        // Remove any leading breaks in the contents
                        contents.children().each(function () {
                            var childElement = $(this);
                            if(childElement.prop("tagName")==='BR') {
                                childElement.remove();
                            }
                            else {
                                // We're done with the leading breaks
                                return false;
                            }
                        });
                    });
                };

                scope.onCancel = function() {
                    scope.isEditing = false;
                    scope.isTalking = false;
                    scope.processing = false;
                };

                scope.goToTalkPage = function() {
                    scope.isTalking = true;
                    scope.isEditing = false;
                };
                scope.goToEditPage = function() {
                    scope.isTalking = false;
                    scope.isEditing = true;
                };

                scope.editOptions = {
                    updateTableOfContents: scope.updateTableOfContents,
                    onDoneEditing: function() {
                        scope.onCancel();
                    },
                    updateWikiPage: function(wikiPage) {
                        if(wikiPage) {
                            scope.tagPage = wikiPage;
                        }
                    },
                    onProcessing: function() {
                        scope.processing = true;
                    },
                    onDoneProcessing: function() {
                        scope.processing = false;
                    },
                    goToTalkPage: scope.goToTalkPage
                };

                scope.showLogin = function() {
                    accountService.showSignupDialog(navigationService, marketingService, {
                        marketingAction: {
                            Action: 'TagPageLoginOpeningSignUpDialog',
                            Data: [{
                                Key: 'PageName',
                                Value: communityService.page.name
                            }]
                        }
                    });
                };

                scope.goToCommunity = function() {
                    navigationService.goToCommunity(communityService.community.Url);
                };
            }
        };
    }]);