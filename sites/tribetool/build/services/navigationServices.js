angular.module('app.Services')
    .factory('navigationService', ['$rootScope', '$http', '$anchorScroll', '$location', '$window', 'route', 'accountService', 'cookiesService', 'modalService', 'commService', '$ionicHistory', 'breadcrumbService', 'OPTIONS', 'ionicHelperService', '$timeout', '$ionicScrollDelegate', '$cordovaGoogleAnalytics', '$ionicPlatform', function($rootScope, $http, $anchorScroll, $location, $window, route, accountService, cookiesService, modalService, commService, $ionicHistory, breadcrumbService, OPTIONS, ionicHelperService, $timeout, $ionicScrollDelegate, $cordovaGoogleAnalytics, $ionicPlatform) {
        return {
            /* note: sub pages can have sub pages of their own */
            pages: [
                { name:'home', path:'/home', label:'Home' },
                { name:'all', path:'/all', label:'All' },

                { name:'profile', path:'/profile', label:'Profile' },
                { name:'stream', path:'/stream', label:'Stream' },
                { name:'community', path:'/community', label:'Community', sub: [
                    { name:'submit', path:'/submit', label:'Submit' },
                    { name:'post', path:'/post', label:'Post' },
                    { name:'compatibility', path:'/compatibility', label:'Compatibility' }
                ]},
                {  },
                { name:'wiki', path:'/wiki', label:'Wiki', sub: [
                    { name:'map', path:'/map', label:'Map' },
                    { name:'maps', path:'/maps', label:'Maps' },
                    { name:'playlists', path:'/playlists', label:'Playlists' }
                ]},

                { name:'learn', path:'/learn', label:'Learn' },
                { name:'teach', path:'/teach', label:'Teach' },
                { name:'lesson', path:'/lesson', label:'Lesson' },
                { name:'messages', path:'/messages', label:'Messages' },
                { name:'settings', path:'/settings', label:'Settings', sub: [
                    { name:'account-settings', path:'/account-settings', label:'Account Settings' },
                    { name:'contact', path:'/contact', label:'Contact' },
                    { name:'teach', path:'/teach', label:'Teach', sub: [
                        { name:'student', path:'/student', label:'Student' }
                    ] }

                ]}
            ],
            loggedInPages: [],
            adminPages: [],
            loginPageName: 'login',
            redirectTo404OnNotFoundSearchParam: 'redirectTo404OnNotFound',
            initialize: function() {
                for(var i = 0; i < this.pages.length; i++)
                    this.loggedInPages.push(this.pages[i]);

                this.loggedInPages.push({ name:'notifications', path:'/notifications', label:'Notifications' });
                this.loggedInPages.push({ name:'messages', path:'/messages', label:'Messages' });
                this.loggedInPages.push({ name:'settings', path:'/settings', label:'Settings' });

                for(i = 0; i < this.loggedInPages.length; i++) {
                    this.adminPages.push(this.loggedInPages[i]);
                }

                //this.adminPages.push({ name:'edit-articles', path:'/edit-articles', label:'Edit Articles' });
                //this.adminPages.push({ name:'edit-article', path:'/edit-article', label:'Edit Article' });

            },
            getPagesForAccount: function(account) {
                return accountService.isLoggedIn(account) ? accountService.isAdminOrSuperAdmin(account) ? this.adminPages : this.loggedInPages : this.pages;
            },
            registerEvent: function(category, action, label, value) {
                if($window.ga) {
                    $window.ga('send', 'event', category, action, label, value);
                }
                else if(OPTIONS.isMobile && ionicHelperService.isWebView()) {
                    $ionicPlatform.ready(function() {
                        $cordovaGoogleAnalytics.trackEvent(category, action, label, value);
                    });
                }
            },
            clearUrlParams: function() {
                $location.url($location.url());
            },
            getPage: function(pageName, pages) {
                for(var i = 0; i < pages.length; i++) {
                    if(pages[i].name === pageName) {
                        return pages[i];
                    }
                    else if(pages[i].sub) {
                        var subPage = this.getPage(pageName, pages[i].sub);
                        if(subPage)
                            return subPage;
                    }
                }

                return null;
            },
            goToTop: function (){
                this.scrollToHash('top');
            },
            scrollToPostContent: function(postContentId) {
                this.scrollToHash('postContent' + postContentId);
            },
            scrollToStatus: function(statusId) {
                this.scrollToHash('status' + statusId);
            },
            scrollToComment: function(commentId) {
                this.scrollToHash('comment' + commentId);
            },
            scrollToAchievement: function(achievementId) {
                this.scrollToHash('achievement' + achievementId);
            },
            /* Scrolls the given perfect scrollbar to the specified hash within
             its container */
            perfectScrollToHash: function(perfectScrollbarId, hash) {
                var hashElement = $('#' + hash);
                if(hashElement && hashElement.length > 0)
                    this.perfectScrollTo(perfectScrollbarId, hashElement[0].offsetTop);
            },
            /* Scrolls the given perfect scrollbar to the bottom of its container */
            perfectScrollToBottom: function(perfectScrollbarId) {
                this.perfectScrollTo(perfectScrollbarId, $( "#messageScrollbar" ).prop( "scrollHeight" ));
            },
            /* Scrolls the given perfect scrollbar to the top of its container */
            perfectScrollToTop: function(perfectScrollbarId) {
                this.perfectScrollTo(perfectScrollbarId, 0);
            },
            perfectScrollTo: function(perfectScrollbarId, top) {
                var perfectScrollbar = $('#' + perfectScrollbarId);
                perfectScrollbar.scrollTop(top);
                perfectScrollbar.perfectScrollbar('update');
            },
            scrollToHash: function(hash) {
                var old = $location.hash();


                if(OPTIONS.isMobile) {

                    var scrollInstance = ionicHelperService.getCurrentScrollInstance();
                    if(scrollInstance) {
                        if(hash === 'top') {
                            scrollInstance.scrollTop(true);
                        }
                        else {


                            if(ionicHelperService.isJsScrolling()) {

                                $location.hash(hash);
                                scrollInstance.anchorScroll(true);
                                $timeout(function() {
                                    $ionicScrollDelegate.resize();
                                    scrollInstance.resize();
                                    $location.hash('');
                                }, 1000);
                            }
                            else {
                                var isVerifying = false;
                                var firstPosition = 0;
                                var rounds = 0;
                                var poll = function() {
                                    rounds++;
                                    $location.hash(hash);
                                    scrollInstance.anchorScroll(true);
                                    $timeout(function() {
                                        $ionicScrollDelegate.resize();
                                        scrollInstance.resize();

                                        $timeout(function() {
                                            var scrollPosition = scrollInstance.getScrollPosition();
                                            //console.log('TRIBETOOL: scrollPosition.top: ' + scrollPosition.top);
                                            if(rounds < 5 && (!isVerifying || scrollPosition.top <= 0 || scrollPosition.top < firstPosition)) {
                                                firstPosition = scrollPosition.top;
                                                isVerifying = true;
                                                poll();
                                            }
                                            else {
                                                $location.hash('');
                                            }
                                        }, 200);

                                    }, 500);
                                };
                                poll();
                            }



    /*
                            var el = $('#' + hash)[0];
                            if(el) {
                                var pos = el.offsetTop;
                                $timeout(function() {
                                    scrollInstance.scrollTo(0, pos, true);
                                }, 10);
                            }
                            */



                            /*
                            $timeout(function() {
                                $ionicScrollDelegate.resize();
                                scrollInstance.resize();
                                $location.hash(old);
                            }, 1000);
                            */
                        }
                    }

                }
                else {
                    $location.hash(hash);
                    this.smoothScrollTo(hash, 25);
                    $location.hash(old);
                }



            },
            goToLogin: function() {
                this.goToPath('/' + this.loginPageName);
            },
            goToSignUp: function() {
                this.goToPath('/register');
            },
            goToTool: function(community, toolName, options) {
                this.goToPath(this.getToolUrl(community, toolName), options);
            },
            getToolUrl: function(community, toolName) {
                return '/tool/' + community.Url + (toolName ? '/' + toolName : '');
            },
            goToWiki: function(community, options) {
                this.goToPath('/wiki/' + community.Url, options);
            },
            goToShare: function(community) {
                this.goToPath('/stream/' + community.Url + '?share=true');
            },
            goToPost: function(post, community) {
                this.goToPath('/post/' + community.Url + '/' + post.UrlId + '/' + post.Url);
            },
            goToStepPage: function(specializationEntry, stepPageUrl) {
                this.goToPath('/lesson/' + specializationEntry.DisciplineUrl + '/' + specializationEntry.SpecializationUrl + '/' + stepPageUrl);
            },
            goToCommunity: function(communityUrl, options) {
                if(!communityUrl) {
                    this.goToPath('/community');
                    return;
                }

                this.goToPath('/community/' + communityUrl, options);
            },
            goToCommunityState: function(communityUrl, options) {

                if(communityUrl) {
                    this.goToCommunity(communityUrl, options);
                }
                else {
                    route.$state.transitionTo('communityNoCommunityUrl', {
                    });
                }
            },
            goToStream: function(communityUrl, options) {
                if(!communityUrl) {
                    this.goToPath('/stream');
                    return;
                }

                this.goToPath('/stream/' + communityUrl, options);
            },
            goToStreamState: function(communityUrl, options) {
                route.$state.transitionTo('stream', {
                    communityUrl: communityUrl
                });
            },
            goToTagPage: function(tag, community, options) {
                this.goToPath('/wiki/' + community.Url + '/' + tag, options);
            },
            goToMap: function(map, community, options) {
                this.goToPath(this.getMapUrl(map, community), options);
            },
            goToPinnedItem: function(pinnedItem, profile, community, options) {
                this.goToPath(this.getPinnedItemUrl(pinnedItem, profile, community), options);
            },
            goToProfile: function(username, community, options) {
                if(!username) {
                    if(!community) {
                        this.goToPath('/profile', options);
                    }
                    else {
                        this.goToPath('/profile' + community.Url, options);
                    }
                }
                this.goToPath('/profile/' + community.Url + '/' + username, options);
            },
            goToProfileState: function(communityUrl, username, options) {
                route.$state.transitionTo('profile.communityUrl.username', {
                    communityUrl: communityUrl,
                    username: username
                });
            },
            goToSpecialization: function(specialization, options) {
                this.goToPath('/learn/specialization/' + specialization.DisciplineUrl + '/' + specialization.SpecializationUrl, options);
            },
            refreshRoute: function(newParams) {
                console.log('Reloading controllers in navigationService.refreshRoute()...');
                route.reload(newParams);
            },
            replaceHistory: function() {
                breadcrumbService.nextViewOptions = {
                    disableBack: true
                };

                $location.replace();

                // handle ionic history replace
                // see http://ionicframework.com/docs/api/service/$ionicHistory/
                // and http://stackoverflow.com/questions/27930702/ionic-framework-state-goapp-home-is-adding-back-button-on-page-where-i-wan

                if($ionicHistory.nextViewOptions)
                    $ionicHistory.nextViewOptions(breadcrumbService.nextViewOptions);
            },
            /* options { replaceHistory: bool }*/
            goToPath: function(path, options) {
                this.clearUrlParams();
                this.goToTop();

                var i = 0;
                var queryParams = null;
                var normalizedPath = path;
                if(path.indexOf('/') !== -1) {
                    var pathAndQueryParams = path.split('?');
                    path = pathAndQueryParams[0];
                    var splitPath = path.split('/');
                    splitPath = splitPath.filter(function(n){ return n !== ''; });
                    for(i = 0; i < splitPath.length; i++) {
                        if(splitPath[i].indexOf('?') !== 0)
                            splitPath[i] = encodeURIComponent(splitPath[i]);
                    }
                    normalizedPath = '';
                    for(i = 0; i < splitPath.length; i++) {
                        normalizedPath += splitPath[i];
                        if(i + 1 < splitPath.length)
                            normalizedPath += '/';
                    }
                    if(pathAndQueryParams.length > 1) {
                        queryParams = pathAndQueryParams[1];
                    }
                }

                var reloadRoute = $location.$$path === '/' + normalizedPath;
                if(!reloadRoute && queryParams !== null)
                    reloadRoute = $location.$$url === '/' + normalizedPath + '?' + queryParams;


                var setSearchParams = function() {
                    if(queryParams !== null) {
                        var queryParamsList = queryParams.split('&');
                        for(i = 0; i < queryParamsList.length; i++) {
                            var queryParamSplit = queryParamsList[i].split('=');
                            $location.search(queryParamSplit[0], queryParamSplit[1]);
                        }
                    }
                };

                if(queryParams !== null)
                    normalizedPath += '?' + queryParams;

                if(reloadRoute) {

                    if($location.$$url === normalizedPath) {
                        setSearchParams();
                        $location.url(normalizedPath);
                    }
                    else {
                        if(route.isUsingState) {
                            setSearchParams();
                        }

                        // Reset the controllers if we're already on the requested page
                        this.refreshRoute($location.$$search);
                    }


                }
                else {
                    if(options && options.replaceHistory) {

                        this.replaceHistory();
                    }

                    $location.url(normalizedPath);
                }

                if(accountService.isLoggedIn(accountService.account))
                    cookiesService.setLastRememberedPage(path);
            },
            isCurrentUrl: function(url) {
                if(url.indexOf('/') !== 0) {
                    url = '/' + url;
                }

                return url === this.getCurrentUrl();
            },
            getCurrentUrl : function() {
                return $location.$$url;
            },
            getCurrentFullUrl : function() {
                return commService.getDomain() + $location.$$url;
            },
            isCurrentPath: function(path) {
                if(path.indexOf('/') !== 0) {
                    path = '/' + path;
                }

                return path === this.getCurrentPath();
            },
            getCurrentPath : function() {
                return $location.$$path;
            },
            isCurrentRoute: function(path) {
                var route = this.getCurrentRoute();
                return route === path;
            },
            getCurrentRoute: function() {
                return route.getCurrentRoute();
            },
            getRoute: function(path) {
                var index = path.indexOf(window.location.hostname);
                if(index === -1)
                    return path;

                return path.substring(index + window.location.hostname.length);
            },
            go: function(pageName, pages) {
                if(!pages) {
                    pages = this.getPagesForAccount(accountService.account);
                }
                var page = this.getPage(pageName, pages);
                if(page)
                    this.goToPath(page.path);
                else
                    this.goToPath('/' + pageName + '/');
            },
            smoothScrollTo: function(elementId, extraY) {
                if(modalService.isOpen()) {
                    $anchorScroll();
                }
                else {
                    // http://stackoverflow.com/questions/21749878/angular-js-anchorscroll-smooth-duration
                    // This scrolling function
                    // is from http://www.itnewb.com/tutorial/Creating-the-Smooth-Scroll-Effect-with-JavaScript

                    var currentYPosition = function () {
                        // Firefox, Chrome, Opera, Safari
                        if (self.pageYOffset) return self.pageYOffset;
                        // Internet Explorer 6 - standards mode
                        if (document.documentElement && document.documentElement.scrollTop)
                            return document.documentElement.scrollTop;
                        // Internet Explorer 6, 7 and 8
                        if (document.body.scrollTop) return document.body.scrollTop;
                        return 0;
                    };

                    var elmYPosition = function(elementId) {
                        var elm = document.getElementById(elementId);
                        if(!elm)
                            return null;
                        var y = elm.offsetTop;
                        var node = elm;
                        while (node.offsetParent && node.offsetParent != document.body) {
                            node = node.offsetParent;
                            y += node.offsetTop;
                        } return y;
                    };

                    var startY = currentYPosition();
                    var stopY = elmYPosition(elementId);
                    if(stopY === null) {
                        return false;
                    }
                    if(extraY) {
                        stopY -= extraY;
                    }

                    var distance = stopY > startY ? stopY - startY : startY - stopY;
                    if (distance < 100) {
                        scrollTo(0, stopY); return;
                    }
                    var speed = Math.round(distance / 100);
                    if (speed >= 20) speed = 20;
                    var step = Math.round(distance / 25);
                    var leapY = stopY > startY ? startY + step : startY - step;
                    var timer = 0;
                    var i = 0;
                    if (stopY > startY) {
                        for (i=startY; i<stopY; i+=step ) {
                            setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
                            leapY += step; if (leapY > stopY) leapY = stopY; timer++;
                        } return;
                    }
                    for (i=startY; i>stopY; i-=step ) {
                        setTimeout("window.scrollTo(0, "+leapY+")", timer * speed);
                        leapY -= step; if (leapY < stopY) leapY = stopY; timer++;
                    }

                }


            },
            logout: function() {
                $rootScope.$broadcast('sessionDestroy', accountService.account);

                // We're allowed to stay on the confirm account page
                if(this.isCurrentRoute('/confirm-account')) {
                    return;
                }

                this.goToLogin();
            },
            getTagUrl: function(tag, options) {
                if(tag.PostId) {
                    return this.getPostUrl(options.post, options.community);
                }

                return null;
            },
            getPostUrl: function(post, community) {
                return '/post/' + community.Url + '/' + post.UrlId + '/' + post.Url;
            },
            goToPostState: function(post, community) {
                /*
                route.$state.go('community.communityUrl.post', {
                    communityUrl: community.Url,
                    postUrlId: post.UrlId,
                    postUrl: post.Url
                });
                */
                this.goToPost(post, community);
            },
            getStatusUrl: function(status, community) {
                return this.getStreamUrl(community) + '?status=' + status.Id;
            },
            getStreamUrl: function(community) {
                return '/stream/' + community.Url;
            },
            getMapUrl: function(map, community) {
                return '/map/' + community.Url + '/' + map.Url;
            },
            getPinnedItemUrl: function(pinnedItem, profile, community) {
                return this.getProfileUrl(profile, community) + '/pin?pinnedItem=' + pinnedItem.Id;
            },
            getProfileUrl: function(profile, community) {
                if(!profile) {
                    profile = this.currentProfile;
                }
                return '/profile/' + community.Url + '/' + profile.Username;
            },
            getCompatibilityUrl: function(profile, community) {
                return this.getProfileUrl(profile, community) + '/compatibility';
            },
            getCompatibilityQuestionUrl: function(profile, compatibilityQuestion, community) {
                return this.getProfileUrl(profile, community) + '/compatibility?question=' + compatibilityQuestion.Id;
            },
            getTagPageUrlFromTag: function(tag, community) {
                return '/wiki/' + community.Url + '/' + tag;
            },
            getTagPageUrl: function(tagPage, community) {
                return this.getTagPageUrlFromTag(tagPage.Tag, community);
            },
            getStepPageUrl: function(stepPage, specialization) {
                return '/lesson/' + specialization.DisciplineUrl + '/' + specialization.SpecializationUrl + '/' + stepPage.Url;
            },
            getImageUrl: function(imageFileEntry, options) {
                if(imageFileEntry.TagPageId) {
                    return this.getTagPageUrl(options.tagPage, options.community) + '?image=' + imageFileEntry.Id;
                }
                else if(imageFileEntry.StepPageId) {
                    return this.getStepPageUrl(options.stepPage, options.specialization) + '?image=' + imageFileEntry.Id;
                }
                else {
                    return '/profile/' + options.community.Url + '/' + options.account.Username + '?image=' + imageFileEntry.Id;
                }
            },
            /*
             options: {
                 status: scope.options.status,
                 post: scope.options.post,
                 imageFileEntry: scope.options.imageFileEntry,
                 account: // used if an image is provided. This is the account to which the image belongs.
                 community: communityService.community,
                 tagPage: scope.options.tagPage, // used for images
                 stepPage: scope.options.stepPage, // used for images
                 specialization: scope.options.specialization // used for images
             }
             */
            getCommentUrl: function(comment, options) {
                if(options.status) {
                    return this.getStatusUrl(options.status, options.community) + '&comment=' + comment.Id;
                }
                else if(options.post) {
                    return this.getPostUrl(options.post, options.community) + '?comment=' + comment.Id;
                }
                else if(options.imageFileEntry) {
                    return this.getImageUrl(options.imageFileEntry, options) + '&comment=' + comment.Id;
                }
                else {
                    return null;
                }
            }




        };
    }]);