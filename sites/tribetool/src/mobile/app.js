// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'app.Directives', 'app.Services', 'app.Controllers',
        'app.Filters', 'oc.lazyLoad', 'matchmedia-ng',  'btford.markdown',
        'btford.socket-io', 'youtube', 'autocomplete', 'jcs-autoValidate',
        'ngCordova', 'jrCrop'])

.run(['$ionicPlatform', 'validator', 'validationDomModifier', 'OPTIONS', '$location', function($ionicPlatform, validator, validationDomModifier, OPTIONS, $location) {

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }

      validator.registerDomModifier(validationDomModifier.key, validationDomModifier);
      validator.setDefaultElementModifier(validationDomModifier.key);

      // Load the facebook SDK asynchronously
      (function(d, s, id){
          var js, fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) {return;}
          js = d.createElement(s); js.id = id;
          js.src = "//connect.facebook.net/en_US/sdk.js";
          fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));


      OPTIONS.facebook = {
          clientId: '1453484004963184'
      };
      OPTIONS.google = {
          clientId: '750763559364-nrgcn64jfr3vcj31l83uq4itutmdfffn.apps.googleusercontent.com',
          scopes: ["https://www.googleapis.com/auth/plus.login", 'email']
      };
      OPTIONS.mobile = {
          analyticsId: 'UA-60655704-4'
      };



  });
}])
.config(['$stateProvider', '$urlRouterProvider', 'markdownConverterProvider', '$httpProvider', '$sceDelegateProvider', '$ionicConfigProvider', '$provide', function($stateProvider, $urlRouterProvider, markdownConverterProvider, $httpProvider, $sceDelegateProvider, $ionicConfigProvider, $provide) {
    if(!ionic.Platform.isIOS()) {
        $ionicConfigProvider.scrolling.jsScrolling(false);

        // http://forum.ionicframework.com/t/native-scrolling-android-testers-wanted/17059/177
        var $LocationDecorator = function($location) {
            $location.hash = function(value) {
                return $location.__hash(value);
            };
            return $location;
        };
        $provide.decorator('$location', ['$delegate', $LocationDecorator]);
    }

    $sceDelegateProvider.resourceUrlWhitelist([
        'self',
        // Allow loading from youtube
        /https?:\/\/(?:[0-9A-Z-]+\.)?(?:youtu\.be\/|youtube(?:-nocookie)?\.com\S*[^\w\s-])([\w-]{11})(?=[^\w-]|$)(?![?=&+%\w.-]*(?:['"][^<>]*>|<\/a>))[?=&+%\w.-]*/gi,
        //new RegExp('^(http[s]?):\/\/(w{3}.)?youtube\.com/.+$'),

        // Allow loading from our assets domain
        'https://s3.amazonaws.com/image.tribetool.com/**'
    ]);



    markdownConverterProvider.config({
        extensions: ['github', 'prettify', 'table', 'wiki', 'tribetool', 'community']
    });


        var goToLoginIfNecessary = ['accountService', 'navigationService', function(accountService, navigationService) {
            if(!accountService.isLoggedIn()) {
                navigationService.goToPath('/login');
            }
        }];
        var resolve = {
            goToLoginIfNecessary: goToLoginIfNecessary
        };

        // Ionic uses AngularUI Router which uses the concept of states
      // Learn more here: https://github.com/angular-ui/ui-router
      // Set up the various states which the app can be in.
      $stateProvider


      .state('login', {
          url: '/login',
          templateUrl: 'app-templates/accounts/login.html',
          params: {
              isCommunityPage: false
          }
      })
      .state('register', {
          url: '/register',
          templateUrl: 'app-templates/accounts/register.html',
          params: {
              isCommunityPage: false
          }
      })

      .state('communityNoCommunityUrl', {
          url: '/community',

          params: {
              isCommunityPage: true
          }
      })
      .state('community', {
          url: '/community/:communityUrl',
          resolve: resolve,
          params: {
              isCommunityPage: true
          },
          views: {
              'community': {
                  templateUrl: 'app-templates/community/community.tpl.html'
              }
          }
      })


      .state('postNoCommunityUrl', {
          url: '/post',
          resolve: resolve,
          params: {
              isCommunityPage: true
          }
      })

      .state('post', {
          url: '/post/:communityUrl/:postUrlId/:postUrl',
          templateUrl: 'app-templates/community/community.tpl.html',
          resolve: resolve,
          params: {
              isCommunityPage: true
          }
      })



      .state('submitNoCommunityUrl', {
          url: '/submit',
          resolve: resolve,
          params: {
              isCommunityPage: true
          }
      })
      .state('submit', {
          url: '/submit/:communityUrl',
          templateUrl: 'app-templates/community/community.tpl.html',
          resolve: resolve,
          params: {
              isCommunityPage: true
          }
      })


      .state('streamNoCommunityUrl', {
          url: '/stream',
          resolve: resolve,
          params: {
              isCommunityPage: true
          }
      })
      .state('stream', {
          url: '/stream/:communityUrl',
          resolve: resolve,
          params: {
              isCommunityPage: true
          },
          views: {
              'stream': {
                  templateUrl: 'app-templates/community/community.tpl.html'
              }
          }
      })


      .state('profileNoCommunityUrl',
      {
          url: '/profile',
        resolve: resolve,
          params: {
              isCommunityPage: true
          }
      })
      .state('profileNoUsername',
      {
          url: '/profile/:communityUrl',
          resolve: resolve,
          params: {
              isCommunityPage: true
          }
      })
      .state('profile',
      {
          url: '/profile/:communityUrl/:username',
          resolve: resolve,
          params: {
              isCommunityPage: true
          },
          views: {
              'profile': {
                  templateUrl: 'app-templates/community/community.tpl.html'
              }
          }
      })


      .state('searchNoCommunityUrl',
      {
          url: '/search',
          resolve: resolve,
          params: {
              isCommunityPage: true
          }
      })
      .state('search',
      {
          url: '/search/:communityUrl',
          resolve: resolve,
          params: {
              isCommunityPage: true
          },
          views: {
              'search': {
                  templateUrl: 'app-templates/community/community.tpl.html'
              }
          }
      })
      .state('searchWithText',
      {
          url: '/search/:communityUrl/:searchText',
          resolve: resolve,
          params: {
              isCommunityPage: true
          },
          views: {
              'search': {
                  templateUrl: 'app-templates/community/community.tpl.html'
              }
          }
      })
        ;
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

    $httpProvider.defaults.useXDomain=true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

}]);
