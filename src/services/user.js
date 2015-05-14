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