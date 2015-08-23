/*
 * angular-markdown-directive v0.3.1
 * (c) 2013-2014 Brian Ford http://briantford.com
 * License: MIT
 */

'use strict';

angular.module('btford.markdown', ['ngSanitize']).
  provider('markdownConverter', function () {
    var opts = {};
    return {
      config: function (newOpts) {
        opts = newOpts;
      },
      $get: function () {
        return new Showdown.converter(opts);
      }
    };
  }).
  directive('btfMarkdown', ['$sanitize', '$compile', 'markdownConverter', 'communityService', 'formatterService', function ($sanitize, $compile, markdownConverter, communityService, formatterService) {
    return {
      restrict: 'AE',
        scope: {
            btfMarkdown: '=',
            /*
                These options will be passed to markdownConverter.makeHtml which will consequently be passed
                to the filter() method of any extensions.
                {
                     html: bool, // indicates whether to process html
                     images: bool, // indicates whether to process images
                     videos: bool, // indicates whether to process videos,
                     infobox: bool, // indicates whether to process infoboxes
                     imageStyling:  {
                        maxHeight: int, // max height of images
                        clear: string // the "clear" value (e.g. "both"),
                        hidePin: bool // if true, the "Pin" link will be hid on images
                     }
                     videoStyling:  {
                         hidePin: bool // if true, the "Pin" link will be hid on videos
                     }
                     preprocess: function(markdown) {
                        return modifiedMarkdown;
                     }

                     reserved properties:
                     scope
                     formatter
                }
             */
            markdownOptions: '=?'
        },
      link: function (scope, element, attrs) {

          var update = function(markdown) {
              if(!scope.markdownOptions)
                scope.markdownOptions = {};

              scope.markdownOptions.scope = scope;
              scope.markdownOptions.formatter = communityService.markdownFormatter;

              // Do any preprocessing if applicable
              if(scope.preprocess) {
                  markdown = scope.preprocess(markdown);
              }

              var compiledHtml = formatterService.getMarkdownElement(markdown, scope.markdownOptions, scope);
              /*
              var unsanitized = markdown ? markdownConverter.makeHtml(markdown, scope.markdownOptions) : '';
              var html = markdown ? $sanitize(unsanitized) : unsanitized;

              // We must surround the html in <div> tags so that it can be correctly compiled. It's possible that the
              // markdown doesn't have any surrounding tags which we need to prevent (to prevent a syntax error in compilation).
              var compiledHtml = $compile('<div>' + html + '</div>')(scope);

              var paragraphs = compiledHtml.find('p');
              for(var i = 0; i < paragraphs.length; i++) {
                  var p = paragraphs[i];
                  if(p.outerHTML === '<p></p>') {
                      p.remove();
                  }
              }
              */

              element.html('');
              element.append(compiledHtml);

              //element.html(html);
          };

          if (attrs.btfMarkdown) {
              scope.$watch('btfMarkdown', function (newVal) {
                  update(scope.btfMarkdown);
              });
              scope.$watch('markdownOptions', function (newVal) {
                  if(newVal)
                      update(scope.btfMarkdown);
              });
          } else {
              update(element.text());
          }




          /*
        if (attrs.btfMarkdown) {
          scope.$watch(attrs.btfMarkdown, function (newVal) {
            var html = newVal ? $sanitize(markdownConverter.makeHtml(newVal)) : '';
            element.html(html);
          });
        } else {
          var html = $sanitize(markdownConverter.makeHtml(element.text()));
          element.html(html);
        }
        */
      }
    };
  }]);
