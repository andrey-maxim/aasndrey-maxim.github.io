var application = angular.module('modelly',['ui.router','rzModule','geo-ng'],function($httpProvider){
    window.isdebug = {passCode:true};

})
//////////////////////////////////////////////////
//////////////////////////////////////////////////
// -----------------------> CONTROLLERS

    .controller('App',function($scope,$state,$stateParams,$location,$rootScope,$user,$overlay,$http,$communication){

        // http config ::
        // #debug ::

        if(window.location.href.indexOf('localhost')!= -1 || window.location.href.indexOf('milosolutions')!= -1){
            //$http._baseURL = 'http://178.79.180.206/api/v1/';
            $http._baseURL = 'http://213.219.37.211/api/v1/';
            window.isdebug.baseURL ='http://213.219.37.211/';//http://178.79.180.206/';
            //$http._baseURL = 'http://178.79.180.206/api/v1/';
            //window.isdebug.baseURL ='http://178.79.180.206/';
        } else {
            $http._baseURL = '/api/v1/';
        }

        $http.defaults.headers.common.Authorization = 'Token token="7d5f34d645611a56c59307c14104955b"';
        $http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
        $http.defaults.headers.common['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
        $http.defaults.headers.common['Access-Control-Allow-Headers'] = 'Content-Type, X-Requested-With';



        // mng globals
        $scope.menu = {};
        $rootScope.lastState = '';
        $scope.preloader = false;

        // apply state style ::
        $rootScope.$on('$stateChangeSuccess',function(evt,current,params,last){
            $scope.currentMenu = null;
            $rootScope.lastState = last.name;
            if(current.display){
                // reset menu params ::
                $rootScope.resetMenu();
                // apply state ::
                util.eachApply(current.display,$rootScope);
            }
        })

        // ------> menu :: forced struct from design
        $rootScope.resetMenu = function(){
            // reset top navi
            util.eachApply({hasNav:false,menuInput:'',title:'',
                hasMenu:false,hasSearchPopup:false,hasDiscover:false,hasDiscoverSearch:false,hasDiscoverMenu:false,
                hasOptions:false,hasClose:false,hasSettings:false,hasReturn:false, hasInput:false, hasSearch:false,
                hasNotif:false, hasNotifList:null , hasGifts:false,hasPadding:false},
                $rootScope);
        }
        $rootScope.resetMenu();// reset navi state
        $rootScope.title = '';// header title

        // params ::
        //$rootScope.hasNav = false;// navigation bar display
        //$rootScope.hasMenu = false;// menu display
        //$rootScope.hasOptions = false;// menu button
        //$rootScope.hasReturn = false;// menu button
        //$rootScope.hasInput = false;// top input
        //$rootScope.hasSearch = false;// search button
        //$rootScope.hasNotif = false;// notify button

        //$rootScope.hasNotifList = false;// notifications :: 1
        //$rootScope.hasDiscoverMenu = false;// discover menu :: 2
        //$rootScope.hasSearchPopup = false;// search menu :: 4

        //$rootScope.hasPadding = false;// padding left right

        // open navi item
        $scope.open = function(id){
            // trigger close menu ::
            if($rootScope.hasDiscoverMenu){
                $rootScope.$broadcast('closeDiscover');
            }
            // clear options ::
            $rootScope.hasMenu = false;
            $rootScope.hasNotifList = false;
            $rootScope.hasDiscoverMenu = false;
            $rootScope.hasSearchPopup = false;
            $rootScope.searchItems = null;
            if($rootScope.hasInput){
                $rootScope.$broadcast('menuclosesearch');
            }
            $rootScope.hasInput = false;


            if($scope.currentMenu == id){
                $scope.currentMenu = id = null;
            } else {
                $scope.currentMenu = id;
            }
            switch (id){
                case 0 :
                    $rootScope.hasMenu = true;
                    break;
                case 1:
                    $rootScope.hasNotifList = true;
                    break;
                case 2:
                    $rootScope.hasDiscoverMenu = true;
                    break;
                case 3:
                    $scope.menuInput = '';
                    $rootScope.$broadcast('menutyping');
                    break;
                default :
                    $scope.triggerClose();
            }
        }

        $rootScope.triggerClose = function(){
            $scope.currentMenu = null;
            $rootScope.$broadcast('menureturn');
        }
        //return btn :
        $rootScope.triggerReturn = function(){
            $rootScope.$broadcast('menureturn');
        }
        // prev state ::
        $rootScope.toLastState = function(){
            $state.go($rootScope.lastState || 'main');
        }
        // close notification ::
        $rootScope.closeNotif = function(){
            $rootScope.hasNotifList = false;
        }
        // text typing ::
        $scope.$watch('menuInput',function(newValue){
            $rootScope.$broadcast('menutext',newValue);
        })
        // select search item ::
        $scope.selectedSearchItem = function(id){
            $rootScope.$broadcast('searchselect',id);
        }

        // terms && conditions
        $rootScope.openTerms = function(){
            $rootScope.$broadcast('openterms');
        }
        // ------> PAGE RESIZE
        $(window).resize(function(){
            // menu ::
            $('#NotificationList').css({height:$(window).height() - 60});
            //
            $rootScope.pageHeight = $(window).height();
            $rootScope.$broadcast('resize');
        })
        $rootScope.pageHeight = $(window).height();

        // LOCK PAGE ::formentera
        $scope.$on('lock',function(e,text){
            $scope.preloader = text || '';
        });
        $scope.$on('unlock',function(){
            $scope.preloader = false;
        });

        // load country list ::
        $communication.countryList();

        // bookmark :
        $scope.closeBookmark = function(){
            $rootScope.bookmark = false;
        };


        //
        $rootScope.appInit = true;
        $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams){
            if($rootScope.appInit){
                if(toState.auth > 0){
                    event.preventDefault();
                    $state.go("preload");
                    // verify login stuff and change state :
                    $user.checkLogin().then(function(){
                        $state.go('main');
                    },function(){
                        $state.go('start');
                    });
                }
                $rootScope.appInit = false;
                return;
            }
            if(toState.keyState){
                $rootScope.keyState = toState.name;
            }

            if($user.userType == 0 && toState.auth === 1){
                $rootScope.authOverlay = true;
                event.preventDefault();
            }
        });


    })


    .controller('StartCtrl',function($scope, $stateParams,$state,$user,$rootScope) {

        $scope.createAccount = function(type){
            $user.createAccount(type);
            $state.go('auth/newuser');
        }

        $scope.getIn = function(){
            //$user.userType = 1;
            $state.go('main');
            // no login access
        }

        if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
            $rootScope.bookmark = true;console.log('display bookmark');
        }


    })


    .controller('MainCtrl',function($scope ,$state, $user , geolocation , $overlay , $timeout ){

        $scope.initAgain = function(){
           $scope.timeout = $timeout( $scope.initUser , 3000);
        }
        
        $scope.initUser = function() {
            switch ($user.userType) {
                case 0:
                    geolocation.getLocation().then(function (coords) {
                        $user.userLocation = {lat: coords.latitude, lng: coords.longitude};
                        $overlay.unlockPage();
                        $state.go('app/discover');
                    }, function (error) {
                        console.log('geolocation error:', error);
                        $overlay.geoError();
                        $scope.initAgain();
                    })
                    break;
                case 1:
                    $user.updateFollowers();
                    $overlay.lockPage();
                    geolocation.getLocation().then(function (coords) {
                        $user.userLocation = {lat: coords.latitude, lng: coords.longitude};
                        $overlay.unlockPage();
                        $state.go('app/newsfeed');
                    }, function (error) {
                        console.log('geolocation error:', error);
                        $overlay.geoError();
                        $scope.initAgain();
                    })
                    break;
                case 2:
                    $overlay.lockPage();
                    geolocation.getLocation().then(function (coords) {
                        $user.userLocation = {lat: coords.latitude, lng: coords.longitude};
                        $user.updateLocation( coords.latitude, coords.longitude);
                        $overlay.unlockPage();
                        $state.go('model/profile');

                    }, function (error) {
                        console.log('geolocation error:', error);
                        $overlay.geoError();
                        $scope.initAgain();
                    })
                    break;
            }
        }
        $scope.initUser();
        $overlay.geoGathering();
        
        $scope.$on('$destroy', function () {
            if($scope.timeout){
                $timeout.cancel($scope.timeout);
            }
        })
    })

