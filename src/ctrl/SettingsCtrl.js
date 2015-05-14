application.controller('SettingsCtrl',function($scope , $rootScope , $user , $photos,$state,$communication,$overlay){
    $scope.user = $user.userData;
    $scope.userType = $user.userType;
    if($scope.userType != 0){
        $scope.photo = $scope.user.avatar.standard_resolution.url;
    }

    switch ($scope.userType){
        case 0:
            $rootScope.hasReturn = true;
            $scope.$on('menureturn',function(){
                $state.go('app/discover');
            })
        case 1:
            $rootScope.hasOptions = true;
            break;
        case 2 :
            $rootScope.hasReturn = true;
            $scope.$on('menureturn',function(){
                $state.go('model/profile');
            })
            break;
    }

    // depends on userType , change 1 or 5
    $scope.changePhoto = function(){
        $photos.getPhoto();
    }

    $scope.asyncPhoto = function(imgsrc){
        $user.photo = imgsrc;
        $overlay.lockPage();
        $communication.uploadPhoto($scope.userType,imgsrc).then(function(result){
            $overlay.unlockPage();
            $user.setUserData(result.data.data);
            $scope.photo = $scope.user.avatar.standard_resolution.url;console.log('set url:',$scope.user.avatar.standard_resolution.url);
        },function(){
            $overlay.unlockPage();
        });
    }
    $scope.$on('photoLoaded',function(evt ,result){
        if(result.success){
            $photos.convertToImage(util.delegate($scope.asyncPhoto,$scope));
        }
    })

    $scope.logout = function(){
        $user.logout();
        $state.go('start');
    }

    $scope.openTerms = function(){
        $rootScope.openTerms();
    }
    /*
    $(".photo320").on("swipe",function(){
        $(".photo320").animate({left:'100%'},1000);//.hide();console.log('do swipe');
    });*/

})
.controller('SettingsInfoCtrl',function($scope , $user , $state , $communication , $DelayCall){
        $scope.profile = $user.userData;
        $scope.username = $scope.profile.username;
        $communication.countryList(function(data){
            $scope.countryList = data;
        });

        $scope.$watchCollection('profile',function(){
            $scope.hasChange = true;
            if(new Date($scope.profile.birth_date) == 'Invalid Date'){
                $scope.dateError = true;
            } else {
                $scope.dateError = false;
            }
        });

        $scope.$watch('username',function(val){
            if(val.length < 4){
                $scope.nameError = true;
            } else {
                $scope.nameError = false;
            }
        })


        $scope.editNameEnd = function(){
            $communication.updateProfile($user.userType,{username:$scope.username}).then(function(result){
                if(result.data.state.code == 1){
                    $scope.nameError = true;
                } else {
                    $scope.nameError = false;
                    $user.setUserData(result.data.data);
                }
            });
        }
        /*
        $scope.changeName = new $DelayCall(function(){console.log($("input#usernameInput").is(":focus"));
            if($("input#usernameInput").is(":focus")){
                $communication.updateProfile($user.userType,{displayName:$scope.profile.username}).then(function(result){
                    console.log(result);
                });
            } else {
                $scope.changeName.call(500);
            }
        });

        $scope.$watch('username', function (val) {console.log(val, $scope.profile.username);
            if (val != $scope.profile.username) {
                $scope.changeName.call(500);
            }
        });*/

        $scope.saveAndReturn = function(){
            if($scope.hasChange){
                var update = {};
                var keys = ['username','sex','birth_date','country','languages'];
                for(var i = 0 ; i<keys.length ; i++ ){
                    update[keys[i]] = $scope.profile[keys[i]];
                }
                $communication.updateProfile($user.userType,update).then(function(result){
                    $user.userData = result.data.data || $user.userData;
                    $state.go('settings/setup');
                },function(){
                    $state.go('settings/setup');
                });

                return;
            }

            $state.go('settings/setup');
        }
})
.controller('SettingsDiscoverCtrl',function($scope,$user,$rootScope){
        $scope.lookingFor = $user.userLocal.discover.lookingFor;
        $scope.range = $user.userLocal.discover.range;
        $scope.minAge = $user.userLocal.discover.minAge;
        $scope.maxAge = $user.userLocal.discover.maxAge;

        $scope.update = function(){
            $user.saveLocal();
        }

        $scope.$watch('lookingFor',function(v){
            $user.userLocal.discover.lookingFor = v;
            $scope.update();
        })
        $scope.$watch('range',function(v){
            $user.userLocal.discover.range = v;
            $scope.update();
        })
        $scope.$watch('minAge',function(v){
            $user.userLocal.discover.minAge = v;
            $scope.update();
        })
        $scope.$watch('maxAge',function(v){
            $user.userLocal.discover.maxAge = v;
            $scope.update();
        })

        $scope.$on('$destroy',function(){
            $rootScope.$broadcast('updateDiscover');
        })
    })
.controller('SecretsCtrl',function($scope , $user , $state , $communication){
        $scope.profile = $user.userData;
        $scope.hasChange = false;
        var initSet = true;
        $scope.$watchCollection('profile',function(){
            if(initSet){
                initSet = false;
                return;
            }
            $scope.hasChange = true;
        });

        $scope.saveAndReturn = function(){
            if($scope.hasChange){
                var update = {};
                var keys = ['breast','height','piercing','tatoos','shaved'];
                for(var i = 0 ; i<keys.length ; i++ ){
                    update[keys[i]] = $scope.profile[keys[i]];
                }
                $communication.updateProfile($user.userType,update).then(function(result){
                    $user.userData = result.data.data;
                    $state.go('settings/setup');
                });
                return;
            }

            $state.go('settings/setup');
        }
    })
.controller('SettingsAccountCtrl',function($scope, $user , $communication,$state){
        console.log($user.userData);
        $scope.user = $user.userData;


        $communication.countryList(function(list){
            for(var i=0 ; i<list.length;i++){
                if(list[i].alpha2 == $scope.user.country){
                    $scope.phoneProxy = '+' + list[i].country_code;
                    $scope.phone = ($scope.user.phone.split(' ').join('').indexOf($scope.phoneProxy) == 0 ?  '' :  $scope.phoneProxy) + $scope.user.phone;
                    return;
                }
            }
        })

        $scope.email = $scope.user.email;
        $scope.emailEdit = function(){
            if($scope.email == $scope.user.email) {
                return;
            }
            $communication.updateProfile($user.userType,{email:$scope.email}).then(function(result){
                $user.userData = result.data.data;
            });

        }
        $scope.passwordEdit = function(){
            if($scope.password == $scope.user.password || $scope.password.length <6) {
                return;
            }
            $communication.updateProfile($user.userType,{password:$scope.password}).then(function(result){
                $user.userData = result.data.data;
            });

        }


        $scope.$watch('phone',function(val){
            if($scope.phoneProxy && val.indexOf($scope.phoneProxy) != 0){
                $scope.phone = $scope.phoneProxy + ' ';
                return;
            }
        })
        $scope.phoneEditEnd = function(){
            if($scope.phone == $scope.user.phone){
                return;
            }
            $communication.updateProfile($user.userType,{phone:$scope.phone}).then(function(result){
                $user.userData = result.data.data;
                /*
                $communication.requestSMSCode().then(function(result){
                    console.log('sms sent');
                }, function (error) {
                    console.log('sms request error:',error);
                });*/
            });

        }

        $scope.changeSubscription = function(){
            $state.go('auth/subscription');
        }
        $scope.cancelSubscription = function(){
            //$state.go('auth/subscription');
        }
        $scope.billing = '1234 1234 1234 1234'

    });