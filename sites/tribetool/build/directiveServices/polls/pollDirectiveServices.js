angular.module('app.Services')
    .factory('pollDirectiveService', ['accountService', 'navigationService', 'marketingService', 'communityService', 'commService', 'uiService', '$ionicLoading', 'pollService', '$timeout', function(accountService, navigationService, marketingService, communityService, commService, uiService, $ionicLoading, pollService, $timeout) {
        return {
            initializePollScope: function(scope, element) {
                scope.isLoggedIn = accountService.isLoggedInAndConfirmed();

                scope.$watch('postContent', function(newValue) {
                    if(newValue) {
                        scope.poll = scope.postContent.CurrentVersion.Poll;
                        scope.selectedPollOption = scope.poll.PollOptions[0];

                        if(!scope.isLoggedIn || scope.poll.SelectedPollOption) {
                            $timeout(function() {
                                scope.updatePercentages();
                            });
                        }
                    }
                });

                scope.showSignup = function() {
                    accountService.showSignupDialog(navigationService, marketingService, {
                        marketingAction: {
                            Action: 'PollLoginToVoteOpeningSignUpDialog',
                            Data: [{
                                Key: 'PageName',
                                Value: communityService.page.name
                            }]
                        }
                    });
                };

                scope.submit = function() {
                    if(!scope.isLoggedIn) {
                        return;
                    }

                    $ionicLoading.show({
                        template: '<loading></loading> Submitting Vote...'
                    });
                    scope.processing = true;
                    pollService.selectPollOption(scope.post.Id, scope.selectedPollOption.Id,
                        function(data) {
                            // Success
                            scope.processing = false;
                            $ionicLoading.hide();
                            scope.poll = data.Poll;
                            scope.postContent.CurrentVersion.Poll = scope.poll;

                            if(scope.options && scope.options.onSelected) {
                                scope.options.onSelected();
                            }

                            $timeout(function() {
                                scope.updatePercentages();
                            });
                        }, function(data) {
                            // Failure
                            commService.showErrorAlert(data);
                            scope.processing = false;
                            $ionicLoading.hide();
                        });
                };

                scope.updatePercentages = function() {
                    var colorList = uiService.getColorList();
                    for(var i = 0; i < scope.poll.PollOptions.length; i++) {
                        var pollOption = scope.poll.PollOptions[i];
                        pollOption.voteCount = pollOption.Votes.length;
                        var percentage = Math.floor((pollOption.voteCount/scope.poll.TotalVotes) * 100);
                        pollOption.percentage = percentage;

                        var bar = element.find('#' + pollOption.Id + 'bar');
                        bar.width(percentage + '%');

                        var color = i >= colorList.length ? uiService.getRandomColor() : colorList[i];
                        bar.css('background', color);

                        var container = element.find('#' + pollOption.Id + 'container');
                        container.css('box-shadow', '0 0 3px ' + color + ', 0 0 3px ' + color);
                    }
                };
            }
        };
    }]);