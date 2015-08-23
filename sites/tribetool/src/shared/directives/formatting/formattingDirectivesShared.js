angular.module('app.Directives')
    .directive('formattingHelp', ['commService', function (commService) {
        return {
            replace: true,
            restrict: 'E',
            template:
                '<div>' +
                    '<table class="formatting-help-table">' +
                    '<tbody>' +
                    '<tr style="background-color: #ffff99">' +
                    '<td><em>You Type:</em></td>' +
                    '<td><em>You See:</em></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td><span style="color: red;">*</span>Your Italics Text<span style="color: red;">*</span></td>' +
                    '<td><em>Your Italics Text</em></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td><span style="color: red;">**</span>Your Bold Text<span style="color: red;">**</span></td>' +
                    '<td><b>Your Bold Text</b></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td><span style="color: red;">[</span>TribeTool<span style="color: red;">](</span>{{domain}}<span style="color: red;">)</span></td>' +
                    '<td><span btf-markdown="linkMarkdown"></span></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td><span style="color: red;">||</span>{{domain}}/images/Up-Arrow.png<span style="color: red;">||</span></td>' +
                    '<td><span btf-markdown="basicImageMarkdown"></span></td>' +
                    '</tr>' +

                    '<tr>' +
                    '<td><span style="color: red;">@</span>username</td>' +
                    '<td><span btf-markdown="\'@username\'"></span></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td><span style="color: red;">#</span>tag</td>' +
                    '<td><span btf-markdown="\'#tag\'"></span></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td><span style="color: red;">[[</span>Tag<span style="color: red;">]]</span></td>' +
                    '<td><span btf-markdown="\'[[Tag]]\'"></span></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td><span style="color: red;">[[</span>Tag<span style="color: red;">|</span>Text<span style="color: red;">]]</span></td>' +
                    '<td><span btf-markdown="\'[[Tag|Text]]\'"></span></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td><span style="color: red;">[[</span>Tag<span style="color: red;">|</span>Text<span style="color: red;">|</span>CommunityName<span style="color: red;">]]</span></td>' +
                    '<td><span btf-markdown="\'[[Tag|Text|CommunityName]]\'"></span></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td><span style="color: red;">:D :) :| :( :O X( :p :*</span></td>' +
                    '<td><span btf-markdown="emotionMarkdown"></span></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td><span style="color: red;">*</span> Item 1<br><span style="color: red;">**</span> Item 2<br><span style="color: red;">*</span> Item 3</td>' +
                    '<td><ul><li>Item 1<ul><li>Item 2</li></ul></li><li>Item 3</li></ul></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td><span style="color: red;">#</span> Item 1<br><span style="color: red;">**</span> Item 2<br><span style="color: red;">#</span> Item 3</td>' +
                    '<td><ol><li>Item 1<ul><li>Item 2</li></ul></li><li>Item 3</li></ol></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td><span style="color: red;">></span> Quoted Text</td>' +
                    '<td><blockquote>Quoted Text</blockquote></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td><span style="color: red;">![</span>Alt Text<span style="color: red;">](</span>{{domain}}/images/Up-Arrow.png <span style="color: red;">"</span>Optional Title<span style="color: red;">")</span></td>' +
                    '<td><span btf-markdown="advancedImageMarkdown"></span></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td><span style="color: red;">~~</span>Strikethrough<span style="color: red;">~~</span></td>' +
                    '<td><strike>Strikethrough</strike></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td>Super<span style="color: red;">^</span>Script</td>' +
                    '<td>Super<sup>Script</sup></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td><span style="color: red;">\\</span>https://tribetool.com</td>' +
                    '<td><span btf-markdown="escapedMarkdown"></span></td>' +
                    '</tr>' +
                    '<tr>' +
                    '<td><span style="color: red;">\\</span>:)</td>' +
                    '<td><span btf-markdown="escapedEmotionMarkdown"></span></td>' +
                    '</tr>' +

                    '</tbody>' +
                    '</table>' +
                    '<div><a href="/formatting" target="_blank">Read More</a></div>' +
                    '</div>',
            link: function (scope, element, attrs) {
                scope.domain = commService.getDomain();
                scope.linkMarkdown = '[TribeTool](' + scope.domain + ')';
                scope.basicImageMarkdown = '||' + scope.domain + '/images/Up-Arrow.png||';
                scope.advancedImageMarkdown = '![Alt Text](' + scope.domain + '/images/Up-Arrow.png "Optional Title")';
                scope.escapedMarkdown = '\\https://tribetool.com';
                scope.emotionMarkdown = ':D :) :| :( :O X(';
                scope.escapedEmotionMarkdown = '\\:)';

            }
        };
    }])
    .directive('tagContentEditor', ['uiService', function (uiService) {
        return {
            replace: false,
            restrict: 'E',
            template:
                '<div class="list card">' +
                    '<textarea auto-suggest input-id="inputId" id="{{inputId}}" ng-required="isRequired" class="form-control content-editor-input item item-input" ng-model="text" placeholder="{{placeholder}}"></textarea>' +
                '</div>',
            scope: {
                inputId: '=?',
                text: '=',
                tags: '=?',
                finalTagText: '=?',
                placeholder: '=?',
                isRequired: '=?' // indicates whether content is required in the text area

            },
            link: function (scope, element, attrs) {
                var textArea = element.find('textarea');
                if(!scope.inputId) {
                    scope.inputId = uiService.getGuid();
                    textArea.attr('id', scope.inputId);
                }

                scope.$watch('text', function(newValue) {
                    if(newValue)
                        scope.onTextChanged();
                });

                scope.onTextChanged = function() {
                    if(!scope.text)
                        return;

                    var elements = scope.text.split(/[#,\[\]]+/);
                    scope.tags = [];
                    scope.finalTagText = '';
                    for(var i = 0; i < elements.length; i++) {
                        var element = elements[i];
                        var normalized = element.replace(/ /g,'');
                        if(!normalized)
                            continue;


                        var tag = '#' + normalized;
                        scope.tags.push(tag);
                        scope.finalTagText += tag + ' ';
                    }
                    scope.finalTagText = scope.finalTagText.trim();
                };


            }
        };
    }]);