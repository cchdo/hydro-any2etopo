(function($) {


function updateTitlePreview() {
  var SPACE = " ";
  var sectionId = $('#sect_id').val();
  var investigators = $('#pi').val() + "/" + $('#inst').val();
  var means = $('#ship').val() + SPACE + $('#year').val();
  var expo = $('#expo').val();

  if(expo !== "") expo = " - " + expo;

  var title = sectionId + SPACE + investigators + " (" + means + ")" + expo;
  $('#title-preview').text(title);
  $('#plot-title').val(title);
}


$('#sect_id').
    add('#pi').
    add('#inst').
    add('#ship').
    add('#year').
    add('#expo').
    change(updateTitlePreview);


})(jQuery);
