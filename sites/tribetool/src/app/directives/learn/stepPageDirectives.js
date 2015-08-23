angular.module('app.Directives')
    .directive('stepPage', ['communityService', '$routeParams', 'stepPageService', '$sanitize', 'markdownConverter', 'commService', 'wikiPageService', 'accountService', 'navigationService', '$compile', '$timeout', 'tagService', 'lockService', function (communityService, $routeParams, stepPageService, $sanitize, markdownConverter, commService, wikiPageService, accountService, navigationService, $compile, $timeout, tagService, lockService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="col-xs-12">' +
                    '<div ng-show="processing"><loading></loading> Processing...</div>' +
                    '<div ng-if="!isEditing && !isTalking" class="pull-right">' +
                        '<a ng-show="allowEditing" class="action-link" style="margin-right: 20px;" ng-click="showTalkPage()">Talk Page</a>' +
                        '<a ng-show="allowEditing" class="action-link" style="margin-right: 20px;" ng-click="showEdit()">Edit</a>' +
                    '</div>' +

                    '<div ng-if="isTalking || isEditing">' +
                        '<div class="pull-right"><button class="btn btn-warning" type="button" ng-click="onCancel()">Cancel</button></div>' +
                    '</div>' +


                    '<div ng-if="isTalking">' +
                        '<wiki-page-talk-page-area step-page="stepPage" step="step" options="editOptions" ></wiki-page-talk-page-area>' +
                    '</div>' +
                    '<div ng-if="isEditing">' +
                        '<wiki-page-edit-area step-page="stepPage" step="step" options="editOptions"></wiki-page-edit-area>' +
                    '</div>' +
                    '<div ng-if="showContents" ng-show="!isEditing && !isTalking">' +
                        '<h1 class="wiki-header wiki-header-1" style="margin-top: 0px;">{{step.Name}}</h1>' +
                        '<div class="row">' +
                            '<div class="col-xs-6">' +
                                '<div class="wiki-page-table-of-contents"></div>' +
                            '</div>' +
                            '<div class="col-xs-6">' +
                                '<div class="wiki-page-main-image-container pull-right">' +
                                    '<wiki-page-main-image allow-editing="allowEditing" specialization="specialization" wiki-page="stepPage"></wiki-page-main-image>' +
                                    '<div ng-if="!tagPage.MainImage && allowEditing"><button ng-click="showEdit(\'image\')" class="btn btn-primary">Select Image</button></div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div ng-show="stepPage && (!stepPage.CurrentVersion || !stepPage.CurrentVersion.FormattedText)" class="centered">' +
                            '<p>Nobody has written anything yet <sad-face></sad-face></p>' +
                            '<div ng-show="allowEditing"><button class="btn btn-primary" ng-click="showEdit(\'write\')">Write Something</button></div>' +
                        '</div>' +
                        '<div class="step-page-contents"></div>' +

                        '<div ng-if="stepPage">' +
                            '<h1 class="wiki-header wiki-header-1">Files</h1>' +
                            '<div ng-show="!stepPage.Files || stepPage.Files.length <= 0">No one has uploaded any files yet. <div ng-show="allowEditing"><button class="btn btn-primary" ng-click="showEdit(\'files\')">Be the first!</button></div></div>' +
                            '<files-view-area ng-show="stepPage.Files && stepPage.Files.length > 0" files="stepPage.Files"></files-view-area>' +
                        '</div>' +

                        '<div ng-if="stepPage">' +
                            '<h1 class="wiki-header wiki-header-1">Playlists</h1>' +
                            '<div ng-show="!stepPage.Playlists || stepPage.Playlists.length <= 0">No one has created any playlists yet. <div ng-show="allowEditing"><button class="btn btn-primary" ng-click="showEdit(\'playlists\')">Be the first!</button></div></div>' +
                            '<playlists ng-show="stepPage.Playlists && stepPage.Playlists.length > 0" playlists="stepPage.Playlists"></playlists>' +
                        '</div>' +

                        '<div ng-if="stepPage && stepPage.AlbumStack">' +
                            '<div ng-if="stepPage.AlbumStack.ProfilePictures.Images.length > 0 || stepPage.CoverImages.Images.length > 0 || stepPage.ContentAlbums.length > 0">' +
                                '<h1 class="wiki-header wiki-header-1">Images</h1>' +
                                '<album-stack album-stack="stepPage.AlbumStack" options="albumStackOptions"></album-stack>' +
                            '</div>' +

                        '</div>' +
                    '</div>' +
                    '<div class="centered" ng-if="!processing && !showContents && !isEditing && !isTalking">' +
                        '<h2>This lesson is not yet available to you.</h2>' +
                        '<p>Please return to the <a href="/learn">Learn Page</a></p>' +
                    '</div>' +
                '</div>',
            scope: {
            },
            link: function (scope, element, attrs) {
                if(!accountService.isLoggedInAndConfirmed()) {
                    navigationService.goToPath('/learn');
                    return;
                }

                scope.allowEditing = false;
                scope.isEditing = false;
                scope.isTalking = false;
                scope.processing = true;

                // Get the step page and specialization
                stepPageService.getStepPage($routeParams.disciplineUrl, $routeParams.specializationUrl,
                    $routeParams.stepUrl, function(data) {
                        // Success

                        scope.stepPage = data.StepPage;
                        scope.specializationEntry = data.Specialization;
                        scope.step = data.Step;
                        scope.stepProgress = data.StepProgress;

                        scope.isTeacherOfSpecialization = accountService.isTeacherOfSpecialization(scope.specializationEntry.Id);
                        scope.allowEditing = scope.isTeacherOfSpecialization;

                        scope.showContents = scope.stepProgress.IsUnlocked || scope.allowEditing;

                        scope.stepPage.mainImageUrl = wikiPageService.getMainImageUrl(scope.stepPage);

                        if(scope.stepPage) {
                            wikiPageService.showImageIfNecessary({
                                stepPage: scope.stepPage,
                                specialization: scope.specializationEntry
                            });
                            scope.albumStackOptions = {
                                stepPage: scope.stepPage,
                                specialization: scope.specializationEntry
                            };

                            var i = 0;
                            if(scope.stepPage.Playlists) {
                                for(i = 0; i < scope.stepPage.Playlists.length; i++) {
                                    scope.stepPage.Playlists[i].playlistElementId = wikiPageService.getPlaylistElementId(scope.stepPage.Playlists[i]);
                                }
                            }

                            if(scope.stepPage.Files) {
                                for(i = 0; i < scope.stepPage.Files.length; i++) {
                                    var file = scope.stepPage.Files[i];
                                    file.fileElementId = wikiPageService.getFileElementId(file);
                                }
                            }
                        }

                        $timeout(function() {
                            scope.updateTableOfContents();
                        }, 0);
                        scope.processing = false;

                    }, function(data) {
                        // Failure
                        commService.showErrorAlert(data);
                        scope.processing = false;
                    });









                scope.showEdit = function() {
                    scope.isEditing = true;
                };
                scope.showEdit = function(section) {
                    scope.isEditing = true;
                    wikiPageService.processShowEdit(section, scope.editOptions);

                };

                scope.showTalkPage = function() {
                    scope.isTalking = true;
                };



                scope.scrollTo = function(hash) {
                    navigationService.scrollToHash(hash);
                };

                scope.updateTableOfContents = function() {
                    if(!scope.stepPage.CurrentVersion) {
                        scope.stepPage.CurrentVersion = { };
                    }
                    if(!scope.stepPage.CurrentVersion.FormattedText)
                        scope.stepPage.CurrentVersion.FormattedText = '';


                    var html = $sanitize(markdownConverter.makeHtml(scope.stepPage.CurrentVersion.FormattedText));
                    var contents = $('.step-page-contents');
                    contents.html(html);

                    var tocHtml = wikiPageService.getTableOfContentsHtml(element, /*questionPosts*/null, /*discussionPosts*/ null, scope.stepPage.Playlists, /*relatedTags*/null, /*news items*/null, scope.stepPage);

                    var toc = $('.wiki-page-table-of-contents');

                    var compiled = $compile(tocHtml);
                    var htmlCompiled = compiled(scope);
                    toc.html('');
                    toc.append(htmlCompiled);
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
                            scope.stepPage = wikiPage;
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

            }
        };
    }])
    .directive('stepPageEditFileArea', ['stepPageService', 'communityService', function (stepPageService, communityService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div style="clear:both; padding-top:20px;">' +
                    '<a id="stepPageEditFileArea"></a>' +
                    '<h1 class="wiki-header wiki-header-1">Files</h1>' +
                    '<files-view-area ng-show="stepPage.Files && stepPage.Files.length > 0" files="stepPage.Files"></files-view-area>' +
                    '<button style="margin-top:10px;" class="btn btn-primary" ng-click="editFiles()" >Edit</button>' +
                '</div>',
            scope: {
                stepPage: '=',
                /*
                 editFiles() // This method will be set in options by this directive so that it can be called outside of this directive,
                 */
                options: '=?'
            },
            link: function (scope, element, attrs) {
                scope.editFiles = function() {
                    stepPageService.selectFile(function(fileEntry) {
                        // FileEntry selected
                    }, scope.stepPage);
                };

                if(!scope.options) {
                    scope.options = { };
                }
                scope.options.editFiles = scope.editFiles;
            }
        };
    }]);