(function($) {


function clamp(f, min, max) { return Math.min(Math.max(f, min), max); }


function showHideBoundsInputs() {
  if(["npstere", "spstere"].indexOf($('#proj').val())!==-1) {
    $('#projbounds-rect').hide();
    $('#projbounds-stere').show();
  }
  else {
    $('#projbounds-rect').show();
    $('#projbounds-stere').hide();
  }
}


if(window.any2trk.hasWork) {
  showHideBoundsInputs();
  $('#proj').change(showHideBoundsInputs);
}
else $('#projbounds-rect').add('#projbounds-stere').hide();


var MAX_LATITUDE = 90.0;
var MIN_LATITUDE = -90.0;
var MAX_LONGITUDE = 180.0;
var MIN_LONGITUDE = -180.0;


var bounds = {
    north: MAX_LATITUDE,
    south: MIN_LATITUDE,
    east: MAX_LONGITUDE,
    west: MIN_LONGITUDE
};


var inverseAware = {
    northSouth: function ians() {
      if(bounds.north < bounds.south) {
        var south = bounds.north;
        bounds.north = bounds.south;
        bounds.south = south;
        $('#bd-cyl-n').val(bounds.north);
        $('#bd-cyl-s').val(bounds.south);
      }
    },
    eastWest: function iaew() {
      if(bounds.east < bounds.west) {
        var west = bounds.east;
        bounds.east = bounds.west;
        bounds.west = west;
        $('#bd-cyl-e').val(bounds.east);
        $('#bd-cyl-w').val(bounds.west);
      }
    }
};


function syncDialogWithRect() {
  var rect = window.any2trk.rect;
  var ne = rect.getBounds().getNorthEast();
  var sw = rect.getBounds().getSouthWest();
  $('#bd-cyl-n').val(bounds.north = parseFloat(ne.lat().toFixed(1)));
  $('#bd-cyl-s').val(bounds.south = parseFloat(sw.lat().toFixed(1)));
  $('#bd-cyl-e').val(bounds.east = parseFloat(ne.lng().toFixed(1)));
  $('#bd-cyl-w').val(bounds.west = parseFloat(sw.lng().toFixed(1)));
}


function usingStereographicProjection() {
  return (function(proj) {
    return proj === "npstere" || proj === "spstere";
  })($('#proj').val());
}


function syncRectWithDialog() {
  inverseAware.northSouth();
  //inverseAware.eastWest();
  var newbounds;
  if(usingStereographicProjection()) {
    newbounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(clamp(bounds.south, -85, 85), bounds.west),
        new google.maps.LatLng(clamp(bounds.north, -85, 85), bounds.east));
  }
  else {
    newbounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(bounds.south, bounds.west),
        new google.maps.LatLng(bounds.north, bounds.east));
  }
  window.any2trk.rectIsRounded = false;
  window.any2trk.rect.setBounds(newbounds);
  window.any2trk.map.fitBounds(newbounds);
}


if(window.any2trk.hasWork)
  syncDialogWithRect();


google.maps.event.addListener(window.any2trk.rect, "bounds_changed",
    function onRectangleBoundsChanged() {
  var rounded = google.maps.LatLngBounds.roundToTenth(
      window.any2trk.rect.getBounds());
  if(window.any2trk.rectIsRounded) { window.any2trk.rectIsRounded = false; return; }
  window.any2trk.rectIsRounded = true;
  window.any2trk.rect.setBounds(rounded);
  window.any2trk.map.fitBounds(rounded);
  if(usingStereographicProjection()) {
    return;
  }
  syncDialogWithRect();
});


