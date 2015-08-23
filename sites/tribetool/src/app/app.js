var app = angular.module('app', ['ngRoute', 'ngCookies', 'ngSanitize', 'ngTouch', 'ngAnimate',
        'ui.bootstrap.accordion','ui.bootstrap',
        'utilityangular', 'angularFileUpload', 'matchmedia-ng',
        'app.DirectiveServices', 'app.Directives', 'app.Services', 'app.Controllers',
        'app.Filters',
        'stripe.checkout', 'angularPayments', 'oc.lazyLoad', 'ngImgCrop',
        'btford.socket-io', 'btford.markdown', 'youtube', 'perfect_scrollbar', 'autocomplete',
        'swipe', 'angular-loading-bar', 'bootstrapLightbox', 'hmTouchEvents',
        'infinite-scroll', 'angular-intro', 'google', 'angulike', 'vcRecaptcha', 'facebook',
        'googleplus'])
    .run(function() {
        FastClick.attach(document.body);

        // Load the facebook SDK asynchronously
        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {return;}
            js = d.createElement(s); js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    })
    .config(['$routeProvider', '$locationProvider', '$httpProvider', 'markdownConverterProvider', 'cfpLoadingBarProvider', 'FacebookProvider', 'GooglePlusProvider', function($routeProvider, $locationProvider, $httpProvider, markdownConverterProvider, cfpLoadingBarProvider, FacebookProvider, GooglePlusProvider) {

        FacebookProvider.init('1641445072740454');

        GooglePlusProvider.setScopes(["https://www.googleapis.com/auth/plus.login", 'email']);
        GooglePlusProvider.init({
            clientId: '750763559364-qvlv0kicntinuicthmrida1n2kcvpt79.apps.googleusercontent.com'
            //apiKey: 'YOUR_API_KEY'
        });

        cfpLoadingBarProvider.includeSpinner = false;

        markdownConverterProvider.config({
            extensions: ['github', 'prettify', 'table', 'wiki', 'tribetool', 'community']
        });


        $routeProvider
            .when('/home',
            {
                templateUrl: '/app-templates/home.tpl.html',
                controller: 'homeController'
            })
            .when('/home/:options',
            {
                templateUrl: '/app-templates/home.tpl.html',
                controller: 'homeController'
            })
            .when('/community',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/community/:communityUrl',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/community/:communityUrl/:communityRoute',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/community/:communityUrl/:communityRoute/:communityRouteData1',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/community/:communityUrl/:communityRoute/:communityRouteData1/:communityRouteData2',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })

            .when('/tool',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/tool/:communityUrl',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/tool/:communityUrl/:toolRoute',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/tool/:communityUrl/:toolRoute/:toolRouteData1',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/tool/:communityUrl/:toolRoute/:toolRouteData1/:toolRouteData2',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/tool/:communityUrl/:toolRoute/:toolRouteData1/:toolRouteData2/:toolRouteData3',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })


            .when('/playlists',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/playlists/:communityUrl',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/maps',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/maps/:communityUrl',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/wiki',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/wiki/:communityUrl',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/wiki/:communityUrl/:tag',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/stream',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/stream/:communityUrl',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/profile',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/profile/:communityUrl',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/profile/:communityUrl/:username',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/profile/:communityUrl/:username/:profileRoute',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/profile/:communityUrl/:username/:profileRoute/profileRouteData1',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/profile/:communityUrl/:username/:profileRoute/profileRouteData1/profileRouteData2',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/submit',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/map',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/map/:communityUrl',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/map/:communityUrl/:mapUrl',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/map/:communityUrl/:mapUrl/:mapLocationUrl',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/landing',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/landing/:communityUrl',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/landing/:communityUrl/:topic',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/landing/:communityUrl/:topic/:landingRouteData1',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/compatibility',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/compatibility/:communityUrl',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            /* This learning page will redirect to the community-specific marketing
             * page if the user has not yet signed-up for any lessons and the community
             * has a lessons module (as specified by
             * community.HasLearnModule). Otherwise, it will be a community-agnostic
              * learning dashboard*/
            .when('/learn',
            {
                templateUrl: '/app-templates/learn/learn.html',
                controller: 'learnController'
            })
            /* This is the community-agnostic specialization-specific learning page */
            .when('/learn/specialization/:discipline/:specializationName',
            {
                templateUrl: '/app-templates/learn/specialization.html',
                controller: 'specializationController'
            })
            /* This is the community-specific "learn" marketing page. */
            .when('/learn/:communityUrl',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/teach',
            {
                templateUrl: '/app-templates/teach/teach.html',
                controller: 'teachController'
            })
            .when('/student/:disciplineUrl/:specializationUrl/:username',
            {
                templateUrl: '/app-templates/teach/student.html',
                controller: 'studentController'
            })
            .when('/submit/:communityUrl',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/post/:communityUrl/:postUrlId/:postUrl',
            {
                templateUrl: '/app-templates/community/community.tpl.html'
            })
            .when('/lesson/:disciplineUrl/:specializationUrl/:stepUrl',
            {
                templateUrl: '/app-templates/learn/step.html',
                controller: 'stepController'
            })
            .when('/login',
            {
                templateUrl: '/app-templates/accounts/login.tpl.html',
                controller: 'loginController'
            })
            .when('/register',
            {
                templateUrl: '/app-templates/accounts/register.tpl.html',
                controller: 'registerController'
            })
            .when('/reset-password',
            {
                templateUrl: '/app-templates/accounts/reset-password.tpl.html',
                controller: 'resetPasswordController'
            })
            .when('/confirm-account',
            {
                templateUrl: '/app-templates/accounts/confirm-account.tpl.html',
                controller: 'accountConfirmationController'
            })
            .when('/account-settings',
            {
                templateUrl: '/app-templates/accounts/account-settings.html',
                controller: 'accountSettingsController'
            })
            .when('/login-authorization/:authorizer',
            {
                templateUrl: '/app-templates/accounts/login-authorization.html',
                controller: 'loginAuthorizationController'
            })

            .when('/messages',
            {
                templateUrl: '/app-templates/messages/messages.html',
                controller: 'messagesController'
            })

            .when('/contact',
            {
                templateUrl: '/app-templates/contact.html',
                controller: 'contactController'
            })
            .when('/faq',
            {
                templateUrl: '/app-templates/faq.html'
            })
            .when('/formatting',
            {
                templateUrl: '/app-templates/formatting/formatting.html'
            })
            .when('/404',
            {
                templateUrl: '/app-templates/404.html',
                controller: 'pageNotFoundController',
                reloadOnSearch: false
            })

            /* Allow us to use a shorthand for communities such as "tribetool.com/disneyland". This will
            * then redirect to "tribetool.com/community/disneyland" */
            .when('/:communityUrl',
            {
                redirectTo: '/community/:communityUrl'
            })

            .when('/',
            {
                redirectTo: '/home'
            })
            .otherwise(
            {
                redirectTo: '/404'
            });


        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        $locationProvider.html5Mode(true).hashPrefix('!');
        //For HTML5 mode to work with a webserver, you need to modify your webserver to rewrite(reWRITE not reDIRECT) all URLs not ending with a mime type(i.e., not requesting a specific asset file) to the root URL.
    }]);

(function() {
    Array.prototype.move = function (old_index, new_index) {
        if (new_index >= this.length) {
            var k = new_index - this.length;
            while ((k--) + 1) {
                this.push(undefined);
            }
        }
        this.splice(new_index, 0, this.splice(old_index, 1)[0]);
        return this; // for testing purposes
    };

}());