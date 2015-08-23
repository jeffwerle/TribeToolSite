angular.module('app.Directives')
    .directive('compatibilityQuiz', ['compatibilityService', 'commService', 'communityService', 'cookiesService', 'navigationService', '$timeout', 'accountService', 'marketingService', function(compatibilityService, commService, communityService, cookiesService, navigationService, $timeout, accountService, marketingService) {
        var socialHtml = '<div style="margin-top: 10px;">' +
                '<span style="margin-right: 10px;" fb-like="social.url"></span>' +
                '<span style="margin-right: 10px;" tweet="social.text" tweet-url="social.url"></span>' +
                '<span style="margin-right: 10px;" google-plus="social.url"></span>' +
            '</div>';
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<a id="compatibilityQuiz"></a>' +
                    '<loading-manager></loading-manager>' +

                    '<div ng-show="!processing">' +
                        '<div ng-if="question">' +
                            '<compatibility-question quiz="quiz" questions="questions" question="question" options="compatibilityQuestionOptions"></compatibility-question>' +
                        '</div>' +
                        '<div ng-if="accounts">' +
                            '<div class="bordered-white-well centered" ng-if="quiz && quizResult">' +
                                '<h2 style="margin-top: 0px;">{{quizResult.Result}}</h2>' +
                                '<div>{{score}} out of {{quiz.Questions.length}}</div>' +
                                '<div class="bold">{{quizResult.Description}}</div>' +
                                socialHtml +

                            '</div>' +
                            '<div class="bordered-white-well centered">' +
                                '<div class="bold green-text" style="margin-bottom: 10px;">We found these people to be your best {{topic}} matches:</div>' +
                                '<div style="overflow: hidden;">' +
                                    '<span ng-repeat="account in accounts">' +
                                        '<comment-picture options="accountPictureOptions" style="margin-right: 5px;" account="account" suppress-progress="true" show-only-picture="true"></comment-picture>' +
                                    '</span>' +
                                '</div>' +
                                '<div class="bold" style="padding-top: 10px;">Talk to them for free when you join now! <happy-face></happy-face></div>' +

                                '<div class="centered clear-both" style="padding-top: 20px;">' +
                                    '<social-login-buttons-vertical></social-login-buttons-vertical>' +
                                '</div>' +
                                '<div class="clear-both">' +
                                    '<a ng-click="signUp()" class="btn btn-call-to-action btn-lg">{{signUpButtonText}}</a>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                quizUrl: '='
            },
            link: function (scope, element, attrs) {
                marketingService.popup.suppress = true;
                scope.topic = communityService.community.Options.Topic;
                var buttonTexts = ['Join Now', 'Join Free'];
                scope.signUpButtonText = buttonTexts[Math.floor(Math.random()*buttonTexts.length)];

                scope.accountPictureOptions = {
                    constructLinkUrl: function(account, accountCommunity, votable) {
                        return '';
                    },
                    getCompatibility: function(account, accountCommunity) {
                        return accountCommunity.Compatibility.CompatibilityPercentage;
                    }
                };

                // The user wants to answer questions (and potentially change their previous
                // answers).
                scope.processing = true;
                compatibilityService.getCommunityCompatibility(function(data) {
                    // Success
                    scope.communityCompatibility = data.CommunityCompatibility;
                    scope.questions = [];
                    var maxQuestions = 5, i = 0, question = null;
                    var availableQuestions = [];
                    if(scope.quizUrl) {
                        // See if  we can find the quiz
                        for(i = 0; i < scope.communityCompatibility.Quizzes.length; i++) {
                            var quiz = scope.communityCompatibility.Quizzes[i];
                            if(quiz.Url.toLowerCase() === scope.quizUrl.toLowerCase()) {
                                // We found our quiz! Let's get the questions.
                                for(var j = 0; j < quiz.Questions.length; j++) {
                                    for(var k = 0; k < scope.communityCompatibility.Questions.length; k++) {
                                        question = scope.communityCompatibility.Questions[k];
                                        if(quiz.Questions[j] === question.Id) {
                                            availableQuestions.push(question);
                                            break;
                                        }
                                    }
                                }
                                scope.quiz = quiz;
                            }
                        }
                    }

                    if(availableQuestions.length <= 0) {
                        // Get the non-knowledge-based questions.
                        var nonKnowledgeQuestions = [];
                        for(i = 0; i < scope.communityCompatibility.Questions.length; i++) {
                            question = scope.communityCompatibility.Questions[i];
                            if(!question.CorrectAnswerId) {
                                nonKnowledgeQuestions.push(question);
                            }
                        }
                        availableQuestions = commService.shuffle(nonKnowledgeQuestions);
                    }

                    for(i = 0; i < availableQuestions.length && i < maxQuestions; i++) {
                        question = availableQuestions[i];
                        question.QuestionIndex = i;
                        scope.questions.push(question);

                    }
                    scope.question = scope.questions[0];

                    scope.processing = false;
                }, function(data) {
                    // Failure
                    commService.showErrorAlert(data);
                    scope.processing = false;
                });

                scope.answers = [];

                scope.onComplete = function() {
                    // all questions have been answered!

                    if(scope.quiz) {
                        // Score the quiz!
                        scope.score = 0;
                        var i = 0;
                        for(i = 0; i < scope.quiz.CorrectAnswers.length; i++) {
                            var correctAnswer = scope.quiz.CorrectAnswers[i];
                            for(var j = 0; j < scope.answers.length; j++) {
                                if(scope.answers[j].AnswerId === correctAnswer) {
                                    // Correct answer!
                                    scope.score++;
                                    break;
                                }
                            }
                        }

                        // Now assign the result
                        for(i = 0; i < scope.quiz.Results.length; i++) {
                            var result = scope.quiz.Results[i];
                            if(result.CorrectCount === scope.score) {
                                // This is the quiz result
                                scope.quizResult = result;
                            }
                        }

                        // Set the social info for the quiz
                        scope.social = {
                            text: 'I got ' + scope.score + ' out of ' + scope.quiz.Questions.length + ' in the "' + scope.quiz.Title + '"! Can you beat my score?',
                            url: navigationService.getCurrentFullUrl()
                        };
                    }
                    else {
                        scope.social = {
                            text: 'I found my best ' + scope.topic + ' matches on ' + communityService.community.Name + '! Who will yours be?',
                            url: navigationService.getCurrentFullUrl()
                        };
                    }


                    // Now let's get the users that the test-taker is compatible with.
                    scope.processing = true;
                    scope.loading.message = 'Please wait. We\'re calculating your compatibility...';
                    compatibilityService.getCompatibleAccounts(scope.answers, {
                        PreferAccountsWithProfilePictures: true
                    }, function(data) {
                        scope.processing = false;
                        // Success
                        var maxAccounts = 5;
                        scope.accounts = [];
                        for(var i = 0; i < data.Accounts.length && i < maxAccounts; i++) {
                            scope.accounts.push(data.Accounts[i]);
                        }
                        $timeout(function() {
                            navigationService.scrollToHash('compatibilityQuiz');
                        });

                    }, function(data) {
                        scope.processing = false;
                        commService.showErrorAlert(data);
                    });
                };
                scope.compatibilityQuestionOptions = {
                    hideTags: true,
                    hideNavigation: true,
                    editQuestionOnStart: false,
                    onNext: function() {
                        scope.loading.quick(function() {
                            // Go to the next question
                            var questionIndex = scope.questions.indexOf(scope.question);
                            if(questionIndex + 1 >= scope.questions.length) {
                                // We're done!
                                scope.onComplete();
                                scope.question = null;
                            }
                            else {
                                scope.question = scope.questions[questionIndex + 1];
                            }
                        });
                    },
                    onPrevious: function() {
                        scope.loading.quick(function() {
                            // Go to the previous question
                            var questionIndex = scope.questions.indexOf(scope.question);
                            if(questionIndex <= 0) {
                                scope.question = scope.questions[scope.questions.length - 1];
                            }
                            else {
                                scope.question = scope.questions[questionIndex - 1];
                            }
                        });
                    },
                    onSubmit: function(answer) {
                        scope.answers.push(answer);
                        navigationService.registerEvent('Compatibility', 'Submit Compatibility Answer (Anonymous)', scope.question.Question);
                        scope.loading.quick(function() {
                            // Save the answers in the cache and in cookies
                            var state = {
                                answers: scope.answers,
                                communityId: communityService.community.Id
                            };
                            cookiesService.setCompatibilityAnswersState(state);
                            compatibilityService.compatibilityQuizState = state;

                            // Move to the next question!
                            scope.compatibilityQuestionOptions.onNext();
                            $timeout(function() {
                                navigationService.scrollToHash('compatibilityQuiz');
                            });
                        });
                    }
                };

                scope.signUp = function() {
                    accountService.showSignupDialog(navigationService, marketingService, {
                        skipMarketingAction: true
                    });

                    $timeout(function() {
                        var data = [{
                            Key: 'Sign-Up Button Text',
                            Value: scope.signUpButtonText
                        }];
                        var i = 0;
                        if(scope.accounts) {
                            var accountNames = '';
                            for(i = 0; i < scope.accounts.length; i++) {
                                var account = scope.accounts[i];
                                accountNames += account.FirstName + ' ' + account.LastName+ ',';
                            }
                            data.push({
                                Key: 'Compatible Accounts',
                                Value: accountNames
                            });
                        }
                        if(scope.quiz) {
                            data.push({
                                Key: 'Quiz',
                                Value: scope.quiz.Title
                            });
                        }
                        if(scope.quizResult) {
                            data.push({
                                Key: 'QuizResult',
                                Value: scope.quizResult.Result
                            });
                        }
                        if(scope.questions) {
                            var questionsString = '';
                            for(i = 0; i < scope.questions.length; i++) {
                                var question = scope.questions[i];
                                questionsString += question.Question + '|';
                            }
                            data.push({
                                Key: 'Questions',
                                Value: questionsString
                            });
                        }
                        var marketingActionEntry = {
                            Action: 'CompatibilityQuizSignUpButtonClicked',
                            Data: data
                        };
                        marketingService.logMarketingAction(marketingActionEntry);
                    });

                };
            }
        };
    }])
    .directive('compatibilityQuestionnaire', ['compatibilityService', 'commService', 'communityService', '$routeParams', function(compatibilityService, commService, communityService, $routeParams) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-show="processing">' +
                        '<loading></loading> Loading Compatibility Questions...' +
                    '</div>' +
                    '<div ng-show="!processing">' +
                        '<div ng-if="question">' +
                            '<compatibility-question questions="questions" question="question" options="compatibilityQuestionOptions"></compatibility-question>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                /*
                    {
                        onSubmit: function(answer)
                    }
                 */
                options: '='
            },
            link: function (scope, element, attrs) {
                // The user wants to answer questions (and potentially change their previous
                // answers).
                scope.processing = true;
                compatibilityService.getCommunityCompatibility(function(data) {
                    // Success
                    scope.communityCompatibility = data.CommunityCompatibility;
                    scope.questions = scope.communityCompatibility.Questions;

                    // We now want to display questions for the user to answer
                    // So get the questions that have not yet been answered by the user
                    scope.unansweredQuestions = [];
                    scope.answeredQuestions = [];
                    if(communityService.accountCommunity && communityService.accountCommunity.CompatibilityAnswers) {
                        for(var i = 0; i < scope.questions.length; i++) {
                            var question = scope.questions[i];

                            if($routeParams.question && question.Id === $routeParams.question) {
                                scope.question = question;
                            }
                            var isAnswered = false;
                            for(var j = 0; j < communityService.accountCommunity.CompatibilityAnswers.length; j++) {
                                var answer = communityService.accountCommunity.CompatibilityAnswers[j];
                                if(answer.QuestionId === question.Id) {
                                    // Answered question
                                    isAnswered = true;
                                    break;
                                }
                            }
                            if(!isAnswered) {
                                scope.unansweredQuestions.push(question);
                            }
                            else {
                                scope.answeredQuestions.push(question);
                            }
                        }
                    }
                    else {
                        scope.unansweredQuestions = scope.questions;
                    }

                    if(!scope.question) {
                        if(scope.unansweredQuestions.length > 0) {
                            scope.question = scope.unansweredQuestions[0];
                        }
                        else {
                            scope.question = scope.answeredQuestions[0];
                        }
                    }

                    // We also want to give them the option to go back and re-answer questions


                    scope.processing = false;
                }, function(data) {
                    // Failure
                    commService.showErrorAlert(data);
                    scope.processing = false;
                });

                scope.goToUnansweredQuestion = function(questionIndex) {
                    if(questionIndex >= scope.unansweredQuestions.length) {
                        // All questions are answered--let the user review their answered questions
                        if(scope.answeredQuestions.length <= 0) {
                            // The user has not answered any questions--send them back to the first
                            // unanswered question.
                            scope.question = scope.unansweredQuestions[0];
                        }
                        else {
                            scope.question = scope.answeredQuestions[0];
                        }

                    }
                    else if(questionIndex < 0) {
                        if(scope.answeredQuestions.length <= 0) {
                            scope.question = scope.unansweredQuestions[scope.unansweredQuestions.length - 1];
                        }
                        else {
                            scope.question = scope.answeredQuestions[scope.answeredQuestions.length - 1];
                        }
                    }
                    else {
                        scope.question = scope.unansweredQuestions[questionIndex];
                    }
                };

                scope.goToAnsweredQuestion = function(questionIndex) {
                    if(questionIndex >= scope.answeredQuestions.length) {
                        // Send the user back to their unanswered questions
                        if(scope.unansweredQuestions.length <= 0) {
                            // There are no unanswered questions--go back to first answered question.
                            scope.question = scope.answeredQuestions[0];
                        }
                        else {
                            scope.question = scope.unansweredQuestions[0];
                        }
                    }
                    else if(questionIndex < 0) {
                        if(scope.unansweredQuestions.length <= 0) {
                            scope.question = scope.answeredQuestions[scope.answeredQuestions.length - 1];
                        }
                        else {
                            scope.question = scope.unansweredQuestions[scope.unansweredQuestions.length - 1];
                        }
                    }
                    else {
                        scope.question = scope.answeredQuestions[questionIndex];
                    }
                };

                scope.compatibilityQuestionOptions = {
                    editQuestionOnStart: !!$routeParams.question,
                    onSubmit: function(answer) {
                        if(scope.options && scope.options.onSubmit) {
                            scope.options.onSubmit(answer);
                        }
                    },
                    onNext: function() {
                        scope.compatibilityQuestionOptions.editQuestionOnStart = false;
                        // Go to the next question
                        var questionIndex = scope.unansweredQuestions.indexOf(scope.question);
                        if(questionIndex === -1) {
                            // The user is viewing answered questions
                            questionIndex = scope.answeredQuestions.indexOf(scope.question);
                            scope.goToAnsweredQuestion(questionIndex + 1);
                        }
                        else {
                            scope.goToUnansweredQuestion(questionIndex + 1);
                        }
                    },
                    onPrevious: function() {
                        scope.compatibilityQuestionOptions.editQuestionOnStart = false;
                        // Go to the previous question
                        var questionIndex = scope.unansweredQuestions.indexOf(scope.question);
                        if(questionIndex === -1) {
                            // The user is viewing answered questions
                            questionIndex = scope.answeredQuestions.indexOf(scope.question);
                            scope.goToAnsweredQuestion(questionIndex - 1);
                        }
                        else {
                            scope.goToUnansweredQuestion(questionIndex - 1);
                        }
                    }
                };
            }
        };
    }])
    .directive('compatibilityQuestion', ['profileService', 'compatibilityService', 'commService', 'communityService', 'navigationService', '$timeout', 'mediaService', 'accountService', 'homeService', function(profileService, compatibilityService, commService, communityService, navigationService, $timeout, mediaService, accountService, homeService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div class="compatibility-question-well">' +
                        '<div class="compatibility-question-number">{{question.QuestionIndex + 1}} of {{questions.length}}</div>' +
                        '<a id="compatibilityQuestionHash"></a>' +
                        '<div class="compatibility-question-content">' +

                            '<h2 class="centered compatibility-question-header">{{question.Question}}</h2>' +
                            '<tag-strip ng-if="!options.hideTags" tag-names="tagNames" class="compatibility-question-tag-strip"></tag-strip>' +

                            '<loading-manager></loading-manager>' +
                        '</div>' +

                        '<div ng-show="!processing" class="clear-both">' +
                            '<div ng-if="!form.isAnswering && chosenAnswer">' +

                                '<div class="compatibility-question-content">' +
                                    '<div ng-repeat="answer in question.Answers">' +
                                        '<div ng-class="{\'green-text bold\': answer.Id === chosenAnswer.AnswerId}">{{answer.Answer}}</div>' +
                                    '</div>' +

                                    '<div ng-show="chosenAnswer.Explanation" style="margin-top: 20px;">' +
                                        '<span class="bold">Your Explanation: </span> <div btf-markdown="chosenAnswer.Explanation"></div>' +
                                    '</div>' +
                                '</div>' +

                                '<div class="compatibility-question-control-area">' +
                                    '<button class="btn btn-warning" type="button" ng-click="previousQuestion()" style="margin-right: 10px;">Previous</button>' +
                                    '<button class="btn btn-warning" type="button" ng-click="nextQuestion()" style="margin-right: 20px;">Next</button>' +
                                    '<button class="btn btn-primary pull-right" type="button" ng-click="edit()">Edit</button>' +
                                '</div>' +
                            '</div>' +

                            '<div ng-if="form.isAnswering">' +
                                '<form name="questionForm" ng-submit="submit()">' +
                                    '<div class="form-group" style="margin-bottom: 0px;">' +
                                        '<div class="compatibility-question-content">' +

                                            '<div class="col-sm-12" ng-repeat="answerRow in answerRows">' +
                                                '<div ng-repeat="answer in answerRow">' +
                                                    '<div class="col-sm-6">' +
                                                        '<label style="cursor: pointer;" class="radio control-label">' +
                                                            '<input required type="radio" name="questionSelection" ng-model="form.answer" ng-value="answer"/>' +
                                                            '<span>{{answer.Answer}}</span>' +
                                                        '</label>' +
                                                    '</div>' +
                                                '</div>' +
                                            '</div>' +
                    /*
                                            '<div ng-repeat="answer in question.Answers">' +
                                                '<div class="col-sm-6">' +
                                                    '<label style="cursor: pointer;" class="radio control-label">' +
                                                        '<input required type="radio" name="questionSelection" ng-model="form.answer" ng-value="answer"/>' +
                                                        '<span>{{answer.Answer}}</span>' +
                                                    '</label>' +
                                                '</div>' +
                                            '</div>' +
                                            */

                                            '<div class="clearfix clear-both" style="margin-top: 10px;" ng-if="form.isLoggedIn" ng-show="form.answer">' +
                                                '<div class="bold" style="margin-top: 20px;">Do you have anything to say about your answer? Want to explain it in detail? (Optional)</div>' +
                                                '<content-editor is-required="false" show-toolbar="false" text="form.explanation" placeholder="\'Want to explain your answer?\'"></content-editor>' +
                                            '</div>' +
                                        '</div>' +

                                        '<div class="compatibility-question-control-area">' +
                                            '<button ng-if="!chosenAnswer" ng-hide="options.hideNavigation" class="btn btn-warning" type="button" ng-click="previousQuestion()" style="margin-right: 10px;">Previous</button>' +

                                            '<button ng-if="!chosenAnswer" ng-hide="options.hideNavigation" class="btn btn-warning" type="button" ng-click="nextQuestion()" style="margin-right: 20px;">Skip</button>' +

                                            '<button ng-if="chosenAnswer" class="btn btn-warning" type="button" ng-click="form.isAnswering=false" style="x; margin-right: 20px;">Cancel</button>' +
                                            '<button class="btn btn-primary pull-right" type="submit" style="margin-right: 10px;">Submit</button>' +

                                            '<button ng-if="chosenAnswer" class="btn btn-danger pull-right" type="button" ng-click="removeAnswer()" style="margin-right: 20px;">Remove Answer</button>' +
                                        '</div>' +

                                    '</div>' +
                                    '<div class="clearfix"></div>' +
                                '</form>' +
                            '</div>' +
                        '</div>' +

                    '</div>' +
                '</div>',
            scope: {
                question: '=',
                questions: '=',
                /*
                    {
                        hideNavigation: bool,
                        hideTags: bool,
                    }
                * */
                options: '=',
                quiz: '=?'
            },
            link: function (scope, element, attrs) {
                scope.mediaService = mediaService;
                scope.topic = communityService.community.Options.Topic;

                scope.nextQuestion = function() {
                    scope.loading.quick(function() {
                        scope.options.onNext();
                        $timeout(function() {
                            navigationService.scrollToHash('compatibilityQuestionHash');
                        });

                    });
                };

                scope.previousQuestion = function() {
                    scope.loading.quick(function() {
                        scope.options.onPrevious();
                        $timeout(function() {
                            navigationService.scrollToHash('compatibilityQuestionHash');
                        });
                    });
                };

                scope.edit = function() {
                    scope.processing = true;
                    scope.loading.message = 'Loading...';
                    $timeout(function() {
                        scope.form.isAnswering = true;
                        scope.processing = false;
                        $timeout(function() {
                            navigationService.scrollToHash('compatibilityQuestionHash');
                        });
                    });
                };

                scope.$watch('question', function(newValue) {
                    var j = 0, answer = null;
                    scope.processing = false;
                    scope.tagNames = compatibilityService.getTags(scope.question);

                    // Have we already answered this question?
                    scope.chosenAnswer = null;
                    if(communityService.accountCommunity &&
                        communityService.accountCommunity.CompatibilityAnswers) {
                        for(j = 0; j < communityService.accountCommunity.CompatibilityAnswers.length; j++) {
                            answer = communityService.accountCommunity.CompatibilityAnswers[j];
                            if(answer.QuestionId === scope.question.Id) {
                                // Answered question
                                scope.chosenAnswer = answer;
                                break;
                            }
                        }
                    }

                    scope.answerRows = homeService.columnizeList(scope.question.Answers, 2);


                    scope.form = {
                        isAnswering: !scope.chosenAnswer || scope.options.editQuestionOnStart,
                        isLoggedIn: accountService.isLoggedIn()
                    };

                    if(scope.chosenAnswer) {
                        for(var i = 0; i < scope.question.Answers.length; i++) {
                            answer = scope.question.Answers[i];
                            if(answer.Id === scope.chosenAnswer.AnswerId) {
                                scope.form.answer = answer;
                            }
                        }
                        scope.form.explanation = scope.chosenAnswer.Explanation;
                    }

                    scope.removeAnswer = function() {
                        if(!scope.chosenAnswer) {
                            return;
                        }

                        scope.processing = true;
                        scope.loading.message = 'Removing Answer...';
                        $timeout(function() {
                            navigationService.scrollToHash('compatibilityQuestionHash');
                        });
                        compatibilityService.removeAnswer(scope.chosenAnswer, function(data) {
                            // Success
                            scope.processing = false;

                            // Remove the answer from our cache
                            if(communityService.accountCommunity && communityService.accountCommunity.CompatibilityAnswers) {
                                var answerToRemoveIndex = -1;
                                for(var i = 0; i < communityService.accountCommunity.CompatibilityAnswers.length; i++) {
                                    var answer = communityService.accountCommunity.CompatibilityAnswers[i];
                                    if(answer.AnswerId === scope.chosenAnswer.AnswerId) {
                                        answerToRemoveIndex = i;
                                        break;
                                    }
                                }
                                if(answerToRemoveIndex >= 0) {
                                    communityService.accountCommunity.CompatibilityAnswers.splice(answerToRemoveIndex, 1);
                                }
                            }

                            scope.chosenAnswer = null;
                            scope.form.isAnswering = false;
                            scope.options.onNext();
                            $timeout(function() {
                                navigationService.scrollToHash('compatibilityQuestionHash');
                            });
                            commService.showSuccessAlert('Your answer has been removed successfully!');

                        }, function(data) {
                            // Failure
                            commService.showErrorAlert(data);
                            scope.processing = false;
                        });
                    };

                    scope.submit = function() {

                        var answer;
                        // Submit the answer
                        answer = {
                            QuestionId: scope.question.Id,
                            Explanation: scope.form.explanation,
                            AnswerId: scope.form.answer.Id
                        };

                        // Ensure that the new, edited answer is saved in our cache of answers.
                        if(scope.chosenAnswer) {
                            angular.extend(scope.chosenAnswer, answer);
                        }

                        scope.processing = true;
                        scope.loading.message = 'Submitting...';
                        if(accountService.isLoggedIn()) {
                            navigationService.registerEvent('Compatibility', 'Submit Compatibility Answer', scope.question.Question);
                            compatibilityService.submitAnswer(answer, function(data) {
                                // Success
                                // Go to the next question!
                                scope.processing = false;

                                if(!communityService.accountCommunity.CompatibilityAnswers) {
                                    communityService.accountCommunity.CompatibilityAnswers = [];
                                }

                                communityService.accountCommunity.CompatibilityAnswers.push(answer);
                                if(scope.options && scope.options.onNext) {
                                    scope.options.onNext(answer);
                                }
                                if(scope.options && scope.options.onSubmit) {
                                    scope.options.onSubmit(answer);
                                }
                                $timeout(function() {
                                    navigationService.scrollToHash('compatibilityQuestionHash');
                                });

                            }, function(data) {
                                // Failure
                                commService.showErrorAlert(data);
                                scope.processing = false;
                            });
                        }
                        else {
                            $timeout(function() {
                                scope.options.onSubmit(answer);
                            });

                        }
                    };
                });

            }
        };
    }])
    .directive('compatibilityQuestionComparison', ['profileService', 'compatibilityService', 'commService', 'communityService', 'navigationService', 'accountService', 'mediaService', '$timeout', function(profileService, compatibilityService, commService, communityService, navigationService, accountService, mediaService, $timeout) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<a id="compatibilityComparisonHash"></a>' +
                    '<loading-manager></loading-manager>' +
                    '<div ng-if="!comparison.myAnswer || !comparison.profileAnswer">' +
                        '<div ng-show="!form.isAnswering" class="compatibility-question-well">' +
                            '<div class="compatibility-question-number">{{comparison.question.QuestionIndex + 1}} of {{questions.length}}</div>' +
                            '<div class="compatibility-question-content">' +

                                '<h2 class="compatibility-question-header">{{comparison.question.Question}}</h2>' +
                                '<tag-strip tag-names="tagNames" class="compatibility-question-tag-strip"></tag-strip>' +
                                '<div class="bold red-text clear-both">To see {{fullName}}\'s answer you\'ll need to answer this question.</div>' +
                            '</div>' +

                            '<div class="compatibility-question-control-area">' +
                                '<button class="btn btn-warning" type="button" ng-click="previousQuestion()" style="margin-right: 10px;">Previous</button>' +
                                '<button class="btn btn-warning" type="button" ng-click="nextQuestion()" style="margin-right: 20px;">Skip</button>' +
                                '<button class="btn btn-primary" type="button" ng-click="form.isAnswering = true">Answer</button>' +
                            '</div>' +
                        '</div>' +
                        '<div ng-show="form.isAnswering">' +
                            '<compatibility-question questions="questions" question="comparison.question" options="compatibilityQuestionOptions"></compatibility-question>' +
                        '</div>' +
                    '</div>' +
                    '<div ng-if="comparison.myAnswer && comparison.profileAnswer" class="compatibility-question-well">' +
                        '<div class="compatibility-question-number">{{comparison.question.QuestionIndex + 1}} of {{questions.length}}</div>' +

                        '<div class="compatibility-question-content">' +

                            '<h2 class="compatibility-question-header">{{comparison.question.Question}}</h2>' +
                            '<tag-strip tag-names="tagNames" class="compatibility-question-tag-strip"></tag-strip>' +


                            '<div class="clear-both">' +

                                '<div class="bold" style="margin-top: 20px;">Possible Answers:</div>' +
                                '<div ng-repeat="answer in comparison.question.Answers">' +
                                    '<div>{{answer.Answer}}</div>' +
                                '</div>' +
/*
                                '<div>PercentageOfQuestionPointsRewarded: {{comparison.PercentageOfQuestionPointsRewarded}}</div>' +
*/
                                '<div class="bold" style="margin-top: 20px;">{{fullName}}\'s Answer:</div>' +
                                '<div class="bold" ng-style="{\'color\': answerColor}">{{comparison.profileAnswer.answer.Answer}}</div>' +
                                '<div ng-show="comparison.profileAnswer.Explanation" style="margin-top: 5px;"><span class="bold">{{fullName}}\'s Explanation: </span> <div btf-markdown="comparison.profileAnswer.Explanation"></div></div>' +


                                '<div class="bold" style="margin-top: 20px;">Your Answer:</div>' +
                                '<div class="bold" ng-style="{\'color\': answerColor}">{{comparison.myAnswer.answer.Answer}}</div>' +
                                '<div ng-show="comparison.myAnswer.Explanation" style="margin-top: 5px;"><span class="bold">Your Explanation: </span> <div btf-markdown="comparison.myAnswer.Explanation"></div></div>' +

                                '<div class="bold" style="margin-top: 20px;" ng-show="compatibilityCategory">Compatibility: <span ng-style="{\'color\': answerColor}">{{compatibilityCategory}}</span></div>' +

                            '</div>' +

                        '</div>' +

                        '<div class="compatibility-question-control-area">' +
                            '<button class="btn btn-primary" type="button" ng-click="previousQuestion()" style="margin-right: 10px;">Previous</button>' +
                            '<button class="btn btn-primary" type="button" ng-click="nextQuestion()" style="margin-right: 20px;">Next</button>' +
                            '<button class="btn btn-warning pull-right" type="button" ng-click="edit()">Edit My Answer</button>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
                questions: '=',
                comparison: '=',
                options: '='
            },
            link: function (scope, element, attrs) {
                scope.form = {
                    isAnswering: false
                };
                scope.compatibilityQuestionOptions = {
                    onNext: function(answer) {
                        scope.loading.quick(function() {
                            if(answer) {
                                scope.comparison.myAnswer = answer;
                                scope.options.normalizeAnswers(scope.comparison);
                            }
                            else {
                                scope.options.onNext();
                                scope.form.isAnswering = false;
                            }
                        });
                    },
                    onPrevious: function() {
                        scope.loading.quick(function() {
                            scope.options.onPrevious();
                            scope.form.isAnswering = false;
                        });
                    }
                };
                scope.mediaService = mediaService;
                scope.fullName = profileService.getProfileFullName(profileService.currentProfile);

                scope.$watch('comparison', function(newValue) {

                    if(angular.isDefined(scope.comparison.PercentageOfQuestionPointsRewarded)) {
                        var percentageRewarded = scope.comparison.PercentageOfQuestionPointsRewarded;
                        scope.answerColor = percentageRewarded >= 90 ? 'green' : percentageRewarded >= 60 ? 'DarkGoldenRod' : percentageRewarded >= 30 ? 'orange' : 'red';
                        scope.compatibilityCategory = percentageRewarded >= 90 ? 'Good' : percentageRewarded >= 60 ? 'Fair' : percentageRewarded >= 30 ? 'Low' : 'Poor';
                    }
                    else {
                        scope.answerColor = 'black';
                        scope.compatibilityCategory = null;
                    }


                    scope.tagNames = compatibilityService.getTags(scope.comparison.question);
                });

                scope.nextQuestion = function() {
                    scope.loading.quick(function() {
                        scope.options.onNext();
                        $timeout(function() {
                            navigationService.scrollToHash('compatibilityComparisonHash');
                        });
                    });
                };

                scope.previousQuestion = function() {
                    scope.loading.quick(function() {
                        scope.options.onPrevious();
                        $timeout(function() {
                            navigationService.scrollToHash('compatibilityComparisonHash');
                        });
                    });

                };

                scope.edit = function() {
                    navigationService.goToPath(navigationService.getCompatibilityQuestionUrl(accountService.account, scope.comparison.question, communityService.community));
                };
            }
        };
    }])
    .directive('compatibilityComparison', ['profileService', 'compatibilityService', 'commService', 'communityService', 'navigationService', 'accountService', function(profileService, compatibilityService, commService, communityService, navigationService, accountService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-show="processing">' +
                        '<loading></loading> Loading Compatibility Questions...' +
                    '</div>' +
                    '<div ng-show="!processing">' +
                        '<div ng-if="!comparisons || comparisons.length <= 0">' +
                            '<h3>You and {{fullName}} have not yet answered any of the same questions.</h3>' +
                            '<div><a class="action-link" ng-href="/messages?newConversation={{currentProfile.Id}}">Tell {{fullName}} To Answer Some Questions!</a></div>' +
                        '</div>' +
                        '<div ng-if="comparisons && comparisons.length > 0">' +
                            '<compatibility-question-comparison options="compatibilityQuestionOptions" comparison="comparison" questions="availableQuestions"></compatibility-question-comparison>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            scope: {
            },
            link: function (scope, element, attrs) {
                // Whose profile are we on?
                scope.currentProfile = profileService.currentProfile;
                scope.fullName = profileService.getProfileFullName(profileService.currentProfile);
                scope.goToMyCompatibility = function() {
                    navigationService.goToPath(navigationService.getCompatibilityUrl(accountService.account, communityService.community));
                };

                scope.compatibilityQuestionOptions = {
                    onNext: function() {
                        // Go to the next question
                        var comparisonIndex = scope.comparisons.indexOf(scope.comparison);
                        if(comparisonIndex + 1 >= scope.comparisons.length) {
                            scope.comparison = scope.comparisons[0];
                        }
                        else {
                            scope.comparison = scope.comparisons[comparisonIndex + 1];
                        }
                    },
                    onPrevious: function() {
                        // Go to the previous question
                        var comparisonIndex = scope.comparisons.indexOf(scope.comparison);
                        if(comparisonIndex <= 0) {
                            scope.comparison = scope.comparisons[scope.comparisons.length - 1];
                        }
                        else {
                            scope.comparison = scope.comparisons[comparisonIndex - 1];
                        }
                    },
                    normalizeAnswers: function(comparison) {
                        for(var j = 0; j < comparison.question.Answers.length; j++) {
                            var answer = comparison.question.Answers[j];
                            if(answer.Id === comparison.profileAnswer.AnswerId) {
                                comparison.profileAnswer.answer = answer;
                            }
                            if(answer.Id === comparison.myAnswer.AnswerId) {
                                comparison.myAnswer.answer = answer;
                            }
                        }
                    }
                };

                scope.processing = true;
                compatibilityService.getComparison(scope.currentProfile.Id,
                    function(data) {
                    // Success
                    scope.communityCompatibility = data.CommunityCompatibility;
                    scope.comparison = data.Comparison;
                    scope.questions = scope.communityCompatibility.Questions;


                    scope.profileCompatibilityAnswers = scope.currentProfile.AccountCommunity.CompatibilityAnswers;
                    scope.myCompatibilityAnswers = communityService.accountCommunity.CompatibilityAnswers;

                    // Only compare those that both users answers
                    scope.comparisons = [];
                    scope.availableQuestions = [];
                    var i = 0;
                    for(i = 0; i < scope.questions.length; i++) {
                        var question = scope.questions[i];

                        // Was this question answered by the profile?
                        var j = 0, profileAnswer = null, myAnswer = null;
                        for(j = 0; j < scope.profileCompatibilityAnswers.length; j++) {
                            if(scope.profileCompatibilityAnswers[j].QuestionId === question.Id) {
                                profileAnswer = scope.profileCompatibilityAnswers[j];
                                break;
                            }
                        }

                        for(j = 0; j < scope.myCompatibilityAnswers.length; j++) {
                            if(scope.myCompatibilityAnswers[j].QuestionId === question.Id) {
                                myAnswer = scope.myCompatibilityAnswers[j];
                                break;
                            }
                        }

                        // The profile has filled out the question but we haven't. Add the
                        // question but not the comparison.
                        if(profileAnswer && !myAnswer) {
                            var comparison = {
                                question: question,
                                myAnswer: myAnswer,
                                profileAnswer: profileAnswer
                            };
                            scope.availableQuestions.push(comparison.question);
                            scope.comparisons.push(comparison);
                        }
                        else {

                            for(j = 0; j < scope.comparison.AnswerComparisons.length; j++) {
                                var answerComparison = scope.comparison.AnswerComparisons[j];
                                if(answerComparison.QuestionId === question.Id) {
                                    answerComparison.question = question;
                                    answerComparison.myAnswer = answerComparison.Answer;
                                    answerComparison.profileAnswer = answerComparison.OtherAnswer;

                                    scope.compatibilityQuestionOptions.normalizeAnswers(answerComparison);


                                    // Only include the question if the profile has answered it
                                    if(profileAnswer) {
                                        scope.availableQuestions.push(answerComparison.question);
                                    }

                                    scope.comparisons.push(answerComparison);
                                    break;
                                }
                            }

                        }



                    }

                    if(scope.comparisons.length > 0)
                        scope.comparison = scope.comparisons[0];

                    for(i = 0; i < scope.availableQuestions.length; i++) {
                        scope.availableQuestions[i].QuestionIndex = i;
                    }


                    scope.processing = false;
                }, function(data) {
                    // Failure
                    commService.showErrorAlert(data);
                    scope.processing = false;
                });

            }
        };
    }])
    .directive('compatibilityPage', ['$routeParams', 'tourService', 'compatibilityService', 'commService', 'communityService', 'navigationService', 'accountService', 'mediaService', '$timeout', function($routeParams, tourService, compatibilityService, commService, communityService, navigationService, accountService, mediaService, $timeout) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<div ng-if="!mediaService.isPhone" class="col-xs-12">' +
                        '<community-cover-photo></community-cover-photo>' +
                    '</div>' +
                    '<div class="clearfix"></div>' +
                    '<div class="centered">' +
                        '<h1>{{topic}} Compatibility</h1>' +

                        '<a id="compatibilityMatches"></a>' +
                        '<loading-manager></loading-manager>' +

                        '<div ng-if="isLoggedIn">' +
                            '<div ng-show="!processing && accounts && accounts.length > 0" class="bordered-white-well" style="margin-top: 10px;">' +
                                '<div class="bold green-text" style="margin-bottom: 10px;">From the questions you\'ve answered thus far, we found these people to be your best {{topic}} matches:</div>' +
                                '<div style="overflow: hidden;">' +
                                    '<span ng-repeat="account in accounts">' +
                                        '<span style="height: 120px; width: 100px; display:inline-block;">' +
                                            '<div class="bold"><a ng-href="/profile/{{community.Url}}/{{account.Username}}">{{account | profileName}}</a></div>' +
                                            '<div class="bold">{{account.AccountCommunity.Compatibility.LowestPossibleCompatibility}}%</div>' +
                                            '<comment-picture style="margin-right: 5px;" account="account"></comment-picture>' +
                                        '</span>' +
                                    '</span>' +
                                '</div>' +
                            '</div>' +

                            '<div>Answer a few more questions and we\'ll know exactly what you\'re looking for in a {{topic}} friend <happy-face></happy-face></div>' +

                        '</div>' +
                    '</div>' +
                    '<div class="col-sm-offset-2 col-sm-8" style="margin-top: 10px;">' +
                        '<div ng-if="isLoggedIn">' +
                            '<compatibility-questionnaire options="questionnaireOptions"></compatibility-questionnaire>' +

                            '<div class="centered">' +
                                '<a ng-href="/stream/{{community.Url}}" class="btn btn-call-to-action btn-lg" title="Stream"><i class="fa fa-newspaper-o"></i> Stream</a>' +
                            '</div>' +
                        '</div>' +

                        '<div ng-if="!isLoggedIn" class="centered">' +
                            '<h3>We want to find your {{topic}} friends too! Login now to check it out <happy-face></happy-face></h3>' +
                            '<sign-up-inline></sign-up-inline>' +
                        '</div>' +


                    '</div>' +



                '</div>',
            scope: {
            },
            link: function (scope, element, attrs) {
                scope.isLoggedIn = accountService.isLoggedIn();
                scope.community = communityService.community;
                scope.mediaService = mediaService;
                scope.topic = communityService.community.Options.Topic;

                if($routeParams.tour && scope.isLoggedIn) {
                    // We were redirected here so let's mark that the user has seen the tour
                    tourService.completeTour(accountService.tourNames.compatibilityRedirect);
                }

                scope.questionnaireOptions = {
                    onSubmit: function(answer) {
                        scope.updateMatches(true);
                    }
                };

                scope.updateMatches = function(goToHashUponComplete) {
                    if(!accountService.isLoggedIn()) {
                        return;
                    }

                    // Now let's get the users that the test-taker is compatible with.
                    scope.processing = true;
                    scope.loading.message = 'Please wait. We\'re calculating your compatibility...';
                    compatibilityService.getCompatibleAccounts(scope.answers, {
                        PreferAccountsWithProfilePictures: false
                    }, function(data) {
                        scope.processing = false;

                        // Success
                        var maxAccounts = 5;
                        scope.accounts = [];
                        for(var i = 0; i < data.Accounts.length && i < maxAccounts; i++) {
                            scope.accounts.push(data.Accounts[i]);
                        }
                        if(goToHashUponComplete) {
                            $timeout(function() {
                                navigationService.scrollToHash('compatibilityMatches');
                            });
                        }

                    }, function(data) {
                        scope.processing = false;
                        commService.showErrorAlert(data);
                    });
                };

                scope.updateMatches(false);
            }
        };
    }]);