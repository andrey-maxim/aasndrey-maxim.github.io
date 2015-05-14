//////////////////////////////////////////////////
//////////////////////////////////////////////////
// -----------------------> LOGIN
application.controller('LoginCtrl',function($scope, $user , $state ) {


    $scope.auth = {login:"",password:""};

    $scope.$watchCollection('auth', function(val){
        var a = $scope.auth;
        $scope.canLogin = (a.login && a.login.length>6) && (a.password && a.password.length>8);
    });


    $scope.signin = function(){
        $scope.hasError = null;
        $scope.hasEmailError = null;
        $scope.hasPasswordError = null;
        if(!$scope.auth.login){
            $scope.isWrongEmail = true;
            $scope.hasError = true;
            if($scope.auth.login === undefined){
                $scope.hasEmailError = 'Wrong email';
            } else {
                $scope.hasEmailError = 'Type email';
            }
        } else {
            $scope.isWrongEmail = false;
        }
        if($scope.auth.password == '' || $scope.auth.password.length < 8 ){
            $scope.isWrongPassword = true;
            $scope.hasError = true;
            $scope.hasPasswordError = 'Password is too short';
        } else {
            $scope.isWrongPassword = false;
        }
        if($scope.hasError){
            return;
        }



        $user.login($scope.auth.login , $scope.auth.password).then(function(result){
            var errors = result.data.errors;
            if(errors) { // has errors ::
                if (errors.email && errors.email.length > 0) {
                    $scope.isWrongEmail = true;
                    $scope.hasError = true;
                    $scope.hasEmailError = 'Email ' + errors.email[0];
                }
                if (errors.password && errors.password.length > 0) {
                    $scope.isWrongPassword = true;
                    $scope.hasError = true;
                    $scope.hasPasswordError = 'Password ' + errors.password[0];
                }
                return;
            }


            $user.setUserData(result.data.data);
            $state.go('main');
        },function(){
            $scope.invalidLogin();
        });
    }

    $scope.invalidLogin = function(){
        $scope.isWrongEmail = true;
        $scope.isWrongPassword = true;
        $scope.hasError = true;
        $scope.hasEmailError = 'Wrong email or password';
    }

    // init from creating account ::
    if($user.create){
       $scope.login = $user.create.email;
       $scope.password = $user.create.password;
    }

    $scope.clearEmail = function(){
        $scope.auth.login = '';
    }
    $scope.clearPass = function(){
        $scope.auth.password = '';
    }
    //$scope.isWrongUsername = true;
    })
    .controller('ReminderCtrl',function($scope, $user,$state , $overlay) {
        $scope.remind = function(){
            $overlay.lockPage();
            $user.remindPassword($scope.username).then(function(result){
                console.log('remind data:',result);
                $overlay.unlockPage();
                if(result.data.state.code == 0) {
                    $state.go('start');
                    return;
                }
                $scope.errorMessage = 'Invalid email or username';// result.data.error.
                },function(error){
                // on error
                $overlay.unlockPage();
                $scope.errorMessage = 'Server error , try again later.';
            });
        }
    })
