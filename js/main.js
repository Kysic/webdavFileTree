// Extraction of HTTP GET param from the query string
var queryString = function () {
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split('=');
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
            query_string[pair[0]] = arr;
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    } 
    return query_string;
}();

var webdavJqueryTree = (function($, webdavLayer, queryString, modalWindow) {

    function getFormRootDir() {
        var rootDir = $('#webdavRoot').val();
        if (rootDir.length == 0 || rootDir.slice(-1) != '/') {
            rootDir += '/';
        }
        return rootDir;
    }
    function removeRootDir(dir) {
        return String(dir).replace(getFormRootDir(), '');
    }
    function refreshFileTree() {
		$('#fileTree').fileTree({
                root: getFormRootDir(),
                folderEvent: 'click',
                expandSpeed: 750,
                collapseSpeed: 750,
                multiFolder: false,
                ajaxConnector: listDir
            }, openFile);
    }
    function connect() {
        modalWindow.show('Trying to connect to webdav server, please wait...', 'Loading', true);
        webdavLayer.connect({
            protocol: 'https',
            host: location.hostname,
            port: 443,
            username: $('#webdavUser').val(),
            password: $('#webdavPassword').val(),
            rootDir: getFormRootDir(),
            success: function(dirContent) {
                password: $('#webdavPassword').val('');
                $('#loginMenu').hide();
                $('.sessionUserName').html($('#webdavUser').val());
                $('.sessionRootDir').html(getFormRootDir());
                $('#actionMenu').show();
                refreshFileTree();
                modalWindow.close();
            },
            error: function(errorCode, errorMsg) {
                modalWindow.show(errorCode + ' : ' + errorMsg, 'Unable to connect');
            }
        });
    }

    function disconnect() {
        $('#actionMenu').hide();
        $('#loginMenu').show();
        $('#fileTree').html('');
    };

    function listDir(dir, jTreeCallback) {
        webdavLayer.listDir({
            dir: dir,
            success: function(dirContent) {
                $('#uploadRemoteDir').val(removeRootDir(dir));
                var jqueryTreeReponse = '<ul class="jqueryFileTree" style="display: none;">';
                dirContent.dirList.forEach(function(childDirName) {
                    jqueryTreeReponse += '<li class="directory collapsed"><a href="#" rel="' +
                                                dir + childDirName + '/">' + childDirName + '</a></li>';
                });
                dirContent.fileList.forEach(function(childFileName) {
                    var fileExt = childFileName.replace(/^.*\./, '');
                    jqueryTreeReponse += '<li class="file ext_' + fileExt + '"><a href="#" rel="' +
                                                dir + childFileName + '">' + childFileName + '</a></li>';
                });
                jqueryTreeReponse += '</ul>';
                jTreeCallback(jqueryTreeReponse);
            },
            error: function(errorCode, errorMsg) {
                modalWindow.show('Unable to list directory content ' + dir + ':<br />'
                                 + errorCode + ' : ' + errorMsg, 'List directory error');
                jTreeCallback('');
            }
        });
    }

    function openFile(file) {
        webdavLayer.openFile(file);
    }

    function uploadFiles() {
        modalWindow.show('Uploading file, please wait...', 'Loading', true);
        var nbFiles = 0;
        jQuery.each(jQuery('#filesInput')[0].files, function(i, file) {
            var remoteDir = getFormRootDir() + $('#uploadRemoteDir').val();
            nbFiles++;
            webdavLayer.uploadFile({
                remoteDir: remoteDir,
                fileName: file.name,
                fileData: file,
                success: function() {
                    nbFiles--;
                    if (nbFiles == 0) {
                        refreshFileTree();
                        modalWindow.close();
                    }
                },
                error: function(errorCode, errorMsg) {
                    modalWindow.show('Unable to upload file ' + file.name + ' to ' + remoteDir + ':<br />'
                                     + errorCode + ' : ' + errorMsg, 'Upload error');
                }
            });
        });
        if (nbFiles == 0) {
            modalWindow.close();
        }
    }

    function deleteFile() {
        if (!$('#fileToDelete').val()) return;
        var deletedFile = getFormRootDir() + $('#fileToDelete').val();
        if (confirm('Delete ' + deletedFile + ' ?')) {
            modalWindow.show('Deleting file, please wait...', 'Loading', true);
            webdavLayer.deleteFile({
                file: deletedFile,
                success: function() {
                    refreshFileTree();
                    modalWindow.close();
                },
                error: function(errorCode, errorMsg) {
                    modalWindow.show('Unable to delete file ' + $('#fileToDelete').val() + ':<br />'
                                     + errorCode + ' : ' + errorMsg, 'Delete file error');
                }
            });
        }
    }

    // Load get param from URL. 
    $( document ).ready(function() {
        if (queryString.webdavUser) $('#webdavUser').val(queryString.webdavUser);
        if (queryString.webdavRoot) $('#webdavRoot').val(queryString.webdavRoot);
        // If you want to indicate the webdav password in URL, be aware it s not safe.
        // if (QueryString.webdavPassword) document.getElementById('webdavPassword').value = QueryString.webdavPassword;
        if (queryString.webdavUser && queryString.webdavPassword && queryString.webdavRoot) {
            connect();
        }
    });

	return {
		connect: connect,
        disconnect: disconnect,
        refreshFileTree: refreshFileTree,
        uploadFiles: uploadFiles,
        deleteFile: deleteFile
	};

})(jQuery, webdavLayer, queryString, modalWindow);
