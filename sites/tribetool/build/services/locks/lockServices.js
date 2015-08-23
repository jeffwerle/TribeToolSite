angular.module('app.Services')
    .factory('lockService', ['$rootScope', 'commService', 'accountService', 'communityService', function($rootScope, commService, accountService, communityService) {
        return {
            minLevelEditLockTagPage: 3,
            minLevelEditLockMap: 6,
            hasLock: function(lock) {
                return !!lock && lock.LockType !== 'None';
            },
            /* Indicates whether the current account can bypass the given lock */
            canBypassLock: function(lock) {
                if(!communityService.hasWriteAccess()) {
                    return false;
                }

                if(!this.hasLock(lock)) {
                    return true;
                }

                if(angular.isDefined(lock.MinimumLevel) &&
                    lock.MinimumLevel !== null) {
                    // There is an XP lid, see if we can beat it
                    if(communityService.accountCommunity.Level.Level >= lock.MinimumLevel ||
                        communityService.isModerator()) {
                        // We made it!
                        return true;
                    }
                }

                return false;
            }
        };
    }]);