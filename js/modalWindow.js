/*
    modalWindow.js - Small js lib used to display a modal window overlay
    Copyright (C) 2016  Ludovic PLANTIN

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
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

