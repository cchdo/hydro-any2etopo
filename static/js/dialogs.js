(function($) {


var Minimized = "dialog-content-minimized";
var DialogCloseButton = ".ui-dialog-titlebar-close";
var HIDE = "hide", SHOW = "show";


function _toggleDialogInstead(evt, jqui) {
  var $this = $(this);
  var $closeButton = $this.parent().find(DialogCloseButton);

  if($this.hasClass(Minimized)) {
    $this.show();
    $closeButton.text(HIDE);
  } else {
    $this.hide();
    $closeButton.text(SHOW);
  }

  $this.toggleClass(Minimized);
  return false;
}


function shiftDialogWidget(_widget, _marginX, _marginY) {
  var _offset = _widget.offset();
  _offset.left += _marginX;
  _offset.top += _marginY;
  _widget.offset(_offset);
}


if($('#trackjson').val() !== "") {
  $('#title-dialog').dialog({
    width: '400px',
    position: {my: "right bottom", at: "right bottom", of: $('#map')},
    beforeClose: _toggleDialogInstead
  });
  shiftDialogWidget($('#title-dialog').dialog('widget'), -14, -14);
}
else {
  $('#title-dialog').hide();
}


$('#opts-dialog').dialog({
  dialogClass: "monospace-title",
  width: '400px',
  position: {my: "right top", at: "right top", of: $('#map')},
  beforeClose: _toggleDialogInstead
});
shiftDialogWidget($('#opts-dialog').dialog('widget'), -14, 14);
if($('#trackjson').val() === "") {
  $('#opts-form-table').hide();
  $('#hydro-plot-etopo-go').hide();
}


$('#title-dialog').parent().find(DialogCloseButton).text(HIDE);
$('#opts-dialog').parent().find(DialogCloseButton).text(HIDE);


})(jQuery);
