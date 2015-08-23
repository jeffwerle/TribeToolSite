angular.module('app.Directives')
    .directive('voteMechanism', ['voteService', 'commService', 'accountService', 'navigationService', 'marketingService', 'communityService', function (voteService, commService, accountService, navigationService, marketingService, communityService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div class="vote-mechanism">' +
                    '<div ng-show="!disableInteraction" class="vote-up-container" ng-click="upVoteClicked()"><i ng-class="{\'voted\': voteType === \'UpVote\'}" class="icon ion-heart vote-up-img"></i></div>' +
                    '<div class="vote-count hoverable" ng-click="voteCountClicked()">{{votableContent.Statistics.VoteCount}}</div>' +
                    '<div ng-show="!disableInteraction" class="vote-down-container" ng-if="allowDownVote" ng-click="downVoteClicked()"><i ng-class="{\'voted\': voteType === \'DownVote\'}" class="icon ion-heart-broken vote-down-img"></i></div>' +
                '</div>',
            scope: {
                post: '=?',
                comment: '=?',
                status: '=?',
                tag: '=?',
                imageFileEntry: '=?',
                newsItem: '=?',

                voteType: '=',
                allowDownVote: '=?',
                disableInteraction: '=?'
            },
            link: function (scope, element, attrs) {
                if(!scope.disableInteraction) {
                    if(!communityService.hasWriteAccess()) {
                        scope.disableInteraction = true;
                    }
                }

                scope.votableContent = scope.post ? scope.post : scope.comment ? scope.comment : scope.status ? scope.status : scope.imageFileEntry ? scope.imageFileEntry : scope.newsItem ? scope.newsItem : scope.tag;
                if(!scope.votableContent.Statistics) {
                    scope.votableContent.Statistics = {
                        VoteCount: 0
                    };
                }

                scope.voteCountClicked = function() {
                    var currentAccountId = accountService.account ? accountService.account.Id : null;
                    var accountVotes = [];

                    var containsCurrentAccount = false;
                    for(var i = 0; i < scope.votableContent.Votes.length; i++) {
                        var accountVote = scope.votableContent.Votes[i];

                        if(accountVote.AccountId === currentAccountId) {
                            if(accountVote.VoteType !== scope.voteType) {
                                continue;
                            }

                            containsCurrentAccount = true;
                        }

                        accountVotes.push(accountVote);
                    }

                    if(currentAccountId && !containsCurrentAccount) {
                        if(scope.voteType !== 'Unvote') {
                            accountVotes.push({
                                AccountId: currentAccountId,
                                VoteType: scope.voteType,
                                DateVoted: new Date()
                            });
                        }
                    }

                    // Show a modal of the accounts that voted for the emotion.
                    accountService.showAccountList({
                        votable: scope.votableContent,
                        type: 'Vote'
                    });
                };

                scope.upVoteClicked = function() {
                    if(scope.disableInteraction) {
                        return;
                    }

                    if(!accountService.isLoggedIn()) {
                        accountService.showSignupDialog(navigationService, marketingService, {
                            marketingAction: {
                                Action: 'VoteUpOpeningSignUpDialog',
                                Data: [{
                                    Key: 'PageName',
                                    Value: communityService.page.name
                                }]
                            }
                        });
                        return;
                    }

                    if(scope.voteType === 'Unvote'){
                        // Vote up
                        scope.votableContent.Statistics.VoteCount++;
                        scope.voteType = 'UpVote';
                    }
                    else if(scope.voteType == 'UpVote') {
                        // Unvote
                        scope.votableContent.Statistics.VoteCount--;
                        scope.voteType = 'Unvote';
                    }
                    else if(scope.voteType === 'DownVote') {
                        // From down vote to up vote
                        scope.votableContent.Statistics.VoteCount += 2;
                        scope.voteType = 'UpVote';
                    }
                    scope.sendToService();
                };

                scope.downVoteClicked = function() {
                    if(scope.disableInteraction) {
                        return;
                    }

                    if(!accountService.isLoggedIn()) {
                        accountService.showSignupDialog(navigationService, marketingService, {
                            marketingAction: {
                                Action: 'VoteDownOpeningSignUpDialog',
                                Data: [{
                                    Key: 'PageName',
                                    Value: communityService.page.name
                                }]
                            }
                        });
                        return;
                    }

                    if(scope.voteType === 'Unvote'){
                        // Vote down
                        scope.votableContent.Statistics.VoteCount--;
                        scope.voteType = 'DownVote';
                    }
                    else if(scope.voteType == 'DownVote') {
                        // From down vote to note vote
                        scope.votableContent.Statistics.VoteCount++;
                        scope.voteType = 'Unvote';
                    }
                    else if(scope.voteType === 'UpVote') {
                        // From upvote to downvote
                        scope.votableContent.Statistics.VoteCount -= 2;
                        scope.voteType = 'DownVote';
                    }
                    scope.sendToService();
                };

                scope.sendToService = function() {
                    if(scope.disableInteraction) {
                        return;
                    }

                    if(!accountService.isLoggedIn()) {
                        accountService.showSignupDialog(navigationService, marketingService, {
                            marketingAction: {
                                Action: 'VoteOpeningSignUpDialog',
                                Data: [{
                                    Key: 'PageName',
                                    Value: communityService.page.name
                                }]
                            }
                        });
                        return;
                    }

                    var voteEntry = {
                        VoteType: scope.voteType
                    };

                    if(scope.tag) {
                        voteEntry.VoteActionType = 'Tag';
                        voteEntry.TagId = scope.tag.Id;
                    }
                    else if(scope.post) {
                        voteEntry.VoteActionType = 'PostContent';
                        voteEntry.PostId = scope.post.Id;
                    }
                    else if(scope.comment) {
                        voteEntry.VoteActionType = 'Comment';
                        voteEntry.CommentId = scope.comment.Id;
                    }
                    else if(scope.status) {
                        voteEntry.VoteActionType = 'Status';
                        voteEntry.StatusId = scope.status.Id;
                    }
                    else if(scope.imageFileEntry) {
                        voteEntry.VoteActionType = 'Image';
                        voteEntry.ImageFileEntryId = scope.imageFileEntry.Id;
                    }
                    else if(scope.newsItem) {
                        voteEntry.VoteActionType = 'NewsItem';
                        voteEntry.NewsItemId = scope.newsItem.Id;
                    }

                    voteService.vote(voteEntry, function(data) {
                        // Successful vote
                    }, function(data) {
                        // Failure vote
                        commService.showErrorAlert('Your vote didn\'t go through! Please try again.');
                    });
                };


            }
        };
    }]);