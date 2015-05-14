



var Promise = (function(){

    function Promise(){

    }

    Promise.prototype.success = function(){

    }

    Promise.prototype.finally = function(callback , thisObj){
        _.bind(callback,thisObj);
        return this;
    }


    Promise.init = function(){
        return new Promise();
    }

    return Promise;
})();



var util = util || {};
util.eachApply = function(src , dest){
    for(var n in src){
        dest[n] = src[n];
    }
}

util.vpromise = function(target, key){
    return function(value){
        target[key] = value;
    }
}

util.delegate = function(func,thisObj){
    return function(){
        func.apply(thisObj,arguments);
    }
}