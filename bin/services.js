application.service('$communication',function($http){

    this.requestBase = {};// {email:'test1@model.com',authentication_token:'6PVgb4KxwyXHAUseE1Lr'};

    this.requestData = function(req){console.log('req :',this.requestBase)
        req = req || {};
        req.user_email = this.requestBase.email;
        req.user_token = this.requestBase.authentication_token;
        return req;
    }

    //////////////////////////////////////////////////
    //////////////////////////////////////////////////
    // ----------------------->

    this.getMyMoments = function(){
        return $http.get($http._baseURL + 'models/me/moments.json',{params :this.requestData({})});
    }
    this.addMoment = function(img , to , position){
        var params = {base64_image:img , recipient_ids:to };
        if(position){
            params.lat = position.location.lat;
            params.lng = position.location.lng;
            params.place = position.name;
        }
        return $http.post($http._baseURL + 'models/me/moments.json',this.requestData(params));
    }
    this.nearByPlaces = function(lat,lng){
        return $http.get($http._baseURL + 'places/find_nearby.json',{params :this.requestData({lat:lat, lng:lng})});
    }
    this.searchPlaces = function(lat,lng , search){
        return $http.get($http._baseURL + 'places/search.json',{params :this.requestData({lat:lat, lng:lng,search:search})});
    }
    this.addPlace = function(lat,lng , name){
        return $http.post($http._baseURL + 'places.json',this.requestData({lat:lat, lng:lng,name:name}));
    }

    this.deleteMoment = function(id){
        return $http.delete($http._baseURL + 'models/me/moments/'+id+'.json',{params :this.requestData({})});
    }

    this.followers = function(id){
        return $http.get($http._baseURL + 'models/'+id+'/followers.json',{params :this.requestData({})});
    }

    this.requestSMSCode = function(){
        return $http.get($http._baseURL + 'sms_activations/send.json',{params :this.requestData({})});
    }
    this.smsConfirm = function(code){
        return $http.get($http._baseURL + 'sms_activations/consume.json',this.requestData({sms_confirmation_token:code}));
    }
    this.getSubscriptions = function(){
        return $http.get($http._baseURL + 'subscriptions.json',{params:this.requestData({})});
    }
    this.setSubscriptions = function(id){
        return $http.put($http._baseURL + 'models/me/subscriptions.json',this.requestData({plan_id:id}));
    }

    this.getNotifications = function(){
        return $http.get($http._baseURL + 'events.json',{params:this.requestData({})});
    }
    //////////////////////////////////////////////////
    //////////////////////////////////////////////////
    // ----------------------->

    this.getModel = function(id){
        return $http.get($http._baseURL + 'models/'+id+'.json', {params :this.requestData({})});
    }

    this.getMoments = function(id){
        return $http.get($http._baseURL + 'models/'+id+'/moments.json', {params :this.requestData({})});
    }

    this.discover = function(sex , range , agemin , agemax , lat , lng){
        return $http.get($http._baseURL + 'discover.json',{params :this.requestData({lat:lat,lng:lng,radius:range,sex:sex == 1? 'male':'female' , min_age:agemin,max_age:agemax})});
    }

    this.follow = function(id){
        return $http.post($http._baseURL + 'models/'+id+'/follow.json',this.requestData({}));
    }
    this.unfollow = function(id){
        return $http.delete($http._baseURL + 'models/'+id+'/unfollow.json',{params:this.requestData({})});
    }


    this.followings = function(){
        return $http.get($http._baseURL + 'members/me/followings.json',{params :this.requestData({})});
    }

    this.newsfeed = function(id){
        return $http.get($http._baseURL + 'newsfeed.json',{params :this.requestData({})});
    }

    this.searchUsers = function(search){
        return $http.get($http._baseURL + 'search/models.json', {params :this.requestData({username:search})});
    }

    this.gifts = function(){
        return $http.get($http._baseURL + 'members/me/gifts.json', {params :this.requestData({})});
    }

    this.likeMoment = function(id){
        return $http.post($http._baseURL + 'moments/'+id+'/like.json', this.requestData({}));
    }

    this.unlikeMoment = function(id){
        return $http.delete($http._baseURL + 'moments/'+id+'/unlike.json', {params:this.requestData({})});
    }

    //////////////////////////////////////////////////
    //////////////////////////////////////////////////
    // ----------------------->

    this.signOut = function(){
        return $http.delete($http._baseURL + 'users/sign_out.json', {params:this.requestData({})});
    }


    //////////////////////////////////////////////////
    //////////////////////////////////////////////////
    // ----------------------->

    this.uploadPhoto = function(profileType,img){
        return $http.put($http._baseURL + (profileType == 1 ? 'members':'models') + '/me.json',this.requestData({base64_avatar:img}));
    }

    this.updateProfile = function(profileType,params){
        return $http.put($http._baseURL + (profileType == 1 ? 'members':'models') +'/me.json',this.requestData(params));
    }

    //////////////////////////////////////////////////
    //////////////////////////////////////////////////
    // ----------------------->

    var globals = {};
    this.globals = globals;
    this.countryList = function(trigger){
        if(this.globals.country == undefined) {
            $http.get($http._baseURL + 'countries.json', {params: this.requestData({})}).then(function (result) {
                globals.country = result.data.data;
                if(trigger)
                    trigger(globals.country);
            });
        } else {
            if(trigger)
                trigger(globals.country);
        }
    }



}).filter('countryName',function($communication){
    return function(val){
        var list = $communication.globals.country;
        if(list){
            for(var i = 0; i<list.length;i++ ){
                if(val == list[i].alpha2){
                    return list[i].name;
                }
            }
        }
        return val;
    }
});

