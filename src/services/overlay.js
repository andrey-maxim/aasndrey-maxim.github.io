



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