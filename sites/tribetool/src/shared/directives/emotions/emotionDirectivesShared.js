angular.module('app.Directives')
    .directive('emotionColor', [function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                scope.$watch(attrs.emotionColor,
                    function(newValue, oldValue) {
                        element.removeClass('emotion-amused-glow');
                        element.removeClass('emotion-excited-glow');
                        element.removeClass('emotion-unamused-glow');
                        element.removeClass('emotion-sad-glow');
                        element.removeClass('emotion-angry-glow');
                        element.removeClass('emotion-surprised-glow');

                        if(newValue) {
                            element.removeClass('emotion-none-glow');
                            element.addClass('emotion-' + newValue.toLowerCase() + '-glow');
                        }
                        else {
                            element.addClass('emotion-none-glow');
                        }
                    });
            }
        };
    }])
    .directive('unamusedFace', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="emotion-icon-no-hover emotion-unamused emotion-sprite-small-unamused-brown"></div>',
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('loveFace', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="emotion-icon-no-hover emotion-love emotion-sprite-small-love"></div>',
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('sillyFace', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="emotion-icon-no-hover emotion-silly emotion-sprite-small-silly"></div>',
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('sadFace', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="emotion-icon-no-hover emotion-sad emotion-sprite-small-sad-green"></div>',
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('happyFace', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="emotion-icon-no-hover emotion-amused emotion-sprite-small-amused"></div>',
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('excitedFace', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="emotion-icon-no-hover emotion-excited emotion-sprite-small-excited"></div>',
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('excitedFaceAnimation', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="emotion-icon-no-hover emotion-excited" src="images/emoticons/Excited-Animation-Blue.gif">',
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('surprisedFace', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="emotion-icon-no-hover emotion-surprised emotion-sprite-small-surprised"></div>',
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('angryFace', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="emotion-icon-no-hover emotion-angry emotion-sprite-small-angry"></div>',
            link: function (scope, element, attrs) {
            }
        };
    }])
    /* Used to display the appropriate smiley for the given emotionType */
    .directive('emotionFace', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="emotionType === \'Excited\'"><excited-face></excited-face></div>' +
                    '<div ng-if="emotionType === \'Amused\'"><happy-face></happy-face></div>' +
                    '<div ng-if="emotionType === \'Unamused\'"><unamused-face></unamused-face></div>' +
                    '<div ng-if="emotionType === \'Sad\'"><sad-face></sad-face></div>' +
                    '<div ng-if="emotionType === \'Surprised\'"><surprised-face></surprised-face></div>' +
                    '<div ng-if="emotionType === \'Angry\'"><angry-face></angry-face></div>' +
                '</div>',
            scope: {
                emotionType: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    }])

    .directive('emotionIcon', [function () {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="image emotion-icon emotion-button"><div class="emotion-sprite" ng-class="{\'emotion-sprite-amused-grey\': !emotion, \'emotion-sprite-amused\': emotion===\'Amused\', \'emotion-sprite-sad-green\': emotion===\'Sad\', \'emotion-sprite-angry\': emotion===\'Angry\'}"></div></div>',
            scope: {
                emotion: '=?'
            },
            link: function (scope, element, attrs) {
            }
        };
    }])
    .directive('emotionVoteMechanism', ['voteService', 'commService', 'accountService', 'navigationService', 'marketingService', 'communityService', '$ionicGesture', 'mediaService', function (voteService, commService, accountService, navigationService, marketingService, communityService, $ionicGesture, mediaService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="emotion-vote-mechanism">' +

                    '<div class="circle-menu" ng-click="toggleMenu($event)" ng-class="{\'inactive\': !menuOpen, \'active\': menuOpen}">' +
                        '<div class="circle-menu-btn trigger">' +
                            '<div ng-show="menuOpen" class="emotion-button"><i class="fa fa-times"></i></div>' +
                            '<div ng-show="!menuOpen"><emotion-icon emotion="emotion"></emotion-icon></div>' +
                        '</div>' +
                        '<div ng-show="menuOpen" class="icons">' +
                            '<div class="rotator-right-3">' +
                                '<div class="circle-menu-btn circle-menu-btn-icon button button-stable" ng-click="selectEmotion(\'Sad\')">' +
                                    '<div class="image emotion-icon emotion-sad emotion-button emotion-choice"><div class="emotion-sprite emotion-sprite-sad-green"></div></div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="rotator-right-3">' +

                                '<div class="circle-menu-btn circle-menu-btn-icon button button-stable"  ng-click="selectEmotion(\'Angry\')">' +
                                    '<div class="image emotion-icon emotion-angry emotion-button emotion-choice"><div class="emotion-sprite emotion-sprite-angry"></div></div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="rotator-right-3">' +
                                '<div class="circle-menu-btn circle-menu-btn-icon button button-stable" ng-click="selectEmotion(\'Amused\')">' +
                                    '<div class="image emotion-icon emotion-amused emotion-button emotion-choice"><div class="emotion-sprite emotion-sprite-amused"></div></div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>'+
                '</div>',
            scope: {
                post: '=?',
                postContent: '=?',
                comment: '=?',
                status: '=?',
                imageFileEntry: '=?',
                newsItem: '=?',

                emotion: '=',
                disableInteraction: '=?',

                /*
                    {
                        toggleMenu: function($event) // filled by this directive, this can be called to toggle the emotion's menu
                    }
                 */
                options: '=?'
            },
            link: function (scope, element, attrs) {
                if(!scope.disableInteraction) {
                    // Double tapping should choose the Excited emotion
                    if($ionicGesture.on) {
                        $ionicGesture.on('doubletap', function(){
                            scope.selectEmotion('Excited');
                            scope.menuOpen = false;
                        }, element);
                    }
                }

                // Show animations on non-mobile
                if(!mediaService.isMobile) {
                    element.find('.circle-menu-btn').addClass('transform');
                    element.find('.emotion-icon').addClass('transform');
                }
                else {
                    element.find('.circle-menu').addClass('active');
                }

                scope.selectedEmotion = scope.emotion;
                scope.votableContent = scope.postContent ? scope.postContent : scope.post ? scope.post : scope.comment ? scope.comment : scope.status ? scope.status : scope.imageFileEntry ? scope.imageFileEntry : scope.newsItem ? scope.newsItem : null;
                if(!scope.votableContent.Statistics) {
                    scope.votableContent.Statistics = { };
                }
                if(!scope.votableContent.Statistics.EmotionStatistics) {
                    scope.votableContent.Statistics.EmotionStatistics = { TotalEmotionCount: 0, ExcitedCount: 0, AmusedCount: 0, UnamusedCount: 0, SadCount: 0, AngryCount: 0, SurprisedCount: 0 };
                }
                scope.emotionStatistics = scope.votableContent.Statistics.EmotionStatistics;

                scope.hasWriteAccess = communityService.hasWriteAccess();
                scope.menuOpen = false;
                scope.toggleMenu = function(e) {
                    if(scope.disableInteraction || !scope.hasWriteAccess) {
                        return;
                    }

                    scope.menuOpen = !scope.menuOpen;
                    if(e)
                        e.stopPropagation();
                };
                if(scope.options) {
                    scope.options.toggleMenu = scope.toggleMenu;
                }


                scope.showAccounts = function(emotionType) {
                    var currentAccountId = accountService.account ? accountService.account.Id : null;
                    var accountVotes = [];
                    var addedCurrentAccount = false;
                    for(var i = 0; i < scope.votableContent.EmotionVotes.length; i++) {
                        var accountEmotion = scope.votableContent.EmotionVotes[i];

                        if(accountEmotion.EmotionType === emotionType) {
                            if(currentAccountId === accountEmotion.AccountId) {
                                if(emotionType !== scope.selectedEmotion)
                                    continue;

                                addedCurrentAccount = true;
                            }

                            accountVotes.push({
                                AccountId: accountEmotion.AccountId,
                                EmotionType: emotionType,
                                DateVoted: accountEmotion.DateVoted
                            });
                        }
                    }

                    if(currentAccountId && emotionType === scope.selectedEmotion && !addedCurrentAccount) {
                        accountVotes.push({
                            AccountId: accountService.account.Id,
                            EmotionType: emotionType,
                            DateVoted: new Date()
                        });
                    }

                    // Show a modal of the accounts that voted for the emotion.
                    accountService.showAccountList({
                        accountVotes: accountVotes,
                        emotionType: emotionType
                    });
                };
/*
                scope.recalculateCounts = function() {
                    // Order from happiest to saddest so that we prefer happy
                    var emotions = ['Excited', 'Amused', 'Unamused', 'Surprised', 'Sad', 'Angry'];

                    var max = 0, i, emotionType;
                    for(i = 0; i < emotions.length; i++) {
                        emotionType = emotions[i];
                        var count = scope.emotionStatistics[emotionType + 'Count'];
                        if(count > max) {
                            max = count;
                        }
                    }

                    if(max > 0) {
                        for(i = 0; i < emotions.length; i++) {
                            emotionType = emotions[i];
                            if(scope.emotionStatistics[emotionType + 'Count'] === max) {
                                scope.votableContent.Statistics.EmotionStatistics.EmotionType = emotionType;
                                break;
                            }
                        }
                    }
                    else {
                        // Change to '' instead of null so that the scope can watch its change
                        scope.votableContent.Statistics.EmotionStatistics.EmotionType = '';
                    }


                };
                scope.recalculateCounts();
*/
                scope.selectEmotion = function(emotion) {
                    if(scope.disableInteraction || !scope.hasWriteAccess) {
                        return;
                    }

                    if(!accountService.isLoggedIn()) {
                        accountService.showSignupDialog(navigationService, marketingService, {
                            marketingAction: {
                                Action: 'EmotionVoteOpeningSignUpDialog',
                                Data: [{
                                    Key: 'PageName',
                                    Value: communityService.page.name
                                }]
                            }
                        });
                        return;
                    }

                    if(!emotion) {
                        scope.selectedEmotion = emotion;
                        return;
                    }

                    if(scope.selectedEmotion === emotion) {
                        // The user is unselecting the currently selected emotion
                        scope.selectedEmotion = null;
                        scope.emotionStatistics[emotion + 'Count']--;
                        scope.emotionStatistics.TotalEmotionCount--;

                    }
                    else {
                        if(scope.selectedEmotion) {
                            scope.emotionStatistics[scope.selectedEmotion + 'Count']--;
                        }
                        else {
                            scope.emotionStatistics.TotalEmotionCount++;
                        }
                        scope.selectedEmotion = emotion;
                        scope.emotionStatistics[emotion + 'Count']++;
                    }

                    var emotionVote = {
                        EmotionType: scope.selectedEmotion === null ? 'None' : scope.selectedEmotion,
                        VoteActionType: null
                    };

                    if(scope.comment) {
                        emotionVote.VoteActionType = 'Comment';
                        emotionVote.CommentId = scope.comment.Id;
                    }

                    if(scope.imageFileEntry) {
                        if(!emotionVote.VoteActionType)
                            emotionVote.VoteActionType = 'Image';
                        emotionVote.ImageFileEntryId = scope.imageFileEntry.Id;
                    }

                    if(scope.post) {
                        if(!emotionVote.VoteActionType)
                            emotionVote.VoteActionType = 'PostContent';
                        emotionVote.PostId = scope.post.Id;
                        if(scope.postContent) {
                            emotionVote.PostContentId = scope.postContent.Id;
                        }
                    }

                    if(scope.status) {
                        if(!emotionVote.VoteActionType)
                            emotionVote.VoteActionType = 'Status';
                        emotionVote.StatusId = scope.status.Id;
                    }

                    if(scope.newsItem) {
                        if(!emotionVote.VoteActionType)
                            emotionVote.VoteActionType = 'NewsItem';
                        emotionVote.NewsItemId = scope.newsItem.Id;
                    }

                    var updateEmotionVotes = function(emotion) {
                        var emotionVotes = scope.votableContent.EmotionVotes;
                        var emotionVoteIndexToRemove = -1;
                        for(var i = 0; i < emotionVotes.length; i++) {
                            var emotionVote = emotionVotes[i];
                            if(emotionVote.AccountId === accountService.account.Id) {
                                // Remove the account
                                emotionVoteIndexToRemove = i;
                                break;
                            }
                        }
                        if(emotionVoteIndexToRemove >= 0) {
                            emotionVotes.splice(emotionVoteIndexToRemove, 1);
                        }
                        emotionVotes.push({
                            AccountId: accountService.account.Id,
                            EmotionType: emotion,
                            DateVoted: new Date(),
                            Account: accountService.account
                        });

                        if(scope.votableContent && scope.votableContent.onEmotionVote) {
                            scope.votableContent.onEmotionVote();
                        }
                    };

                    var previousEmotion = scope.emotion;
                    voteService.emotionVote(emotionVote, function(data) {
                        // Success

                    }, function(data) {
                        // Failure
                        scope.emotion = previousEmotion;
                        updateEmotionVotes(scope.emotion);
                        commService.showErrorAlert('Your emotion vote didn\'t go through! Please try again. If the problem persists, please report this as a bug.');
                    });

                    scope.emotion = scope.selectedEmotion;
                    updateEmotionVotes(scope.emotion);

                };
            }
        };
    }]);