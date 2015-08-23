angular.module('app.Services')
    .factory('metaService', ['$rootScope', '$route', '$location', '$window', 'commService', 'communityService', 'navigationService', function($rootScope, $route, $location, $window, commService, communityService, navigationService) {
        return {
            observerCallbacks: {
                description: [],
                title: [],
                status: [],
                social: [] // Callbacks for directives used to share on social media
            },
            registerDescriptionCallback: function(callback) {
                this.observerCallbacks.description.push(callback);
            },
            registerTitleCallback: function(callback) {
                this.observerCallbacks.title.push(callback);
            },
            registerStatusCallback: function(callback) {
                this.observerCallbacks.status.push(callback);
            },
            registerSocialCallback: function(callback) {
                this.observerCallbacks.social.push(callback);
            },
            homeMetaData: {
                getMetaData: function() {
                    return {
                        title: 'Tribe Tool: A Network Based on Interests',
                        description: "We connect people based on their interests. Make friends who share your crazy obsessions.",
                        socialInfo: {
                            shortUrl: null
                        }
                    };
                }
            },
            routeMetaData: [],
            metaData: this.homeMetaData,
            raiseDescriptionChanged: function() {
                for(var i = 0; i < this.observerCallbacks.description.length; i++) {
                    this.observerCallbacks.description[i]();
                }
            },
            raiseTitleChanged: function() {
                for(var i = 0; i < this.observerCallbacks.title.length; i++) {
                    this.observerCallbacks.title[i]();
                }
            },
            raiseStatusChanged: function() {
                for(var i = 0; i < this.observerCallbacks.status.length; i++) {
                    this.observerCallbacks.status[i]();
                }
            },
            raiseSocialChanged: function() {
                for(var i = 0; i < this.observerCallbacks.social.length; i++) {
                    this.observerCallbacks.social[i]();
                }
            },
            setTitle: function(title) {
                // Let google do the real truncating, we just won't allow anything massively
                // long
                title = this.truncatePhrase(title, 140);

                this.metaData.title = title;
                this.raiseTitleChanged();
            },
            setDescription: function(description) {
                // Let google do the real truncating, we just won't allow anything massively
                // long
                description = this.truncatePhrase(description, 250);

                this.metaData.description = description;
                this.raiseDescriptionChanged();
            },
            truncatePhrase: function(phrase, maxLength) {
                phrase = phrase.trim();
                if(phrase.length > maxLength) {
                    phrase = phrase.substring(0, maxLength);
                    var indexOfLastWhitespace = phrase.lastIndexOf(' ');
                    phrase = phrase.substring(0, indexOfLastWhitespace);
                }
                return phrase;
            },
            /* fromCommunityPageLoaded: bool. Indicates whether this method was called from the 'communityPageLoaded' event (true)
                or from the '$routeChangeSuccess' event (false)
            * */
            getMetaDataFromCurrentRoute: function(fromCommunityPageLoaded) {
                var currentPath = navigationService.getCurrentPath();
                if(currentPath) {
                    if(communityService.page && communityService.page.isCommunityPage) {
                        // We're on a community page.
                        if(!fromCommunityPageLoaded)
                            return null;
                        currentPath = communityService.page.name;
                    }
                    else {
                        currentPath = currentPath.substring(1);
                    }
                    for(var i = 0; i < this.routeMetaData.length; i++) {
                        if(currentPath === this.routeMetaData[i].route) {
                            return this.routeMetaData[i].getMetaData();
                        }
                    }
                }

                return this.homeMetaData.getMetaData();
            },
            prerenderInfo: null,
            setPrerenderInfo: function(info) {
                this.prerenderInfo = info;
                this.raiseStatusChanged();
            },
            socialInfo: null,
            getCurrentUrl: function() {
                return 'http://' + $location.$$host + $location.$$path;
            },
            setOtherMetaData: function(metaData) {
                this.metaData.allowHistory = metaData.allowHistory;
            },
            setSocialInfo: function(info) {
                this.socialInfo = info;
                if(this.socialInfo && !this.socialInfo.url) {
                    this.socialInfo.url = this.getCurrentUrl();
                }
                this.raiseSocialChanged();
            },
            initialize: function() {
                this.routeMetaData = [
                    {
                        route: 'home',
                        getMetaData: function() {
                            return this.homeMetaData;
                        }
                    },
                    {
                        route: 'community',
                        getMetaData: function() {
                            return {
                                title: 'Tribe Tool: ' + (communityService.community ? communityService.community.Name + ' ' : '') + 'Community',
                                description: 'Get ' + (communityService.community && communityService.community.Options ? communityService.community.Options.Topic + ' ' : '') + 'news and discuss ' + (communityService.community && communityService.community.Options ? communityService.community.Options.Topic + ' ' : '') + 'with other fanatics.',
                                socialInfo: {
                                    shortUrl: null
                                }
                            };
                        }
                    },
                    {
                        route: 'stream',
                        getMetaData: function() {
                            return {
                                title: 'Tribe Tool: ' + communityService.community.Name + ' Stream',
                                description: 'Share your' + (communityService.community.Options ? ' ' + communityService.community.Options.Topic : '') + ' news and thoughts with your ' + communityService.getNameWithoutThe() + ' friends.',
                                socialInfo: {
                                    shortUrl: null
                                }
                            };
                        }
                    },
                    {
                        route: 'wiki',
                        getMetaData: function() {
                            return {
                                title: 'Tribe Tool: ' + communityService.community.Name + ' Wiki',
                                description: communityService.community.Name + ' wiki driven and built every day by the ' + communityService.getNameWithoutThe() + ' community.',
                                socialInfo: {
                                    shortUrl: null
                                }
                            };
                        }
                    },
                    {
                        route: 'map',
                        getMetaData: function() {
                            return {
                                title: 'Tribe Tool: Interactive' + (communityService.community.Options ? ' ' + communityService.community.Options.Topic : '') + ' Maps',
                                description: 'A series of interactive' + (communityService.community.Options ? ' ' + communityService.community.Options.Topic : '') + ' maps used to discover new videos and pictures in the ' + communityService.getNameWithoutThe() + ' community.',
                                socialInfo: {
                                    shortUrl: null
                                }
                            };
                        }
                    },
                    {
                        route: 'submit',
                        getMetaData: function() {
                            return {
                                title: 'Tribe Tool: Submit a ' + communityService.getNameWithoutThe() + ' Post',
                                description: 'Submit a post to the ' + communityService.getNameWithoutThe() + ' community to share your fascinating thoughts!',
                                socialInfo: {
                                    shortUrl: null
                                }
                            };
                        }
                    },
                    {
                        route: 'playlists',
                        getMetaData: function() {
                            return {
                                title: 'Tribe Tool: ' + communityService.community.Name + ' Playlists',
                                description: 'Browse ' + communityService.getNameWithoutThe() + ' videos for various' + (communityService.community.Options ? ' ' + communityService.community.Options.Topic : '') + ' topics.',
                                socialInfo: {
                                    shortUrl: null
                                }
                            };
                        }
                    }
                ];

                this.metaData = this.homeMetaData;
            },
            prerenderUnready: function() {
                $window.prerenderReady = false;
            },
            prerenderReady: function() {
                $window.prerenderReady = true;
            }
        };
    }]);