//////////////////////////////////////////////////
//////////////////////////////////////////////////
// -----------------------> MENU

    .controller('MenuCtrl',function($scope, $rootScope , $location){
        // bind to app root ::
        $rootScope.$menu = $scope;

        // ------> interaction
        $scope.newsfeed = function(){
            $location.url('newsfeed');
        }
        $scope.settings = function(){
            $location.url('settings');
        }
        $scope.discovery = function(){
            $location.url('discovery');
        }


    }
)
//////////////////////////////////////////////////
//////////////////////////////////////////////////
// -----------------------> CONFIG

    .config(function($stateProvider,$urlRouterProvider,$compileProvider){


        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|sms|tel|mailto|chrome-extension):/);
        $urlRouterProvider.otherwise("/start/");
        $stateProvider
            .state('preload', {
                url: "/preload/",
                template: "",
                display:{hasMenu:false,bgState:1}
            })
            .state('start', {
                url: "/start/",
                templateUrl: "tpl/start.html",
                controller: 'StartCtrl',
                display:{hasMenu:false,bgState:0}
            })

            // login ::
            .state('auth/login', {
                url: "/login/",
                templateUrl: "tpl/auth/login.html",
                controller: 'LoginCtrl',
                display:{hasNav:false,bgState:0}
            }).state('auth/remind', {
                url: "/passwordremind/",
                templateUrl: "tpl/auth/passwordremind.html",
                controller: 'ReminderCtrl'
            })

            // create account ::
            .state('auth/newuser', {
                url: "/newuser/",
                templateUrl: "tpl/auth/createacc.html",
                controller: 'NewUserCtrl',
                display:{hasNav:false,bgState:0}
            }).state('auth/image', {
                url: "/newuserimg/",
                templateUrl: "tpl/auth/selectimg.html",
                controller: 'NewUserImageCtrl',
                display:{hasNav:false,bgState:0}
            }).state('auth/code', {
                url: "/newusercode/",
                templateUrl: "tpl/auth/sendcode.html",
                controller: 'NewUserCodeCtrl',
                display:{hasNav:false,bgState:0}
            }).state('auth/codeconfirm', {
                url: "/newusersms/",
                templateUrl: "tpl/auth/confirmcode.html",
                controller: 'NewUserConfirmCtrl',
                display:{hasNav:false,bgState:0}
            }).state('auth/subscription', {
                url: "/subscription/",
                templateUrl: "tpl/auth/subscription.html",
                controller: 'SubscriptionCtrl',
                display:{hasNav:false,bgState:0}
            }).state('auth/billing', {
                url: "/billing/",
                templateUrl: "tpl/auth/billing.html",
                controller: 'BillingCtrl',
                display:{hasNav:false,bgState:0}
            }).state('auth/paymentcomplete', {
                url: "/auth/paymentcomplete/",
                templateUrl: "tpl/auth/paymentcomplete.html",
                controller: 'PaymentCompleteCtrl',
                display:{hasNav:false,bgState:0}
            })




            // main menu ::
            .state('main', {
                url: "/main/",
                templateUrl: "tpl/main.html",
                controller: 'MainCtrl',
                display:{hasNav:true,bgState:1, hasOptions:true,title:'Loading ...'},
                auth:2
            })

            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // -----------------------> USER

            // ------> newsfeed  ::

            .state('app/newsfeed',{
                url: "/newsfeed",
                templateUrl: "tpl/app/newsfeed.html",
                controller: 'NewsfeedCtrl',
                display:{hasNav:true,bgState:1,hasOptions:true,title:'Newsfeed',hasGifts:true},
                keyState:true,
                auth:1
            })

            .state('app/following',{
                url: "/following",
                templateUrl: "tpl/app/following.html",
                controller: 'FollowingCtrl',
                display:{hasNav:true,bgState:1,title:'Following',hasReturn:true},
                auth:1
            })

            .state('app/discover',{
                url: "/discover",
                templateUrl: "tpl/app/discover.html",
                controller: 'DiscoverCtrl',
                display:{hasNav:true,bgState:2,title:'Discover',hasOptions:true,hasDiscover:true,hasDiscoverSearch:true},
                keyState:true,
                auth:2
            })

            .state('app/profile',{
                url: "/modelprofile/:id",
                templateUrl: "tpl/app/profile.html",
                controller: 'ProfileViewCtrl',
                display:{hasNav:true,bgState:1,title:'',hasReturn:true},
                auth:2
            })

            .state('app/gifts',{
                url: "/gifts",
                templateUrl: "tpl/app/gifts.html",
                controller: 'GiftsCtrl',
                display:{hasNav:true,bgState:1,title:'Gifts',hasReturn:true},
                auth:1
            })

            // ------> setup ::

            .state('settings/setup',{
                url: "/settings",
                templateUrl: "tpl/settings/setup.html",
                controller: 'SettingsCtrl',
                display:{hasNav:true,bgState:1,title:'Settings'},
                auth:1
            })

            .state('settings/info',{
                url: "/settings/info",
                templateUrl: "tpl/settings/info.html",
                controller: 'SettingsInfoCtrl',
                display:{bgState:1},
                auth:1
            })

            .state('settings/account',{
                url: "/settings/account",
                templateUrl: "tpl/settings/account.html",
                controller: 'SettingsAccountCtrl',
                display:{bgState:1},
                auth:1
            })

            .state('settings/about',{
                url: "/settings/about",
                templateUrl: "tpl/settings/about.html",
                controller: 'SettingsCtrl',
                display:{bgState:1},
                auth:1
            })

            .state('settings/discover',{
                url: "/settings/discover",
                templateUrl: "tpl/settings/discover.html",
                controller: 'SettingsDiscoverCtrl',
                display:{bgState:1},
                auth:1
            })

            .state('settings/secrets',{
                url: "/settings/secrets",
                templateUrl: "tpl/settings/secrets.html",
                controller: 'SecretsCtrl',
                display:{bgState:1},
                auth:1
            })


            //////////////////////////////////////////////////
            //////////////////////////////////////////////////
            // -----------------------> MODEL

            // ------> profile

            .state('model/profile',{
                url: "/myprofile",
                templateUrl: "tpl/model/profile.html",
                controller: 'ProfileDisplayCtrl',
                display:{hasNav:true,bgState:1,hasNotif:true,hasSettings:true},
                auth:1
            })

            // ------>

            .state('model/addmoment',{
                url: "/addmoment",
                templateUrl: "tpl/model/addmoment.html",
                controller: 'AddPositionCtrl',
                display:{hasNav:true,bgState:1,title:'New Moment',hasClose:true},
                auth:1
            })

            // ------> search ::

            .state('model/searching', {
                url: "/locationserach/:for",
                templateUrl: "tpl/model/search.html",
                controller: 'NearbyCtrl',
                display:{hasNav:true,bgState:1,hasSearch:true,title:'Nearby Places',hasClose:true,hasPadding:true},
                auth:1
            })

            // ------>

            .state('model/followers',{
                url: "/followers",
                templateUrl: "tpl/model/followers.html",
                controller: 'FollowersCtrl',
                display:{hasNav:true,bgState:1,title:'Followers',hasReturn:true},
                auth:1
            })




            // ------>
            .state('loginerror', {
                url: "/login/:errorid/",
                templateUrl: "tpl/login.html",
                controller: 'LoginCtrl',
                display:{hasNav:false,bgState:0}
            })
            .state('debug', {
                url: "/debug/",
                templateUrl: "tpl/debug.html",
                controller: 'DebugCtrl'
            });

    }).service('$global',function(){
        this.isDebug = true;
    })

