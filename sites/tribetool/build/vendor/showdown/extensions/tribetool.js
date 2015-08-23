//
//  Created by Ross
//

(function(){

    var tribetool = function(converter) {
        return [



            {
                type: 'output', filter:
                function(source, options){


                    if(options && (options.post || options.status || options.imageFileEntry || options.comment)) {
                        var post = options.post;
                        var status = options.status;
                        var imageFileEntry = options.imageFileEntry;
                        var comment = options.comment;

                        // Match [QUOTE=2038jfa3f][/QUOTE]
                        // /(\\)?\[QUOTE=([^\s]+?)\]\[\/QUOTE]/gi
                        return source.replace(/(\\)?\[QUOTE=([^\s]+?)\]\[\/QUOTE]/gi, function(wholeMatch, leadingSlash, sourceMaterialId) {


                            if(leadingSlash !== '\\' && sourceMaterialId) {
                                var i = 0;
                                var commentQuote = null;
                                // Let's try to find the requested source material
                                if(comment && comment.Quotes) {
                                    for(i = 0; i < comment.Quotes.length; i++) {
                                        if(comment.Quotes[i].SourceMaterialId === sourceMaterialId) {
                                            commentQuote = comment.Quotes[i];
                                            break;
                                        }
                                    }
                                }


                                if(!commentQuote) {
                                    var account = comment ? comment.Account : post ? post.Account : status ? status.Account : imageFileEntry ? imageFileEntry.Account : null;
                                    var displayName = account ? account.FirstName + (angular.isDefined(account.LastName) && account.LastName !== null ? ' ' + account.LastName : '') : null;

                                    // See if we can find the quoted comment
                                    var findComment = function(commentCollection, commentId) {
                                        for(var j = 0; j < commentCollection.length; j++) {
                                            var c = commentCollection[j];
                                            if(c.Id === commentId) {
                                                return c;
                                            }

                                            if(c.Comments && c.Comments.length > 0) {
                                                var child = findComment(c.Comments, commentId);
                                                if(child) {
                                                    return child;
                                                }
                                            }
                                        }

                                        return null;
                                    };

                                    var populateCommentQuote = function(commentable, getText) {
                                        if(commentable.Id === sourceMaterialId) {
                                            // The comment is quoting the PostContent
                                            return {
                                                FormattedText: getText(commentable),
                                                DisplayName: displayName,
                                                AgeString: commentable.AgeString
                                            };
                                        }

                                        var sourceMaterialComment = findComment(commentable.Comments, sourceMaterialId);
                                        if(sourceMaterialComment) {
                                            return {
                                                FormattedText: sourceMaterialComment.FormattedText,
                                                DisplayName: displayName,
                                                AgeString: sourceMaterialComment.AgeString
                                            };
                                        }

                                        return null;
                                    };

                                    if(post && post.Contents) {
                                        // Try to find it in the post
                                        for(i = 0; i < post.Contents.length; i++) {
                                            var postContent = post.Contents[i];

                                            commentQuote = populateCommentQuote(postContent, function(commentable) {
                                                return commentable.CurrentVersion.FormattedText
                                            });
                                            if(commentQuote) {
                                                break;
                                            }
                                        }
                                    }

                                    // Try to find the comment in the status
                                    if(!commentQuote && status) {
                                        commentQuote = populateCommentQuote(status, function(commentable) {
                                            return commentable.FormattedText
                                        });
                                    }

                                    // Try to find the comment in the imageFileEntry
                                    if(!commentQuote && imageFileEntry) {
                                        commentQuote = populateCommentQuote(imageFileEntry, function(commentable) {
                                            return commentable.Title;
                                        });
                                    }
                                }

                                if(commentQuote) {
                                    // Put the quote in the scope so that we can use the quote in the btfMarkdown directive in our returned html
                                    options.scope['quote' + sourceMaterialId] = commentQuote;

                                    // We found the material that we're quoting
                                    var html = '<div class="quote-well no-margin-bottom" ><b>' + commentQuote.DisplayName + '</b>';

                                    if(commentQuote.AgeString) {
                                        html += ' <em>' + commentQuote.AgeString + '</em>';
                                    }
                                    if(commentQuote.SourceMaterialDate) {
                                        var $injector = angular.element('*[ng-app]').injector();
                                        var $filter = $injector.get('$filter');
                                        html += ', <em>' + $filter('dateRobust')(commentQuote.SourceMaterialDate, 'shortIfNotToday') + '</em>';
                                    }

                                    html += '<div btf-markdown="quote' + sourceMaterialId + '.FormattedText" markdown-options="markdownOptions"></div></div>'

                                    return html;
                                }
                            }

                            return wholeMatch;
                        });


                    }
                    else {
                        return source;
                    }
                }
            }

        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.tribetool = tribetool; }
    // Server-side export
    if (typeof module !== 'undefined') module.exports = tribetool;

}());
