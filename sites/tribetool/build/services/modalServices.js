angular.module('app.Services')
    .factory('modalService', ['$modal', '$modalStack', '$window', function($modal, $modalStack, $window) {
        return {
            closeAll: function() {
                $modalStack.dismissAll();
            },
            close: function(modalInstance) {
                $modalStack.close(modalInstance);
            },
            isOpen: function() {
                var topModal = $modalStack.getTop();
                if(topModal && topModal.key) {
                    return true;
                }

                return false;
            },
            open: function(options, onSuccess, onDismissed, onFinally) {
                var modalInstance = $modal.open(options);

                modalInstance.result['finally'](function() {
                    if(onFinally)
                        onFinally();
                });
                modalInstance.result.then(function (data) {
                    // Modal OK
                    if(onSuccess)
                        onSuccess(data);
                }, function (data) {
                    // Modal dismissed
                    if(onDismissed)
                        onDismissed(data);
                });

                return modalInstance;
            },
            confirmDelete: function(title, message, callback) {
                bootbox.dialog({
                    message: message,
                    title: title,
                    onEscape: function() {},
                    show: true,
                    backdrop: true,
                    closeButton: true,
                    animate: true,
                    //className: "my-modal",
                    buttons: {

                        cancel: {
                            label: "Cancel",
                            callback: function() { callback(false);}
                        },
                        success: {
                            label: "Delete",
                            className: "btn-danger",
                            callback: function() {
                                callback(true);
                            }
                        }
                    }
                });
            },
            /* http://bootboxjs.com/#download */
            confirm: function(message, callback) {
                return $window.bootbox.confirm(message, callback);
            },
            /* Example callback:
                function(result) {
                     if (result === null) {
                        Example.show("Prompt dismissed");
                     } else {
                        Example.show("Hi <b>"+result+"</b>");
                     }
                }
             */
            prompt: function(message, callback) {
                return $window.bootbox.prompt(message, callback);
            },
            alert: function(message, callback) {
                return $window.bootbox.alert(message, callback);
            }

        };
    }]);