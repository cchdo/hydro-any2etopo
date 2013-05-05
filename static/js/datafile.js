(function($) {

  /* Set the page to reload when the datafile is changed so that we can start
  using the updated track data immediately. The track is hard-substituted into
  the value of <input#trackjson> by the form handler. This isn't safe, but we
  assume that we can trust the form handler to produce only arrays of arrays of
  floats as JSON output.
  */
  $('#datafile').change(function() {
    $('#upload-form')[0].submit();
  });


  /* Basic utility function for rounding a number to the nearest tenth. */
  function roundToTenth(f) {
    //return Math.round(f * 10) * 0.1;
    return f.toFixed(1);
  }


  /* Extension of the Google Maps LatLng class to round an instance to the
  nearest tenth of a degree of latitude and longitude.
  */
  google.maps.LatLng.roundToTenth =
      function gmLatLngRoundToTenth(latlng) {
    return new google.maps.LatLng(
        roundToTenth(latlng.lat()),
        roundToTenth(latlng.lng()));
  };


  /* Extension of the Google Maps LatLngBounds class to round an instance to
  the nearest tenth of a degree of latitude and longitude for each bounding
  coordinate.
  */
  google.maps.LatLngBounds.roundToTenth =
      function gmLatLngBoundsRoundToTenth(bounds) {
    return new google.maps.LatLngBounds(
        google.maps.LatLng.roundToTenth(bounds.getSouthWest()),
        google.maps.LatLng.roundToTenth(bounds.getNorthEast()));
  };


  /* Set up the debug object if necessary. The debug object holds all the
  data that this interface should need. */
  if(window.any2trk === undefined || window.any2trk === null)
    window.any2trk = {};


  /* Initialize the map view. By default we are zoomed all the way out,
  centered on Null Island.
  */
  window.any2trk.map = new google.maps.Map($('#map')[0], {
      center: new google.maps.LatLng(0, 0),
      zoom: 2,
      mapTypeId: google.maps.MapTypeId.SATELLITE
  });


  /* If <input#trackjson> has a non-empty value, then a datafile was submitted
  and we can use its track data. So let's take that track data and plot it on
  the map.
  */
  if($('#trackjson').val() !== "") {
    window.any2trk.hasWork = true;

    /* Parse the JSON dumped by the form handler out of the value field. Also
    go ahead and convert it into LatLng instances.
    */
    window.any2trk.track = JSON.parse($('#trackjson').val()).
        map(function flatToGMLatLng(x) {
          return new google.maps.LatLng(x[1], x[0]);
        });

    /* If there's anything interesting to note, build a bounding rectangle and
    focus the map on it. */
    if(window.any2trk.track.length >= 1) {

      /* Find out the minimum bounds for the track points. */
      var initialBounds = (function computeInitialBounds(track) {
        var bounds = new google.maps.LatLngBounds(track[0], track[0]);
        for(var i = 1; i < track.length; ++i) {
          bounds.extend(track[i]);
        }
        return google.maps.LatLngBounds.roundToTenth(bounds);
      })(window.any2trk.track);

      /* Focus the map on the minimum bounds. */
      window.any2trk.map.fitBounds(initialBounds);

      /* Make a rectangle that fits around the track points. */
      window.any2trk.rect = new google.maps.Rectangle({
          bounds: initialBounds,
          editable: true,
          fillColor: '#6199df',
          fillOpacity: 0.1,
          strokeColor: '#6199df',
          strokeOpacity: 0.5,
          strokeWeight: 2,
          map: window.any2trk.map
      });

      /* Make markers for all the track points. */
      (function makeMarkersForTrack(track, markerOptionsFunction) {
        for(var i = 0; i < track.length; ++i) {
          new google.maps.Marker(markerOptionsFunction(track[i]));
        }
      })(window.any2trk.track,
      function markerOptionsFor(latlng) {
        return {
            map: window.any2trk.map,
            position: latlng,
            draggable: false,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 3,
                fillColor: '#f87',
                fillOpacity: 1.0,
                strokeColor: '#000',
                strokeWeight: 2
            }
        };
      });
    }
  }
  else window.any2trk.hasWork = false;
})(jQuery);
