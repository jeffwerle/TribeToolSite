var directiveServices = angular.module('app.DirectiveServices', []);
/*
directiveServices
    .factory('modalService', ['$rootScope', '$timeout', function($rootScope, $timeout) {
        return {
            onNewModalEvent: function(modalOptions, event, data) {

                modalOptions.startTime = new Date();
                modalOptions.hasAnswered = false;

                if(angular.isDefined(data.title)) {
                    modalOptions.modalTitle = data.title;
                }

                if(angular.isDefined(data.message)) {
                    modalOptions.modalMessage = data.message;
                }

                if(angular.isDefined(data.messageType)) {
                    modalOptions.messageType = data.messageType;
                    modalOptions.isError = modalOptions.messageType === 'error';
                }
                if(data.onCompleted)
                    modalOptions.onCompleted = data.onCompleted;


            }
        };
    }]);
    */