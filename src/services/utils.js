application.directive('scrollslider',function(){
    return {
        link:function(scope,element,attrs){
            var d = {size:parseInt(attrs.scrolloffset || attrs.scrollsize) , target:$(attrs.scrollslider == 'this' ? element : attrs.scrollslider ) ,window:$(window)};
            if(attrs.scrolloffset){
                var el = $('<div style="height: '+d.size+'px"></div>');
                element.prepend(el);
                //el.animate({height: d.size},500);
            }


            d.target.bind("scroll",function(e){
                var update = d.target.scrollTop();
                if(update < d.size){
                    if(!d.animating){
                        scope.updateScroll();
                        scope.$emit('scrollslider');
                    } else if(update < d.last){
                        scope.updateScroll();
                    }
                }
                d.last = update;
            });

            d.animationEnd = function(){
                d.animating = false;
            }

            scope.updateScroll = function(){
                d.animating = true;
                d.target.clearQueue().stop().delay(250).animate({
                    scrollTop: (d.size + 2)
                }, (d.size - d.last) * 5 , d.animationEnd);
            }

            scope.$on('$destroy' , function(){
                d.window.unbind('scroll');
            })
        },
        restrict: 'A'
    }
}).service('$DelayCall',function(){
    function DelayCall(callback,scope){
        this._i = undefined;// timeout id
        this._c = callback;
        this._s = scope;
    }
    DelayCall.prototype.call = function(delay){
        if(!isNaN(this._i)){
            clearTimeout(this._i);
        }
        this._i = setTimeout(util.delegate(this._c,this._s),delay);
    }
    DelayCall.prototype.cancel = function(){
        if(!isNaN(this._i)){
            clearTimeout(this._i);
            this._i = undefined;
        }
    }

    return DelayCall;
}).directive('setwindowheight',function($rootScope){
    return {
        link:function(scope,element,attrs){
            var offset = parseInt(attrs['setwindowoffset']);
            function resize(){
                element.css({'height': ($rootScope.pageHeight - offset)});
            }
            resize();
            scope.$on('resize',resize);
        },
        restrict: 'A'
    }
});