angular.module('dmusiclibrary.Directives')
    .directive("dmusiclibraryQuestionAnswerWizard", ["$rootScope", '$compile', function($rootScope, $compile) {
        var link = function(scope, element, attrs, ctrls) {
            var timer,
                $window = $(window),
                firstQWasShown = false,
                $allQaContainer = getAllQaContainer(),
                $questionContainer = getQuestionContainer(),
                $questionAnimatedContainer = getAnimatedQuestionContainer(),
                $postQuestionContainer = getPostQuestionContainer();

            scope.speed = angular.isNumber(scope.speed) ? scope.speed : 300;
            scope.currentQ = null;
            scope.animating = false;
            scope.show = true;

            if(scope.postQuestionHtml) {
                var compiled = $compile(scope.postQuestionHtml);
                var postQuestionHtmlCompiled = compiled(scope);
                $postQuestionContainer.html('');
                $postQuestionContainer.append(postQuestionHtmlCompiled);
            }

            // Add a class to the body indicating that this directive is being
            // used so that we may apply CSS to prevent horizontal scroll-bars
            // when animating questions past the window
            $("body").addClass("has-question-answer-wizard");

            // scope.qIndex controls the current question, so everyone should change
            // the question by changing that index
            scope.$watch(function() { return scope.qIndex; }, function(newVal, oldVal) {
                if (qIndexIsValid()) {
                    if (newVal >= oldVal) {
                        scope.next();
                    } else if (newVal < oldVal) {
                        scope.previous();
                    }
                }
            });

            function qIndexIsValid() {
                if (!scope.allQa || !scope.allQa.length || !angular.isNumber(scope.qIndex) ||
                    scope.qIndex < 0 || scope.qIndex > scope.allQa.length - 1) {
                    console.log("qIndex was not valid: " + scope.qIndex);

                    return false;
                }

                return true;
            }

            scope.executeCallback = function(index) {
                scope.currentQ.selected = index;

                if (scope.currentQ.callback && !angular.isFunction(scope.currentQ.callback)) {
                    console.log("The callback for the current question is not a function: ");
                    console.log(scope.currentQ);
                    return;
                }

                scope.currentQ.callback(index);
            };

            var onQuestionChanged = function() {
                if(scope.currentQ.onPresented) {
                    scope.currentQ.onPresented(scope.currentQ);
                }
            };

            scope.next = function() {
                var info = prepareAndGetAnimationInfo();

                animationBegin();

                if (firstQWasShown) {
                    //Current question leaves, next comes in
                    info.$questionAnimatedContainer.css("position", "absolute")
                        .animate({left: "-" + info.questionAnimatedContainerWidth + "px"}, scope.speed, function() {
                            $rootScope.$safeApply(function() {
                                scope.currentQ = scope.allQa[scope.qIndex];

                                info.$questionAnimatedContainer
                                    .css({ position: "absolute", left: info.winWidth })
                                    .animate({ left: info.finalAnimatedLeftVal }, scope.speed, animationCallback);

                                onQuestionChanged();
                            });
                        });
                } else {
                    // Update the question right away since it's the first question
                    scope.currentQ = scope.allQa[scope.qIndex];

                    info.$questionAnimatedContainer
                        .css({ position: "absolute", left: info.winWidth })
                        .animate({ left: info.finalAnimatedLeftVal }, scope.speed, animationCallback);

                    onQuestionChanged();
                }
            };

            scope.previous = function() {
                var info = prepareAndGetAnimationInfo();

                animationBegin();

                info.$questionAnimatedContainer.css("position", "absolute").animate({left: info.winWidth}, scope.speed, function() {
                    $rootScope.$safeApply(function() {
                        scope.currentQ = scope.allQa[scope.qIndex];

                        info.$questionAnimatedContainer
                            .css( { position: "absolute", left: "-" + info.questionAnimatedContainerWidth + "px" } )
                            .animate({ left: info.finalAnimatedLeftVal }, scope.speed, animationCallback);

                        onQuestionChanged();
                    });
                });
            };

            scope.incrementQIndex = function() {
                ++scope.qIndex;
            };

            scope.decrementQIndex = function() {
                --scope.qIndex;
            };

            function animationCallback() {
                firstQWasShown = true;

                fixQuestionContainerHeight();

                $rootScope.$safeApply(function() {
                    scope.animating = false;
                });
            }

            function animationBegin() {
                scope.animating = true;

                // Make sure the animation container is the same width as its container
                $questionAnimatedContainer.css("width", $questionContainer.width());
            }

            function prepareAndGetAnimationInfo() {
                var winWidth = $window.width(),
                    allQaContainerLeft = $allQaContainer.position().left,
                    finalAnimatedLeftVal = allQaContainerLeft + parseInt($questionContainer.css("margin-left"));

                return {
                    winWidth: winWidth,
                    allQaContainerLeft: allQaContainerLeft,
                    $questionContainer: $questionContainer,
                    $questionAnimatedContainer: $questionAnimatedContainer,
                    questionAnimatedContainerWidth: $questionAnimatedContainer.width(),
                    finalAnimatedLeftVal: finalAnimatedLeftVal
                };
            }

            function getPostQuestionContainer() {
                return element.find('.post-question-container');
            }

            function getAnimatedQuestionContainer() {
                return element.find('.question-animated-container');
            }

            function getQuestionContainer() {
                return element.find('.question-container');
            }

            function getAllQaContainer() {
                return element.find('.all-qa-container');
            }

            function fixQuestionContainerHeight() {
                var qContainer = getQuestionContainer(),
                    qContainerChildren = qContainer.children(),
                    height = 0;

                qContainerChildren.each(function() {
                    var $this = $(this);

                    height += $this.outerHeight();
                });

                qContainer.animate({ height : height}, scope.speed / 1.5);
            }

            function onResize(){
                animationBegin();

                var info = prepareAndGetAnimationInfo();

                info.$questionAnimatedContainer.animate({left: info.finalAnimatedLeftVal }, scope.speed / 1.5, function() {
                    animationCallback();
                });
            }

            // Track browser resizing so we only recalculate question positions on the last resize after X milliseconds

            $window.on("resize",function() {
                clearTimeout(timer);

                timer = setTimeout(onResize, 100);
            });
        };

        var template =  "<div ng-show='show' class='all-qa-container'>" +
            "<div class='question-container'>" +
            "<div class='question-animated-container answers num-{{currentQ.answers.length}}'>" +
            "<h3 class='question-text '>{{currentQ.question}}</h3>" +
            '<div class="post-question-container"></div>' +
            "<div ng-class='{ selected: currentQ.selected === {{$index}} }' class='answer-text num-{{$index+1}}' ng-click='executeCallback($index)' ng-repeat='a in currentQ.answers'>"  +
            "{{a}}" +
            "</div>" +
            "</div>" +
            "</div>" +
            "</div>" +
            "<div class='button-container' ng-show='showButtons'>" +
            "<button ng-disabled='!qIndex || animating' ng-show='show' class='btn btn-success prev-button' ng-click='decrementQIndex()'>Previous</button>" +
            "<button ng-disabled='qIndex===allQa.length-1 || animating' ng-show='show' class='btn btn-success next-button' ng-click='incrementQIndex()'>Next</button>" +
            "</div>";

        return {
            restrict: "AE",
            scope: {
                /*
                 [{
                 question: string,
                 selected: bool
                 }]
                 */
                allQa: "=allQa",
                qIndex: "=qIndex",
                showButtons: "=showButtons",
                speed: "=speed",

                // If not null, this html will be inserted after the question
                // "currentQ" can be used to refer to the current question object.
                postQuestionHtml: '='
            },
            link: link,
            template: template
        };
    }]);
		