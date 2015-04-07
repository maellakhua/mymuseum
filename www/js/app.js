// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordova']).run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
});
app.controller('MapCtrl', function($scope, $cordovaGeolocation, $location, $ionicScrollDelegate, $http, $ionicPopup, $timeout, $ionicSideMenuDelegate, $ionicLoading, $compile) {
    $scope.devList = [{
        text: "Museums",
        checked: true
    }];
    $scope.by = {
        means: 'TRANSIT'
    };
    $scope.helper = {
        t: true
    };
    $scope.destList = [{
        type: 'Museums',
        list: [],
        icon: "img/museum.png",
        showList: true
    }];
    var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();
    



    $scope.toggler = function() {
        $scope.devList.forEach(function(dest) {
            dest.checked = $scope.helper.t;
        });
    };
    $scope.deleteMarkers = function(list) {
        list.forEach(function(i) {
            i.marker.setMap(null);
        });
    };
    $scope.getResults = function() {
        var send = [];
        $scope.devList.forEach(function(dest) {
            if (dest.checked) send.push(dest.text);
        });
        
        // get venues from server
        var req = "http://62.217.125.30/~ellakuser/museumapp/mymuseums/venues/lat/" + $scope.position.lat() + "/lng/" + $scope.position.lng() + "/radius/" + $scope.data.radius + "/limit/" + $scope.data.resultslimit + "/method/" + $scope.data.sortmethod;
        

        $http.get(req).
        success(function(data, status, headers, config) {


            // first : empty the lists, delete markers
            $scope.destList.forEach(function(i) {
                $scope.deleteMarkers(i.list);
                i.list = [];
            });
            var L = $scope.devList,
                item, D = $scope.destList;
            // console.log(data); return; // delete        
            // console.log($scope.destList);
            
            for (var j = 0; j < data.length; j++) {
                if (data[j] == null) continue;
                //item = data[j].category;
                // if (item.search(/museum/i) != -1) {
                D[0].list.push(data[j]);
                // place a marker
                $scope.newMarker(D[0], data[j]);
                data[j] = null;
            }
            $ionicLoading.hide();
            // close 'You are here!' info window after getting the venues
            $scope.infowindow.close();
        }).
        error(function(data, status, headers, config) {
            $ionicLoading.hide();
            /*$ionicPopup.alert({
                        title: 'Something went horribly wrong :(',
                        template: status
                    });*/
        });
    }
    $scope.openWindow = function(type, x) {
        x.opened = !x.opened;
        // if (x.opened && (x.extra == undefined || x.extra == null)) {
            // $scope.getExtras(type, x.id, x.source);
        // }
    }
    var previnfo;
    $scope.newMarker = function(i, x) {
        x.infow = new google.maps.InfoWindow();
        
        x.marker = new google.maps.Marker({
            position: new google.maps.LatLng(x.lat, x.lng),
            map: $scope.map,
            icon: i.icon
        });

        // set icons for museums' current state
        if (x.isopen == -1) {
            x.marker.icon = "img/museum_unknown.png";
        } else if (x.isopen == 0) {
            x.marker.icon = "img/museum_closed.png";
        } else if (x.isopen == 1) {
            x.marker.icon = "img/museum_open.png";
        }


        var content = '<div style="cursor: pointer;" title="click for more info" ng-click="openRight(\'' + x.lat + '\', \'' + i.type + '\', \'' + x.id + '\', \'' + x.source + '\')"><a><strong>';
        
        content = content + "<h4>" + x.name + "</h4>";

        // if start and end hours exist
        if (x.hours.length > 0) {
            // filter if first char equals to '+'
            if ((x.hours[0].start && typeof x.hours[0].start != 'undefined') && (x.hours[0].end && typeof x.hours[0].end != 'undefined')) {
                var start_hours = x.hours[0].start;
                var end_hours = x.hours[0].end
                if (start_hours.charAt(0) == '+') {
                    start_hours = start_hours.substring(1);
                }
                if (end_hours.charAt(0) == '+') {
                    end_hours = end_hours.substring(1);
                }
                start_hours = start_hours.substring(0, 2) + ':' + start_hours.substring(2, 4);
                end_hours = end_hours.substring(0, 2) + ':' + end_hours.substring(2, 4);
                content = content + 'Open from ' + start_hours + ' to ' + end_hours;
            }
        }

        content = content + "<br>" + x.address_address;
        content = content + "<br>" + x.address_postalcode + " " + x.address_city + " " + x.address_state + " " + x.address_country;

        content = content + '</strong></a></div>';


        var compiled = $compile(content)($scope);
        x.infow.setContent(compiled[0]);
        x.opened = false;
        google.maps.event.addListener(x.marker, 'mousedown', function() {
            if (previnfo) {
                previnfo.close();
                // close 'You are here!' info window after getting the venues from autocomplete field
            	$scope.infowindow.close();
            }
            x.infow.open($scope.map, this);
            $scope.markerEvent(i, x);
            previnfo = x.infow;
        });
    };
    $scope.markerEvent = function(a, b) {
        $scope.destList.forEach(function(l) {
            l.showList = false;
            l.list.forEach(function(it) {
                it.opened = false;
            });
        });
        a.showList = true;
        b.opened = true;
        //b.infow.open($scope.map, b.marker);
    };
    $scope.onMap = function(list) {
        $scope.map.setCenter(new google.maps.LatLng(list.lat, list.lng));
        list.infow.open($scope.map, list.marker);
        $scope.map.setZoom(17);
    };

    function initialize() {
        var myLatlng = new google.maps.LatLng(37.9908372, 23.7383394);
        var mapOptions = {
            center: myLatlng,
            zoom: 12,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map((document.getElementById('map_canvas')), mapOptions);
        var input = document.getElementById('pac-input');
        var auto_options = {
            types: ['(regions)']
            //componentRestrictions: {country: "gr"}
        };
        var autocomplete = new google.maps.places.Autocomplete(input, auto_options);
        autocomplete.bindTo('bounds', map);
        var infowindow = new google.maps.InfoWindow();
        var marker = new google.maps.Marker({
            map: map,
            anchorPoint: new google.maps.Point(0, -29),
            draggable: true
        });
        google.maps.event.addListener(marker, 'dragend', function(evt) {
            var x = evt.latLng.lat();
            var y = evt.latLng.lng();
            $scope.position = new google.maps.LatLng(x, y);
        });
        google.maps.event.addListener(autocomplete, 'place_changed', function() {
            infowindow.close();
            marker.setVisible(false);
            var place = autocomplete.getPlace();
            if (!place.geometry) {
                return;
            }
            $scope.position = place.geometry.location;
            $scope.position.k -= 0.000000527264;
            $scope.position.B -= 0.000001245434;
            $scope.loading = $ionicLoading.show({
                content: 'Getting location...',
                showBackdrop: true
            });
            $scope.getResults();
            // If the place has a geometry, then present it on a map.
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
                map.setZoom(17); // Why 17? Because it looks good.
            }
            marker.setIcon( /** @type {google.maps.Icon} */ ({
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(35, 35)
            }));
            marker.setPosition(place.geometry.location);
            marker.setVisible(true);
            var address = '';
            if (place.address_components) {
                address = [
                    (place.address_components[0] && place.address_components[0].short_name || ''), (place.address_components[1] && place.address_components[1].short_name || ''), (place.address_components[2] && place.address_components[2].short_name || '')
                ].join(' ');
            }
            infowindow.setContent('<div><strong>' + place.name + '</strong></div>');
            infowindow.open(map, marker);
        });
        $scope.map = map;
        $scope.marker = marker;
        $scope.infowindow = infowindow;
        $scope.mapOptions = mapOptions;
        directionsDisplay = new google.maps.DirectionsRenderer();
        directionsDisplay.setMap($scope.map);
    }
    google.maps.event.addDomListener(window, 'load', initialize);
    $scope.calcRoute = function(list) {
        if (!$scope.position) {
            var alertPopup = $ionicPopup.alert({
                title: 'Not so fast',
                template: 'Specify a start point by searching a region or by using the "Track Me" button .'
            });
            alertPopup.then(function(res) {});
            return;
        } else {
            var inner = '<ion-radio ng-model="by.means" value="DRIVING" selected>Driving</ion-radio><ion-radio ng-model="by.means" value="TRANSIT">Transit</ion-radio><ion-radio ng-model="by.means" value="WALKING">Walking</ion-radio>';
            var myPopup = $ionicPopup.show({
                template: inner,
                title: 'Enter means of transport',
                scope: $scope,
                buttons: [{
                    text: 'Cancel'
                }, {
                    text: '<b>GO</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        if (!$scope.by.means) {
                            e.preventDefault();
                        }
                        return $scope.by.means;
                    }
                }, ]
            });
            myPopup.then(function(res) {
                if (!$scope.by.means) return;
                var request = {
                    origin: $scope.position,
                    destination: new google.maps.LatLng(list.lat, list.lng),
                    travelMode: google.maps.TravelMode[res]
                };
                directionsService.route(request, function(response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                    }
                });
            });
        }
    }
    $scope.replay = function() {
        $timeout(function() {
            if ($ionicSideMenuDelegate.isOpenLeft()) {
                $scope.replay();
            } else {
                if ($scope.position) {
                    $scope.loading = $ionicLoading.show({
                        content: 'Getting current location...',
                        showBackdrop: true
                    });
                    $scope.getResults();
                }
            }
            return;
        }, 400);
    };

     $scope.about = function() {
       var alertPopup = $ionicPopup.alert({
         title: '<strong>Museum Guide</strong>',
         template: '<div style="font-size: 0.85em;"><strong>Development Team:</strong><br>Panagiotis Gemos<br>Dionisis Konstantinopoulos<br>Ioannis Mitropoulos<br>Anastasios Spiliopoulos<br>Chris Tsolkas<br><br><div style="font-size: 0.9em; font-style: italic">This project was designed at the 2nd ELLAK Summer Code Camp at Harokopio University in April 2015</div></div>'
       });
            alertPopup.then(function(res) {
       });
     };

     $scope.openRight = function(id, type, objId, objSource) {
        $ionicSideMenuDelegate.toggleRight();
        //$scope.getExtras(type, objId, objSource);
        //scroll
        $location.hash(id);
        $ionicScrollDelegate.anchorScroll(true);
    }
    $scope.geoLocate = function() {
        if (!$scope.map) {
            return;
        }
        $scope.loading = $ionicLoading.show({
            content: 'Getting current location...',
            showBackdrop: false
        });
        var geoMarker;
        var options = { timeout: 30000, enableHighAccuracy: true, maximumAge: 50000 };
        $cordovaGeolocation.getCurrentPosition(options).then(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            $scope.position = pos;
            var infow = new google.maps.InfoWindow();
            geoMarker = new google.maps.Marker({
                position: pos,
                map: $scope.map,
                anchorPoint: new google.maps.Point(0, -29),
                draggable: true
            });
            geoMarker.setIcon( /** @type {google.maps.Icon} */ ({
                url: "img/geo.png",
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(35, 35)
            }));
            google.maps.event.addListener(geoMarker, 'dragend', function(evt) {
                var x = evt.latLng.lat();
                var y = evt.latLng.lng();
                $scope.position = new google.maps.LatLng(x, y);
            });
            infow.setContent('<div>You are here!</div>');
            infow.open($scope.map, geoMarker);
            if ($scope.infowindow) {
                $scope.infowindow.close();
                $scope.infowindow = infow;
            }
            if ($scope.marker) {
                $scope.marker.setVisible(false);
                $scope.marker = geoMarker;
            }
            $scope.map.setCenter(pos);
            $scope.getResults();

        }, function(error) {
            $ionicLoading.hide();
            var alertPopup = $ionicPopup.alert({
                title: 'Error',
                template: 'Geolocation failed!'
            });
        });
    };
    $timeout(function() {
        $ionicSideMenuDelegate.canDragContent(false);
    }, 1000);


    
    $scope.searchRadiusList = [
        { text: "1000", value: "1000" },
        { text: "2500", value: "2500" },
        { text: "5000", value: "5000" },
        { text: "10000", value: "10000" }
      ];

      $scope.sortMethodList = [
        { text: "By Distance", value: "distance" },
        { text: "By Rating", value: "rating" },
        { text: "Weighted", value: "weight" }

      ];

       $scope.resultsLimitList = [
        { text: "10", value: "10" },
        { text: "20", value: "20" },
        { text: "30", value: "30" },
        { text: "40", value: "40" },
        { text: "50", value: "50" }
      ];

      // set default values fro radius, sorting method and results limit
      $scope.data = {
        radius: '5000',
        sortmethod: 'weight',
        resultslimit: '10'
      };
      
      $scope.radiusselected = function(item) {
        // console.log("Radius Selected: ", item.value);
        $scope.data.radius = item.value;
      };

       $scope.sortmethodeselected = function(item) {
        // console.log("Radius Selected: ", item.value);
        $scope.data.sortmethod = item.value;
      };

      $scope.resultslimitselected = function(item) {
        // console.log("Results Limit Selected: ", item.value);
        $scope.data.resultslimit = item.value;
      };





});