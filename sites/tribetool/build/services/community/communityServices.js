 angular.module('app.Services')
    .factory('communityService', ['$rootScope', '$http', '$timeout', 'commService', 'accountService', '$ocLazyLoad', 'OPTIONS', 'navigationService', 'route', function($rootScope, $http, $timeout, commService, accountService, $ocLazyLoad, OPTIONS, navigationService, route) {
        return {
            /* {
             *  name: This will be null if not on a community page. 'community', 'stream', 'wiki', 'profile', 'post', 'submit', 'learn'.
             *  isCommunityPage: bool, // indicates whether the page is any type of community page (i.e. one that necessitates the use of a community)
             * } */
            page: null,
            /*
                [{
                    onCommunityModulesLoaded: function({
                        alreadyLoaded: bool // If true, the js files were already loaded for the community
                        communityService: the communityService,
                         community: community,
                         communityOptions: communityOptions
                    }) //  Called when the community modules are completely loaded
                }]
             */
            callbacks: [],
            removeCallback: function(callbackObject) {
                var i = this.callbacks.indexOf(callbackObject);
                if(i >= 0) {
                    this.callbacks.splice(i, 1);
                }
            },
            triggerEvent: function(eventName, data) {
                for(var i = 0; i < this.callbacks.length; i++) {
                    if(this.callbacks[i][eventName])
                        this.callbacks[i][eventName](data);
                }
            },
            onCommunityModulesLoaded: function(data) {

                var service = this;
                if(data && data.communityService) {
                    service = data.communityService;
                }

                service.removeCommunityCss();
                service.loadCommunityCssWithDependencies(data.community);

                service.triggerEvent('onCommunityModulesLoaded', data);
            },
            markdownFormatter: null,
            isOnProfilePage: function() {
                return this.page && this.page.name === 'profile';
            },
            isOnCommunityPage: function() {
                return this.page && this.page.name === 'community';
            },
            isOnStreamPage: function() {
                return this.page && this.page.name === 'stream';
            },
            isOnWikiPage: function() {
                return this.page && this.page.name === 'wiki';
            },
            isOnPostPage: function() {
                return this.page && this.page.name === 'post';
            },
            getPage: function(state) {
                var page = {
                    isCommunityPage: false
                };

                var currentRoute = navigationService.getCurrentRoute();
                if(currentRoute) {
                    currentRoute = currentRoute.substring(1);
                }
                page.name = currentRoute;
                if(route.isUsingState) {
                    if(!state) {
                        state = route.$state;
                    }
                    page.isCommunityPage = state.params.isCommunityPage;
                }

                if(page.name) {
                    var indexOfForwardSlash = page.name.indexOf('/');
                    if(indexOfForwardSlash > 0)
                        page.name = page.name.substring(0, indexOfForwardSlash);
                }
                return page;
            },
            setPage: function(state) {
                this.page = this.getPage(state);
            },
            /* A list of the accounts in the community (AccountCommunityEntry with .Account populated) */
            accountsInCommunity: null,

            /* The AccountCommunity object for the current account
            and the currently loaded community
             */
            accountCommunity: null,
            /* The current community that is loaded */
            community: null,
            /* The current communityOptions that is loaded for the current community */
            communityOptions: null,

            /* If not null, this object can be used to add directives to the inside
            of the framework-level directives.
             {
                // community page
                community: {
                    // community page sidebar
                    sidebar: {
                        objects: [{
                            template: string, // html
                        }]
                    }
                }
             }
             */
            communityRenderOptions: null,

            /* Key is community name (lower-case),
                value is {
                    community: CommunityEntry,
                    loading: bool // indicates whether the community is in the process of being loaded
                    appLoaded: bool  // if true, the community is completely loaded and ready to be rendered,
                    useDefaultFiles: bool // if true, the 'default' files will be used (at sites/default/),
                    recentlyChanged: bool // true if the community was loaded (i.e. 'communityChanged' was called) in order to render the current page (if another page is loaded in the same community then this will turn to false),
                    isDependency: bool // If true, the community is a dependency and not a community in the database
                    style: {
                        logoClass: string, // If provided, this class will be applied to a div to display the community's logo
                    }
                }
            */
            communities: { },
            defaultCommunityUrl: 'the-mouse-landing',
            /* If true, the default community (i.e. /sites/default) has had its files loaded. */
            hasDefaultCommunityBeenLoaded: false,
            initialize: function() {

            },
            recache: function() {
                if(this.community)
                    this.populateAccountsInCommunity();
                this.recacheCommunities();
            },
            addCommunityIfNecessary: function(community) {
                var lowercaseCommunityUrl = community.Url.toLowerCase();
                var communityOptions;
                if(!this.communities[lowercaseCommunityUrl]) {
                    communityOptions = {
                        loading: false,
                        appLoaded: false,
                        community: community
                    };
                    this.communities[lowercaseCommunityUrl] = communityOptions;
                    return communityOptions;
                }
                else {
                    communityOptions = this.communities[lowercaseCommunityUrl];
                    communityOptions.community = community;
                    return communityOptions;
                }
            },
            setCommunity: function(community, accountCommunity) {
                var communityOptions = this.addCommunityIfNecessary(community);
                // Use the redirect if applicable
                if(community.FinalDestination) {
                    communityOptions = this.addCommunityIfNecessary(community.FinalDestination);
                    community = community.FinalDestination;
                }

                var communityChanged = community && (!this.community || this.community.Id !== community.Id);

                this.community = community;
                this.communityOptions = communityOptions;

                if(communityChanged) {

                    // Set the rendering options to null to cancel out the previous
                    // community's options--the new community will set its own render
                    // options in its main controller.
                    this.communityRenderOptions = null;
                    communityOptions.recentlyChanged = true;

                    $rootScope.$broadcast('communityChanged', community);
                }
                else {
                    communityOptions.recentlyChanged = false;
                }

                if(angular.isDefined(accountCommunity))
                    this.setAccountCommunity(accountCommunity);

                return {
                    community: community,
                    communityChanged: communityChanged
                };
            },
            setAccountCommunity: function(accountCommunity) {
                if(this.community) {
                    var lowercaseCommunityUrl = this.community.Url.toLowerCase();
                    if(accountCommunity && this.communities[lowercaseCommunityUrl]) {
                        this.communities[lowercaseCommunityUrl].accountCommunity = accountCommunity;
                    }
                }

                var accountCommunityChanged = accountCommunity && (!this.accountCommunity || this.accountCommunity.Id != accountCommunity.Id);
                this.accountCommunity = accountCommunity;

                if(accountCommunityChanged) {
                    if(accountService.shouldNavigateToCompatibilityPage(accountCommunity)) {
                        navigationService.goToPath('/compatibility/' + this.community.Url + '?tour=true');
                    }
                    $rootScope.$broadcast('accountCommunityChanged', accountCommunity);
                }
            },
            /* Gets the default community url for the user */
            getDefaultCommunityUrl: function() {
                // Is a community already loaded?
                if(this.community) {
                    return this.community.Url;
                }
                else {
                    if(accountService.isLoggedIn() &&
                        accountService.account.CommunityUrls &&
                        accountService.account.CommunityUrls.length > 0) {
                        return accountService.account.CommunityUrls[0];
                    }
                    else {
                        return this.defaultCommunityUrl;
                    }
                }
            },
            /* Gets the applicable object{} from this.communities for the currently
            * loaded community*/
            getCommunityOptions: function(community) {
                if(!community) {
                    community = this.community;
                }
                return this.getCommunityOptionsFromUrl(community.Url);
            },
            getCommunityOptionsFromUrl: function(communityUrl) {
                var lowercaseCommunityUrl = communityUrl.toLowerCase();
                var communityOptions = this.communities[lowercaseCommunityUrl];
                if(!communityOptions) {
                    return this.addCommunityIfNecessary({
                        Url: communityUrl
                    });
                }
                return communityOptions;
            },
            getCommunityFolderName: function(community, communityOptions) {
                if(!community) {
                    community = this.community;
                }
                if(!communityOptions)
                    communityOptions = this.getCommunityOptions(community);
                var lowercaseCommunityUrl = community.Url.toLowerCase();
                var lowercaseCommunityUrlNormalized = lowercaseCommunityUrl.replace(/-/g, '');
                return communityOptions.useDefaultFiles ? 'default' : lowercaseCommunityUrlNormalized;
            },
            /*
            Gets the current community's name with "the" in front of it (not included if the community name
            already includes "the"
             */
            getNameWithThe: function(community) {
                if(!community) {
                    community = this.community;

                }
                if(community.Name.toLowerCase().indexOf('the') === 0) {
                    return community.Name;
                }
                else {
                    return 'the ' + community.Name;
                }
            },
            /*
             Gets the current community's name without "the" in front of it
             */
            getNameWithoutThe: function(community) {
                if(!community) {
                    community = this.community;
                }
                if(community.Name.toLowerCase().indexOf('the ') === 0) {
                    return community.Name.substring('the '.length);
                }
                else {
                    return community.Name;
                }
            },
            /* Gets the default community to show for the user */
            getDefaultCommunity: function(onSuccess, onFailure) {
                // Is a community already loaded?
                this.getCommunity(this.getDefaultCommunityUrl(), onSuccess, onFailure);
            },
            recacheCommunities: function(onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('community', {
                    Credentials: accountService.getCredentials(my.community),
                    GetCommunitiesOptions: {
                        GetCommunitiesType: 'NonUserCreatedPublic'
                    },
                    RequestType: 'GetCommunities'
                }, function(data) {
                    // Success
                    if(data.Communities) {
                        for(var i = 0; i < data.Communities.length; i++) {
                            var community = data.Communities[i];
                            my.addCommunityIfNecessary(community);
                        }
                        $rootScope.$broadcast('communitiesRecached', {});
                    }
                    if(onSuccess)
                        onSuccess();
                }, onFailure);
            },
            isCommunityAccessible: function(community) {
                if(community.SpecializationId) {
                    if(accountService.account && accountService.account.Billing &&
                        accountService.account.Billing.Subscriptions) {
                        var subscriptions = accountService.account.Billing.Subscriptions;
                        for(var i = 0; i < subscriptions.length; i++) {
                            var subscription = subscriptions[i];
                            if(subscription.Status === 'Active' && subscription.LessonSubscription &&
                                subscription.LessonSubscription.SpecializationId === community.SpecializationId) {
                                return true;
                            }
                        }
                    }

                    return false;
                }
                else {
                    return true;
                }
            },
            resetLoadingFlag: function() {
                for(var communityUrl in this.communities) {
                    var communityOptions = this.communities[communityUrl];
                    communityOptions.loading = false;
                }
            },
            /* Gets the current community that is being loaded. Returns null if no community is currently being loaded. */
            getCurrentCommunityLoading: function() {
                for(var communityUrl in this.communities) {
                    var communityOptions = this.communities[communityUrl];
                    if(communityOptions.isDependency) {
                        continue;
                    }

                    if(communityOptions.loading) {
                        return communityOptions.community;
                    }
                }
                return null;
            },
            /* Gets a list of the communities that are accessible to the current account. */
            getAccessibleCommunities: function() {
                var communities = [];
                for(var communityUrl in this.communities) {
                    var communityOptions = this.communities[communityUrl];
                    if(communityOptions.isDependency) {
                        continue;
                    }

                    var community = communityOptions.community;

                    // Is this community accessible?
                    if(this.isCommunityAccessible(community)) {
                        communities.push(community);
                    }
                }
                return communities;
            },
            /* Gets the accessible communities that are not the currently loaded community (and do not redirect
            * to the currently loaded community) */
            getAccessibleCommunitiesExcludingCurrent: function() {
                var accessibleCommunities = this.getAccessibleCommunities();
                var communities = [];
                for(var i = 0; i < accessibleCommunities.length; i++) {
                    if(!this.isEqualToCurrentCommunity(accessibleCommunities[i])) {
                        communities.push(accessibleCommunities[i]);
                    }
                }
                return communities;
            },
            isEqualToCurrentCommunity: function(community) {
                if(!this.community) {
                    return false;
                }

                if(community.Id === this.community.Id) {
                    return true;
                }
                if(community.Redirect && community.FinalDestination.Id === this.community.Id) {
                    return true;
                }

                return false;
            },
            getCommunity: function(communityUrl, onSuccess, onFailure) {
                var lowercaseUrl = communityUrl.toLowerCase();

                var communityOptions = this.communities[lowercaseUrl];

                var refreshCommunity = !communityOptions || (communityOptions.loading && !communityOptions.appLoaded);

                if(!refreshCommunity) {
                    // We will want to refresh the accountCommunity if we're logged in and the Ids don't
                    // match
                    if(accountService.account) {
                        if(!communityOptions.accountCommunity ||
                            communityOptions.accountCommunity.AccountId != accountService.account.Id) {
                            refreshCommunity = true;
                        }
                    }
                }

                if(refreshCommunity) {
                    // Retrieve the community
                    var my = this;
                    commService.postWithParams('community', {
                        Credentials: accountService.getCredentials(my.community),
                        AccountCommunity: my.accountCommunity,
                        CommunityUrl: communityUrl,
                        RequestType: 'GetCommunity'
                    }, function(data) {
                        // Save the community so we don't have to look it up next time
                        var setCommunityResult = my.setCommunity(data.Community, data.AccountCommunity);
                        data.communityChanged = setCommunityResult.communityChanged;
                        if(onSuccess)
                            onSuccess(data);
                    }, onFailure);
                }
                else {

                    // We're just getting the community and account community from the cache
                    // But we also want to update the account community in case XP or level has changed
                    // We can do this lazily
                    var community = communityOptions.community;
                    var setCommunityResult = this.setCommunity(community);
                    community = setCommunityResult.community;

                    // Update the url of the community since it may have changed due to the requested
                    // community having a redirect
                    lowercaseUrl = community.Url.toLowerCase();
                    if(accountService.account) {
                        this.getAccountCommunity(community.Id);
                    }

                    onSuccess({
                        Community: community,
                        AccountCommunity: communityOptions.accountCommunity,
                        communityChanged: setCommunityResult.communityChanged
                    });
                }
            },

            getCommunityUrl: function() {
                return '/community/' + this.community.Url;
            },
            getCommunitiesForAccount: function(onSuccess, onFailure) {
                var my = this;
                commService.postWithParams('community', {
                    Credentials: accountService.getCredentials(my.community),
                    RequestType: 'GetCommunitiesForAccount'
                }, onSuccess, onFailure);
            },
            populateAccountsInCommunity: function(onSuccess) {
                var my = this;
                commService.postWithParams('community', {
                    Credentials: accountService.getCredentials(my.community),
                    CommunityId: this.community.Id,
                    RequestType: 'GetAccountsInCommunity'
                }, function(data) {
                    my.accountsInCommunity = data.AccountsInCommunity;

                    $rootScope.$broadcast('accountsInCommunityChanged', my.accountsInCommunity);

                    if(onSuccess)
                        onSuccess();
                }, function(data) {
                    // failure
                });
            },
            getAccountCommunity: function(communityId) {
                var my = this;
                commService.postWithParams('community', {
                    Credentials: accountService.getCredentials(my.community),
                    CommunityId: communityId,
                    RequestType: 'GetAccountCommunity'
                }, function(data) {
                    my.setAccountCommunity(data.AccountCommunity);
                }, function(data) {
                    // failure
                });
            },
            newAccountCommunity: function() {
                return {
                    CommunityId: this.community ? this.community.Id : null,
                    ProfileImage: null
                };
            },
            /* Updates the properties provided in the given accountCommunity.Statistics  */
            updateAccountCommunityStatistics: function(statistics) {
                if(this.accountCommunity) {
                    var xpChanged;
                    for(var p in statistics) {
                        if(p === 'XP') {
                            xpChanged = this.accountCommunity.Statistics[p] !== statistics[p];
                        }
                        this.accountCommunity.Statistics[p] = statistics[p];
                    }

                    if(xpChanged) {
                        $rootScope.$broadcast('xpChanged', this.accountCommunity);
                    }
                }
            },
            /* Loads all of the necessary files and modules to display the given community */
            loadCommunityFiles: function(community, onCommunityModulesLoaded) {


                if(!community) {
                    community = this.community;
                }
                if(!onCommunityModulesLoaded) {
                    onCommunityModulesLoaded = this.onCommunityModulesLoaded;
                }

                var lowercaseCommunityUrl = community.Url.toLowerCase();
                var communityOptions = this.communities[lowercaseCommunityUrl];

                // Have we already loaded the community's modules and files?
                if(communityOptions.appLoaded)
                {
                    communityOptions.loading = false;
                    onCommunityModulesLoaded({
                        alreadyLoaded: true,
                        communityService: this,
                        community: community,
                        communityOptions: communityOptions
                    });
                    return;
                }

                // We'll want to load app.js whether we're in debug or production
                // Let's try to load the app.js file at the appropriate community name folder (i.e. NOT
                // the /default/ folder to start).
                var lowercaseCommunityUrlNormalized = lowercaseCommunityUrl.replace(/-/g, '');
                var appJs = 'sites/' + lowercaseCommunityUrlNormalized + '/' + (OPTIONS.isDebug ? 'app.js' : 'all.min.js');
                var filesToLoad = [appJs];

                var self = this;
                var loadFailed = false;
                var loadFiles = function() {
                    // We'll pass on the onCommunityModulesLoaded that we want the community
                    // to call when it's done being loaded (which will be called in
                    // communityService.loadCommunityScripts()).
                    communityOptions.onCommunityModulesLoaded = onCommunityModulesLoaded;


                    var promise = $ocLazyLoad.load(filesToLoad);

                    // The app.js file will call communityService.loadCommunityScripts() which
                    // will trigger the loading of the modules.
                    promise.then(function() {
                        // App.js file loaded successfully

                        if(loadFailed && self.hasDefaultCommunityBeenLoaded) {
                            self.loadCommunityModules(community, communityOptions.onCommunityModulesLoaded, /*useDefaultFiles*/true);
                        }

                    }, function(data) {
                        // Failure
                        commService.showErrorAlert(data);
                    });
                };

                var onLoadFail = function(data, status, headers, config) {
                    loadFailed = true;
                    // The app.js file does not exist for the community so we'll have
                    // to load up the default files
                    filesToLoad = ['sites/default/' + (OPTIONS.isDebug ? 'app.js' : 'all.min.js')];

                    loadFiles();
                };
                // See if the community has its app.js file (if not, we'll use the '/sites/default/' files)
                $http.get(appJs)
                    .success(function(data, status, headers, config) {
                        // If the contents of the app.js file are empty then it's as if the file doesn't exist.
                        if(!data) {
                            onLoadFail(data, status, headers, config);
                        }
                        else {
                            // The app.js file exists for the community so we can load it
                            loadFiles();
                        }

                    }).
                    error(onLoadFail);



            },
            cssLinkClass: 'community-css-file-link',
            /* Removes all css files that have been added for communities or dependencies */
            removeCommunityCss: function() {
                var head = $('head');
                // Remove any css files we may have loaded from other communities
                head.find('link.' + this.cssLinkClass).remove();
            },
            /* Loads the css for the given community */
            loadCommunityCss: function(community) {
                if(!community) {
                    community = this.community;
                }
                var folder = this.getCommunityFolderName(community);
                var cssPath = 'sites/' + folder + '/styles/app.min.css';
                var head = $('head');

                // Now insert the css file for this community
                head.append('<link class="' + this.cssLinkClass + '" rel="stylesheet" href="' + cssPath + '" type="text/css" />');
            },
            /*
            Loads the css for the given community (along with the css for its dependencies
             */
            loadCommunityCssWithDependencies: function(community) {
                if(!community) {
                    community = this.community;
                }

                var communityOptions = this.getCommunityOptions(community);
                var dependencies = communityOptions.dependencies;
                var self = this;
                if(dependencies && dependencies.length > 0) {
                    var loadDependency = function(index) {
                        var dependency = dependencies[index];
                        self.loadCommunityCss(dependency);
                        if(index + 1 < dependencies.length) {
                            loadDependency(index + 1);
                        }
                    };
                    loadDependency(0);
                }
                // Load our main community's css last so that it takes precedence
                this.loadCommunityCss(community);
            },
            /* Loads the community modules
            * useDefaultFiles: if true, the 'default' files will be used (at sites/default/)*/
            loadCommunityModules: function(community, onCommunityModulesLoaded, useDefaultFiles) {
                if(!community) {
                    community = this.community;
                }
                var lowercaseCommunityUrl = community.Url.toLowerCase();
                var communityOptions = this.communities[lowercaseCommunityUrl];
                communityOptions.useDefaultFiles = useDefaultFiles;

                var folder = this.getCommunityFolderName(community);
                var jsPath = 'sites/' + folder + '/' + (OPTIONS.isDebug ? 'app.js' : 'all.min.js');

                // 'd' for dependency (i.e. library) and 'c' for community.
                var appModule = (communityOptions.isDependency ? 'd' : 'c') + folder;

                var controllersModule = appModule + '.Controllers';
                var directivesModule = appModule + '.Directives';
                var servicesModule = appModule + '.Services';

                var modules = [
                    {
                        name: appModule,
                        files: [jsPath]
                    },
                    {
                        name: controllersModule,
                        files: [jsPath]
                    },
                    {
                        name: directivesModule,
                        files: [jsPath]
                    },
                    {
                        name: servicesModule,
                        files: [jsPath]
                    }];

                var my = this;
                $ocLazyLoad.load(modules)
                .then(function() {

                    communityOptions.appLoaded = true;
                    communityOptions.loading = false;

                    if(useDefaultFiles) {
                        my.hasDefaultCommunityBeenLoaded = true;
                    }

                    communityOptions.indexFilePath = 'sites/' + folder + '/app-templates/index.html';

                    onCommunityModulesLoaded({
                        alreadyLoaded: false,
                        communityService: my,
                        community: community,
                        communityOptions: communityOptions
                    });

                }, function(data) {

                    // Failure
                    commService.showErrorAlert(data);
                });
            },
            /* Loads the given .js files and then loads the community modules upon completion. This will
             * be called by the debugFile.js of each community
             *
             * options: {
             *      community: {
              *         Url: string
             *      }, // the Url ommunity that is loading the scripts
             *      files: [],  // an array of file names to load. These will not be loaded in production (they should be part of the concatenated app.js)
             *      dependencyCommunities: [], // an array of communities that should be loaded as dependencies
             *      useDefaultFiles: bool //if true, the 'default' files will be used (at sites/default/)
             * }
             */
            loadCommunityScripts: function(options) {

                if(options.useDefaultFiles) {
                    // Get the community that is being loaded--it's not "default"
                    options.community = this.getCurrentCommunityLoading();
                }

                var communityOptions = this.getCommunityOptions(options.community);
                var community = communityOptions.community;
                communityOptions.dependencies = options.dependencyCommunities;

                // If this is not a dependency (i.e. it's the core community we're loading) or if no
                // onCommunityModulesLoaded method has been provided then use communityService's default
                // onCommunityModulesLoaded which will signal to everyone that the community's modules
                // are completely loaded
                if(!communityOptions.onCommunityModulesLoaded) {
                    communityOptions.onCommunityModulesLoaded = this.onCommunityModulesLoaded;
                }


                var loadModules = function() {

                    if(OPTIONS.isDebug) {
                        // We're in debug so we'll want to load the individual script files. Otherwise
                        // the app.js will be our concatenated script files so no need to load individual files

                        var onFilesLoaded = function() {

                            // Now we've loaded all the individual scripts so let's load the modules
                            my.loadCommunityModules(community, communityOptions.onCommunityModulesLoaded, options.useDefaultFiles);
                        };

                        // Now we'll load the files synchronously using JQuery instead of asynchronously
                        // with ocLazyLoad
                        // (Some files care about the order in which they're loaded
                        // as in the case of VexFlow in the MusicLibrary)
                        var loadFile = function(index) {
                            var file = options.files[index];
                            $ocLazyLoad.load(file)
                                .then(function() {
                                    if(index + 1 < options.files.length) {
                                        loadFile(index + 1);
                                    }
                                    else {
                                        onFilesLoaded();
                                    }
                                }, function(data) {
                                    // Failure
                                    commService.showErrorAlert(data);
                                });
                            /*
                            $.getScript(file)
                                .done(function( script, textStatus ) {
                                    if(index + 1 < options.files.length) {
                                        loadFile(index + 1);
                                    }
                                    else {
                                        onFilesLoaded();
                                    }
                                })
                                .fail(function( jqxhr, settings, exception ) {
                                    // Failure
                                    commService.showErrorAlert(data);
                                });
                                */
                        };
                        if(!options.files || options.files.length <= 0) {
                            onFilesLoaded();
                        }
                        else {
                            loadFile(0);
                        }


                    }
                    else {
                        // No need to load individual script files since app.js is a concatenated file
                        my.loadCommunityModules(community, communityOptions.onCommunityModulesLoaded, /*useDefaultFiles*/options.useDefaultFiles);
                    }
                };

                // Load any dependencies
                var my = this;
                if(options.dependencyCommunities && options.dependencyCommunities.length > 0) {
                    var loadDependency = function(index) {
                        var dependency = options.dependencyCommunities[index];

                        var dependencyOptions = my.addCommunityIfNecessary(dependency);
                        dependencyOptions.isDependency = true;

                        my.loadCommunityFiles(dependency, function(data) {
                            if(index + 1 < options.dependencyCommunities.length) {
                                loadDependency(index + 1);
                            }
                            else {
                                // We finished loading all of the dependencies
                                loadModules();
                            }
                        });
                    };
                    loadDependency(0);
                }
                else {
                    // no dependencies to load
                    loadModules();
                }





            },
            isModerator: function() {
                return this.accountCommunity && this.accountCommunity.AccountType === 'Moderator';
            },
            hasWriteAccess: function() {
                return (this.accountCommunity && this.accountCommunity.AccountType === 'Standard') || this.isModerator();
            }
        };
    }])
     .factory('communityRenderService', ['$rootScope', 'communityService', '$compile', function($rootScope, communityService, $compile) {
         return {
             addElements: function(container, scope, objects) {
                 for(var i = 0; i < objects.length; i++) {
                     var object = objects[i];
                     var html = object.template;
                     container.prepend($compile(html)(scope));
                 }
             }
         };
     }]);