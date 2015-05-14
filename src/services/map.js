
// change
application.service('$map',function(){
    this._initialized = false;
    var proxy = this;

    this.initMap = function(){
        var mapOptions = {
            zoom: 14,
            disableDefaultUI: true,
            styles: [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#354760"},{"lightness":1}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#354760"},{"lightness":6}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#354760"},{"lightness":1}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#354760"},{"lightness":16},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#354760"},{"lightness":2}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#354760"},{"lightness":0}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#354760"},{"lightness":7}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#354760"},{"lightness":0}]},{"elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#354760"},{"lightness":26}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#354760"},{"lightness":3}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#354760"},{"lightness":4}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#354760"},{"lightness":1},{"weight":1.2}]}]
        };

        this.mapNode = document.createElement('div');
        this.mapNode.setAttribute('style','width:100%;height:100%;min-width:400px;min-height:300px;');
        if(google == undefined){
            this.mapNode.innerHTML = 'error loading google maps';
            return;
        }
        this.map = new google.maps.Map(this.mapNode, mapOptions);


        this._initialized = true;
    }

    this.addMap = function(element , lat , long){
        if(this._initialized == false){
            this.initMap();
        }
        element.appendChild(this.mapNode);
        this.map.setCenter({lat: lat || 54, lng: long || 16});
        setTimeout(function(){// safety resize
            proxy.resize();
        },100);// future stack
    }

    this.resize = function(){
        google.maps.event.trigger(proxy.map, 'resize');
    }

    this.getMapCoords = function(point){
        var latLng = point || this.map.getCenter();

        var numTiles = 1 << this.map.getZoom();
        var projection = this.map.getProjection();
        var worldCoordinate = projection.fromLatLngToPoint(latLng);
        var pixelCoordinate = new google.maps.Point(
            worldCoordinate.x * numTiles,
            worldCoordinate.y * numTiles);

        var topLeft = new google.maps.LatLng(
            this.map.getBounds().getNorthEast().lat(),
            this.map.getBounds().getSouthWest().lng()
        );

        var topLeftWorldCoordinate = projection.fromLatLngToPoint(topLeft);
        var topLeftPixelCoordinate = new google.maps.Point(
            topLeftWorldCoordinate.x * numTiles,
            topLeftWorldCoordinate.y * numTiles);

        return new google.maps.Point(
            pixelCoordinate.x - topLeftPixelCoordinate.x,
            pixelCoordinate.y - topLeftPixelCoordinate.y
        );
    }

    this.getDistance = function(lat1, lon1, lat2, lon2) {
        var radlat1 = Math.PI * lat1/180
        var radlat2 = Math.PI * lat2/180
        var radlon1 = Math.PI * lon1/180
        var radlon2 = Math.PI * lon2/180
        var theta = lon1-lon2
        var radtheta = Math.PI * theta/180
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist)
        dist = dist * 180/Math.PI
        dist = dist * 60 * 1.1515
        dist = dist * 1.609344;
        return dist;
    }
});