// change
application.service('$map',function(){
    this._initialized = false;
    var proxy = this;

    this.initMap = function(){
        var mapOptions = {
            zoom: 14,
            disableDefaultUI: true,
            styles: [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#354760"},{"lightness":1}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#354760"},{"lightness":6}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#354760"},{"lightness":1}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#354760"},{"lightness":16},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#354760"},{"lightness":2}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#354760"},{"lightness":0}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#354760"},{"lightness":7}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#354760"},{"lightness":0}]},{"elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#354760"},{"lightness":26}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#354760"},{"lightness":3}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#354760"},{"lightness":4}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#354760"},{"lightness":1},{"weight":1.2}]}]
        };

        this.mapNode = document.createElement('div');
        this.mapNode.setAttribute('style','width:100%;height:100%;min-width:400px;min-height:300px;');
        if(google == undefined){
            this.mapNode.innerHTML = 'error loading google maps';
            return;
        }
        this.map = new google.maps.Map(this.mapNode, mapOptions);


        this._initialized = true;
    }

    this.addMap = function(element , lat , long){
        if(this._initialized == false){
            this.initMap();
        }
        element.appendChild(this.mapNode);
        this.map.setCenter({lat: lat || 54, lng: long || 16});
        setTimeout(function(){// safety resize
            proxy.resize();
        },100);// future stack
    }

    this.resize = function(){
        google.maps.event.trigger(proxy.map, 'resize');
    }

    this.getMapCoords = function(point){
        var latLng = point || this.map.getCenter();

        var numTiles = 1 << this.map.getZoom();
        var projection = this.map.getProjection();
        var worldCoordinate = projection.fromLatLngToPoint(latLng);
        var pixelCoordinate = new google.maps.Point(
            worldCoordinate.x * numTiles,
            worldCoordinate.y * numTiles);

        var topLeft = new google.maps.LatLng(
            this.map.getBounds().getNorthEast().lat(),
            this.map.getBounds().getSouthWest().lng()
        );

        var topLeftWorldCoordinate = projection.fromLatLngToPoint(topLeft);
        var topLeftPixelCoordinate = new google.maps.Point(
            topLeftWorldCoordinate.x * numTiles,
            topLeftWorldCoordinate.y * numTiles);

        return new google.maps.Point(
            pixelCoordinate.x - topLeftPixelCoordinate.x,
            pixelCoordinate.y - topLeftPixelCoordinate.y
        );
    }

    this.getDistance = function(lat1, lon1, lat2, lon2) {
        var radlat1 = Math.PI * lat1/180
        var radlat2 = Math.PI * lat2/180
        var radlon1 = Math.PI * lon1/180
        var radlon2 = Math.PI * lon2/180
        var theta = lon1-lon2
        var radtheta = Math.PI * theta/180
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist)
        dist = dist * 180/Math.PI
        dist = dist * 60 * 1.1515
        dist = dist * 1.609344;
        return dist;
    }
});




