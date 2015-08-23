angular.module('app.Services')
    .factory('voteService', ['$rootScope', 'commService', 'accountService', 'communityService', 'navigationService', function($rootScope, commService, accountService, communityService, navigationService) {
        return {
            vote: function(voteEntry, onSuccess, onFailure) {
                navigationService.registerEvent('Vote', voteEntry.VoteType, voteEntry.VoteActionType);

                if(!voteEntry.AccountId) {
                    voteEntry.AccountId = accountService.account.Id;
                }
                commService.postWithParams('vote', {
                    Vote: voteEntry,
                    Credentials: accountService.getCredentials(communityService.community)
                }, onSuccess, onFailure);
            },
            emotionVote: function(emotionVoteEntry, onSuccess, onFailure) {

                if(!emotionVoteEntry.AccountId) {
                    emotionVoteEntry.AccountId = accountService.account.Id;
                }
                commService.postWithParams('vote', {
                    EmotionVote: emotionVoteEntry,
                    Credentials: accountService.getCredentials(communityService.community)
                }, onSuccess, onFailure);


                navigationService.registerEvent('EmotionVote', emotionVoteEntry.EmotionType, emotionVoteEntry.EmotionType);
            }
        };
    }]);