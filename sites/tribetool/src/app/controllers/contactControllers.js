angular.module('app.Controllers')
    .controller('contactController', ['$scope', 'contactService', 'communityService', function($scope, contactService, communityService) {
        $scope.community = communityService.community;
        $scope.communityEmailAddress = $scope.community && $scope.community.Options && $scope.community.Options.EmailAddress ? $scope.community.Options.EmailAddress : "Ross@TribeTool.com";
        $scope.communityName = $scope.community ? 'the ' + communityService.getNameWithoutThe() + ' community' : 'Tribe Tool';

        $scope.contactInfo = {
        };

        $scope.processingForm = false;
        $scope.emailSent = false;
        $scope.emailFailure = false;
        $scope.response = null;

        $scope.submit = function() {
            $scope.processingForm = true;
            contactService.sendEmail($scope.contactInfo.name, $scope.contactInfo.email, $scope.contactInfo.content,
                function(data) {
                    $scope.processingForm = false;
                    $scope.emailSent = true;

                    // Success
                },
                function(data) {
                    // Failure
                    $scope.processingForm = false;
                    $scope.emailFailure = true;
                    $scope.emailSent = false;
                    $scope.response = data;
                });
        };
    }]);