application.service('$overlay',function($rootScope){
    this.isLocked = false;

    this.lockPage = function(message){
        $rootScope.$broadcast('lock',message);
        this.isLocked = true;
    };
    this.unlockPage = function(){
        $rootScope.$broadcast('unlock');
        this.isLocked = false;
    };

    this.lockScroll = false;

    this.geoGathering = function(){
        $rootScope.$broadcast('lock','Receiving location ...');
        this.isLocked = true;
    }
    this.geoError = function(){
        $rootScope.$broadcast('lock','Enable geolocation to proceed.');
        this.isLocked = true;
    }
})
.controller('MomentPopupCtrl',function($scope, $map, $state , $communication , $user , $rootScope){
        $scope.current = null;
        $scope.$on('moment', function(e , moment , showMap){
            $scope.current = moment;
            //
            $scope.display(true);
            if(showMap || !$scope.current.image && $scope.current.position){
                $scope.showMap();
            } else {
                $scope.hasMap = false;
            }
        });

        $scope.showMap = function(){
            if($scope.hasMap == true){
                return;
            }
            $scope.hasMap = true;
            $map.addMap($scope.map , $scope.current.lat, $scope.current.lng);
        }

        $scope.close =  function(){
            $scope.current = null;
            $scope.display(false);
        };


        $scope.openProfile = function(){
            $state.go("app/profile" , { id:$scope.current.model.id });
            $scope.close();
        }

        $scope.canLike = true;
        $scope.like = function(){
            if($user.userType == 0){
                $rootScope.authOverlay = true;
                return;
            }
            if($scope.canLike){
                $scope.canLike = false;
                if($scope.current.liked){
                    $scope.current.liked = false;
                    $scope.current.likes_count --;
                    $communication.unlikeMoment($scope.current.id).finally(function(){
                        $scope.canLike = true;
                    });
                } else {
                    $scope.current.liked = true;
                    $scope.current.likes_count ++;
                    $communication.likeMoment($scope.current.id).finally(function(){
                        $scope.canLike = true;
                    });
                }
            }
        }
    }
)

.directive('momentpopup',function($overlay){
    return {
        restrict:'A',
        link:function(scope, element, attrs){
            scope.display = function(visible) {

                if (visible) {
                    element.show();
                    //$overlay.lockScroll = true;
                    //$('[useBlur]').addClass('filter-blur');
                } else {
                    element.hide();
                    $overlay.lockScroll = false;
                    //$('[useBlur]').removeClass('filter-blur');
                }
            }

            $('.popupclose').click(function(e){
                if(e.currentTarget == e.target){
                    scope.display(false);
                }
            })

            //console.log(element.find('.container'));
            /*
            var container = element.find('.container');
            container.scrollTop(1);
            container.scroll(function(e){

                var p = container.scrollTop();
                //console.log('trigger:',e);
                if(p == 0){
                    container.scrollTop(1);
                    e.preventDefault();
                }
                //console.log($(window).height(),p, element.height(), container.height());
                if($(window).height() >= element.height()){
                    //container.scrollTop(element.height()-1);
                    e.preventDefault();
                }
            })*/
            scope.map = element.find('.gmap')[0];
            scope.background = element.find('.popup');
        },
        templateUrl:'tpl/popup/moment.html'
    }
})
.controller('SetupPopupCtrl',function($scope , $rootScope , $user){

    $scope.$on('momentedit', function(e , moment ) {
        $scope.displaySetup(true);
        $scope.current = moment;
    });

    $scope.deleteMoment = function(){
        $rootScope.$broadcast('deletemoment',$scope.current);
        $scope.current = null;
        $scope.close();
    }

    $scope.close = function(){
        $scope.displaySetup(false);
    }
}) // ng-controller="SetupPopupCtrl"
.directive('setuppopup',function($overlay){
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.displaySetup = function(visible) {
                    if (visible) {
                        element.show();
                        $overlay.lockScroll = true;
                       // $('[useBlur]').addClass('filter-blur');
                    } else {
                        element.hide();
                        $overlay.lockScroll = false;
                        //$('[useBlur]').removeClass('filter-blur');
                    }
                }
            },
            controller:'SetupPopupCtrl',
            templateUrl:'tpl/popup/momentedit.html'
        }
    })
