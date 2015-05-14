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