//////////////////////////////////////////////////
//////////////////////////////////////////////////
// -----------------------> DIRECTIVES
    .directive('menu',function(){
        return {
            restrict        : 'AE',
            templateUrl     : 'tpl/menu.html'
        }
    })
    .directive('requirelogin',function(){
        return {
            restrict        : 'AE',
            controller      : 'RequireLoginCtrl',
            templateUrl     : 'tpl/requirelogin.html'
        }
    })

    //////////////////////////////////////////////////
    //////////////////////////////////////////////////
    // -----------------------> DEBUG

    .controller('DebugCtrl',function($scope,$stateParams,$photos,$map,$location){
        console.log('new debug ctrl');
        $scope.name = "Debug";
        $scope.params = $stateParams;
        $scope.$on('photoLoaded',function(){
            console.log('photo loaded !');
        });

        $scope.$on("$routeChangeStart", function (event, next, current){
            console.log('close DebugCtrl');
        });
        $scope.$on("$routeUpdate", function (event, next, current){
            console.log('$routeUpdate:',$stateParams);
        });
        console.log('$stateParams:',$stateParams);

        $scope.getPhoto = function(num){
            $photos.getPhoto(num);
        }

        $scope.subPage = function(num){
            switch(num){
                case 1 :
                    $location.url('debug/settings/');
                    break;
                case 2 :
                    $location.url('debug/newsfeed/');
                    break;
            }
        }
        $scope.selected = function(){
            $map.addMap(document.getElementById('maptest'),Math.random() * 40 - 20 , Math.random()*180 - 90);
        }
        $scope.selected2 = function(){
            var p = $map.getMapCoords(new google.maps.LatLng(52.4158226123788,16.936798095703125));
            var d = document.createElement('div');
            d.setAttribute('style','position:fixed;top:'+( p.y + $map.mapNode.offsetTop ) + 'px;left:'+ ( p.x + $map.mapNode.offsetLeft ) +'px;');
            d.innerHTML = "<div class='pin'></div><div class='pulse'></div>";
            document.body.appendChild(d);
        }

    })


    //////////////////////////////////////////////////
    //////////////////////////////////////////////////
    // -----------------------> FILTERS

    .filter('dateresolve', function() {
        return function(input) {
            var d = new Date(input);
            var current = new Date().getTime();
            var offset = Math.ceil((current - d.getTime())/60000);
            if(offset<60){
                return offset + ' minutes ago';
            } else if(offset<1440){
                return Math.floor(offset/60).toString() + ' hours ago';
            }
            return Math.floor(offset/1440) +' days ago';
        };
    })
    .filter('mathround',function(){
        return function(input) {
            return input ? Math.round(parseFloat(input)):"";
        };
    }).filter('countryName',function($communication){
        return function(countryCode){
            var list = $communication.globals.country;
            if(list){
                for(var i=0;i<list.length;i++){
                    if(list[i][1] == countryCode){
                        return list[i][0];
                    }
                }
            }
            return '';
        }
    })
    .filter('ageresolve',function(){
        return function(v){
            var current = new Date();
            var change = current.getTime() - new Date(v).getTime();
            return new Date(change).getFullYear() - new Date(0).getFullYear();
        }
    })