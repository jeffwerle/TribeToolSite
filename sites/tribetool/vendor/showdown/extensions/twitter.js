//
//  Twitter Extension
//  @username   ->  <a href="http://twitter.com/username">@username</a>
//  #hashtag    ->  <a href="http://twitter.com/search/%23hashtag">#hashtag</a>
//

(function(){

    var twitter = function(converter) {
        return [

            // @username syntax
            // http://stackoverflow.com/questions/6664151/difference-between-b-and-b-in-regex
            // match empty string not at the beginning or end of the word, an optional leading
            // slash, @ symbol, and then match anything but whitespace one or more times, then
            // match an empty string at the beginning or end of the word
            // \\ is equivalent to \ in regex (due to escaping from the string)
            // and so \\\\ is equivalent to \\ in regex which is really just a match
            // on \
            { type: 'lang', regex: '\\B(\\\\)?@([\\S]+)\\b', replace:
                function(match, leadingSlash, username) {
                    // Check if we matched the leading \ and return nothing changed if so
                    if (leadingSlash === '\\') {
                        return match;
                    } else {
                        return '<a href="http://twitter.com/' + username + '">@' + username + '</a>';
                    }
                }
            },

            // #hashtag syntax
            { type: 'lang', regex: '\\B(\\\\)?#([\\S]+)\\b', replace:
                function(match, leadingSlash, tag) {
                    // Check if we matched the leading \ and return nothing changed if so
                    if (leadingSlash === '\\') {
                        return match;
                    } else {
                        return '<a href="http://twitter.com/search/%23' + tag + '">#' + tag + '</a>';
                    }
                }
            },

            // Escaped @'s
            { type: 'lang', regex: '\\\\@', replace: '@' }
        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.twitter = twitter; }
    // Server-side export
    if (typeof module !== 'undefined') module.exports = twitter;

}());
