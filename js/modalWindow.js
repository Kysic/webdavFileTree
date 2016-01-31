// Modal Window
var modalWindow = (function($) {

	function moveTo(fmTop, fmLeft) {
		$('#modalWindow').css({
			'top' : fmTop > 0 ? fmTop : 0,
			'left' : fmLeft > 0 ? fmLeft : 0
		});
	}

	function centerInWindow() {
		var fmTop = $(window).height() / 2.5 - $('#modalWindow').height() / 2;
		var fmLeft = $(window).width() / 2 - $('#modalWindow').width() / 2;
		moveTo(fmTop, fmLeft);
	}
	
	function show(contenuHtml, titreHtml, noCloseButton) {
		$('#overlay').show();
		$('#modalWindowTitle').html(titreHtml ? titreHtml : '&nbsp;');
		$('#modalWindowContent').html(contenuHtml);
		if (noCloseButton) {
			$('#modalWindowClose').hide();
		} else {
			$('#modalWindowClose').show();
			$('#modalWindowClose').click(function() {
				close();
			});
		}
		centerInWindow();
		$('#modalWindow').show();
		centerInWindow();
	}

	function showLoadingMsg() {
		show("Loading", "Loading...", true);
	}

	function open(url) {
		showLoadingMsg();
		$.ajax({
			url : url,
			dataType : 'html',
			success : function(data) {
				show(data);
			},
			error : function(qXHR, textStatus, error) {
				$(document).trigger('error', [ textStatus, error ]);
			}
		});
	}
	
	function postData(url, data) {
		showLoadingMsg();
		$.ajax({
			type : 'POST',
			data : data,
			url : url,
			dataType : 'html',
			success : function(data) {
				show(data);
			},
			error : function(qXHR, textStatus, error) {
				$(document).trigger('error', [ textStatus, error ]);
			}
		});
	}

	function submitForm(modalForm) {
		postData(modalForm.attr('action'), modalForm.serialize());
		return false;
	}

	function close() {
		$("#overlay").hide();
		$("#modalWindow").hide();
	}
	
	$(document).on('error', function(event, errorTitle, errorMsg) {
		show(errorMsg, errorTitle);
	});

    // Move the window by clicking the title
	var initalPageX;
	var initalPageY;
	var intialFenTop;
	var intialFenLeft;
	var mouseMoveHandler = function(event) {
		moveTo(intialFenTop + event.pageY - initalPageY, intialFenLeft
				+ event.pageX - initalPageX)
	};
	var mouseUpHandler = function(event) {
		$(window).off('mousemove', mouseMoveHandler);
		$(window).off('mouseup', mouseUpHandler);
	};

	$('#modalWindow').ready(function() {
		$('#modalWindowTitle').mousedown(function(event) {
			initalPageX = event.pageX;
			initalPageY = event.pageY;
			intialFenTop = parseInt($('#modalWindow').css('top'));
			intialFenLeft = parseInt($('#modalWindow').css('left'));
			$(window).on('mousemove', mouseMoveHandler);
			$(window).on('mouseup', mouseUpHandler);
		});
	});

	return {
		show: show,
        open: open,
		close: close,
		postData: postData,
		submitForm: submitForm
	};

})(jQuery);