.directive('termspopup',function($rootScope){
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.display = function(v){
                    if(v){
                        element.show();
                    } else {
                        element.hide();
                    }
                }
            },
            templateUrl:'tpl/popup/terms.html',
            controller:function($scope){
                $scope.$on('openterms', function(e , moment ) {
                    $scope.display(true);
                });
                $scope.termsAgree = function(val){
                    $scope.display(false);
                    $rootScope.$broadcast('terms',val);
                }
            }
        }
    })
    .directive('logout',function($rootScope){
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                scope.displayLogout = function(v){
                    if(v){
                        element.show();
                    } else {
                        element.hide();
                    }
                }
            },
            templateUrl:'tpl/popup/logout.html',
            controller:function($scope){
                $scope.$on('openlogout', function(e , moment ) {
                    $scope.displayLogout(true);
                });
                $scope.logout = function(val){
                    $scope.displayLogout(false);
                    $rootScope.$broadcast('logout',val);
                }
            }
        }
    })



/*
 events ::
 -> photoLoaded     success:boolean

 */


application.service('$photos',function($rootScope,$global){

    this._chooseTpl = '<input type="file" accept="image/*">';
    //this._captureTpl = '<input type="file" accept="image/*" capture="camera">';

    var proxy = this;


    /*
    where galery is 1;
     */
    this.getPhoto = function(galeryOrCamera , callback){
        if(proxy.currentChoose != null){
            $(proxy.currentChoose.node).unbind('change');
            $(proxy.currentChoose.node).remove();
        }

        proxy.currentChoose = {cb:callback};

        var d = document.createElement('div');
        d.setAttribute('style','display:none');
        d.innerHTML = this._chooseTpl;// (galeryOrCamera == 1)?proxy._chooseTpl:proxy._captureTpl;
        document.body.appendChild(d);
        var query = $(d).find('input');
        proxy.currentChoose.node = d;
        proxy.currentChoose.state = 0;

        query.change(this.chooseCallback);

        query.one("click", function () {
            var cancelled = false;
            setTimeout(function () {
                $(document).one("mousemove.filesSelector focusin.filesSelector", function () {
                    if (query.val().length === 0 && !cancelled) {
                        console.log('cancelled!');
                        cancelled = true;
                        // todo :: broadcast cancel
                    }
                });
            }, 1);
        })
        query.trigger('click');
    }

    // TODO :: Defer ?
    this.chooseCallback = function(event){
        proxy.selectedFile = event.target.files[0];
        $rootScope.$broadcast('photoLoaded',{success:proxy.selectedFile == null?false:true});
    }

    this.convertToImage = function(toApply){
        var reader = new FileReader();
        reader.onload = function(event) {
            toApply(event.target.result);
        }
        reader.readAsDataURL(this.selectedFile);
    }

    this.hasImage = function(){
        return this.selectedFile ? true:false;
    }

    this.clear = function(){
        this.selectedFile = null;
        this.currentChoose = null;
    }
})
/*
    events ::
    -> login
    -> logout




    userType -> 0 unknown , 1 user , 2 model;

 */

