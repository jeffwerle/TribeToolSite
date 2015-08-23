angular.module('app.Services')
    .factory('messageService', ['$rootScope', 'commService', 'accountService', 'communityService', '$socket', 'navigationService', function($rootScope, commService, accountService, communityService, $socket, navigationService) {
        return {
            initialize: function() {
                var my  = this;
                $socket.on('conversationMessageReceived', function(arg) {
                    var data = arg.data;
                    my.triggerEvent('conversationMessageReceived', {
                            messageReceipt: data.MessageReceipt,
                            message: data.Message
                        });
                });
            },
            /*
                [
                    {
                         conversationRead: function(),
                         conversationMessageReceived: function({ messageReceipt, message })
                    }
                ]
             */
            callbacks: [],
            triggerEvent: function(eventName, data) {
                for(var i = 0; i < this.callbacks.length; i++) {
                    if(this.callbacks[i][eventName])
                        this.callbacks[i][eventName](data);
                }
            },
            removeCallback: function(callbackObject) {
                var i = this.callbacks.indexOf(callbackObject);
                if(i >= 0) {
                    this.callbacks.splice(i, 1);
                }
            },
            triggerConversationRead: function() {
                this.triggerEvent('conversationRead');
            },
            getUnreadMessageCount: function(onSuccess, onFailure) {
                commService.postWithParams('message', {
                    Credentials: accountService.getCredentials(communityService.community),
                    RequestType: 'GetUnreadMessageCount'
                }, onSuccess, onFailure);
            },
            getConversations: function(onSuccess, onFailure) {
                commService.postWithParams('message', {
                    Credentials: accountService.getCredentials(communityService.community),
                    RequestType: 'GetConversations'
                }, onSuccess, onFailure);
            },
            createConversation: function(conversation, onSuccess, onFailure) {
                commService.postWithParams('message', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Conversation: conversation,
                    RequestType: 'CreateConversation'
                }, onSuccess, onFailure);
            },
            markConversationRead: function(conversation, onSuccess, onFailure) {
                commService.postWithParams('message', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Conversation: conversation,
                    RequestType: 'MarkConversationRead'
                }, onSuccess, onFailure);
            },
            createMessage: function(conversation, message, onSuccess, onFailure) {
                navigationService.registerEvent('Message', 'Create Message', message.FormattedText);

                commService.postWithParams('message', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Conversation: {
                        Id: conversation.Id
                    },
                    Message: message,
                    RequestType: 'CreateMessage'
                }, onSuccess, onFailure);
            },
            getMessageUrl: function(conversation, message) {
                return '/messages?conversation=' + conversation.Id + '&message=' + message.Id;
            }
        };
    }]);