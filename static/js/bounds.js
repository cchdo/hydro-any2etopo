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
  $('#bd-cyl-n').val(bounds.north = ne.lat().toFixed(1));
  $('#bd-cyl-s').val(bounds.south = sw.lat().toFixed(1));
  $('#bd-cyl-e').val(bounds.east = ne.lng().toFixed(1));
  $('#bd-cyl-w').val(bounds.west = sw.lng().toFixed(1));
}


function syncRectWithDialog() {
  inverseAware.northSouth();
  inverseAware.eastWest();
  window.any2trk.rect.setBounds(new google.maps.LatLngBounds(
      new google.maps.LatLng(bounds.south, bounds.west),
      new google.maps.LatLng(bounds.north, bounds.east)));
}


if(window.any2trk.hasWork)
  syncDialogWithRect();


google.maps.event.addListener(window.any2trk.rect, "bounds_changed",
    function onRectangleBoundsChanged() {
  var rounded = google.maps.LatLngBounds.roundToTenth(
      window.any2trk.rect.getBounds());
  if(rounded.equals(window.any2trk.rect.getBounds()))
    return;
  rect.setBounds(rounded);
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


})(jQuery);