//////////////////////////////////////////////////
//////////////////////////////////////////////////
    // -----------------------> CREATE ACCOUNT :: UNIVERSAL PART

    .controller('NewUserCtrl',function($scope, $user , $state) {
        if($user.create == null){
            $state.go('start');
            return;
        }
        $scope.auth = {};
        $scope.isModel = $user.create.type == 2;
        $scope.auth.email = $user.create.email || '';
        $scope.auth.password = $user.create.password || '';

        $scope.$watchCollection('auth',function(v){
            $scope.canRegister = $scope.auth.email && $scope.auth.password && $scope.auth.email.length >8 && $scope.auth.password.length>8;
        });

        $scope.proceed = function(){
            // verify login and pass
            $scope.hasError = null;
            $scope.hasEmailError = null;
            $scope.hasPasswordError = null;
            if(!$scope.auth.email){
                $scope.isWrongEmail = true;
                $scope.hasError = true;
                if($scope.auth.email === undefined){
                    $scope.hasEmailError = 'Wrong email';
                } else {
                    $scope.hasEmailError = 'Type email';
                }
            } else {
                $scope.isWrongEmail = false;
            }
            if($scope.auth.password == '' || $scope.auth.password.length < 8 ){
                $scope.isWrongPassword = true;
                $scope.hasError = true;
                $scope.hasPasswordError = 'Password is too short';
            } else {
                $scope.isWrongPassword = false;
            }
            if($scope.hasError){
                return;
            }

            $user.createUsername($scope.auth.email,$scope.auth.password).then(function(result){
                var errors = result.data.errors;
                if(errors) { // has errors ::
                    if (errors.email && errors.email.length > 0) {
                        $scope.isWrongEmail = true;
                        $scope.hasError = true;
                        $scope.hasEmailError = 'Email ' + errors.email[0];
                    }
                    if (errors.password && errors.password.length > 0) {
                        $scope.isWrongPassword = true;
                        $scope.hasError = true;
                        $scope.hasPasswordError = 'Password ' + errors.password[0];
                    }
                    return;
                }
                // no serverside errors ::
                $user.createAuthData(result.data.data);
                $state.go('auth/image');
            },function(error){
                $scope.hasError = 'Could not create account';
                $scope.isWrongEmail = true;
                $scope.isWrongPassword = true;
            });
        }

        $scope.clearEmail = function(){
            $scope.auth.email = '';
        }
        $scope.clearPass = function(){
            $scope.auth.password = '';
        }
    // ------>
    }).controller('NewUserImageCtrl',function($scope, $user ,$state , $photos , $overlay) {
        // init load ::
        if($user.create == null){
            $state.go('start');
            return;
        }
        // SAVED DATA
        $scope.isModel = $user.create.type == 2;
        $scope.displayName = '@' + ($user.create.displayName || '' );
        $scope.imgsrc = $user.create.image;
        $scope.$watch('displayName',function(val){
            $scope.canProceed = val.length > 4;
        })

        $scope.updateDisplayName = function(){
            if($scope.displayName.indexOf('@') != 0){
                $scope.displayName = '@' + $scope.displayName.split('@').join('');
            }
            $scope.displayName = $scope.displayName.toLocaleLowerCase();
        }
        $scope.clearName = function(){
            $scope.displayName = '@';
        }

        $scope.selectImage = function(){
            $photos.getPhoto();
        }
        $scope.removeImage = function(){
            $scope.imgsrc = null;
        }


        $scope.$on('photoLoaded',function(e,data){
            if(data.success == false){
                // operation cancelled
                return;
            }
            var reader = new FileReader();
            reader.onload = function(event) {
                var imgData = event.target.result;
                $user.createImage(imgData);
                $scope.imgsrc = imgData;

                var img = new Image();
                img.src = imgData;
                $scope.imageStyle = {'background-image':"url('" + imgData + "')"};
                var scale = img.width / img.height;
                if(img.width>img.height){
                    $scope.imageStyle['background-size'] = '71px ' + Math.floor(71 / scale) + 'px';
                } else {
                    $scope.imageStyle['background-size'] =  Math.floor(71 * scale) + 'px 71px';
                }

                $scope.$apply();
            };
            reader.readAsDataURL($photos.selectedFile);
        })

        $scope.process = function () {
            if(!$scope.canProceed){
                if($scope.displayName.length < 4){
                    $scope.hasError = 'Username too short';
                }
                return;
            }
            $overlay.lockPage();
            $user.createDisplayName($scope.displayName.substr(1)).then(
                function(result){
                    $overlay.unlockPage();
                    if(result.data.state.code != 0){
                        var errors = result.data.errors;
                        if(errors.username){
                            $scope.hasError = 'Username ' +result.data.errors.username[0];
                        }
                        if(errors.base64_avatar){
                            $scope.hasError = 'Image ' +result.data.errors.base64_avatar[0];
                        }
                        return;
                    }

                    if($scope.isModel){
                        $state.go('auth/code');
                    } else {
                        // todo : create account
                        //$user.newUserLogin();
                        //
                        $state.go('auth/login');
                    }
                },function(error){
                    $overlay.unlockPage();
                    console.log('createDisplayName error:',error);
                }
            );


        }

    })
    //////////////////////////////////////////////////
    //////////////////////////////////////////////////
    // -----------------------> MODEL PART
    .controller('NewUserCodeCtrl',function($scope, $user , $state , $overlay , $communication , $rootScope) {

        $user.countryList().then(function(data){
            $scope.countryList = data.data.data;
        })

        if($user.create == null){
            $state.go('start');
            return;
        }
        // data if back clicked ::
        //$scope.phone = $user.create.phone,country:$user.create.country};
        //.phone = phone:$user.create.phone,country:$user.create.country};


        /*
        $scope.verifyPhone = function(){
            var numberPattern = /\d+/g;
            if(!/^\d+$/.test($scope.data.phone)){
                var p = $scope.data.phone.match( numberPattern );
                if(p){
                    $scope.data.phone = p.join('');
                } else {
                    $scope.data.phone = '';
                }
            }$scope.canProceed();
        }*/


        $scope.phoneError = false;
        $scope.phone = "";
        $scope.data = {countryNum:null};
        $scope.$watch('data.countryNum',function(val){
            if($scope.countryList == null){
                return;
            }
            $scope.country = $scope.countryList[val];
            for(var i=0 ; i<$scope.countryList.length;i++){
                if($scope.countryList[i].alpha2 == val){
                    $scope.country = $scope.countryList[i];
                }
            }
            if($scope.country == null){
                return;
            }
            $scope.phoneMin = Number.POSITIVE_INFINITY;
            $scope.phoneMax = 0;
            $scope.phonebase = $scope.phone = '+'+$scope.country.country_code + ' ';
            var nLen = $scope.country.national_number_lengths;
            for(var i = 0 ; i < nLen.length ; i++){
                $scope.phoneMin = Math.min(nLen[i],$scope.phoneMin);
                $scope.phoneMax = Math.max(nLen[i],$scope.phoneMax);
            }
            // scope on phone number :: skip directive
            document.getElementById('PhoneNumber').focus();
        });



        $scope.$watch('phone',function(val){
            $scope.phoneError = false;
            if($scope.phone == undefined || $scope.phonebase == undefined){
                $scope.phoneError = true;
                return;
            }
            if(val.indexOf($scope.phonebase) != 0){
                $scope.phone = $scope.phonebase + ' ';
                return;
            }
            var pLen = $scope.phone.substr($scope.phonebase.length).split(' ').join('').length;
            if(pLen < $scope.phoneMin){
                $scope.phoneError = 'Phone too short';
            }
            if(pLen > $scope.phoneMax){
                $scope.phoneError = 'Phone too long';
            }

            $scope.canProceed = $scope.country && ($scope.phoneError == false);
        });


        $scope.proceed = function(){
            //$scope.verifyPhone();
            if(!$scope.canProceed){
                return;
            };
            // send request with phone :
            $overlay.lockPage();
            $user.createSMSRequest($scope.phone ,$scope.country.alpha2).then(function(result){
                console.log('createSMSRequest:',result);

                $communication.requestSMSCode().then(function(){
                    $overlay.unlockPage();
                    if(result.data.state.code == 0){
                        $state.go('auth/codeconfirm');
                    } else {
                        console.log('server error :',result);
                    }
                })


            },function(){
                // handle error::
                $overlay.unlockPage();
                console.log('sms proceed error :',arguments);
            });
        }

        $scope.openTerms = function(){
            $rootScope.openTerms();
        }
        $scope.clearPhone = function(){
            $scope.phone = '';
        }

    }).controller('NewUserConfirmCtrl',function($scope,$user,$state){
        $scope.proceed = function() {
            $scope.smsError =null;
            $user.createSMSCode($scope.code).then(function (result) {
                if(result.data.state.code == 1 && window.isdebug.passCode == false){
                    $scope.smsError = 'Invalid code';
                    return;
                }
                $state.go('auth/subscription');
            }, function () {
                $scope.smsError = 'Invalid code';
                console.log('sms error:', arguments);
            })
        }
        $scope.back = function(){

        }

        $scope.clearSms = function(){
            $scope.code = '';
        }

    }).controller('SubscriptionCtrl',function($scope,$user,$state,$communication){
        $communication.getSubscriptions().then(function(result){
            $scope.subscriptions = result.data.data;
            $scope.current = 0;
            /*
            setTimeout(function(){
                var query = $('.swipe .item');
                if(query.length==1){
                    query.addClass('current');
                } else {
                    query.eq(0).addClass('left');
                    query.eq(1).addClass('current');
                    query.eq(2).addClass('right');
                }


                $(".swipe").swipe( {
                    swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
                        var item = $(".swipe").find(".item.current");

                        if (direction === 'left' && item.next(".item").size() > 0) {
                            item.removeClass("current").addClass("left");
                            item.next().removeClass("right").addClass("current").next().removeClass("right-hide").addClass("right");
                            item.prev().removeClass("left").addClass("left-hide")
                        }
                        if (direction === 'right' && item.prev(".item").size() > 0) {
                            item.removeClass("current").addClass("right")
                            item.prev().removeClass("left").addClass("current").prev().removeClass("left-hide").addClass("left");
                            item.next().removeClass("right").addClass("right-hide")
                        }
                    },
                    threshold:30
                });
            },0);*/
        })
        // ------> to test

        $(".swipe").swipe( {
            swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
                var index;
                if(direction == 'left' && ($scope.current < $scope.items.length-1 )){
                    index = $scope.current + 1;
                } else if(direction == 'right' && $scope.current > 0) {
                    index = $scope.current - 1;
                }

                if(!isNaN(index)){
                    for(var i = 0 ; i < $scope.items.length ; i++){
                        $scope.items[i].animate({left:(12.5 + (i - index) * 77.5)+'%'},500);
                    }
                    $scope.current = index;
                }
            },
            threshold:30
        });


        $scope.selectPlan = function(subscription){console.log(subscription);
            $communication.setSubscriptions(subscription.id).then(function(){
                $state.go('auth/billing');
            })

        };
    }).directive('subscription',function(){
        return {
            link:function(scope,element,attrs){
                scope.$parent.items = scope.$parent.items || [];
                scope.$parent.items.push(element);
                var index = attrs['subscription'];
                element.css({left:(12.5 + index * 77.5 ) +'%'});
            },
            restrict:'A'
        }
    })

    //////////////////////////////////////////////////
    //////////////////////////////////////////////////
    // ----------------------->
    .controller('BillingCtrl', function($scope,$state){
        $scope.cvc = 'codeCVC';
        $scope.proceed = function(){
            if($scope.cvc == ''){
                $scope.isWrongCvc = true;
                return;
            }
            $state.go('auth/paymentcomplete');
        }
    }).controller('PaymentCompleteCtrl',function($scope,$state,$user){
        $scope.proceed = function(){
            // debug ::
            //$user.userType = 2;
            //$user.login();
            //
            $state.go('auth/login');
        }
    })
