


// write your code here


var map, infoWindow, pos;

function initMap() {
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var service = new google.maps.DistanceMatrixService();
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 7,
        center: new google.maps.LatLng(32.727827, -117.145326)
    });
    directionsDisplay.setMap(map);

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            
            infoWindow = new google.maps.InfoWindow();

            infoWindow.setPosition(pos);
            infoWindow.setContent('Current Location.');
            infoWindow.open(map);
            map.setCenter(pos);

            $.getJSON("data.json", function (json) {

                for (let i = 0; i < json.length; i++) {
                    let tr = $('<tr/>');
                    tr.append("<td>" + json[i].name + "</td>");
                    tr.append("<td>" + json[i].description + "</td>");
                    tr.append("<td><a href='https://www.google.com/maps?q=" + json[i].location + "' class='btn btn-primary btn-sm'>Open in Google Maps</a></td>")
                    calculateDistance(json[i].location[0], json[i].location[1], service, function (distance) {
                        tr.append("<td>" + parseFloat(distance) + "</td>");
                    })
                    $('#usertable tbody').append(tr);
                }

                $('#usertable tbody tr').sort(function(a, b) {
                    var anum = parseFloat($(a).find('td:eq(3)').text());
                    var bnum = parseFloat($(b).find('td:eq(3)').text());

                    
                    console.log($(a).find('td:eq(3)').text())

                    return anum - bnum;
                }).appendTo('#usertable tbody');
                
                let jsonfile = json;
                
                for (var i = 0, length = jsonfile.length; i < length; i++) {
                    var data = jsonfile[i],
                        latLng = new google.maps.LatLng(data.location[0], data.location[1]);

                    var marker = new google.maps.Marker({
                        position: latLng,
                        map: map,
                        title: data.name
                    });

                    (function (marker, data) {
                        google.maps.event.addListener(marker, "click", function (e) {
                            var clicklat = data.location[0];
                            var clicklng = data.location[1];
                            calculateAndDisplayRoute(clicklat, clicklng, directionsService, directionsDisplay);

                            var myCallback = function (distance) {
                                infoWindow.setContent(data.name.bold() + " : " + data.description + "  " + distance);
                                infoWindow.open(map, marker);
                            };
                            calculateDistance(clicklat, clicklng, service, myCallback);
                        });
                    })(marker, data);
                }
            });

        }, function () {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
    
        handleLocationError(false, infoWindow, map.getCenter());
    }


    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: The Geolocation service failed.' :
            'Error: Your browser doesn\'t support geolocation.');
        infoWindow.open(map);
    }


    /*var onChangeHandler = function() {
      calculateAndDisplayRoute(directionsService, directionsDisplay);
    };*/
    //document.getElementById('start').addEventListener("change", onChangeHandler);
    //document.getElementById('end').addEventListener("change", onChangeHandler);   

}

function calculateAndDisplayRoute(latlocation, lnglocation, directionsService, directionsDisplay) {
    directionsService.route({
        origin: pos,
        destination: { lat: latlocation, lng: lnglocation },//document.getElementById('end').value,
        travelMode: 'DRIVING'
    }, function (response, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
}

function calculateDistance(latdistance, lngdistance, service, callback) {
    service.getDistanceMatrix({
        origins: [pos],
        destinations: [{ lat: latdistance, lng: lngdistance }],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false
    }, function (response, status) {
        if (status == google.maps.DistanceMatrixStatus.OK && response.rows[0].elements[0].status != "ZERO_RESULTS") {
            var distance = response.rows[0].elements[0].distance.text;
            var duration = response.rows[0].elements[0].duration.text;
            var dvDistance = document.getElementById("dvDistance");

            callback(distance);

        } else {
            alert("Unable to find the distance via road.");
        }
    });
}

