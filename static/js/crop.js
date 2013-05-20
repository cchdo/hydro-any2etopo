$(function() {
  function showCoords(coords) {
    $('#x1').val(coords.x);
    $('#y1').val(coords.y);
    $('#x2').val(coords.x2);
    $('#y2').val(coords.y2);
  }

  $('#target').Jcrop({
      aspectRatio: 1,
      onSelect: showCoords,
      onChange: showCoords
  });

  $('.coord-input').change(function(e) {
    $('#target').Jcrop({
        setSelect: [
            $('#x1').val(), $('#y1').val(),
            $('#x2').val(), $('#y2').val()
        ]
    });
  });
});