.controller('RequireLoginCtrl',function($scope,$state,$rootScope,$user){
        $scope.openUser = function(){
            $user.createAccount(1);
            $state.go('auth/newuser');
            $rootScope.authOverlay = false;
        }
        $scope.openModel = function(){
            $user.createAccount(1);
            $state.go('auth/newuser');
            $rootScope.authOverlay = false;
        }

        $scope.openConnect = function(){
            $state.go('auth/login');
            $rootScope.authOverlay = false;
        }
        $scope.openClose = function(){
            $state.go('auth/login');
            $rootScope.authOverlay = false;
        }

        $scope.close = function(){
            $rootScope.authOverlay = false;
        }
    })
application.controller('ProfileDisplayCtrl',function($scope , $rootScope,$photos,$state,$user,$communication){

    $scope.option = 0; //

    $scope.profile = $user.userData;
    $rootScope.title = $scope.profile.userName;

    // get moments ::
    $scope.updateMoments = function() {
        $communication.getMyMoments().then(function (result) {
            console.log('moments data:', result);
            $scope.moments = result.data.data;
        })
    }
    $scope.updateMoments();

    $scope.addPicture = function(){
        $photos.getPhoto();
    }
    $scope.$on('photoLoaded',function(e,response){
        if(response.success == true){
            $state.go('model/addmoment',{for:'moment'});
        } else {
            alert('error loading img');
        }
    })


    $scope.addPosition = function(){
        $photos.clear();
        $state.go('model/searching',{for:'position'});
    }

    $scope.momentSetup = function(moment){
        $rootScope.$broadcast('momentedit',moment);
    }
    $scope.$on('deletemoment',function(e,moment) {
        $communication.deleteMoment(moment.id).then(function(){
            $scope.updateMoments();
        })
    });

    //$rootScope.notificationList = [];//[{user:'maxvoltar' },{user:'maxvoltar'},{user:'maxvoltar'},{user:'maxvoltar'},{user:'maxvoltar'},{user:'maxvoltar'},{user:'maxvoltar'},{user:'maxvoltar'},{user:'maxvoltar'},{user:'maxvoltar'},{user:'maxvoltar'},{user:'maxvoltar'},{user:'maxvoltar'},{user:'maxvoltar'},{user:'maxvoltar'},{user:'maxvoltar'},{user:'maxvoltar'},{user:'maxvoltar'}];
    // todo :: resize event plug
    $communication.getNotifications().then(function(result){
        $rootScope.notificationList = result.data.data;
    });
    $('#NotificationList').css({height:$(window).height() - 43});

    // move to settings info ::
    $scope.openSettingsInfo = function(){
        $state.go('settings/info');
    }
    // move to settings secrets ::
    $scope.openSettingsSecrets = function(){
        $state.go('settings/secrets');
    }
})

