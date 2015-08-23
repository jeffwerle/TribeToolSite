//
//  Created by Ross
//

(function(){

    var wiki = function(converter) {
        return [

            // http://en.wikipedia.org/wiki/Help:Wiki_markup
            // = Heading =, == Heading ==, etc
            { type: 'lang', regex: '(\\\\)?(={1,6})\\s(.*)\\s(={1,6})', replace:
                function(wholeMatch, leadingSlash, firstEqualsMatch, headerTitle, secondEqualsMatch) {
                    // Check if we matched the leading \ and return nothing changed if so
                    if (leadingSlash === '\\') {
                        return match;
                    } else {
                        var h_level = firstEqualsMatch.length;
                        return '<h' + h_level + ' class="wiki-header wiki-header-' + h_level + '">' + headerTitle + '</h' + h_level + '>';
                    }
                }
            },
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.wiki = wiki; }
    // Server-side export
    if (typeof module !== 'undefined') module.exports = wiki;

}());
