angular.module('app.Controllers')
    .controller('billingController', ['$scope', '$modalInstance', 'items', 'accountService',
        function($scope, $modalInstance, items, accountService) {

            $scope.billingOptions = items[0];

            // Have any specializations been provided? If so, we're signing up for that
            // specialization (if the user doesn't already have it).
            if($scope.billingOptions.specialization) {

            }

            //models
            $scope.account = accountService.account;
            $scope.payment = {
                paymentId: null,
                paymentInstrumentId: null,
                referenceNumber: null,
                amount: null,
                status: null,
                scheduledDate: null,
                remittanceDate: null
            };
            $scope.paymentCard = {
                name: null,
                number: null,
                cvc: null,
                exp_month: null,
                exp_year: null,
            };

            //billing setup workflow progress
            $scope.progress = {
                step: 'ProductSelection'
            };

            //meta data
            var lessonsPerPack = 4;

            var features = [
                { label:'Personal Lessons' },
                { label:'Recorded Videos of Lessons' },
                { label:'Online Instructional Videos' },
                { label:'Online Playalongs' },
                { label:'Exclusive Community Access' },
                { label:'Written Instructor Feedback' },
                { label:'Certified Instructors' },
                { label:'Skill Tree' },
            ];
            $scope.products = [
                { label:'30 Minute Lesson', type:2, price:'$40 / lesson', value: (40.00 * lessonsPerPack), features: features},
                { label:'45 Minute Lesson', type:3, price:'$55 / lesson', value: (55.00 * lessonsPerPack), selected:true,  features: features},
                { label:'60 Minute Lesson', type:4, price:'$65 / lesson', value: (65.00 * lessonsPerPack), features: features}
            ];

            //deep account load
            $scope.setup = true;
            /*
            Account.get({accountId:$scope.account.accountId}, function(response) {
                if (response && response.success && response.data) {
                    $scope.account.init(response.data);

                    //setup billing?
                    if ($scope.account.accountType == 0 || $scope.account.accountType == 1) {
                        $scope.setup = true;
                    } else {
                        $scope.setup = false;
                    }
                }
            });
            */


            //methods
            $scope.chooseProduct = function(product) {
                $scope.account.accountType = (product !== null) ? product.type : 1;
                $scope.payment.amount = product.value;

                $scope.progress.step = 'PaymentMethod';
            };

            $scope.choosePaymentMethod = function(payment) {
                $scope.progress.step = 'Confirmation';
            };

            $scope.close = function() {
                $modalInstance.dismiss();
            };

        }])
    .controller('manageSubscriptionsController', ['$scope',
        function($scope) {

        }])
    .controller('paymentOptionsController', ['$scope',
        function($scope) {

            $scope.meta = {
                months: [
                    { name: 'January', label: '01', value: 1 },
                    { name: 'February', label: '02', value: 2 },
                    { name: 'March', label: '03', value: 3 },
                    { name: 'April', label: '04', value: 4 },
                    { name: 'May', label: '05', value: 5 },
                    { name: 'June', label: '06', value: 6 },
                    { name: 'July', label: '07', value: 7 },
                    { name: 'August', label: '08', value: 8 },
                    { name: 'September', label: '09', value: 9 },
                    { name: 'October', label: '10', value: 10 },
                    { name: 'November', label: '11', value: 11 },
                    { name: 'December', label: '12', value: 12 }
                ],
                years: function() {

                    var years = [], current = new Date().getFullYear();
                    for (var i = current; i <= (current + 20); i++) {
                        years.push({
                            label: i.toString(),
                            value: i
                        });
                    }

                    return years;
                }()
            };

            //dropdowns
            $scope.dropdowns = {
                month: {
                    isOpen: false
                },
                year: {
                    isOpen: false
                }
            };

            //form actions
            $scope.submitting = {
                card: false,
                payment: false
            };


            //methods



            $scope.checkout = function(status, response) {

                var $form = $('#stripeForm');

                // Disable the submit button to prevent repeated clicks
                $form.find('button').prop('disabled', true);

                Stripe.card.createToken({
                    number: $scope.cardNumber,
                    cvc: $scope.cvc,
                    exp_month: $scope.expMonth,
                    exp_year: $scope.expYear
                }, function(status, response) {

                    if (response.error) {
                        // Show the errors on the form
                        $form.find('.payment-errors').text(response.error.message);
                        $form.find('button').prop('disabled', false);
                    } else {
                        // response contains id and card, which contains additional card details
                        var token = response.id;
                        // Insert the token into the form so it gets submitted to the server
                        $form.append($('<input type="hidden" name="stripeToken" />').val(token));
                        // and submit
                        $form.get(0).submit();



                        // payment instrument
                        var instrument = {
                            paymentInstrumentType: 1,
                            cardMask: paymentCard.number.substr(paymentCard.number.length - 4),
                            cardExp: paymentCard.exp_month + '/' + paymentCard.exp_year,
                            cardBrand: response.card.brand,
                            fingerprint: response.card.fingerprint,
                            token: response.id
                        };

                        Billing.registerPaymentInstrument({
                            billingProfileId: $scope.account.BillingProfile.billingProfileId,
                            instrument: instrument.toJSON()
                        }, function(response) {
                            if (response && response.success) {
                                $scope.account.BillingProfile.PaymentInstruments.push(instrument);
                                $scope.payment.paymentInstrumentId = response.data.paymentInstrumentId;
                            } else {
                                if (response.message) {
                                    Messaging.flashInline(response.message);
                                } else {
                                    Messaging.flashInline('There was a problem adding your payment card, please try again shortly.');
                                }
                            }
                        });
                    }
                });

                var k = 3;
            };


            $scope.addCard = function(paymentCard) {

                $scope.submitting.card = true;

                var form = angular.element(document.querySelector('#addPaymentCardForm'));

                Stripe.createToken(form, function(status, response) {
                    $scope.$apply(function() {
                        if (status === 200) {

                            // payment instrument
                            var instrument = {
                                paymentInstrumentType: 1,
                                cardMask: paymentCard.number.substr(paymentCard.number.length - 4),
                                cardExp: paymentCard.exp_month + '/' + paymentCard.exp_year,
                                cardBrand: response.card.brand,
                                fingerprint: response.card.fingerprint,
                                token: response.id
                            };

                            Billing.registerPaymentInstrument({
                                billingProfileId: $scope.account.BillingProfile.billingProfileId,
                                instrument: instrument.toJSON()
                            }, function(response) {
                                if (response && response.success) {
                                    $scope.account.BillingProfile.PaymentInstruments.push(instrument);
                                    $scope.payment.paymentInstrumentId = response.data.paymentInstrumentId;
                                } else {
                                    if (response.message) {
                                        Messaging.flashInline(response.message);
                                    } else {
                                        Messaging.flashInline('There was a problem adding your payment card, please try again shortly.');
                                    }
                                }
                            });

                            $scope.paymentCard = {
                                name: null,
                                number: null,
                                cvc: null,
                                exp_month: null,
                                exp_year: null,
                            };

                        } else {

                        }

                        $scope.submitting.card = false;
                    });
                });
            };


        }])
    .controller('billingConfirmationController', ['$scope',
        function($scope) {

            $scope.account = $scope.$parent.account;
            $scope.payment = $scope.$parent.payment;

            $scope.instrument = $scope.account.BillingProfile.getPaymentInstrument($scope.payment.paymentInstrumentId);

        }]);