.controller('AddPositionCtrl',function($scope,$map,$photos,$state,$user,$overlay,$communication){

        $scope.letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

        $scope.option = 0;

        $communication.followers($user.userData.id).then(function(result){console.log('my follows:',result.data.data)
            $scope.followers = result.data.data;
        })


        // display selected image ::
        $scope.displayImage = function(data){
            $scope.image = data;
            $scope.$apply();
        }


        if($user.location){
            $scope.position = $user.location;console.log($scope.position);
            $map.addMap(document.getElementById('map'),$scope.position.lat , $scope.position.lng);
        } else {
            console.log('no location::model ctrl');
        }
        if($photos.hasImage()) {
            $photos.convertToImage($scope.displayImage);
        }

        $scope.addLocation = function(){
            $state.go('model/searching',{for:'moment'});
        }




        $scope.$on('menureturn',function(){
            $state.go('model/profile');
        });

        // temp solution ::
        $(window).bind("scroll",$scope.scroll);

        $scope.$on('$destroy',function(){
            $(window).unbind('scroll',$scope.scroll);
        })

        $scope.scroll = function() {
            if ($(window).scrollTop() > 380) {
                $(".alphabet").fadeIn("slow");
            }else {
                $(".alphabet").fadeOut("fast");
            }
        };

        $scope.getMoment = function(){
            var m = {likes:0};
            if($scope.image){
                m.image = $scope.image;
            }
            if($scope.position){
                m.position = $scope.position;
            }
            return m;
        }


        $scope.select = function(user){
            var i = $scope.selected.indexOf(user);
            if(i == -1){
                $scope.selected.push(user);
                $scope.selectedIds[user.id] = true;
            } else {
                $scope.selected.splice(i,1);
                delete $scope.selectedIds[user.id];
            }
        }
        $scope.selected = [];
        $scope.selectedIds = {};


        $scope.share = function(to){
            // share ::
            $overlay.lockPage('Uploading ...');
            //console.log($scope.position);
            //
            $communication.addMoment($scope.image , to , $scope.position).then(function(updatedMoments){
                //$user;//updatedMoments TODO plug it in
                console.log(updatedMoments);
                $state.go('model/profile');
                $overlay.unlockPage();
            },function(){
                $overlay.unlockPage();
            });
        }


        $scope.shareDirect = function(){
            var ids = [];
            for(var k in $scope.selected){
                ids.push($scope.selected[k].id);
            }
            $scope.share(ids);
        }


})

