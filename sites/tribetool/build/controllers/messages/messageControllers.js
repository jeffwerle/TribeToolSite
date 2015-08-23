angular.module('app.Controllers')
    .controller('messagesController', ['$scope', '$routeParams', 'communityService', 'accountService', 'navigationService', 'messageService', 'commService', '$location', '$timeout', 'mediaService', 'route', function($scope, $routeParams, communityService, accountService, navigationService, messageService, commService, $location, $timeout, mediaService, route) {
        if(!accountService.isLoggedInAndConfirmed()) {
            navigationService.goToCommunity();
            return;
        }

        $scope.mediaService = mediaService;
        $scope.showConversations = !mediaService.isPhone;

        // An array of accounts that are the recipients of the current conversation
        $scope.recipients = [];

        $scope.messageText = '';
        $scope.formattingHelperOptions = {
            markdownOptions: {
                infobox: false
            },
            autofocus: false
        };


        $scope.messageServiceCallbacks = {
            /* When a message is received (from the web socket), add it to its appropriate
            * conversation */
            conversationMessageReceived: function(data) {
                var message = data.message;
                var messageReceipt = data.messageReceipt;

                // Add the message to the appropriate conversation
                if($scope.conversations) {
                    var scrollToMessageScrollbar = function() {
                        navigationService.perfectScrollToHash('messageScrollbar', message.Id);
                    };

                    for(var i = 0; i < $scope.conversations.length; i++) {
                        var conversation = $scope.conversations[i];
                        if(conversation.Id === messageReceipt.ConversationId) {

                            // Make sure the conversation doesn't already have this message
                            for(var j = 0; j < conversation.Messages.length; j++) {
                                if(conversation.Messages[j].Id === message.Id) {
                                    return;
                                }
                            }

                            message.account = $scope.getAccountForMessage(conversation, message);
                            conversation.Messages.push(message);

                            // Are we currently viewing this conversation? If so, scroll to
                            // the message
                            if($scope.conversation && $scope.conversation.Id === conversation.Id) {

                                // Mark the conversation as read (since we got a new message and
                                // it's currently being viewed).
                                $scope.markCurrentConversationAsRead();

                                $timeout(scrollToMessageScrollbar);
                            }
                            else {
                                // We're not viewing this conversation, so add to the unread
                                // message receipts
                                if(!conversation.UnreadMessageReceipts) {
                                    conversation.UnreadMessageReceipts = [];
                                }

                                conversation.UnreadMessageReceipts.push(messageReceipt);
                            }

                            break;
                        }
                    }
                }
            }
        };
        $scope.$on('$destroy', function() {
            messageService.removeCallback($scope.messageServiceCallbacks);
        });
        messageService.callbacks.push($scope.messageServiceCallbacks);


        // Get the conversations
        $scope.loading = true;
        messageService.getConversations(function(data) {
            // Success
            $scope.loading = false;
            $scope.conversations = data.Conversations;

            var i = 0;
            for(i = 0; i < $scope.conversations.length; i++) {
                for(var j = 0; j < $scope.conversations[i].Participants.length; j++) {
                    var participant = $scope.conversations[i].Participants[j];
                    if(participant.Id === accountService.account.Id) {
                        $scope.conversations[i].Participants[j] = accountService.account;
                    }
                }
            }

            if($scope.conversations.length > 0) {
                if(route.routeParams.conversation) {
                    // Get the conversation
                    for(i = 0; i < $scope.conversations.length; i++) {
                        if($scope.conversations[i].Id === route.routeParams.conversation) {
                            $scope.conversation = $scope.conversations[i];
                            break;
                        }
                    }

                    if(!$scope.conversation) {
                        commService.showErrorAlert('Conversation not found.');
                    }
                }

                if(!$scope.conversation) {
                    $scope.conversation = $scope.conversations[0];
                }
            }
            else {
                $scope.newConversation();
            }

            $scope.selectConversation($scope.conversation);

        }, function(data) {
            // Failure
            $scope.loading = false;
            commService.showErrorAlert(data);
        });

        $scope.clearAllSelected = function() {
            if(!$scope.conversations) {
                $scope.conversations = [];
            }
            for(var i = 0; i < $scope.conversations.length; i++) {
                $scope.conversations[i].selected = false;
            }
        };

        $scope.markCurrentConversationAsRead = function() {
            var conversation = $scope.conversation;
            if(conversation.Id) {
                messageService.markConversationRead(conversation, function(data) {
                    // Success
                    conversation.UnreadMessageReceipts = [];
                    messageService.triggerConversationRead();
                }, function(data) {
                    // Failure
                });
            }
        };

        $scope.getAccountForMessage = function(conversation, message) {
            // Find the appropriate account
            if(accountService.account.Id === message.SenderAccountId) {
                return accountService.account;
            }
            for(var j = 0; j < conversation.Participants.length; j++) {
                if(conversation.Participants[j].Id === message.SenderAccountId) {
                    return conversation.Participants[j];
                }
            }

            return null;
        };

        $scope.selectConversation = function(conversation) {
            $scope.conversation = conversation;
            $scope.clearAllSelected();

            var i = 0;



            $scope.recipients = [];
            for(i = 0; i < conversation.Participants.length; i++) {
                var account = conversation.Participants[i];
                if(account.Id !== accountService.account.Id)
                    $scope.recipients.push(account);
            }

            for(i = 0; i < conversation.Messages.length; i++) {
                var message = conversation.Messages[i];
                message.account = $scope.getAccountForMessage(conversation, message);
            }

            conversation.selected = true;

            // scroll to the top so that we scroll to the appropriate bottom
            navigationService.perfectScrollToTop('messageScrollbar');
            $timeout(function() {
                if(route.routeParams.conversation === $scope.conversation.Id &&
                    route.routeParams.message) {

                    navigationService.perfectScrollToHash('messageScrollbar', route.routeParams.message);
                }
                else {
                    navigationService.perfectScrollToBottom('messageScrollbar');
                }

                $scope.markCurrentConversationAsRead();
            });

            if(mediaService.isPhone) {
                // Go to the messages area
                navigationService.scrollToHash('messageArea');
            }
        };

        $scope.removeRecipient = function(recipient) {
            var recipientIndex = $scope.recipients.indexOf(recipient);
            $scope.recipients.splice(recipientIndex, 1);

            if($scope.conversation.ParticipantAccountIds) {
                recipientIndex = $scope.conversation.ParticipantAccountIds.indexOf(recipient);
                $scope.conversation.ParticipantAccountIds.splice(recipientIndex, 1);
            }
        };

        $scope.newConversation = function() {
            $scope.conversation = {
                SenderAccountId: accountService.account.Id,
                ParticipantAccountIds: [accountService.account.Id],
                Participants: [accountService.account],
                Messages: [],
                CommunityIdWhenSent: communityService.community ? communityService.community.Id : null,
                Subject: 'No Subject',
                IsTrashed: false
            };
            $scope.recipients = [];
            $scope.clearAllSelected();
        };

        $scope.showErrors = false;
        $scope.sendMessage = function() {
            $scope.showErrors = false;
            if(!$scope.conversation) {
                $scope.newConversation();
            }

            if(!$scope.conversation.ParticipantAccountIds ||
                $scope.conversation.ParticipantAccountIds.length <= 1) {
                commService.showErrorAlert('At least one recipient must be specified.');
                $scope.showErrors = true;
                return;
            }

            var message = {
                FormattedText: $scope.messageText,
                IsTrashed: false
            };

            $scope.processing = true;
            // Has the conversation been created?
            if(!$scope.conversation.Id) {
                // Add the message to the conversation
                $scope.conversation.Messages.push(message);

                // Create the conversation
                messageService.createConversation($scope.conversation,
                function(data) {
                    $scope.processing = false;
                    // Success
                    $scope.conversation = data.Conversations[0];

                    if(!$scope.conversations) {
                        $scope.conversations = [];
                    }

                    // Insert at the top of the conversations
                    $scope.conversations.splice(0, 0, $scope.conversation);

                    // Scroll the conversations area to the top
                    $timeout(function() {
                        navigationService.perfectScrollToTop('conversationScrollbar');
                        navigationService.scrollToHash($scope.conversation.Messages[0].Id);
                    });

                    $scope.messageText = '';
                    $scope.selectConversation($scope.conversation);

                }, function(data) {
                    // Failure
                    $scope.processing = false;
                    commService.showErrorAlert(data);

                    // Remove the failed message from the conversation
                    $scope.conversation.Messages.pop();
                });
            }
            else {
                // Create the message
                messageService.createMessage($scope.conversation,
                    message,
                function(data) {
                    $scope.processing = false;
                    // Add the message to the conversation
                    $scope.conversation.Messages.push(data.Message);
                    $scope.messageText = '';

                    $timeout(function() {
                        navigationService.perfectScrollToBottom('messageScrollbar');
                    });

                }, function(data) {
                    // Failure
                    $scope.processing = false;
                    commService.showErrorAlert(data);
                });
            }
        };


        $scope.addRecipient = function(account) {

            // Ensure that the account hasn't already been added
            for(var i = 0; i < $scope.conversation.ParticipantAccountIds.length; i++) {
                var recipientId = $scope.conversation.ParticipantAccountIds[i];
                if(account.Id === recipientId) {
                    return false;
                }
            }

            $scope.recipients.push(account);
            if($scope.conversation) {
                if(!$scope.conversation.ParticipantAccountIds) {
                    $scope.conversation.ParticipantAccountIds = [];
                }

                $scope.conversation.ParticipantAccountIds.push(account.Id);
                $scope.conversation.Participants.push(account);
            }

        };

        $scope.searchBarOptions = {
            searchText: '',
            excludeSelf: true,
            onSelect: function(entity) {
                // Get the account community of the account
                var accountCommunity = entity.item;
                var account = accountCommunity.Account;

                $scope.addRecipient(account);

                $scope.searchBarOptions.searchText = '';

                // prevent redirecting to account page
                return false;
            }
        };


        if($routeParams.newConversation) {
            $scope.newConversation();
            accountService.getAccountFromCache($routeParams.newConversation, function(data) {
                $scope.addRecipient(data.Account);
            }, function(data) {
                // Failure
                commService.showErrorAlert(data);
            });
        }


    }]);