angular.module('app.Services')
    .factory('wikiPageService', ['$rootScope', 'commService', 'accountService', 'imageService', 'navigationService', '$timeout', 'route', 'Lightbox', function($rootScope, commService, accountService, imageService, navigationService, $timeout, route, Lightbox) {
        return {
            /* Shows a dialog box to select and/or upload an image
             onSelect(imageFileEntry) */
            selectPicture: function(onSelect, tagPageEntry, stepPageEntry, allowImageSizeSelection, selectUploadedImage, albumType, fileOptions) {
                imageService.selectPicture(onSelect,
                    {
                        getAlbumStack: function(onSuccess, onFailure, community) {
                            onSuccess({
                                AlbumStack: tagPageEntry ? tagPageEntry.AlbumStack : stepPageEntry.AlbumStack
                            });
                        },
                        allowImageSizeSelection: allowImageSizeSelection,
                        selectUploadedImage: selectUploadedImage,
                        albumType: albumType,
                        tagPage: tagPageEntry,
                        stepPage: stepPageEntry,
                        fileOptions: fileOptions
                    });
            },
            /*
                Shows an image if requested by the routeParams.
                options: {
                    tagPage: TagPageEntry, // Current TagPage being viewed
                    stepPage: StepPageEntry, // Current StepPage being viewed
                    specialization: SpecializationEntry // specialization of current StepPage being viewed
                }
             */
            showImageIfNecessary: function(options) {
                if(route.routeParams.image) {
                    imageService.getImage({
                        Id: route.routeParams.image
                    }, function(data) {
                        // Only show the image if we're on the proper page
                        if(options.tagPage && data.ImageFileEntry.TagPageId != options.tagPage.Id) {
                            return;
                        }
                        if(options.stepPage && data.ImageFileEntry.StepPageId != options.stepPage.Id) {
                            return;
                        }

                        // Success--Show the image
                        Lightbox.openModal([{
                            imageFileEntry: data.ImageFileEntry,
                            tagPage: options.tagPage,
                            stepPage: options.stepPage,
                            specialization: options.specialization
                        }], /*index*/0);

                    }, function(data) {
                        // Failure
                    });
                }
            },
            processShowEdit: function(section, editOptions) {
                if(section === 'playlists') {
                    // Scroll to playlists
                    $timeout(function() {
                        navigationService.scrollToHash('wikiPageEditPlaylistArea');

                        if(editOptions && editOptions.editPlaylists)
                            editOptions.editPlaylists();
                    });
                }
                else if(section === 'write') {
                    // Scroll to the write area
                    $timeout(function() {
                        navigationService.scrollToHash('wikiPageEditAreaInput');
                        editOptions.focus(true);
                    });
                }
                else if(section === 'image') {
                    // Scroll to the image area
                    $timeout(function() {
                        navigationService.scrollToHash('wikiPageEditAreaImage');
                        editOptions.selectImage();
                    });
                }
                else if(section === 'files') {
                    // Scroll to files
                    $timeout(function() {
                        navigationService.scrollToHash('stepPageEditFileArea');

                        if(editOptions && editOptions.editFiles)
                            editOptions.editFiles();
                    });
                }
            },
            getMainImageUrl: function(wikiPage) {
                return wikiPage && wikiPage.MainImage && wikiPage.MainImage.Medium ? wikiPage.MainImage.Medium.Url : 'images/silhouette-medium.png';
            },
            getPlaylistElementId: function(playlist) {
                return 'playlist' + playlist.Title;
            },
            getPostElementId: function(post) {
                return post.UrlId + post.Title.replace(/[^a-zA-Z\d:]/g, "");
            },
            getNewsItemElementId: function(newsItem) {
                return newsItem.Id;
            },
            getRelatedTagElementId: function(tag) {
                return 'tag' + tag.Tag;
            },
            getRedirectElementId: function(redirect) {
                return 'redirect' + redirect.Id;
            },
            getFileElementId: function(file) {
                return 'file' + file.Id;
            },
            getTableOfContentsHtml: function(directiveElement, playlists, relatedTags, newsItems, wikiPage) {
                var headers = directiveElement.find('.wiki-header');
                var headersInfo = [];
                for(var i = 0; i < headers.length; i++) {
                    var header = headers[i];
                    var level = 1;
                    for(var j = 0; j < header.classList.length; j++) {
                        if(header.classList[j].indexOf('wiki-header-') === 0) {
                            level = header.classList[j].substring('wiki-header-'.length);
                            break;
                        }
                    }
                    var id = header.textContent;

                    headersInfo.push({
                        header: header,
                        level: Number(level),
                        id: id
                    });

                    $(header).attr('id', id);
                }

                var my = this;

                /*
                var addPostHeaders = function(posts, mainHeaderTitle) {
                    if(posts && posts.length > 0) {
                        var indexOfPostsHeader = headersInfo.length - 1;
                        for(i = 0; i < headersInfo.length; i++) {
                            if(headersInfo[i].header.textContent === mainHeaderTitle) {
                                indexOfPostsHeader = i;
                            }
                        }

                        for(i = 0; i < posts.length; i++) {
                            var post = posts[i];

                            headersInfo.splice(indexOfPostsHeader + 1, 0, {
                                header: {
                                    textContent: angular.isDefined(post.Question) ? post.Question : post.Title
                                },
                                level: 2,
                                id: my.getPostElementId(post)
                            });
                        }
                    }
                };
                addPostHeaders(questionPosts, 'Question Posts');
                addPostHeaders(discussionPosts, 'Discussion Posts');
                */


                if(newsItems && newsItems.length > 0) {
                    var addNewsItemHeaders = function(items, mainHeaderTitle) {
                        if(items && items.length > 0) {
                            var indexOfNewsItemsHeader = headersInfo.length - 1;
                            for(i = 0; i < headersInfo.length; i++) {
                                if(headersInfo[i].header.textContent === mainHeaderTitle) {
                                    indexOfNewsItemsHeader = i;
                                }
                            }

                            for(i = 0; i < items.length; i++) {
                                var newsItem = items[i];

                                headersInfo.splice(indexOfNewsItemsHeader + 1, 0, {
                                    header: {
                                        textContent: newsItem.Description
                                    },
                                    level: 2,
                                    id: my.getNewsItemElementId(newsItem)
                                });
                            }
                        }
                    };

                    addNewsItemHeaders(newsItems.currentNews, 'Current News');
                    addNewsItemHeaders(newsItems.nonCurrentNews, 'Non-Current News');
                }




                if(playlists && playlists.length > 0) {

                    var indexOfPlaylistsHeader = headersInfo.length - 1;
                    for(i = 0; i < headersInfo.length; i++) {
                        if(headersInfo[i].header.textContent === 'Playlists') {
                            indexOfPlaylistsHeader = i;
                        }
                    }

                    for(i = 0; i < 3; i++) {
                        if(i >= playlists.length)
                            break;

                        var playlist = playlists[i];

                        headersInfo.splice(indexOfPlaylistsHeader + 1, 0, {
                            header: {
                                textContent: playlist.Title
                            },
                            level: 2,
                            id: this.getPlaylistElementId(playlist)
                        });
                    }
                }


                if(relatedTags && relatedTags.length > 0) {

                    var indexOfRelatedTagsHeader = headersInfo.length - 1;
                    for(i = 0; i < headersInfo.length; i++) {
                        if(headersInfo[i].header.textContent === 'Related Tags') {
                            indexOfRelatedTagsHeader = i;
                        }
                    }

                    for(i = 0; i < 3; i++) {
                        if(i >= relatedTags.length)
                            break;

                        var relatedTag = relatedTags[i];

                        headersInfo.splice(indexOfRelatedTagsHeader + 1, 0, {
                            header: {
                                textContent: relatedTag.Tag
                            },
                            level: 2,
                            id: this.getRelatedTagElementId(relatedTag)
                        });
                    }
                }


                if(wikiPage && wikiPage.SourceRedirects && wikiPage.SourceRedirects.length > 0) {

                    var indexOfRedirectsHeader = headersInfo.length - 1;
                    for(i = 0; i < headersInfo.length; i++) {
                        if(headersInfo[i].header.textContent === 'Redirected Tags') {
                            indexOfRedirectsHeader = i;
                        }
                    }

                    for(i = 0; i < 3; i++) {
                        if(i >= wikiPage.SourceRedirects.length)
                            break;

                        var redirect = wikiPage.SourceRedirects[i];

                        headersInfo.splice(indexOfRedirectsHeader + 1, 0, {
                            header: {
                                textContent: redirect.SourceTag
                            },
                            level: 2,
                            id: this.getRedirectElementId(redirect)
                        });
                    }
                }

                if(wikiPage && wikiPage.Files && wikiPage.Files.length > 0) {

                    var indexOfFilesHeader = headersInfo.length - 1;
                    for(i = 0; i < headersInfo.length; i++) {
                        if(headersInfo[i].header.textContent === 'Files') {
                            indexOfFilesHeader = i;
                        }
                    }

                    for(i = 0; i < 3; i++) {
                        if(i >= wikiPage.Files.length)
                            break;

                        var file = wikiPage.Files[i];

                        headersInfo.splice(indexOfFilesHeader + 1, 0, {
                            header: {
                                textContent: file.Title
                            },
                            level: 2,
                            id: this.getFileElementId(file)
                        });
                    }
                }

                for(i = 0; i < headersInfo.length; i++) {
                    headersInfo[i].index = i;
                }

                // construct table of contents from headers

                var tocHtml = '<ul style="padding: 0px;">';

                var getHighestLevelChild = function(h, startIndex, endIndex) {
                    for(var j = h.level + 1; j <= 6; j++) {
                        // Can we find any child on this level?
                        for(i = startIndex; i < endIndex; i++) {
                            if(headersInfo[i].level === j) {
                                return headersInfo[i];
                            }
                            else if(headersInfo[i].level < j) {
                                // We passed beyond a header that is more important so we're done
                                // searching for our children
                                return null;
                            }
                        }
                    }
                    return null;
                };

                // look for wiki-header in html of page
                var populateHeaderChildren = function(headerInfo) {
                    // Get the next header on the same level
                    var nextHeaderInfo = null;
                    var i = 0;
                    for(i = headerInfo.index + 1; i < headersInfo.length; i++) {
                        if(headersInfo[i].level <= headerInfo.level) {
                            nextHeaderInfo = headersInfo[i];
                            break;
                        }
                    }
                    var endIndex = nextHeaderInfo ? nextHeaderInfo.index : headersInfo.length;


                    // Now get the first child on the next lowest level (and keep going
                    // down levels until we find the highest child on a lower level)

                    var firstHighestChild = getHighestLevelChild(headerInfo, headerInfo.index + 1, endIndex);


                    if(firstHighestChild) {
                        // Now get any children that are before this highest first child.
                        // And move their level up appropriately
                        // and continue that until we've processed all preceding children
                        while(true)
                        {
                            var secondHighestChild = getHighestLevelChild(firstHighestChild, headerInfo.index + 1, firstHighestChild.index);

                            if(secondHighestChild) {
                                secondHighestChild.level = firstHighestChild.level;
                                firstHighestChild = secondHighestChild;
                            }
                            else {
                                break;
                            }
                        }

                        // Now the first child should be the correct child
                        firstHighestChild = getHighestLevelChild(headerInfo, headerInfo.index + 1, endIndex);



                        // Now get all of the children headers (but don't pass beyond
                        // the next header on this level)
                        var childHeaderInfos = [];
                        for(var m = headerInfo.index + 1; m < endIndex; m++) {
                            if(m >= headersInfo.length)
                                break;
                            if(headersInfo[m].level === firstHighestChild.level) {
                                var child = headersInfo[m];
                                childHeaderInfos.push(populateHeaderChildren(child));
                            }
                        }

                        return {
                            info: headerInfo,
                            children: childHeaderInfos
                        };
                    }
                    else {
                        // There are no children, we're done with this header!
                        return {
                            info: headerInfo,
                            children: []
                        };
                    }
                };

                var getHeaderHtml = function(header, number, levelString) {
                    var html = '<li>';
                    var info = header.info;
                    var prefix = (levelString ? levelString + '.' : '') + number;
                    html += '<a class="toc-link" ng-click="scrollTo(\'' + info.id + '\')">' +
                        '<span class="toc-text">' + prefix + '</span> ' +
                        '<span class="toc-text">' + info.header.textContent + '</span>' +
                        '</a>';

                    if(header.children.length > 0) {
                        html += '<ul>';
                        for(var i = 0; i < header.children.length; i++) {
                            html += getHeaderHtml(header.children[i], i + 1, prefix);
                        }
                        html += '</ul>';
                    }


                    html += '</li>';
                    return html;
                };

                // Get all of the h1 headers
                var populatedHeaders = populateHeaderChildren({
                    index: -1,
                    level: 0,
                    header: null
                });

                for(i = 0; i < populatedHeaders.children.length; i++) {
                    tocHtml += getHeaderHtml(populatedHeaders.children[i], i + 1, null);
                }

                tocHtml += '</ul>';

                return tocHtml;
            }
        };
    }]);