.controller('FollowersCtrl',function($scope,$rootScope){
    $scope.followers = [];
})

.controller('NofificationCtrl',function(){

    })
.controller('NearbyCtrl',function($scope , $rootScope ,$state , $stateParams , $overlay , $user , geolocation , $communication, $DelayCall){

        geolocation.getLocation().then(function(position){
            $communication.nearByPlaces(position.latitude , position.longitude).then(function(result){
                console.log('nearby results ::',result);
                $scope.found = result.data.data;
            })
        });


        $scope.$on('menutyping' , function(){
            $rootScope.hasSearch = false;
            $rootScope.hasInput = true;
            $rootScope.title = '';

            $scope.isTyping = true;
        });

        $scope.search = function(){
            geolocation.getLocation().then(function(position) {
                $communication.searchPlaces(position.latitude, position.longitude, $scope.typing).then(function (result) {
                    $scope.found = result.data.data.venues;
                })
            })
        }

        $scope.delaySearch = new $DelayCall($scope.search,$scope);

        $scope.$on('menutext',function(e,text) {
            $scope.typing = text;
            if (text.length > 3) {
                $scope.delaySearch.call(1000);
            }
        });


        $scope.closeTyping = function(){
            $rootScope.hasSearch = true;
            $rootScope.hasInput = false;
            $rootScope.title = 'Nearby Places';
            $scope.isTyping = false;

        }
        $scope.$on('menureturn',function(e){
            if($scope.isTyping){
                $scope.closeTyping();
            } else {
                $rootScope.toLastState();
            }
        })
        $scope.$on('menuclosesearch' , $scope.closeTyping );

        $scope.isTyping = false;
        $scope.create = function(){
            $overlay.lockPage('Updating position ...');
            geolocation.getLocation().then(function(data){
                $communication.addPlace(data.latitude, data.longitude , $scope.typing).then(function(result){
                    console.log('addPlace:',result);
                    $state.go('model/addmoment');
                    $overlay.unlockPage();
                },function(){
                    $overlay.unlockPage();
                })

            },function(error){
                console.log('geoerror:',arguments);
                $overlay.unlockPage();
            });

        }

        $scope.select = function(position){
            switch ($stateParams.for){
                case 'moment':
                    $user.location = position;
                    $state.go('model/addmoment');
                    break;
                case 'position':
                    $communication.updateProfile(2,{lat:position.lat,lng:position.lng,place:position.name}).then(function(result){
                        $user.setUserData(result.data.data);
                        $state.go('model/profile');
                    },function(error){
                        console.log(error);
                    });
                    break;
            }

        }
});

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
        $rootScope.$broadcast('openlogout');
    }
    $scope.$on('logout',function(evt,val){console.log('logout',val)
        if(val == true){
            $user.logout();
            $state.go('start');
        }
    })

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
application.controller('NewsfeedCtrl',function($scope, $rootScope , $user , $communication , $state){

    $scope.user = $user.userData;
    $scope.news = [];

    $scope.openFollowing = function(){
        if($scope.user.followings_count != 0){
            $state.go('app/following');
        }
    }

    $scope.updateNews = function(){
        $communication.newsfeed().then(function(data){
            if(data.data.data.length > 0){
                $scope.news = data.data.data;
            } else {
                $scope.news = null;
            };
            $scope.updateScroll();
        });
    }

    $scope.canLike = true;
    $scope.like = function(event){
        if($user.userType == 0){
            $rootScope.authOverlay = true;
            return;
        }
        if($scope.canLike){
            $scope.canLike = false;
            if(event.liked){
                event.liked = false;
                event.likes_count --;
                $communication.unlikeMoment(event.id).finally(function(){
                    $scope.canLike = true;
                });
            } else {
                event.liked = true;
                event.likes_count ++;
                $communication.likeMoment(event.id).finally(function(){
                    $scope.canLike = true;
                });
            }
        }
    }



    $scope.getActionText = function(event){
        if(event.gift){
            return ' posted photo just for You';
        } else {
            return ' posted new photo ';
        }
        /*
        switch (event){
            case 2 :
                return ' posted photo just for You';
            default ://1
                return ' posted new photo ';
    }*/
    }

    $scope.selectMoment = function(selected,showMap){
        $rootScope.$broadcast('moment',selected,showMap);
    }
    // slide to load more ::
    $scope.$on('scrollslider',function(){
        $scope.updateNews();
    })

    $scope.updateNews();
})

    .controller('FollowingCtrl',function($scope,$user,$state){
        $scope.following = $user.userFollowing.concat();

        $scope.isFollowing = function(id){
            $user.checkFollow(id);
        }

        $scope.unfollow = function(model){
            model.followRemoved = true;
            $user.removeFollow(model.id);
        }
        $scope.follow = function(model){
            model.followRemoved = false;
            $user.followModel(model.id);
        }

        $scope.$on('$destroy',function(){
            $user.updateFollowers();
        })

        $scope.$on('menureturn' , function(e){
            $state.go('app/newsfeed');
        });
    })
    .controller('GiftsCtrl',function($scope,$rootScope,$state,$communication,$user){
        $scope.gifts = [];
        $communication.gifts().then(function(result){
            $scope.gifts = result.data.data;
        });

        $scope.thank = function(event){
            if(event.liked){
                event.liked = false;
                $communication.unlikeMoment(event.id);
            } else {
                event.liked = true;
                $communication.likeMoment(event.id);
            }
        }

        $scope.thankText = function(gift){console.log('ask:',$user);
            if($user.checkFollow(gift.id)){
                return 'Thanked';
            } else {
                return 'Thank !';
            }
        }

        $scope.selectModel = function(selected){
            $state.go('app/profile', {id:$scope.gifts[selected].model.id});
        }

        $scope.selectMoment = function(selected){console.log(selected);
            $rootScope.$broadcast('moment',selected);
        }
        $scope.$on('menureturn' , function(e){
            $state.go('app/newsfeed');
        });
    })
    //////////////////////////////////////////////////
    //////////////////////////////////////////////////
    // ----------------------->
    .controller('DiscoverCtrl',function($scope,$rootScope,$state,$overlay,$communication,$user,$DelayCall){


        $scope.loadModels = function(){
            if(!!$user.userLocation) {
                $communication.discover($user.userLocal.discover.lookingFor, $user.userLocal.discover.range, $user.userLocal.discover.minAge, $user.userLocal.discover.maxAge, $user.userLocation.lat, $user.userLocation.lng).then(function (result) {
                    $user.lastDiscover = $scope.models = result.data.data;
                    $user.lastDiscoverIndex = 0;
                    $user.checkFollow($scope.currentID());
                })
            }
                /*
                // debug ::
                $communication.discover($user.userLocal.discover.lookingFor,$user.userLocal.discover.range,$user.userLocal.discover.minAge,$user.userLocal.discover.maxAge , 0,0).then(function(result){
                    $scope.models = result.data.data;
                })*/
        }

        $scope.$on('closeDiscover',function(){
            $scope.models = null;
            $scope.loadModels();
        })

        $scope.follow = function(){
            // current::
            if($user.isLogged){
                $user.followModel($scope.models[$scope.animation.current].id);
            } else {
                $rootScope.authOverlay = true;
            }

        }
        $scope.displayProfile = function() {
            if ($scope.models[$scope.animation.current]) {
                $state.go('app/profile', {id: $scope.models[$scope.animation.current].id});
            }
        }


        $scope.followText = function(){
            if($scope.models == null || $scope.models == null || $scope.models.length == 0 || isNaN($scope.animation.current)){
                return;
            }
            if($user.checkFollow($scope.models[$scope.animation.current].id)){
                return 'Following';
            } else {
                return 'Follow';
            }
        }

        //////////////////////////////////////////////////
        //////////////////////////////////////////////////
        // -----------------------> SEARCH ::

        $scope.$on('menutyping' , function(){
            // resize background
            $('#DiscoverSearch').css({height:$(window).height()});

            $rootScope.hasSearch = false;
            $rootScope.hasInput = true;
            $rootScope.title = '';
            $rootScope.hasOptions = false;
            $rootScope.hasSearchPopup = true;

            $scope.isTyping = true;
            setTimeout(function(){
                document.getElementById("SearchInput").focus();
            },0)


            $scope.$on('menutext',function(e,value){
                $scope.typing = value;
                if (value.length > 3) {
                    $scope.delaySearch.call(1000);
                }
            })
        });
        $scope.userSearch = function(){
            $communication.searchUsers($scope.typing).then(function(result){
                $rootScope.searchItems = result.data.data;
            });
        }
        $scope.delaySearch = new $DelayCall($scope.userSearch,$scope);

        $scope.$on('searchselect',function(e,id){
            $state.go('app/profile', {id:$rootScope.searchItems[id].id});
        })

        $scope.normalState = function(e){
            $rootScope.hasSearch = false;
            $rootScope.hasOptions = true;
            $rootScope.hasInput = false;
            $rootScope.title = 'Discover';
            $scope.isTyping = false;
        }
        $scope.$on('menureturn' , $scope.normalState);
        $scope.$on('menuclosesearch' , $scope.normalState);

        $scope.$on('resize',function(){
            $('#DiscoverSearch').css({height:$(window).height()});
        });

        //



        $scope.next = function(){
            if($scope.models.length == 0){return};
            if($scope.animation.current < $scope.models.length -1) {
                $scope.animation.current = $scope.animation.current +1;
            } else {
                $scope.animation.current = 0;
            }

            // hide old ::
            $scope.animation['card' + $scope.animation.atDisplay].stop(true).animate({opacity:0,transform: 'scale(2,2)'},1000,'swing');
            // show new ::
            $scope.animation.atDisplay = $scope.animation.atDisplay == 1 ? 2:1;
            var toShow = $scope.animation['card' + $scope.animation.atDisplay];
            toShow.stop(true).css({transform: 'scale(1,1)'}).animate({opacity:1},1000,'linear').parent().append(toShow);
            if($scope.animation.atDisplay % 2){
                $scope.p1 = $scope.animation.current;
            } else {
                $scope.p2 = $scope.animation.current;
            }
            $scope.isFollowing = $user.checkFollow($scope.currentID());
            $user.lastDiscoverIndex = $scope.animation.current;
        }

        $scope.currentID = function(){
            if($scope.models && $scope.models[$scope.animation.current]) {
                return $scope.models[$scope.animation.current].id
            }
            return Number.NaN;
        }

        //      initial data ::
        // check if discover was used before ::
        if($user.lastDiscover === undefined){
            $scope.loadModels();
        } else {
            $scope.models = $user.lastDiscover;
        }

        $scope.p1 = $user.lastDiscoverIndex || 0;
        $scope.p2 = $scope.p1 +1;

        $scope.animation = {card1:$('#card1'),card2:$('#card2'),current:$scope.p1 , atDisplay:1};
        $scope.animation.card2.css({opacity:0});

    })