application.service('$user',function($http,$rootScope,$q,$communication){
//////////////////////////////////////////////////
//////////////////////////////////////////////////
// -----------------------> values ::

    var proxy = this;
    this.isLogged = false;
    this.userData;
    this.userLocal;
    this.userLogin;
    this.appData;

    // model = 2 / user = 1
    this.userType = 0;

    this.login = function(user , pass){
        this.userLogin = {e:user,p:pass};
        return $http.post($http._baseURL + "users/sign_in.json",{email:user , password:pass});
    }
    this.logout = function(){
        this.userData = null;
        this.userLocal = null;
        this.userLogin = null;
        this.userType = 0;
        this.setAuthData(null,null);
        this.clearLocal();
        this.isLogged = false;
        this.createCleanup();
        return $communication.signOut();
    }

    this.remindPassword = function(identification) {
        return $http.post($http._baseURL + "users/password.json",{username_or_email:identification});
    }

    this.checkLogin = function(){
        return $q(function (resolve, reject) {
            // stored login ::
            proxy.loadLocal();
            if (proxy.userLogin) {
                proxy.login(proxy.userLogin.e, proxy.userLogin.p).then(function(data){
                    proxy.setUserData(data.data.data);
                    resolve();
                }, reject);
            } else {
                console.log('auto login rejected !');
                reject();
            }
        });
    }


    this.setUserData = function(data){
        console.log('setUserData:',data);
        this.isLogged = true;
        this.userData = data;
        this.userType = data.type == 'Member' ? 1:2;
        this.createCleanup();// after login remove trash data
        if(this.userType == 0){
            return;
        }
        this.setAuthData(this.userData.email,this.userData.authentication_token);
        this.saveLocal();
    }
    this.setAuthData = function(email , token){
        $communication.requestBase.email = email;
        $communication.requestBase.authentication_token = token;
    }


    //////////////////////////////////////////////////
    //////////////////////////////////////////////////
    // -----------------------> check login::
    // this.userType = 1;
    // this.login(1,2);


    //////////////////////////////////////////////////
    //////////////////////////////////////////////////
    // -----------------------> SAVE LOCAL

    this.saveLocal = function(){
        localStorage.setItem('userLocal', JSON.stringify(this.userLocal));
        localStorage.setItem('userData', JSON.stringify(this.userData));
        localStorage.setItem('userLogin',JSON.stringify(this.userLogin));
        localStorage.setItem('appData',JSON.stringify(this.appData));
        localStorage.setItem('userRegister',JSON.stringify(this.create));
    }
    this.loadLocal = function(){
        try {
            this.userLocal = JSON.parse(localStorage.getItem('userLocal')) || {
                discover: {
                    lookingFor: 1,
                    range     : 40,
                    minAge    : 18,
                    maxAge    : 30
                }
            };
            this.userData = JSON.parse(localStorage.getItem('userData'));
            this.userLogin = JSON.parse(localStorage.getItem('userLogin'));
            this.appData = JSON.parse(localStorage.getItem('appData'));
            this.create = JSON.parse(localStorage.getItem('userRegister'));
        } catch (e){
            this.clearLocal();
        }

    }


    this.clearLocal = function(){
        localStorage.removeItem('userLocal');
        localStorage.removeItem('userData');
        localStorage.removeItem('userLogin');
        localStorage.removeItem('userRegister');
        this.userLocal = JSON.parse(localStorage.getItem('userLocal')) || {
            discover: {
                lookingFor: 1,
                range     : 40,
                minAge    : 18,
                maxAge    : 30
            }
        };
    }

    this.loadLocal();


    //////////////////////////////////////////////////
    //////////////////////////////////////////////////
    // -----------------------> LOCATION ::
    this.updateLocation = function(lat,lng,name) {
        $communication.updateProfile(2, {
            lat  : lat,
            lng  : lng,
            place: name
        }).then(function (result) {
            proxy.setUserData(result.data.data);
        }, function (error) {
            console.log(error);
        });
    }

    //////////////////////////////////////////////////
    //////////////////////////////////////////////////
    // -----------------------> FOLLOWS ::
    this.followModel = function(id){
        $communication.follow(id).then(function(result){
            proxy.userFollowing = result.data.data;
            proxy.userData.followings_count = result.data.data.length;
        });
    }

    this.checkFollow = function(id){
        if(this.userFollowing == null){
            return false;
        }
        for(var i = 0 ;i<this.userFollowing.length ; i++){
            if(this.userFollowing[i].id == id){
                return true;
            }
        }
        return false;
    }

    this.updateFollowers = function(){
        $communication.followings().then(function(result){
            proxy.userFollowing = result.data.data;
            proxy.userData.followings_count = proxy.userFollowing.length;
        })
    }

    this.removeFollow = function(id){
        for(var i = 0 ;i<proxy.userFollowing.length ; i++){
            if(proxy.userFollowing[i].id == id){
                proxy.userFollowing.splice(id,1);
                break;
            }
        }
        $communication.unfollow(id).then(function(result){
            proxy.userData.followings_count = result.data.length;
        });
    }



    //////////////////////////////////////////////////
    //////////////////////////////////////////////////
    // -----------------------> SECURITY / DATA CONCAT ::


    //////////////////////////////////////////////////
    //////////////////////////////////////////////////
    // -----------------------> CREATE ACCOUNT

    this.createAccount = function (type){
        this.create = {email:'',password:'',image:null , type:type};
        this.create.urlType = type == 1 ? 'members':'models';
        this.saveLocal();
    }
    this.createUsername = function (email , password){
        this.create.email = email;
        this.create.password = password;
        this.saveLocal();
        return $http.post($http._baseURL + proxy.create.urlType + '.json' ,{email:email,password:password});
    }
    this.createAuthData = function(data){
        this.create.auth = data;
        this.setAuthData(data.email, data.authentication_token)
        this.saveLocal();
    }
    // partial :: for passive upload ?
    this.createImage = function (image){
        this.create.image = image;
        this.saveLocal();
    }
    this.createDisplayName = function(displayName){
        var params = {username:displayName};
        if(this.create.image){
            params.base64_avatar = this.create.image;
        }
        this.create.displayName = displayName;
        this.saveLocal();
        return $http.put($http._baseURL + proxy.create.urlType + '/me.json',$communication.requestData(params));
    }
    this.createSMSRequest = function(phone,country){
        proxy.create.phone = phone;
        proxy.create.country = country;
        this.saveLocal();
        return $http.put($http._baseURL + proxy.create.urlType + '/me.json',$communication.requestData({phone:phone,country:country}));
    }

    this.createSMSCode = function(code){
        return $http.post($http._baseURL + 'sms_activations/consume.json',$communication.requestData({code:code}));
    }
    this.createPlan = function(plan){
        proxy.create.plan = plan;
        this.saveLocal();
    }

    this.createCleanup = function(){
        localStorage.removeItem('userRegister');
        this.create = null;
    }
    if(this.create && this.create.auth){
        this.setAuthData(this.create.auth.email,this.create.auth.authentication_token);
    }

    //////////////////////////////////////////////////
    //////////////////////////////////////////////////
    // ----------------------->
    this.newUserLogin = function(){
        proxy.login(proxy.create.email,proxy.create.password);
    }

    //////////////////////////////////////////////////
    //////////////////////////////////////////////////
    // -----------------------> UTILS ::
    this.countryList = function(){
        return $http.get($http._baseURL + 'countries.json');
    }
})
application.directive('scrollslider',function(){
    return {
        link:function(scope,element,attrs){
            var d = {size:parseInt(attrs.scrolloffset || attrs.scrollsize) , target:$(attrs.scrollslider == 'this' ? element : attrs.scrollslider ) ,window:$(window)};
            if(attrs.scrolloffset){
                var el = $('<div style="height: '+d.size+'px"></div>');
                element.prepend(el);
                //el.animate({height: d.size},500);
            }


            d.target.bind("scroll",function(e){
                var update = d.target.scrollTop();
                if(update < d.size){
                    if(!d.animating){
                        scope.updateScroll();
                        scope.$emit('scrollslider');
                    } else if(update < d.last){
                        scope.updateScroll();
                    }
                }
                d.last = update;
            });

            d.animationEnd = function(){
                d.animating = false;
            }

            scope.updateScroll = function(){
                d.animating = true;
                d.target.clearQueue().stop().delay(250).animate({
                    scrollTop: (d.size + 2)
                }, (d.size - d.last) * 5 , d.animationEnd);
            }

            scope.$on('$destroy' , function(){
                d.window.unbind('scroll');
            })
        },
        restrict: 'A'
    }
}).service('$DelayCall',function(){
    function DelayCall(callback,scope){
        this._i = undefined;// timeout id
        this._c = callback;
        this._s = scope;
    }
    DelayCall.prototype.call = function(delay){
        if(!isNaN(this._i)){
            clearTimeout(this._i);
        }
        this._i = setTimeout(util.delegate(this._c,this._s),delay);
    }
    DelayCall.prototype.cancel = function(){
        if(!isNaN(this._i)){
            clearTimeout(this._i);
            this._i = undefined;
        }
    }

    return DelayCall;
}).directive('setwindowheight',function($rootScope){
    return {
        link:function(scope,element,attrs){
            var offset = parseInt(attrs['setwindowoffset']);
            function resize(){
                element.css({'height': ($rootScope.pageHeight - offset)});
            }
            resize();
            scope.$on('resize',resize);
        },
        restrict: 'A'
    }
});