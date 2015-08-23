angular.module('app.Controllers')
    .controller('accountListController', ['$scope', 'commService', 'accountService', 'communityService', '$timeout', 'modalService', 'navigationService', function($scope, commService, accountService, communityService, $timeout, modalService, navigationService) {


        $scope.modalEntry = modalService.getOpenModal();

        $scope.cancel = function () {
            modalService.cancel($scope.modalEntry);
        };

        $scope.options = $scope.modalEntry.options;
        $scope.emotionVotes = $scope.options.votable.EmotionVotes;


        $scope.goToAccount = function(account) {
            var url = navigationService.getProfileUrl(account, communityService.community);
            modalService.closeAll();
            navigationService.goToPath(url);
        };

        $scope.accountIds = [];
        for(var i = 0; i < $scope.emotionVotes.length; i++) {
            var emotionVote = $scope.emotionVotes[i];
            $scope.accountIds.push(emotionVote.AccountId);
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

                var account, emotionVote;
                var j = 0;
                for(var i = 0; i < $scope.emotionVotes.length; i++) {
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



                $scope.getMoreItems();
            }, function(data) {
                // failure
                $scope.loadingAccounts = false;
                commService.showErrorAlert(data);
                $scope.cancel();
            });

    }]);