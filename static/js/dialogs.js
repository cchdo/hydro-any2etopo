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


$('#title-dialog').dialog({
  width: '400px',
  position: {my: "right bottom", at: "right bottom", of: $('#map')},
  beforeClose: _toggleDialogInstead
});


$('#opts-dialog').dialog({
  width: '400px',
  position: {my: "right top", at: "right top", of: $('#map')},
  beforeClose: _toggleDialogInstead
});


$('#title-dialog').parent().find(DialogCloseButton).text(HIDE);
$('#opts-dialog').parent().find(DialogCloseButton).text(HIDE);


function shiftDialogWidget(_widget, _marginX, _marginY) {
  var _offset = _widget.offset();
  _offset.left += _marginX;
  _offset.top += _marginY;
  _widget.offset(_offset);
}


shiftDialogWidget($('#title-dialog').dialog('widget'), -14, -14);
shiftDialogWidget($('#opts-dialog').dialog('widget'), -14, 14);


})(jQuery);
