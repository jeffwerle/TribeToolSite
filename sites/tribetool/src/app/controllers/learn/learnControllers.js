angular.module('app.Controllers')
    .controller('learnController', ['$scope', 'communityService', 'billingService', 'accountService', 'navigationService', function($scope, communityService, billingService, accountService, navigationService) {



        // The SpecializationEntry collection to which the current account is
        // subscribed (if any)
        $scope.specializationSubscriptions = [];

        // If true, we will show the account's specialization dashboard
        // If false, we will show marketing for signing up for lessons
        $scope.showDashboard = false;

        if(accountService.isLoggedIn()) {
            var subscriptions = accountService.account.Billing ? accountService.account.Billing.Subscriptions : null;
            // Get the specializations to which the account is subscribed
            var communityHasLearnModule = communityService.community && communityService.community.HasLearnModule;
            var subscribedCommunitySpecialization = null;
            if(subscriptions) {
                var i = 0;
                for(i = 0; i < subscriptions.length; i++) {
                    var subscription = subscriptions[i];
                    if(subscription.Status === 'Active' && subscription.LessonSubscription &&
                        subscription.LessonSubscription.SpecializationEntry) {
                        $scope.specializationSubscriptions.push(subscription.LessonSubscription.SpecializationEntry);
                    }
                }

                // Is the account subscribed to any of this community's specializations?
                if(communityHasLearnModule && communityService.community.Specializations) {
                    for(i = 0; i < $scope.specializationSubscriptions.length; i++) {
                        for(var j = 0; j < communityService.community.Specializations.length; i++) {
                            if($scope.specializationSubscriptions[i].Id === communityService.community.Specializations[j]) {
                                // The user is actively subscribed to one of the community's specializations. Therefore,
                                // the user accessed the learn page from a community that relates to their specializations
                                // which means they most likely want to see their specializations (not marketing). Therefore, go
                                // to the learning dashboard.
                                subscribedCommunitySpecialization = $scope.specializationSubscriptions[i];
                                break;
                            }
                        }
                    }
                }
            }

            if(communityHasLearnModule &&
                !subscribedCommunitySpecialization) {
                // Go to community-specific marketing page
                navigationService.goToPath('/learn/' + communityService.community.Url, {
                    replaceHistory: true
                });
            }
            else {
                if($scope.specializationSubscriptions &&
                    $scope.specializationSubscriptions.length > 0) {
                    // Go to the dashboard page
                    $scope.showDashboard = true;

                    if(subscribedCommunitySpecialization) {
                        // Go to the dashboard for the "subscribedCommunitySpecialization"
                        // specialization
                        navigationService.goToSpecialization(subscribedCommunitySpecialization, {
                            replaceHistory: true
                        });
                    }
                    else if($scope.specializationSubscriptions.length === 1) {
                        navigationService.goToSpecialization($scope.specializationSubscriptions[0], {
                            replaceHistory: true
                        });
                    }
                }
                else {
                    // Go to the general marketing page
                    $scope.showDashboard = false;
                }
            }
        }

    }])
    .controller('specializationController', ['$scope', 'accountService', '$routeParams', 'specializationService', 'navigationService', 'commService', 'communityService', function($scope, accountService, $routeParams, specializationService, navigationService, commService, communityService) {
        $scope.processing = true;
        $scope.showDashboard = false;
        $scope.specializationEntry = null;
        $scope.community = communityService.community;

        var disciplineUrl = $routeParams.discipline;
        var specializationUrl = $routeParams.specializationName;
        if(accountService.isLoggedIn()) {

            // Is the user subscribed to this specialization? If not, we'll be marketing this specialization
            // rather than allowing dashboard-interaction
            var subscriptions = accountService.account.Billing ? accountService.account.Billing.Subscriptions : null;
            if(subscriptions) {
                for(var i = 0; i < subscriptions.length; i++) {
                    var subscription = subscriptions[i];
                    if(subscription.Status === 'Active' &&
                        subscription.LessonSubscription &&
                        subscription.LessonSubscription.SpecializationEntry) {

                        var specialization = subscription.LessonSubscription.SpecializationEntry;
                        if(specialization.DisciplineUrl.toLowerCase().indexOf(disciplineUrl.toLowerCase()) === 0 &&
                            specialization.SpecializationUrl.toLowerCase().indexOf(specializationUrl.toLowerCase()) === 0) {
                            // The user is subscribed to this specialization
                            $scope.showDashboard = true;
                            $scope.specializationEntry = specialization;
                        }
                    }
                }
            }
        }


        specializationService.getSpecialization(disciplineUrl, specializationUrl, function(data) {
            // Success
            $scope.specializationEntry = data.Specialization;
            $scope.processing = false;

            var community = null;
            if(!$scope.showDashboard) {

                // Go to the community learn page for the community that markets
                // the specialization
                if($scope.specializationEntry.MarketingCommunities &&
                    $scope.specializationEntry.MarketingCommunities.length > 0) {
                    community = $scope.specializationEntry.MarketingCommunities[0];
                    navigationService.goToPath('/learn/' + community.Url);
                    return;
                }
                else {
                    // If we don't have a community that markets this specialization then we will have
                    // to market it generally
                }
            }
            else {
                // Get the community for the specialization
                $scope.specializationCommunity = null;
                for(var communityUrl in communityService.communities) {
                    community = communityService.communities[communityUrl].community;
                    if(community.Id === $scope.specializationEntry.CommunityId) {
                        $scope.specializationCommunity = community;
                        break;
                    }
                }



                // Get the full SpecializationEntry along with its SkillTree
                // Additionally, get the applicable AccountSpecialization
                $scope.accountSpecialization = data.AccountSpecialization;

                // Get the unlocked steps
                $scope.unlockedSteps = [];
                var steps = $scope.specializationEntry.SkillTree.Steps;
                for(var i = 0; i < steps.length; i++) {
                    var step = steps[i];
                    if(!step.StepProgress.IsComplete && step.StepProgress.IsUnlocked) {
                        $scope.unlockedSteps.push(step);
                    }
                }

            }

        }, function(data) {
            // Failure
            $scope.processing = false;
            commService.showErrorAlert(data);
            navigationService.goToPath('/learn');
        });

        $scope.goToSpecializationCommunity = function() {
            navigationService.goToCommunity($scope.specializationCommunity.Url);
        };


    }]);