.controller('ProfileViewCtrl' , function( $stateParams, $rootScope, $scope, $state,$communication,$user,$map){

        $scope.action = 1;
        // return to main state (newsfeed or discover)
        $scope.$on('menureturn', function(){
            $state.go($rootScope.keyState || 'app/newsfeed');
        });
        // check if user is followed
        $scope.followText = function(){
            if($user.checkFollow($stateParams.id)){
                return 'Following';
            } else {
                return 'Follow';
            }
        }

        $communication.getModel($stateParams.id).then(function(result){
            $scope.profile = result.data.data;
            // set title::
            $rootScope.title = $scope.profile.username;
            console.log($scope.profile,$user.userLocation);
            if($user.userLocation && $scope.profile.place){
                $scope.lastSeen = Math.ceil($map.getDistance($scope.profile.lat,$scope.profile.lng , $user.userLocation.lat,$user.userLocation.lng));
            }
        })

        $communication.getMoments($stateParams.id).then(function(result){
            $scope.moments = result.data.data;
        })

        $scope.follow = function(){
            if($user.isLogged){
                $user.followModel($stateParams.id);
            } else {
                $rootScope.authOverlay = true;
            }
        }

        $scope.canLike = true;
        $scope.like = function(event){
            if($user.userType == 0){
                $rootScope.authOverlay = true;
                return;
            }
            if($scope.canLike){
                $scope.canLike = false;
                if(event.liked){
                    event.liked = false;
                    event.likes_count --;
                    $communication.unlikeMoment(event.id).finally(function(){
                        $scope.canLike = true;
                    });
                } else {
                    event.liked = true;
                    event.likes_count ++;
                    $communication.likeMoment(event.id).finally(function(){
                        $scope.canLike = true;
                    });
                }
            }
        }

        $scope.getActionText = function(id){
            switch (id){
                case 1 :
                    return ' posted new photo ';
                    break;
                case 2 :
                    return ' posted photo just for You';
                    break;
            }
        }

        $scope.selectMoment = function(selected){
            $rootScope.$broadcast('moment',selected);
        }

    })
.controller('DiscoverMenuCtrl',function($scope , $user){

        $scope.update = function(){
            $scope.lookingFor = $user.userLocal.discover.lookingFor || 1;
            $scope.range = $user.userLocal.discover.range || 100;
            $scope.minAge = $user.userLocal.discover.minAge || 18;
            $scope.maxAge = $user.userLocal.discover.maxAge || 35;
        }
        $scope.$on('updateDiscover',$scope.update);
        $scope.update();

        $scope.applyChanges = function(){
            $user.saveLocal();
        }

        $scope.$watch('lookingFor',function(v){
            $user.userLocal.discover.lookingFor = v;
            $scope.applyChanges();
        })
        $scope.$watch('range',function(v){
            $user.userLocal.discover.range = v;
            $scope.applyChanges();
        })
        $scope.$watch('minAge',function(v){
            $user.userLocal.discover.minAge = v;
            $scope.applyChanges();
        })
        $scope.$watch('maxAge',function(v){
            $user.userLocal.discover.maxAge = v;
            $scope.applyChanges();
        })

    })
