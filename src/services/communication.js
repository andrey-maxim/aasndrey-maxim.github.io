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