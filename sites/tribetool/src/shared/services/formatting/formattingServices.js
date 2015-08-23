angular.module('app.Services')
    .factory('formatterService', ['$rootScope', 'commService', '$window', 'communityService', 'markdownConverter', 'OPTIONS', '$sanitize', '$compile', function($rootScope, commService, $window, communityService, markdownConverter, OPTIONS, $sanitize, $compile) {
        return {
            youtubeRegex: /(\\)?https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/gi,
            //imgRegex: /(\\)?(src=")?(https?:\/\/[^?#]*\.(?:jpg|gif|png))(?:\?([^#<>\s]*))?(?:#(.*))?/gi,
            imgRegex: /(\\)?(src=")?(https?:\/\/[^?#\s\|]*\.(?:jpg|gif|png))(?:\?([^#<>\s]*))?(?:#(.*))?/gi,
            forceImageRegex: /(\\)?\|\|([^\|\s]+?)\|\|/gi,
            getYouTubeUrls: function(formattedText) {
                var urls = [];
                while(true) {
                    var match = this.youtubeRegex.exec(formattedText);
                    if(match === null)
                        break;
                    urls.push(match[0]);
                }

                return urls;
            },
            getImageUrls: function(formattedText) {
                var urls = [];

                var match = null;
                while(true) {
                    match = this.imgRegex.exec(formattedText);
                    if(match === null)
                        break;
                    urls.push(match[0]);
                }
                while(true) {
                    match = this.forceImageRegex.exec(formattedText);
                    if(match === null)
                        break;

                    // /(\\)?\|\|([^\|\s]+?)\|\|/gi
                    urls.push(match[2]);
                }

                return urls;
            },
            /* Converts the given url to html for an img */
            getImageHtml: function(url, markdownOptions) {
                var maxHeight = 500;
                if(markdownOptions.imageStyling && markdownOptions.imageStyling &&
                    markdownOptions.imageStyling.maxHeight) {
                        maxHeight = markdownOptions.imageStyling.maxHeight;
                }
                var html = '<img src="' + url + '" class="light-boxable-image" style="max-height: ' + maxHeight + 'px;';

                if(markdownOptions.imageStyling && markdownOptions.imageStyling) {
                    if(markdownOptions.imageStyling.clear) {
                        html += 'clear: ' + markdownOptions.imageStyling.clear + ';';
                    }
                }

                // end "style" attribute
                html += '"';


                if(markdownOptions.imageStyling && angular.isDefined(markdownOptions.imageStyling.hidePin)) {
                    html += ' hide-pin="' + markdownOptions.imageStyling.hidePin + '"';
                }

                var result = communityService.markdownFormatter.processImage(html, {
                    src: url
                }, markdownOptions) + '>';
                return result;
            },
            /* Converts ||imageUrl|| to <img> */
            replaceForceImage: function(content, markdownOptions) {
                var self = this;
                var anyMatch = false;
                var results = [];
                var normalizedContent = content.replace(this.forceImageRegex,
                    function(wholeMatch, leadingSlash, url) {
                        // Check if we matched the leading \ and return nothing changed if so
                        if (leadingSlash === '\\') {
                            return wholeMatch;
                        } else {
                            anyMatch = true;
                            //url = self.makeSecureUrl(url);
                            var result = self.getImageHtml(url, markdownOptions);
                            results.push(result);
                            return result;
                        }
                    });
                return {
                    results: results,
                    normalizedContent: normalizedContent,
                    anyMatch: anyMatch
                };
            },
            /* Converts images (.png/.jpg/.gif) to <img> */
            replaceImage: function(content, markdownOptions) {
                var self = this;
                var anyMatch = false;
                var results = [];
                var normalizedContent = content.replace(this.imgRegex,
                    function(wholeMatch, leadingSlash, srcAttr, url) {
                        // Check if we matched the leading \ and return nothing changed if so
                        if (leadingSlash === '\\' || srcAttr) {
                            return wholeMatch;
                        } else {
                            anyMatch = true;
                            //url = self.makeSecureUrl(url);
                            var result = self.getImageHtml(url, markdownOptions);
                            results.push(result);
                            return result;
                        }
                    });
                return {
                    results: results,
                    normalizedContent: normalizedContent,
                    anyMatch: anyMatch
                };
            },
            getYouTubeUrl: function(videoId) {
                return 'https://www.youtube.com/embed/' + videoId;
            },
            replaceYouTube: function(content, markdownOptions) {
                var anyMatch = false;
                var results = [];
                var normalizedContent = content.replace(this.youtubeRegex,
                    function(wholeMatch, leadingSlash, videoId) {
                        // Check if we matched the leading \ and return nothing changed if so
                        if (leadingSlash === '\\') {
                            return wholeMatch;
                        } else {
                            anyMatch = true;
                            var html = '<youtube video-id="' + videoId + '"';

                            if(markdownOptions && markdownOptions.videoStyling && angular.isDefined(markdownOptions.videoStyling.hidePin)) {
                                html += ' hide-pin="' + markdownOptions.videoStyling.hidePin + '"';
                            }

                            html += '></youtube>';

                            results.push(html);
                            return html;
                        }
                    });
                return {
                    results: results,
                    normalizedContent: normalizedContent,
                    anyMatch: anyMatch
                };
            },
            /* Gets the first piece of media from the given content (prefers YouTube) as html. Returns null
            * if no media was found. */
            getMedia: function(content, markdownOptions) {
                var youtube = this.getYouTube(content, markdownOptions);
                if(youtube !== null) {
                    return youtube;
                }

                return this.getImage(content, markdownOptions);
            },
            /* Returns null if the given content does not contain an image. If there is an image link, returns
             * the <img> directive as html */
            getImage: function(content, markdownOptions) {
                // Try ||img|| first
                var result = this.replaceForceImage(content, markdownOptions);
                if(result.anyMatch)
                    return result.results[0];

                // Now look for .jpg/.png/.gif etc
                result = this.replaceImage(content, markdownOptions);
                if(result.anyMatch)
                    return result.results[0];

                return null;
            },
            isYouTube: function(link) {
                return link.test(this.youtubeRegex);
            },
            makeSecureUrl: function(url) {
                if(url.toLowerCase().indexOf('http:') === 0) {
                    return 'https:' + url.substring('http:'.length);
                }
                else {
                    return url;
                }
            },
            /* Returns null if the given content does not contain a youtube link. If there is a youtube link, returns
            * the <youtube> directive as html */
            getYouTube: function(content, markdownOptions) {
                var result = this.replaceYouTube(content, markdownOptions);
                if(result.anyMatch)
                    return result.results[0];

                return null;
            },
            getMarkdownElement: function(markdown, markdownOptions, scope) {
                var unsanitized = markdown ? markdownConverter.makeHtml(markdown, markdownOptions) : '';
                var html = markdown ? $sanitize(unsanitized) : unsanitized;

                // We must surround the html in <div> tags so that it can be correctly compiled. It's possible that the
                // markdown doesn't have any surrounding tags which we need to prevent (to prevent a syntax error in compilation).
                var compiledHtml = $compile('<div>' + html + '</div>')(scope);

                var paragraphs = compiledHtml.find('p');
                for(var i = 0; i < paragraphs.length; i++) {
                    var p = paragraphs[i];
                    if(p.outerHTML === '<p></p>') {
                        p.remove();
                    }
                }

                return compiledHtml;
            },
            updateMarkdownCommunityReferences: function() {
                if(!communityService.community) {
                    return;
                }

                var my = this;
                communityService.markdownFormatter = {
                    /*
                        str: string // the current html that is being edited
                        data: {
                            src: string,
                            alt: string,
                            title: string,

                        }
                        options: markdownOptions (passed to btfMarkdown directive)
                     */
                    processImage: function(str, data, options) {
                        return str + ' show-light-box interactive-image fit-image-width-to-parent';
                    },
                    /*
                     str: string // the current html that is being edited
                     data: {
                         href: string,
                         title: string,
                         isTag: bool

                     }
                     options: markdownOptions (passed to btfMarkdown directive)
                     */
                    processAnchor: function(str, data, options) {
                        if(data && data.isTag) {
                            str = str + ' close-modal-on-click';
                        }
                        else {
                            str = str + ' class="visitable" target="_blank"';
                        }
                        return str;
                    }
                };

                $window.Showdown.extensions.community = function(converter) {

                    var conversions = [

                        // @username syntax
                        // http://stackoverflow.com/questions/6664151/difference-between-b-and-b-in-regex
                        // match empty string not at the beginning or end of the word, an optional leading
                        // slash, @ symbol, and then match anything but whitespace one or more times, then
                        // match an empty string at the beginning or end of the word
                        // \\ is equivalent to \ in regex (due to escaping from the string)
                        // and so \\\\ is equivalent to \\ in regex which is really just a match
                        // on \
                        { type: 'lang', regex: '\\B(\\\\)?@([\\S]+)\\b', replace:
                            function(wholeMatch, leadingSlash, username) {
                                // Check if we matched the leading \ and return nothing changed if so
                                if (leadingSlash === '\\') {
                                    return wholeMatch;
                                } else {
                                    var html = '<a href="' + (OPTIONS.isMobile ? '#/' : '/') + 'profile/' + communityService.community.Url + '/' + username + '"';
                                    return communityService.markdownFormatter.processAnchor(html, { isTag: true }, /*markdownOptions*/null) + '>@' + username + '</a>';
                                }
                            }
                        },


                        // #hashtag syntax
                        // \B(\\)?#([\S]+)\b
                        // (\]\()?((https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*)?\B(\\)?#([\S]+)\b
                        // We need to check for # belonging to a link such as in http://localhost/#/post/the-mouse-landing/0/favorite-ride
                        // where we don't want to match
                        { type: 'input', filter: function(source, options){
                            return source.replace(/(\]\()?((https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*)?\B(\\)?#([\S]+)\b/gi,
                                function(wholeMatch, bracketParenthesis, url, http, leadingSlash, tag) {
                                    // Check if we matched the leading \ and return nothing changed if so
                                    // (or if this # is simply part of a link)
                                    // (or if this # is simply part of a relative link as is the case in [Disneyland](#/disneyland)
                                    if (url || bracketParenthesis || leadingSlash === '\\') {
                                        return wholeMatch;
                                    }
                                    else {
                                        var html = '<a href="' + (OPTIONS.isMobile ? '#/search' : '/wiki') + '/' + communityService.community.Url + '/' + tag + '"';
                                        return communityService.markdownFormatter.processAnchor(html, { isTag: true  }, /*markdownOptions*/null) + '>#' + tag + '</a>';
                                    }
                                });
                        }},

                        // Escaped @'s
                        { type: 'lang', regex: '\\\\@', replace: '@' },




                        // [[tagAndText]]
                        // (\\)?\[\[([^\|\s]+?)\]\]
                        // (\\)?\[\[([^\|]+?)\]\]
                        // Note that we don't allow the tagAndText to contain the "|" character
                        // Note that we don't allow whitespace in the "tag".
                        { type: 'lang', regex: '(\\\\)?\\[\\[([^\\|]+?)\\]\\]', replace:
                            function(wholeMatch, leadingSlash, tag) {
                                // Check if we matched the leading \ and return nothing changed if so
                                if (leadingSlash === '\\') {
                                    return wholeMatch;
                                } else {
                                    var noWhitespaceTag = tag.replace(/\s/g, '');
                                    var html = '<a href="' + (OPTIONS.isMobile ? '#/search' : '/wiki') + '/' + communityService.community.Url + '/' + noWhitespaceTag + '"';
                                    return communityService.markdownFormatter.processAnchor(html, { isTag: true  }, /*markdownOptions*/null) + '>' + tag + '</a>';
                                }
                            }
                        },

                        // [[tag|text]]
                        // (\\)?\[\[([^\|\s]+)\|([^\|]+?)\]\]
                        // (\\)?\[\[([^\|]+)\|([^\|]+?)\]\]
                        // (\\)?\[\[([^\|\[\]]+)\|([^\|\[\]]+?)\]\]
                        // Note that we don't allow whitespace in the "tag"
                        { type: 'lang', regex: '(\\\\)?\\[\\[([^\\|\\[\\]]+)\\|([^\\|\\[\\]]+?)\\]\\]', replace:
                            function(wholeMatch, leadingSlash, tag, text) {
                                // Check if we matched the leading \ and return nothing changed if so
                                if (leadingSlash === '\\') {
                                    return wholeMatch;
                                } else {
                                    var noWhitespaceTag = tag.replace(/\s/g, '');
                                    var html = '<a href="' + (OPTIONS.isMobile ? '#/search' : '/wiki') + '/' + communityService.community.Url + '/' + noWhitespaceTag + '"';
                                    return communityService.markdownFormatter.processAnchor(html, { isTag: true  }, /*markdownOptions*/null) + '>' + text + '</a>';
                                }
                            }
                        },

                        // [[tag|text|community]]
                        // (\\)?\[\[([^\|\s]+)\|([^\|]+)\|([^\|]+?)\]\]
                        // (\\)?\[\[([^\|]+)\|([^\|]+)\|([^\|]+?)\]\]

                        // (\\)?\[\[([^\|\[\]]+)\|([^\|\[\]]+)\|([^\|\[\]]+?)\]\]
                        // Note that we don't allow whitespace in the "tag"
                        { type: 'lang', regex: '(\\\\)?\\[\\[([^\\|\\[\\]]+)\\|([^\\|\\[\\]]+)\\|([^\\|\\[\\]]+?)\\]\\]', replace:
                            function(wholeMatch, leadingSlash, tag, text, community) {
                                // Check if we matched the leading \ and return nothing changed if so
                                if (leadingSlash === '\\') {
                                    return wholeMatch;
                                } else {
                                    var noWhitespaceTag = tag.replace(/\s/g, '');

                                    var html = '<a href="' + (OPTIONS.isMobile ? '#/search' : '/wiki') + '/' + community + '/' + noWhitespaceTag + '"';
                                    return communityService.markdownFormatter.processAnchor(html, { isTag: true  }, /*markdownOptions*/null) + '>' + text + '</a>';
                                }
                            }
                        },

                        // :) syntax
                        { type: 'input', filter: function(source, options){
                            return source.replace(/(\\)?:\)/g,
                                function(match, leadingSlash) {
                                    // Check if we matched the leading \ and return nothing changed if so
                                    if (leadingSlash === '\\') {
                                        return ':)';
                                    } else {
                                        return '<happy-face></happy-face>';
                                    }
                                });
                        }},

                        // :D syntax
                        { type: 'input', filter: function(source, options){
                            return source.replace(/(\\)?:D/g,
                                function(match, leadingSlash) {
                                    // Check if we matched the leading \ and return nothing changed if so
                                    if (leadingSlash === '\\') {
                                        return ':D';
                                    } else {
                                        return '<excited-face></excited-face>';
                                    }
                                });
                        }},

                        // :( syntax
                        { type: 'input', filter: function(source, options){
                            return source.replace(/(\\)?:\(/g,
                                function(match, leadingSlash) {
                                    // Check if we matched the leading \ and return nothing changed if so
                                    if (leadingSlash === '\\') {
                                        return ':(';
                                    } else {
                                        return '<sad-face></sad-face>';
                                    }
                                });
                        }},

                        // :p syntax
                        { type: 'input', filter: function(source, options){
                            return source.replace(/(\\)?:p/gi,
                                function(match, leadingSlash) {
                                    // Check if we matched the leading \ and return nothing changed if so
                                    if (leadingSlash === '\\') {
                                        return ':p';
                                    } else {
                                        return '<silly-face></silly-face>';
                                    }
                                });
                        }},

                        // :* syntax
                        { type: 'input', filter: function(source, options){
                            return source.replace(/(\\)?:\*/gi,
                                function(match, leadingSlash) {
                                    // Check if we matched the leading \ and return nothing changed if so
                                    if (leadingSlash === '\\') {
                                        return ':*';
                                    } else {
                                        return '<love-face></love-face>';
                                    }
                                });
                        }},

                        // :o or :O syntax
                        { type: 'input', filter: function(source, options){
                            return source.replace(/(\\)?:o/gi,
                                function(wholeMatch, leadingSlash) {
                                    // Check if we matched the leading \ and return nothing changed if so
                                    if (leadingSlash === '\\') {
                                        return wholeMatch.substring(1);
                                    } else {
                                        return '<surprised-face></surprised-face>';
                                    }
                                });
                        }},

                        // :| syntax
                        { type: 'input', filter: function(source, options){
                            return source.replace(/(\\)?:\|/g,
                                function(match, leadingSlash) {
                                    // Check if we matched the leading \ and return nothing changed if so
                                    if (leadingSlash === '\\') {
                                        return ':|';
                                    } else {
                                        return '<unamused-face></unamused-face>';
                                    }
                                });
                        }},

                        // X( syntax
                        { type: 'input', filter:
                            function(source, options){
                                return source.replace(/(\\)?x\(/gi,
                                    function(wholeMatch, leadingSlash) {
                                        // Check if we matched the leading \ and return nothing changed if so
                                        if (leadingSlash === '\\') {
                                            return wholeMatch.substring(1);
                                        } else {
                                            return '<angry-face></angry-face>';
                                        }
                                    });
                            }
                        },


                        // Convert ||imageUrl|| to <img>
                        // (\\)?\|\|([^\|\s]+?)\|\|
                        { type: 'input', filter:
                            function(source, options){
                                if(options && angular.isDefined(options.images) && !options.images) {
                                    return source;
                                }
                                var result = my.replaceForceImage(source, options);
                                return result.normalizedContent;
                            }
                        },

                        // youtube url
                        // https://github.com/brandly/angular-youtube-embed/blob/master/src/angular-youtube-embed.js
                        // /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/gi
                        { type: 'input', filter:
                            function(source, options){
                                if(options && angular.isDefined(options.videos) && !options.videos) {
                                    return source;
                                }
                                var result = my.replaceYouTube(source, options);
                                return result.normalizedContent;
                            }
                        },

                        // Convert images to <img>
                        // http://stackoverflow.com/questions/169625/regex-to-check-if-valid-url-that-ends-in-jpg-png-or-gif
                        // (\\)?(src=")?(https?:\/\/[^?#]*\.(?:jpg|gif|png))(?:\?([^#\<\>\s]*))?(?:#(.*))?
                        { type: 'input', filter:
                            function(source, options){
                                if(options && angular.isDefined(options.images) && !options.images) {
                                    return source;
                                }
                                var result = my.replaceImage(source, options);
                                return result.normalizedContent;
                            }
                        },

                        // Convert urls to anchor links
                        // /(\]\()?(\|\|)?(=['"]?)?(\\)?\b((https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])(\]\()?/ig;
                        // http://stackoverflow.com/questions/1500260/detect-urls-in-text-with-javascript
                        { type: 'input', filter:
                            function(source, options){
                                return source.replace(/(\[)?(\]\()?(\|\|)?(=['"]?)?(\\)?\b((https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig,
                                    function(wholeMatch, openingBracket, bracketParenthesis, doubleLines, attributeSet, leadingSlash, url, http) {
                                        // Check if we matched the leading \, the leading "](" (as in "[text](url)")
                                        // or the leading "||" (as in "||imageUrl||"), an attribute set (as in href="url")
                                        // and return nothing changed if so
                                        // openingBracket is "[" that precedes the link which would indicate that the link
                                        // is in the first section [section1](section2) of this format []() and we don't want to replace
                                        // it.
                                        if (bracketParenthesis || doubleLines || attributeSet || openingBracket) {
                                            return wholeMatch;
                                        }
                                        else if(leadingSlash) {
                                            return url;
                                        } else {
                                            //url = my.makeSecureUrl(url);
                                            var result = '<a href="' + url + '"';
                                            result = communityService.markdownFormatter.processAnchor(result, { href: url }, /*markdownOptions*/null);
                                            return result + '>' + url + '</a>';

                                        }
                                    });
                            }
                        }

                    ];


                    // For Mobile App
                    if(OPTIONS.isMobile) {
                        // Insert at the start so we can intercept links before any other converters get to it
                        // because we want to replace https://tribetool.com with [https://tribetool.com/path](http://localhost/#/path)
                        conversions.splice(0, 0,
                            // Convert tribetool.com to localhost.com/#
                            // /(\]\()?(\|\|)?(=['"]?)?(\\)?\b(https?:\/\/tribetool.com([-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]))/ig;
                            { type: 'input', filter:
                                function(source, options){
                                    return source.replace(/(\[)?(\]\()?(\|\|)?(=['"]?)?(\\)?\b(https?:\/\/tribetool.com([-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]))/ig,
                                        function(wholeMatch, openingBracket, bracketParenthesis, doubleLines, attributeSet, leadingSlash, url, path) {
                                            // Check if we matched the leading \, the leading "](" (as in "[text](url)")
                                            // or the leading "||" (as in "||imageUrl||"), or an attribute set (as in href="url")

                                            // openingBracket is "[" that precedes the link which would indicate that the link
                                            // is in the first section [section1](section2) of this format []() and we don't want to replace
                                            // it with localhost because it's merely serving as text.

                                            // Make it relative such as [Text](#/url) which ensures that
                                            // it will work in production devices
                                            //var localhost = 'http://localhost/#';
                                            var localhost = '#';
                                            if (leadingSlash || doubleLines || openingBracket) {
                                                // \url
                                                // ||url
                                                return wholeMatch;
                                            }
                                            else if(bracketParenthesis) {
                                                // ](tribetool.com/path
                                                // to ](#/path
                                                return bracketParenthesis + localhost + path;
                                            }
                                            else if(attributeSet) {
                                                // ="url or ='url
                                                // to ='#/path
                                                return attributeSet + localhost + path;
                                            }
                                            else {
                                                // tribetool.com/path
                                                // to [tribetool.com/path](#/path)

                                                var result = '[' + url + '](' + localhost + path + ')';
                                                return result;
                                            }
                                        });
                                }
                            });
                    }

                    return conversions;
                };

                $window.Showdown.isValidCustomTag = function(tag, attrs, lkey, value) {
                    return tag === 'happy-face' || tag === 'excited-face' || tag === 'sad-face' ||
                        tag === 'surprised-face' || tag === 'unamused-face' || tag === 'silly-face' ||
                        tag === 'love-face' ||
                        tag === 'angry-face';
                };

                $window.Showdown.isValidCustomAttribute = function(attr) {
                    if(attr === 'show-light-box' || attr === 'close-modal-on-click' ||
                        attr==='interactive-image' || attr==='hide-pin' ||
                        attr==='fit-image-width-to-parent') {
                        return true;
                    }
                };

                markdownConverter.reloadExtensions();

            }
        };
    }]);