$('#bd-cyl-n').change(function onBoundsNorthChanged() {
  var f = parseFloat($(this).val());
  if(isNaN(f)) $(this).val(bounds.north);
  else {
    $(this).val(bounds.north = clamp(f, MIN_LATITUDE, MAX_LATITUDE));
    syncRectWithDialog();
  }
});
$('#bd-cyl-s').change(function onBoundsSouthChanged() {
  var f = parseFloat($(this).val());
  if(isNaN(f)) $(this).val(bounds.south);
  else {
    $(this).val(bounds.south = clamp(f, MIN_LATITUDE, MAX_LATITUDE));
    syncRectWithDialog();
  }
});
$('#bd-cyl-e').change(function onBoundsEastChanged() {
  var f = parseFloat($(this).val());
  if(isNaN(f)) $(this).val(bounds.east);
  else {
    $(this).val(bounds.east = clamp(f, MIN_LONGITUDE, MAX_LONGITUDE));
    syncRectWithDialog();
  }
});
$('#bd-cyl-w').change(function onBoundsWestChanged() {
  var f = parseFloat($(this).val());
  if(isNaN(f)) $(this).val(bounds.west);
  else {
    $(this).val(bounds.west = clamp(f, MIN_LONGITUDE, MAX_LONGITUDE));
    syncRectWithDialog();
  }
});


$('#bd-stere').change(function onStereographicParallelChanged() {
  var f = parseFloat($(this).val());
  if(isNaN(f)) {
    $(this).css('background-color', '#fcc');
    return;
  }
  else if($('#proj').val() === "npstere") {
    $(this).val(bounds.south = clamp(window.roundToTenth(f), MIN_LATITUDE, MAX_LATITUDE));
    bounds.east = MAX_LONGITUDE;
    bounds.west = MIN_LONGITUDE;
    bounds.north = MAX_LATITUDE;
    syncRectWithDialog();
  }
  else if($('#proj').val() === "spstere") {
    $(this).val(bounds.north = clamp(window.roundToTenth(f), MIN_LATITUDE, MAX_LATITUDE));
    bounds.east = MAX_LONGITUDE;
    bounds.west = MIN_LONGITUDE;
    bounds.south = MIN_LATITUDE;
    syncRectWithDialog();
  }
});


$('#proj').change(function onProjectionChanged() {
  if($(this).val() === "npstere") {
    bounds.north = MAX_LATITUDE;
    if(!$('#bd-stere').val()) $('#bd-stere').val(0);
    var f = parseFloat($('#bd-stere').val());
    bounds.south = clamp(window.roundToTenth(f), MIN_LATITUDE, MAX_LATITUDE);
    bounds.east = MAX_LONGITUDE;
    bounds.west = MIN_LONGITUDE;
  }
  else if($(this).val() === "spstere") {
    bounds.south = MIN_LATITUDE;
    if(!$('#bd-stere').val()) $('#bd-stere').val(0);
    var f = parseFloat($('#bd-stere').val());
    bounds.north = clamp(window.roundToTenth(f), MIN_LATITUDE, MAX_LATITUDE);
    bounds.east = MAX_LONGITUDE;
    bounds.west = MIN_LONGITUDE;
  }
  else {
    $.each([$('#bd-cyl-n'), $('#bd-cyl-s'), $('#bd-cyl-e'), $('#bd-cyl-w')],
        function(i, e) { if(!e.val()) e.val(0); if(isNaN(parseFloat(e.val()))) e.val(0); });
    bounds.north = clamp(window.roundToTenth(parseFloat($('#bd-cyl-n').val())),
        MIN_LATITUDE, MAX_LATITUDE);
    bounds.south = clamp(window.roundToTenth(parseFloat($('#bd-cyl-s').val())),
        MIN_LATITUDE, MAX_LATITUDE);
    bounds.east = clamp(window.roundToTenth(parseFloat($('#bd-cyl-e').val())),
        MIN_LONGITUDE, MAX_LONGITUDE);
    bounds.west = clamp(window.roundToTenth(parseFloat($('#bd-cyl-w').val())),
        MIN_LONGITUDE, MAX_LONGITUDE);
  }
  syncRectWithDialog();
});


})(jQuery);
