angular.module('app.Services')
    .factory('validationDomModifier', [function () {
            var
                hasErrorClass = 'has-error',
                fieldErrorClass = 'field-error',

                reset = function (el) {
                    el.removeClass(hasErrorClass);
                    var nextElement = el.next();
                    if (nextElement !== undefined && nextElement.hasClass(fieldErrorClass)) {
                        nextElement.remove();
                    }
                },

                findParentLabel = function (el) {
                    var parent = el;
                    for (var i = 0; i <= 3; i += 1) {
                        if (parent !== undefined && parent[0].tagName === 'LABEL') {
                            break;
                        } else if (parent !== undefined) {
                            parent = parent.parent();
                        }
                    }

                    return parent;
                },

                makeValid = function (el) {
                    //reset(findParentLabel(el));
                    reset(el);
                },

                makeInvalid = function (el, errorMsg) {
                    var parent = el;// findParentLabel(el);
                    reset(parent);
                    parent.addClass(hasErrorClass);

                    var errorTextEl = angular.element('<div class="' + fieldErrorClass + '"><i class="icon ion-alert-circled error" style="min-width: 16px;"></i> ' + errorMsg + '</div>');
                    parent.after(errorTextEl);
                },

                makeDefault = function (el) {
                    //reset(findParentLabel(el));
                    reset(el);
                };

            return {
                makeValid: makeValid,
                makeInvalid: makeInvalid,
                makeDefault: makeDefault,
                key: 'validationDomModifier'
            };
        }]);