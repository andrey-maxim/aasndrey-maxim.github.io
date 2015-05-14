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