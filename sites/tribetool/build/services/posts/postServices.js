angular.module('app.Services')
    .factory('postService', ['$rootScope', 'commService', 'accountService', 'communityService', 'formatterService', 'tagService', 'tagPageService', function($rootScope, commService, accountService, communityService, formatterService, tagService, tagPageService) {
        var service = {
            /* The Posts being viewed (if applicable). These are summaries and do not have their full info loaded. */
            posts: [],
            /* The Post that is currently being viewed, if applicable */
            post: null,
            /* A callback used to update the currently viewed Post (if applicable). This
             * will be set when a post is loaded. */
            updatePostCallback: null,
            postTypes: ['Text', 'Link', 'Poll', 'Question', 'Live Event'],
            commentSystemTypes: ['Branch', 'Thread'],
            getPostTypes: function(isPost) {
                return isPost ? this.postTypes : ['Text', 'Link', 'Poll'];
            },
            getPostById: function(postId, getSummary, onSuccess, onFailure) {
                commService.postWithParams('post', {
                    Credentials: accountService.getCredentials(communityService.community),
                    GetPostOptions: {
                        PostId: postId,
                        GetSummary: getSummary
                    },
                    RequestType: 'GetPost'
                }, onSuccess, onFailure);
            },
            getPost: function(postUrlId, postUrl, onSuccess, onFailure) {
                commService.postWithParams('post', {
                    Credentials: accountService.getCredentials(communityService.community),
                    GetPostOptions: {
                        UrlId: postUrlId,
                        Url: postUrl
                    },
                    RequestType: 'GetPost'
                }, onSuccess, onFailure);
            },
            /*
             checkCache: bool, // if true, we will retrieve from postService.posts before calling the web service
            * */
            getPosts: function(pageNumber, countPerPage, onSuccess, onFailure, useCache) {
                if(!pageNumber) {
                    pageNumber = 1;
                }
                if(!countPerPage) {
                    countPerPage = 10;
                }

                if(useCache && this.posts.length > 0) {
                    var postsInCache = [];
                    var postIndex = 0;
                    for(var k = ((pageNumber - 1) * countPerPage); k < this.posts.length && postIndex < countPerPage; k++) {
                        postsInCache.push(this.posts[k]);
                        postIndex++;
                    }
                    if(postsInCache.length >= countPerPage) {
                        if(onSuccess)
                            onSuccess({
                                Posts: postsInCache
                            });
                        return;
                    }
                }

                var my = this;
                commService.postWithParams('post', {
                    Credentials: accountService.getCredentials(communityService.community),
                    GetPostOptions: {
                        PageNumber: pageNumber,
                        CountPerPage: countPerPage
                    },
                    RequestType: 'GetPosts'
                }, function(data) {
                    if(!my.posts) {
                        my.posts = [];
                    }
                    if(data.Posts && data.Posts.length > 0) {
                        for(var i = 0 ; i < data.Posts.length; i++) {
                            var post = data.Posts[i];

                            var isContained = false;
                            for(var j = 0; j < my.posts.length; j++) {
                                if(my.posts[j].Id === post.Id) {
                                    isContained = true;
                                    break;
                                }
                            }
                            if(!isContained) {
                                my.posts.push(post);
                            }
                        }
                        $rootScope.$broadcast('postsSet', my.posts);
                    }

                    if(onSuccess)
                        onSuccess(data);
                }, onFailure);
            },
            deletePost: function(post, onSuccess, onFailure) {
                commService.postWithParams('post', {
                    Credentials: accountService.getCredentials(communityService.community),
                    PostId: post.Id,
                    PostContentId: post.Contents[0].Id,
                    RequestType: 'DeletePost'
                }, onSuccess, onFailure);
            },
            submitPost: function(post, onSuccess, onFailure) {
                commService.postWithParams('post', {
                    Credentials: accountService.getCredentials(communityService.community),
                    SubmitPostOptions: {
                        Post: post
                    },
                    RequestType: 'SubmitPost'
                }, onSuccess, onFailure);
            },
            submitPostContent: function(post, postContent, onSuccess, onFailure) {
                commService.postWithParams('post', {
                    Credentials: accountService.getCredentials(communityService.community),
                    PostId: post.Id,
                    SubmitPostContentOptions: {
                        PostContent: postContent
                    },
                    RequestType: 'SubmitPostContent'
                }, onSuccess, onFailure);
            },
            editPostContent: function(postContent, postId, onSuccess, onFailure) {
                commService.postWithParams('post', {
                    Credentials: accountService.getCredentials(communityService.community),
                    PostId: postId,
                    PostContentId: postContent.Id,
                    EditPostContentOptions: {
                        PostContent: postContent
                    },
                    RequestType: 'EditPostContent'
                }, onSuccess, onFailure);
            },
            setPostAnswer: function(answerCommentId, postId, postContentId, onSuccess, onFailure) {
                commService.postWithParams('post', {
                    Credentials: accountService.getCredentials(communityService.community),
                    PostId: postId,
                    PostContentId: postContentId,
                    SetAnswerOptions: {
                        AnswerCommentId: answerCommentId
                    },
                    RequestType: 'SetPostAnswer'
                }, onSuccess, onFailure);
            },
            /*
                Gets the url of an image associated with the given post.

                onSuccess: function({ imageUrl: string })
             */
            getPostImage: function(post) {
                var text = '';
                var i = 0;
                for(i = 0; i < post.Contents.length; i++) {
                    var contents = post.Contents[i];
                    var formattedText = contents.CurrentVersion.FormattedText;
                    text += formattedText + ' ';
                    if(contents.CurrentVersion.Link) {
                        text += contents.CurrentVersion.Link + ' ';
                    }
                }

                var failureImage = 'images/silhouette-medium.png';

                var imageUrls = formatterService.getImageUrls(text);
                if(!imageUrls || imageUrls.length <= 0) {

                    var tagImages = [];
                    for(i = 0; i < post.Tags.length; i++) {
                        var tag = post.Tags[i];
                        var image = tagPageService.getTagPageImageFromCache(tag);
                        if(image) {
                            tagImages.push(image);
                        }
                    }
                    if(tagImages && tagImages.length > 0) {
                        var chosenImage = tagImages[Math.floor(Math.random()*tagImages.length)];
                        return chosenImage.Medium.Url;
                    }
                }
                else {
                    return imageUrls[Math.floor(Math.random()*imageUrls.length)];
                }

                return failureImage;
            }
        };


        $rootScope.$on('communityChanged', function(event, community) {
            service.posts = [];
        });

        return service;
    }]);