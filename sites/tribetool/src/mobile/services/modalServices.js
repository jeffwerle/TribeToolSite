angular.module('app.Services')
    .factory('modalService', ['$rootScope', '$ionicModal', function($rootScope, $ionicModal) {


        var service = {
            /*
                {
                    modal: ionicModal // http://ionicframework.com/docs/api/controller/ionicModal/#initialize
                    options: { }, // data provided by creator of the modal
                    onDismissed: function(),
                    onSuccess: function(),
                    onFinally: function()
                }
             */
            modals: [],
            getOpenModal: function() {
                if(this.modals.length <= 0) {
                    return null;
                }

                return this.modals[this.modals.length - 1];
            },
            closeAll: function(data, callback) {
                var self = this;
                var closeModal = function() {
                    if(self.modals.length > 0) {
                        var modalEntry = self.modals[0];
                        self.cancel(modalEntry, data, function() {
                            closeModal();
                        });
                    }
                    else {
                        if(callback) {
                            callback();
                        }
                    }
                };
                closeModal();
            },
            isOpen: function() {
                return this.modals.length > 0;
            },
            /* Closes the currently open modal as a success */
            ok: function(modalEntry, data, callback) {
                var self = this;
                modalEntry.modal.remove().then(function() {
                    if(modalEntry.onSuccess)
                        modalEntry.onSuccess(data);
                    if(modalEntry.onFinally)
                        modalEntry.onFinally(data);
                    self.removeModal();
                    if(callback) {
                        callback();
                    }
                });
            },
            /* Cancels the currently open modal */
            cancel: function(modalEntry, data, callback) {
                var self = this;
                modalEntry.modal.remove().then(function() {
                    if(modalEntry.onDismissed)
                        modalEntry.onDismissed(data);
                    if(modalEntry.onFinally)
                        modalEntry.onFinally(data);
                    self.removeModal(modalEntry);
                    if(callback) {
                        callback();
                    }
                });
            },
            removeModal: function(modalEntry) {
                var index = this.modals.indexOf(modalEntry);
                if(index >= 0)
                    this.modals.splice(index, 1);
            },
            open: function(options, onSuccess, onDismissed, onFinally) {
                var modalEntryOptions = options.resolve.items()[0];
                var modalEntry = {
                    onSuccess: onSuccess,
                    onDismissed: onDismissed,
                    onFinally: onFinally,
                    options: modalEntryOptions
                };
                this.modals.push(modalEntry);

                // See http://ionicframework.com/docs/api/controller/ionicModal/#initialize
                $ionicModal.fromTemplateUrl(options.templateUrl, {
                    //scope: options.scope,
                    animation: 'slide-in-up'
                }).then(function(modalInstance) {
                    modalEntry.modal = modalInstance;
                    modalInstance.show();
                });


            }
        };


        return service;
    }]);