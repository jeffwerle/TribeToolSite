//
//  Created by Ross
//

(function(){

    // This will be created/overriden in formatterService.updateMarkdownCommunityReferences()
    var community = function(converter) {
        return [

        ];
    };

    // Client-side export
    if (typeof window !== 'undefined' && window.Showdown && window.Showdown.extensions) { window.Showdown.extensions.community = community; }
    // Server-side export
    if (typeof module !== 'undefined') module.exports = community;

}());
