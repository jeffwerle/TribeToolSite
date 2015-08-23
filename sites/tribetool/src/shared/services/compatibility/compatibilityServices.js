angular.module('app.Services')
    .factory('compatibilityService', ['$rootScope', 'commService', 'accountService', 'communityService', 'navigationService', function($rootScope, commService, accountService, communityService, navigationService) {
        return {
            /* state: {
                     answers: [] // array of AccountCompatibilityAnswers
                     communityId: ObjectId
                }
            */
            compatibilityQuizState: null,
            getCommunityCompatibility: function(onSuccess, onFailure) {
                if(communityService.community.CommunityCompatibility) {
                    if(onSuccess) {
                        onSuccess({
                            CommunityCompatibility: communityService.community.CommunityCompatibility
                        });
                        return;
                    }
                }

                commService.postWithParams('compatibility', {
                    Credentials: accountService.getCredentials(communityService.community),
                    RequestType: 'GetCommunityCompatibility'
                }, function(data) {
                    communityService.community.CommunityCompatibility = data.CommunityCompatibility;
                    if(onSuccess) {
                        onSuccess(data);
                    }

                }, onFailure);
            },
            getComparison: function(accountId, onSuccess, onFailure) {
                commService.postWithParams('compatibility', {
                    Credentials: accountService.getCredentials(communityService.community),
                    ComparisonAccountId: accountId,
                    RequestType: 'GetComparison'
                }, onSuccess, onFailure);
            },
            submitAnswer: function(answer, onSuccess, onFailure) {
                commService.postWithParams('compatibility', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Answer: answer,
                    RequestType: 'SubmitAnswer'
                }, onSuccess, onFailure);
            },
            removeAnswer: function(answer, onSuccess, onFailure) {
                navigationService.registerEvent('Compatibility', 'Remove Compatibility Answer', answer.Question);

                commService.postWithParams('compatibility', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Answer: answer,
                    RequestType: 'RemoveAnswer'
                }, onSuccess, onFailure);
            },
            getCompatibleAccounts: function(answers, options, onSuccess, onFailure) {
                commService.postWithParams('compatibility', {
                    Credentials: accountService.getCredentials(communityService.community),
                    Answers: answers,
                    GetCompatibileAccountsOptions: options,
                    RequestType: 'GetCompatibleAccounts'
                }, onSuccess, onFailure);
            },
            getTags: function(question) {
                var tagNames = [];
                if(question.Tags)
                    tagNames = tagNames.concat(question.Tags);
                for(var j = 0; j < question.Answers.length; j++) {
                    var answer = question.Answers[j];
                    if(answer.Tags && answer.Tags.length > 0 )
                        tagNames = tagNames.concat(answer.Tags);
                }
                return tagNames;
            }
        };
    }]);