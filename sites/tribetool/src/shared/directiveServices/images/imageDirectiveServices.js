angular.module('app.Services')
    .factory('imageDirectiveService', ['commService', 'accountService', 'communityService', 'albumService', '$timeout', 'tagPageService', 'imageService', '$ionicLoading', function(commService, accountService, communityService, albumService, $timeout, tagPageService, imageService, $ionicLoading) {
        return {
            initializeSelectImageAreaScope: function(scope) {
                scope.community = scope.options.community ? scope.options.community : communityService.community;
                if(!scope.community) {
                    // Get the user's communities
                    communityService.getCommunitiesForAccount(function(data) {
                        // Success
                        scope.communities = data.Communities;
                    }, function(data) {
                        // Failure
                        commService.showErrorAlert(data);
                    });
                }

                scope.onCommunityChosen = function(community) {
                    scope.community = community;
                    scope.options.community = community;
                };

                if(scope.community) {
                    scope.onCommunityChosen(scope.community);
                }


                scope.cancel = function() {
                    if(scope.options && scope.options.onCancelled) {
                        scope.options.onCancelled();
                    }
                };
            },
            intializeAlbumStackAreaScope: function(scope) {
                scope.hasInitialFile = scope.options.fileOptions && scope.options.fileOptions.file;

                // Start getting the albums
                scope.loadingAlbums = true;
                scope.selectedAlbum = null;
                $ionicLoading.show({
                    template: '<loading></loading> Loading Albums...'
                });
                scope.options.getAlbumStack(function(data) {
                    // Get the applicable albums from the AlbumStack
                    scope.albums = [];

                    scope.allAlbums = albumService.getAllAlbums(data.AlbumStack);

                    if(scope.options.albumId) {
                        for(var i = 0; i < scope.allAlbums.length; i++) {
                            if(scope.allAlbums[i].Id === scope.options.albumId) {
                                scope.selectedAlbum = scope.allAlbums[i];
                                break;
                            }
                        }
                    }

                    if(!scope.selectedAlbum) {
                        if(scope.options.albumType === 'ProfilePicture') {
                            scope.selectedAlbum = data.AlbumStack.ProfilePictures;
                        }
                        else if(scope.options.albumType === 'CoverImage') {
                            scope.selectedAlbum = data.AlbumStack.CoverImages;
                        }
                        else if(scope.options.albumType === 'Content') {
                            scope.albums = data.AlbumStack.ContentAlbums;
                        }
                        else if(scope.options.albumType === 'Any') {
                            scope.albums = scope.allAlbums;
                        }
                    }

                    if(!scope.selectedAlbum && scope.hasInitialFile) {
                        scope.selectedAlbum = scope.albums[0];
                    }

                    scope.loadingAlbums = false;
                    $ionicLoading.hide();

                }, function(data) {
                    // Failure
                    commService.showErrorAlert(data);
                    scope.loadingAlbums = false;
                    $ionicLoading.hide();
                }, scope.options.community);

                scope.cancel = function() {
                    if(scope.options && scope.options.onCancelled) {
                        scope.options.onCancelled();
                    }
                };
            },
            initializeAlbumSelectionScope: function(scope) {
                scope.cancel = function() {
                    if(scope.options && scope.options.onCancelled) {
                        scope.options.onCancelled();
                    }
                };

                scope.onFileDropped = function(album) {
                    if(scope.options.onlyAllowSelection) {
                        return;
                    }
                    scope.selectAlbum(album);
                };

                scope.selectedAlbum = null;
                scope.selectAlbum = function(album) {
                    scope.selectedAlbum = album;
                };

                scope.options.onEndUploading = function(imageFileEntry) {
                    scope.isUploading = false;
                    if(imageFileEntry) {
                        // The image was uploaded--add it to the album
                        scope.selectedAlbum.Images.splice(0, 0, imageFileEntry);
                        scope.images = scope.selectedAlbum.Images;

                        if(scope.options && scope.options.selectUploadedImage &&
                            scope.options.onSelected) {
                            scope.options.onSelected(imageFileEntry, imageFileEntry ? imageFileEntry.Medium : null);
                        }
                    }
                    else {
                        // Upload cancelled before uploading
                    }
                };

                scope.beginUploading = function() {
                    if(scope.options.onlyAllowSelection || scope.albums.length <= 0) {
                        return;
                    }

                    // Select an album
                    scope.selectAlbum(scope.albums[0]);

                    scope.isUploading = true;
                };


                scope.isEditing = false;
                scope.isCreating = false;
                scope.options.onEndEditing = function(album) {
                    if(album) {
                        if(scope.isCreating) {
                            // We created an album--add it to the list of albums
                            scope.albums.splice(0, 0, album);
                        }
                        else {
                            // We edited an album
                        }
                    }
                    scope.isEditing = false;
                    scope.isCreating = false;
                };

                scope.addNewAlbum = function() {
                    if(scope.options.onlyAllowSelection) {
                        return;
                    }
                    scope.albumToEdit = { };
                    scope.isCreating = true;
                };

                scope.editAlbum = function(album) {
                    if(scope.options.onlyAllowSelection) {
                        return;
                    }
                    scope.albumToEdit = album;
                    scope.isEditing = true;
                };

                scope.deleteAlbum = function(album) {
                    if(scope.options.onlyAllowSelection) {
                        return;
                    }
                    scope.isDeleting = false;
                    albumService.deleteAlbum(album, scope.options.tagPage ? scope.options.tagPage.Id : null,
                        scope.options.stepPage ? scope.options.stepPage.Id : null,
                        function(data) {
                            // success

                            // Remove the album from our list of albums
                            var indexOfAlbum = scope.albums.indexOf(album);
                            if(indexOfAlbum >= 0) {
                                scope.albums.splice(indexOfAlbum, 1);
                            }

                            commService.showSuccessAlert('Album deleted successfully!');
                            scope.isDeleting = false;

                        }, function(data) {
                            // failure
                            scope.isDeleting = false;
                            commService.showErrorAlert(data);
                        }, scope.options.community);
                };

                scope.tagPageSearchOptions = {
                    onSelect: function(term) {
                        // Now let's get the tag page's albums
                        scope.loading = true;
                        var tag = term.identifier;
                        tagPageService.getTagPage(tag, {
                            GetFinalRedirect: true
                        }, function(data) {
                            // Success!
                            scope.loading = false;
                            scope.tagPage = data.TagPage;
                            var albums = albumService.getAllAlbums(scope.tagPage.AlbumStack);

                            // For tag pages, only allow those albums that have images--because the user
                            // can't upload photos from a tag page image search--they'll have to go to the
                            // actual tag page to do image editing
                            scope.albums = [];
                            for(var i = 0; i < albums.length; i++) {
                                var album = albums[i];
                                if(album.Images && album.Images.length > 0) {
                                    scope.albums.push(album);
                                }
                            }

                            scope.options.onlyAllowSelection = true;
                        }, function(data) {
                            // Failure
                            scope.loading = false;
                            commService.showErrorAlert(data);
                        });


                        // Don't redirect to the tag page
                        return false;
                    }
                };
            },
            initializeImageSelectionScope: function(scope) {
                scope.images = scope.album.Images;

                scope.isEditing = false;

                // If there are no images to select OR if we're uploading an
                // image, immediately go to upload
                scope.isUploading = (!scope.images || scope.images.length <= 0) || (scope.options.fileOptions && scope.options.fileOptions.file);


                scope.onFileDropped = function() {
                    scope.isUploading = true;
                };

                scope.options.onEndEditing = function() {
                    scope.isEditing = false;
                    scope.imageToEdit = null;
                };

                scope.editImage = function(imageFileEntry) {
                    if(scope.options.onlyAllowSelection) {
                        return;
                    }
                    scope.imageToEdit = imageFileEntry;
                    scope.isEditing = true;
                };

                scope.options.onEndUploading = function(imageFileEntry) {
                    scope.isUploading = false;
                    if(imageFileEntry) {
                        // The image was uploaded--add it to the album
                        scope.album.Images.splice(0, 0, imageFileEntry);
                        scope.images = scope.album.Images;

                        if(scope.options && scope.options.selectUploadedImage &&
                            scope.options.onSelected) {
                            scope.options.onSelected(imageFileEntry, imageFileEntry ? imageFileEntry.Medium : null);
                        }
                    }
                    else {
                        // Upload cancelled before uploading
                    }
                };

                scope.beginUploading = function() {
                    if(scope.options.onlyAllowSelection) {
                        return;
                    }

                    scope.isUploading = true;
                };

                scope.deleteImage = function(imageFileEntry) {
                    if(scope.options.onlyAllowSelection) {
                        return;
                    }

                    scope.isDeleting = true;
                    $ionicLoading.show({
                        template: '<loading></loading> Deleting Image...'
                    });
                    imageService.deleteImage(imageFileEntry, function(data) {
                        // Remove the image from the album
                        var indexOfImage = scope.album.Images.indexOf(imageFileEntry);
                        if(indexOfImage >= 0) {
                            scope.album.Images.splice(indexOfImage, 1);
                            scope.images = scope.album.Images;
                        }

                        scope.isDeleting = false;
                        $ionicLoading.hide();
                        commService.showSuccessAlert('Picture deleted successfully!');
                    }, function(data) {
                        // Failure
                        commService.showErrorAlert(data);
                        scope.isDeleting = false;
                        $ionicLoading.hide();
                    }, scope.options.community);
                };

                scope.imageClicked = function(image) {
                    scope.selectImage(image, image.Medium ? image.Medium : image.Small);
                };

                scope.cancel = function() {
                    if(scope.options && scope.options.onCancelled) {
                        scope.options.onCancelled();
                    }
                };

                scope.selectImage = function(image, imageFileComponent) {
                    if(scope.options && scope.options.onSelected) {
                        scope.options.onSelected(image, imageFileComponent);
                    }
                };
            },
            initializeEditImageScope: function(scope) {
                if(scope.options.onlyAllowSelection) {
                    return;
                }

                scope.cancel = function() {
                    scope.options.onEndEditing();
                };
                if(!scope.imageFileEntry.TagText) {
                    scope.imageFileEntry.TagText = '';
                }

                scope.form = {
                    tagText: scope.imageFileEntry.TagText,
                    finalTagText: '',
                    tags: []
                };

                scope.oAlt = scope.imageFileEntry.Alt;
                scope.oTitle = scope.imageFileEntry.Title;


                scope.submitEdit = function() {
                    if(scope.imageFileEntry.Alt === scope.oAlt &&
                        scope.imageFileEntry.Title === scope.oTitle &&
                        scope.imageFileEntry.TagText === scope.form.finalTagText) {
                        // Nothing changed, no need to submit.
                        scope.options.onEndEditing();
                        return;
                    }
                    scope.imageFileEntry.TagText = scope.form.finalTagText;

                    scope.processing = true;
                    $ionicLoading.show({
                        template: '<loading></loading> Editing Image...'
                    });
                    imageService.editImage(scope.imageFileEntry, function(data) {
                        // success
                        commService.showSuccessAlert('Image edited successfully!');
                        scope.processing = false;
                        $ionicLoading.hide();
                        scope.options.onEndEditing();
                    }, function(data) {
                        // failure
                        scope.processing = false;
                        commService.showErrorAlert(data);
                        $ionicLoading.hide();
                    }, scope.options.community);
                };
            },
            initializeEditAlbumScope: function(scope) {
                if(scope.options.onlyAllowSelection) {
                    return;
                }

                scope.cancel = function() {
                    scope.options.onEndEditing();
                };

                scope.save = function() {
                    scope.processing = true;
                    if(scope.album.Id) {
                        // Editing album

                        $ionicLoading.show({
                            template: '<loading></loading> Editing Album...'
                        });
                        albumService.editAlbum(scope.album, scope.options.tagPage ? scope.options.tagPage.Id : null,
                            scope.options.stepPage ? scope.options.stepPage.Id : null,
                            function(data) {
                                // success
                                commService.showSuccessAlert('Album edited successfully!');
                                scope.processing = false;
                                $ionicLoading.hide();
                                scope.options.onEndEditing(data.Album);
                            }, function(data) {
                                // failure
                                scope.processing = false;
                                $ionicLoading.hide();
                                commService.showErrorAlert(data);
                            }, scope.options.community);
                    }
                    else {
                        // Creating album
                        $ionicLoading.show({
                            template: '<loading></loading> Creating Album...'
                        });
                        albumService.createAlbum(scope.album, scope.options.tagPage ? scope.options.tagPage.Id : null,
                            scope.options.tagPage ? scope.options.tagPage.Tag : null,
                            scope.options.stepPage ? scope.options.stepPage.Id : null,
                            function(data) {
                                // success
                                commService.showSuccessAlert('Album created successfully!');
                                scope.processing = false;
                                $ionicLoading.hide();
                                scope.options.onEndEditing(data.Album);
                            }, function(data) {
                                // failure
                                scope.processing = false;
                                $ionicLoading.hide();
                                commService.showErrorAlert(data);
                            }, scope.options.community);
                    }

                };
            },
            initializeUploadImageScope: function(scope) {
                scope.rotateRight = function() {
                    scope.form.rotation += 90;
                    scope.form.rotation = scope.form.rotation % 360;
                };
                scope.rotateLeft = function() {
                    scope.form.rotation -= 90;
                    while(scope.form.rotation < 0) {
                        scope.form.rotation += 360;
                    }
                    scope.form.rotation = scope.form.rotation % 360;
                };
            },
            getUploadImageServiceParameters: function(scope, croppedImageBase64) {

                var data = {
                    AccountId: accountService.account.Id,
                    SessionId: accountService.getSessionId(),
                    CommunityId: scope.options.community ? scope.options.community.Id : communityService.community.Id,
                    RequestType: 'UploadFiles',
                    ImageBase64DataMedium: croppedImageBase64,
                    AlbumId: scope.album.Id
                };

                if(scope.form.title) {
                    data.Title = scope.form.title;
                }
                if(scope.form.finalTagText) {
                    data.ImageTags = scope.form.finalTagText;
                }
                if(scope.form.altText) {
                    data.AltText = scope.form.altText;
                }
                if(scope.form.rotation) {
                    data.Rotation = scope.form.rotation;
                }

                if(scope.options) {
                    if(scope.options.tagPage) {
                        data.Tag = scope.options.tagPage.Tag;
                        data.TagPageId = scope.options.tagPage.Id;
                    }
                    if(scope.options.stepPage) {
                        data.StepPageId = scope.options.stepPage.Id;
                    }
                    if(scope.options.map) {
                        data.MapId = scope.options.map.Id;
                    }
                }

                return data;
            }
        };
    }]);