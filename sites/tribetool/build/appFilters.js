angular.module('app.Filters', [])
    /* Used the same as the angularjs "date" filter except it now handles
     * formats like /Date(32729492498)/ */
    .filter('dateRobust', ['$filter', function ($filter) {
        return function (input, format, timezone) {
            if (typeof input === 'function') return '';

            var date = input instanceof Date ? input : new Date(parseInt(input.replace('/Date(', '')));




            if(format === 'shortIfNotToday') {
                if(date.toDateString() === new Date().toDateString()) {
                    // The given date is today
                    format = 'shortTime';
                }
                else {
                    format = 'short';
                }
            }
            else if(format === 'mediumIfNotToday') {
                if(date.toDateString() === new Date().toDateString()) {
                    // The given date is today
                    format = 'mediumTime';
                }
                else {
                    format = 'medium';
                }
            }

            if(!format || format === 'medium') {
                var now = new Date();

                if(date.toDateString() == now.toDateString()) {
                    return 'Today ' + $filter('date')(date, ' h:mm a', timezone);
                }
                else {
                    var yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);

                    if(date.toDateString() == yesterday.toDateString()) {
                        return 'Yesterday ' + $filter('date')(date, ' h:mm a', timezone);
                    }
                    else {
                        var y = date.getYear();
                        format = 'MMM d';

                        if(now.getYear() !== y) {
                            format += ', y';
                        }

                        format += ' h:mm a';
                    }
                }
            }

            return $filter('date')(date, format, timezone);
        };
    }])
    .filter('profileName', ['profileService', function (profileService) {
        return function (account) {
            if (typeof input === 'function') return '';

            return profileService.getProfileFullName(account);
        };
    }])
    .filter('profileNameList', ['profileService', function (profileService) {
        return function (accounts) {
            if (typeof input === 'function') return '';

            var accountNames = [];
            for(var i = 0; i < accounts.length; i++) {
                var account = accounts[i];
                accountNames.push(profileService.getProfileFullName(account));
            }
            return accountNames.join(", ");
        };
    }])
    .filter('profilePictureUrl', ['profileService', function (profileService) {
        return function (account) {
            if (typeof input === 'function') return '';

            return profileService.getCommentProfilePictureUrl(account.AccountCommunity, account);
        };
    }]);