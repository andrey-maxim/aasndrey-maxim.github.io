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
