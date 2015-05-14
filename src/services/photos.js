/*
 events ::
 -> photoLoaded     success:boolean

 */


application.service('$photos',function($rootScope,$global){

    this._chooseTpl = '<input type="file" accept="image/*">';
    //this._captureTpl = '<input type="file" accept="image/*" capture="camera">';

    var proxy = this;


    /*
    where galery is 1;
     */
    this.getPhoto = function(galeryOrCamera , callback){
        if(proxy.currentChoose != null){
            $(proxy.currentChoose.node).unbind('change');
            $(proxy.currentChoose.node).remove();
        }

        proxy.currentChoose = {cb:callback};

        var d = document.createElement('div');
        d.setAttribute('style','display:none');
        d.innerHTML = this._chooseTpl;// (galeryOrCamera == 1)?proxy._chooseTpl:proxy._captureTpl;
        document.body.appendChild(d);
        var query = $(d).find('input');
        proxy.currentChoose.node = d;
        proxy.currentChoose.state = 0;

        query.change(this.chooseCallback);

        query.one("click", function () {
            var cancelled = false;
            setTimeout(function () {
                $(document).one("mousemove.filesSelector focusin.filesSelector", function () {
                    if (query.val().length === 0 && !cancelled) {
                        console.log('cancelled!');
                        cancelled = true;
                        // todo :: broadcast cancel
                    }
                });
            }, 1);
        })
        query.trigger('click');
    }

    // TODO :: Defer ?
    this.chooseCallback = function(event){
        proxy.selectedFile = event.target.files[0];
        $rootScope.$broadcast('photoLoaded',{success:proxy.selectedFile == null?false:true});
    }

    this.convertToImage = function(toApply){
        var reader = new FileReader();
        reader.onload = function(event) {
            toApply(event.target.result);
        }
        reader.readAsDataURL(this.selectedFile);
    }

    this.hasImage = function(){
        return this.selectedFile ? true:false;
    }

    this.clear = function(){
        this.selectedFile = null;
        this.currentChoose = null;
    }
})