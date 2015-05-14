/*

    geolocation service

    * usage ::
    * geolocation.getLocation(timeout = 0).then(
    *       completeFunction(coordsObject:{
    *               speed:number , heading:number , altitudeAccuracy:number ,
    *               accuracy:number , longitude:number , latitude:number}) ,
    *      failFunction(errorObj:{code:int , message:string})
    * );

 */



var geong = angular.module('geo-ng',[]);

geong.service('geolocation',['$q',function($q){
    return {
        getLocation:function(timeout){
            var geo = this;
            return $q(function(resolve, reject) {
                // check if aviable ::
                if(navigator.geolocation === undefined){
                    reject({code:4 , message:"Geolocation not supported"});
                    return;
                }
                // timeout reject ::
                if(!isNaN(timeout) && timeout != 0){// native timeout is not working on all devices ;
                    setTimeout(function(){
                        reject({code:3 , message:"Geolocation timeout"});
                    },timeout);
                }
                // request position ::
                navigator.geolocation.getCurrentPosition(function(result){
                    resolve(result.coords);
                },function(error){ // geolocation error ::
                    reject(error);
                })
            });
        }
    };
}])