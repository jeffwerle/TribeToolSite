angular.module('app.Directives')
    .directive('autoSuggest', ['autoCompleteService', 'tagPageService', 'commService', '$compile', 'communityService', '$timeout', function (autoCompleteService, tagPageService, commService, $compile, communityService, $timeout) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.autosuggestText = '';
                scope.completing = false;
                var autocompleteElement = $compile('<autocomplete completing="completing" input-id="' + attrs.inputId + '" ng-model="autosuggestText" terms="terms" data="data" on-select="termSelected" attr-input-class="{{inputClass}}" click-activation="false"></autocomplete>')(scope);
                autocompleteElement.removeClass('autocomplete-float');
                element.after(autocompleteElement);

                scope.suggestionType = 'None';
                scope.$watch(attrs.ngModel, function(newValue) {
                    if(newValue) {
                        var i = 0;
                        // Should we auto-suggest a tag?
                        var matches = newValue.match(/#([^\s]*?)$/igm);
                        if(matches) {
                            for(i = 0; i < matches.length; i++) {
                                if(scope.suggestionType !== 'Tag') {
                                    scope.suggestionType = 'Tag';
                                    scope.populate();
                                }
                                scope.autosuggestText = matches[0].substring(1); // Skip the "#'
                                // show the autocomplete
                                scope.completing = true;
                                return;
                            }
                        }

                        // Should we auto-suggest an account?
                        matches = newValue.match(/@([^\s]*?)$/igm);
                        if(matches) {
                            for(i = 0; i < matches.length; i++) {
                                if(scope.suggestionType !== 'Account') {
                                    scope.suggestionType = 'Account';
                                    scope.populate();
                                }

                                scope.autosuggestText = matches[0].substring(1); // Skip the "@'
                                // show the autocomplete
                                scope.completing = true;
                                return;
                            }
                        }
                    }
                    // Hide the autocomplete
                    scope.completing = false;
                });


                scope.data = [];
                scope.terms = [];
                scope.populate = function() {
                    scope.tagPages = [];
                    scope.accountCommunities = [];

                    if(scope.suggestionType === 'None' ||
                        scope.suggestionType === 'Tag') {
                        scope.tagPages = tagPageService.tagPages;
                    }
                    else if(scope.suggestionType === 'None' ||
                        scope.suggestionType === 'Account') {
                        scope.accountCommunities = communityService.accountsInCommunity;
                    }

                    autoCompleteService.populateTerms(scope);
                };
                scope.populate();

                scope.termSelected = function(data) {
                    if(!data.entities)
                    {
                        if(!scope.data[data]) {
                            data = { identifier: data.trim(), type: scope.suggestionType === 'Tag' ? 'tagpage' : 'account', text: data.trim() };
                        }
                        else {
                            data = scope.data[data];
                        }
                    }

                    var inputText = commService.getScopeProperty(scope, attrs.ngModel);
                    var indicator = scope.suggestionType === 'Tag' ? '#' : '@';

                    var length = (indicator + scope.autosuggestText).length;
                    var indexOf = inputText.lastIndexOf(indicator + scope.autosuggestText);
                    var succeeding = inputText.substring(indexOf + length);
                    commService.setScopeProperty(scope, attrs.ngModel,
                        inputText.substring(0,indexOf) + indicator + data.text + (data.entities ? ' ' : '') + succeeding);

                    if(attrs.ngAutofocus) {
                        commService.setScopeProperty(scope, attrs.ngAutofocus, true);
                    }
                };
            }
        };
    }])
    .directive('universalSearchBar', ['tagPageService', 'communityService', 'mapService', function (tagPageService, communityService, mapService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<search-bar input-id="\'universalSearchBar\'" tag-pages="tagPages" maps="maps" input-class="inputClass" account-communities="accountCommunities" communities="communities" placeholder="\'Search...\'"></search-bar>' +
                '</div>',
            scope: {
                inputClass: '=?'
            },
            link: function (scope, element, attrs) {

                scope.populate = function() {
                    scope.tagPages = tagPageService.tagPages;
                    scope.accountCommunities = communityService.accountsInCommunity;
                    scope.maps = mapService.maps;


                    scope.communities = communityService.getAccessibleCommunitiesExcludingCurrent();
                };

                scope.$on('mapsChanged', function(maps) {
                    scope.populate();
                });
                scope.$on('tagPagesChanged', function(tagPages) {
                    scope.populate();
                });
                scope.$on('accountsInCommunityChanged', function(tagPages) {
                    scope.populate();
                });
                scope.$on('communitiesRecached', function() {
                    scope.populate();
                });
                scope.$on('sessionCreate', function() {
                    scope.populate();
                });

                scope.populate();

            }
        };
    }])
    /* Used to search accounts (not account communities--i.e. not accounts within a community). This is
     * for searching for global accounts as may be needed in Messaging. */
    .directive('accountSearchBar', ['commService', 'accountService', function (commService, accountService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<search-bar input-id="\'accountSearchBar\'" options="options" search-text="searchText" account-communities="accountCommunities" placeholder="placeholder"></search-bar>' +
                '</div>',
            scope: {
                /*This is the ng-model (i.e. text) that the user is searching for*/
                searchText: '=',

                placeholder: '=?',
                /*
                 excludeSelf: bool // If true, the currently logged in account (if applicable) will not be returned in the search results
                 onSelect(term) // Called when the term is selected. This should return false to stop any further action (i.e. redirecting to the entity's page)
                 */
                options: '=?'
            },
            link: function (scope, element, attrs) {
                if(!scope.placeholder) {
                    scope.placeholder = 'Search for an account...';
                }

                scope.accountCommunities = [];
                scope.populate = function() {

                    // Get the accounts
                    accountService.getAccounts(function(data) {
                        // Success
                        scope.accountCommunities = [];
                        var accounts = data.Accounts || [];
                        for(var i = 0; i < accounts.length; i++) {
                            var account = accounts[i];

                            // Don't include logged-in account if applicable
                            if(scope.options && scope.options.excludeSelf &&
                                accountService.account) {
                                if(account.Id === accountService.account.Id) {
                                    continue;
                                }
                            }

                            var accountCommunity = {
                                Account: account,
                                ProfileImage: account.ProfileImage
                            };
                            scope.accountCommunities.push(accountCommunity);
                        }
                    }, function(data) {
                        commService.showErrorAlert('Error retrieving accounts...');
                        commService.showErrorAlert(data);
                    });
                };
                scope.populate();
            }
        };
    }])
    .directive('communitySearchBar', ['tagPageService', 'commService', 'navigationService', 'communityService', function (tagPageService, commService, navigationService, communityService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<search-bar input-id="\'communitySearchBar\'" communities="communities" placeholder="placeholder"></search-bar>' +
                '</div>',
            scope: {
                placeholder: '=?'
            },
            link: function (scope, element, attrs) {
                if(!scope.placeholder) {
                    scope.placeholder = 'Search for a Community...';
                }
                scope.populate = function() {
                    scope.communities = communityService.getAccessibleCommunities();
                };

                scope.$on('communitiesRecached', function() {
                    scope.populate();
                });
                scope.$on('sessionCreate', function() {
                    scope.populate();
                });
                scope.populate();
            }
        };
    }])
    .directive('mapSearchBar', ['mapService', 'commService', 'navigationService', 'communityService', function (mapService, commService, navigationService, communityService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<search-bar input-id="\'mapSearchBar\'" maps="maps" placeholder="\'Search...\'"></search-bar>' +
                '</div>',
            scope: {
            },
            link: function (scope, element, attrs) {
                scope.populate = function() {
                    scope.maps = mapService.maps;
                };

                scope.$on('mapsChanged', function(maps) {
                    scope.populate();
                });
                if(communityService.community) {
                    scope.populate();
                }

            }
        };
    }])
    .directive('tagPageSearchBar', ['tagPageService', 'commService', 'navigationService', 'communityService', function (tagPageService, commService, navigationService, communityService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<search-bar show-search="showSearch" input-id="\'tagPageSearchBar\'" autocomplete-required="autocompleteRequired" search-text="searchText" tag-pages="tagPages" placeholder="\'Search...\'" options="options"></search-bar>' +
                '</div>',
            scope: {
                /*This is the ng-model (i.e. text) that the user is searching for*/
                searchText: '=?',

                showSearch: '=?',
                autocompleteRequired: '=?',
                /*
                 onSelect(term) // Called when the term is selected. This should return false to stop any further action (i.e. redirecting to the entity's page)
                 */
                options: '=?'
            },
            link: function (scope, element, attrs) {
                scope.populate = function() {
                    scope.tagPages = tagPageService.tagPages;
                };

                scope.$on('tagPagesChanged', function(tagPages) {
                    scope.populate();
                });
                if(communityService.community) {
                    scope.populate();
                }

            }
        };
    }])
    .directive('searchBar', ['autoCompleteService', 'tagPageService', 'commService', 'navigationService', 'communityService', 'profileService', 'modalService', function (autoCompleteService, tagPageService, commService, navigationService, communityService, profileService, modalService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<autocomplete-input show-search="showSearch" input-id="inputId" ng-model="searchText" terms="terms" data="data" on-select="termSelected" attr-input-class="{{inputClass}}" attr-placeholder="{{placeholder}}" click-activation="true" autocomplete-required="autocompleteRequired"></autocomplete-input>' +
                '</div>',
            scope: {
                tagPages: '=?',
                maps: '=?',
                accountCommunities: '=?',
                communities: '=?',
                placeholder: '=',
                inputClass: '=?',
                inputId: '=',
                autocompleteRequired: '=?',
                showSearch: '=?',

                /*This is the ng-model (i.e. text) that the user is searching for*/
                searchText: '=?',
                /*
                 onSelect(term) // Called when the term is selected. This should return false to stop any further action (i.e. redirecting to the entity's page)
                 */
                options: '=?'
            },
            link: function (scope, element, attrs) {
                if(!scope.inputClass) {
                    scope.inputClass = '';
                }
                scope.inputClass = 'form-control ' + scope.inputClass;

                if(!angular.isDefined(scope.searchText)) {
                    scope.searchText = '';
                }

                scope.data = [];
                scope.terms = [];
                scope.populate = function() {
                    autoCompleteService.populateTerms(scope);
                };
                scope.populate();

                scope.$watch('tagPages', function(newValue) {
                    if(newValue)
                        scope.populate();
                });
                scope.$watch('maps', function(newValue) {
                    if(newValue)
                        scope.populate();
                });
                scope.$watch('accountCommunities', function(newValue) {
                    if(newValue)
                        scope.populate();
                });
                scope.$watch('communities', function(newValue) {
                    if(newValue)
                        scope.populate();
                });



                scope.termSelected = function(selectedTerm) {
                    if(!selectedTerm) {
                        scope.submit();
                    }
                    else {
                        scope.goToPage(selectedTerm);
                    }
                };

                scope.submit = function() {
                    if(!scope.searchText) {
                        return;
                    }

                    var i = 0;
                    // Is the text a community name?
                    if(scope.communities) {
                        var lowercaseTerm = scope.searchText.toLowerCase();
                        for(i = 0; i < scope.communities.length; i++) {
                            if(scope.communities[i].Name.toLowerCase() === lowercaseTerm) {
                                // Are we already in this community?
                                if(communityService.community.Id === scope.communities[i].Id) {
                                    break;
                                }

                                navigationService.goToCommunity(scope.communities[i].Url);
                                scope.searchText = '';
                                return;
                            }
                        }
                    }

                    // The user pressed enter
                    // Search for an exact match by text
                    var searchTextLowercase = scope.searchText.toLowerCase();
                    for(var term in scope.data) {
                        var dataElement = scope.data[term];
                        if(dataElement.text.toLowerCase() === searchTextLowercase) {
                            // Skip communities--we already checked those
                            if(dataElement.entities.length === 1 &&
                                dataElement.entities[0].type === 'community')
                                continue;

                            scope.goToPage(dataElement);
                            return;
                        }
                    }

                    // Nothing has yet been found. Let's go with what
                    // the user typed in.
                    scope.goToPage(scope.searchText);
                };

                scope.goToPage = function(data) {

                    var entity = null;
                    if(data.entities)
                        entity = data.entities[0];
                    else if(!scope.data[data]) {
                        entity = { identifier: data.trim(), type: 'tagpage' };
                    }
                    else {
                        entity = scope.data[data].entities[0];
                    }


                    if(scope.options && scope.options.onSelect) {
                        if(scope.options.onSelect(entity) === false) {
                            return;
                        }
                    }


                    if(entity.type === 'account') {
                        navigationService.goToProfile(entity.identifier, communityService.community);
                    }
                    else if(entity.type === 'community') {
                        navigationService.goToCommunity(entity.item.Url);
                    }
                    else if(entity.type === 'map') {
                        navigationService.goToMap({
                            Url: entity.identifier
                        }, communityService.community);
                    }
                    else {
                        navigationService.goToTagPage(entity.identifier, communityService.community);
                    }

                    scope.searchText = '';
                    modalService.closeAll();

                };
            }
        };
    }]);