angular.module('app.Controllers')
    .controller('accountListController', ['$scope', 'commService', '$modalInstance', 'items', 'accountService', 'communityService', '$timeout', 'modalService', 'navigationService', function($scope, commService, $modalInstance, items, accountService, communityService, $timeout, modalService, navigationService) {



        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.options = items[0];


        $scope.type = $scope.options.type; // 'EmotionVote' or 'Vote'
        $scope.isEmotionVote = !$scope.type || $scope.type === 'EmotionVote';

        $scope.emotionVotes = $scope.options.votable.EmotionVotes;
        $scope.votes = $scope.options.votable.Votes;


        $scope.goToAccount = function(account) {
            var url = navigationService.getProfileUrl(account, communityService.community);
            modalService.closeAll();
            navigationService.goToPath(url);
        };

        $scope.accountIds = [];
        var i = 0;
        if($scope.isEmotionVote) {
            for(i = 0; i < $scope.emotionVotes.length; i++) {
                var emotionVote = $scope.emotionVotes[i];
                $scope.accountIds.push(emotionVote.AccountId);
            }
        }
        else {
            for(i = 0; i < $scope.votes.length; i++) {
                var vote = $scope.votes[i];
                $scope.accountIds.push(vote.AccountId);
            }
        }


        var countToLoadFromCache = 4;
        $scope.accountsCache = [];
        $scope.scrollingDone = false;
        $scope.getMoreItems = function() {
            if($scope.loadingAccounts || $scope.scrollingDone) {
                return;
            }

            $scope.loadingAccounts = true;
            // Timeout so we can give the loading gif time to render
            $timeout(function() {

                // Retrieve the items from the cache
                var cacheLength = $scope.accountsCache.length;
                for(var i = 0; i < cacheLength && i < countToLoadFromCache; i++) {
                    var account = $scope.accountsCache.shift();
                    $scope.accounts.push(account);
                }
                if($scope.accountsCache.length <= 0) {
                    $scope.loadingAccounts = false;
                    $scope.scrollingDone = true;
                }
                else {
                    $timeout(function() {
                        $scope.loadingAccounts = false;
                    });
                }
            });
        };

        // Get the accounts
        $scope.loadingAccounts = true;
        $scope.type = 'None';
        accountService.getAccountList($scope.accountIds, communityService.community,
            function(data) {
                // Success
                $scope.accounts = data.Accounts;
                $scope.loadingAccounts = false;

                var account, emotionVote, vote;
                var j = 0, i = 0;
                if($scope.isEmotionVote) {
                    for(i = 0; i < $scope.emotionVotes.length; i++) {
                        emotionVote = $scope.emotionVotes[i];

                        // Find the corresponding account
                        for(j = 0; j < $scope.accounts.length; j++) {
                            account = $scope.accounts[j];

                            if(account.Id === emotionVote.AccountId) {
                                account.emotionVote = emotionVote;

                                account.emotionTypeLowerCase = emotionVote.EmotionType.toLowerCase();

                                break;
                            }
                        }
                    }
                }
                else {
                    for(i = 0; i < $scope.votes.length; i++) {
                        vote = $scope.votes[i];

                        // Find the corresponding account
                        for(j = 0; j < $scope.accounts.length; j++) {
                            account = $scope.accounts[j];

                            if(account.Id === vote.AccountId) {
                                account.vote = vote;

                                account.voteIconClass = vote.VoteType === 'UpVote' ? 'ion-heart vote-up-img' : 'ion-heart-broken vote-down-img';

                                break;
                            }
                        }
                    }
                }



                $scope.getMoreItems();
            }, function(data) {
                // failure
                $scope.loadingAccounts = false;
                commService.showErrorAlert(data);
                $scope.cancel();
            });



        /*
        $scope.accountIds = [];
        for(var i = 0; i < $scope.options.accountVotes.length; i++) {
            var accountVote = $scope.options.accountVotes[i];
            $scope.accountIds.push(accountVote.AccountId);
        }


        var countToLoadFromCache = 4;
        $scope.accountsCache = [];
        $scope.scrollingDone = false;
        $scope.getMoreItems = function() {
            if($scope.loadingAccounts || $scope.scrollingDone) {
                return;
            }

            $scope.loadingAccounts = true;
            // Timeout so we can give the loading gif time to render
            $timeout(function() {

                // Retrieve the items from the cache
                var cacheLength = $scope.accountsCache.length;
                for(var i = 0; i < cacheLength && i < countToLoadFromCache; i++) {
                    var account = $scope.accountsCache.shift();
                    // Where do we put the account?
                    if($scope.type === 'Vote') {
                        if(account.accountVote.VoteType === 'UpVote') {
                            $scope.upVoteAccounts.push(account);
                        }
                        else {
                            $scope.downVoteAccounts.push(account);
                        }
                    }
                    else if($scope.type === 'Emotion') {
                        $scope.accounts.push(account);
                    }
                }
                if($scope.accountsCache.length <= 0) {
                    $scope.loadingAccounts = false;
                    $scope.scrollingDone = true;
                }
                else {
                    $timeout(function() {
                        $scope.loadingAccounts = false;
                    });
                }
            });
        };

        // Get the accounts
        $scope.loadingAccounts = true;
        $scope.type = 'None';
        accountService.getAccountList($scope.accountIds, communityService.community,
            function(data) {
                $scope.perfectScrollbarElement = $('#accountListPerfectScrollbar');
                // Success
                $scope.accounts = data.Accounts;
                $scope.loadingAccounts = false;

                var account, accountVote;
                var j = 0;
                for(var i = 0; i < $scope.options.accountVotes.length; i++) {
                    accountVote = $scope.options.accountVotes[i];

                    // Find the corresponding account
                    for(j = 0; j < $scope.accounts.length; j++) {
                        account = $scope.accounts[j];

                        if(account.Id === accountVote.AccountId) {
                            account.accountVote = accountVote;
                            break;
                        }
                    }
                }

                if($scope.options.accountVotes.length > 0 &&
                    angular.isDefined($scope.options.accountVotes[0].VoteType)) {
                    $scope.type = 'Vote';
                    $scope.upVoteAccounts = [];
                    $scope.downVoteAccounts = [];

                    // Add the up votes first
                    for(j = 0; j < $scope.accounts.length; j++) {
                        if($scope.accounts[j].accountVote.VoteType === 'UpVote')
                            $scope.accountsCache.push($scope.accounts[j]);
                    }
                    // now the down votes
                    for(j = 0; j < $scope.accounts.length; j++) {
                        if($scope.accounts[j].accountVote.VoteType === 'DownVote')
                            $scope.accountsCache.push($scope.accounts[j]);
                    }
                }
                else {
                    $scope.type = 'Emotion';
                    $scope.emotionType = $scope.options.emotionType;
                    var emotionTypeLowerCase = $scope.emotionType.toLowerCase();
                    $scope.emotionImageClass = 'emotion-' + emotionTypeLowerCase;
                    $scope.emotionColor = 'emotion-' + emotionTypeLowerCase + '-border-color';
                }

                $scope.getMoreItems();
            }, function(data) {
               // failure
               $scope.loadingAccounts = false;
               commService.showErrorAlert(data);
               $scope.cancel();
            });

*/
    }]);