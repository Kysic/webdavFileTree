/*
    WebDAV file tree - small js lib used to display the content of a remote webDAV server
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

var webdavUI = (function($, webdavLayer, queryString, modalWindow) {

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

    function createDir(parentDir) {
        var newDirName = prompt('New directory name : ');
        if (!newDirName) return;
        var dirToCreate = parentDir + newDirName;
        modalWindow.show('Creating dir, please wait...', 'Loading', true);
        webdavLayer.createDir({
            dir: dirToCreate,
            success: function() {
                refreshFileTree();
                modalWindow.close();
            },
            error: function(errorCode, errorMsg) {
                modalWindow.show('Unable to create dir ' + dirToCreate + ':<br />'
                                 + errorCode + ' : ' + errorMsg, 'Create directory error');
            }
        });
    }

    function moveFile(fileSrc, dirDest) {
        if (!fileSrc) {
            modalWindow.show('No file in clipboard to paste', 'Move file error');
            return;
        }
        var fileDest = dirDest + fileSrc.replace(/\/$/, '').replace(/^.*\//, '');
        modalWindow.show('Moving file, please wait...', 'Loading', true);
        webdavLayer.moveFile({
            src: fileSrc,
            dest: fileDest,
            success: function() {
                refreshFileTree();
                modalWindow.close();
            },
            error: function(errorCode, errorMsg) {
                modalWindow.show('Unable to move file ' + fileSrc + ' to ' + fileDest + ':<br />'
                                 + errorCode + ' : ' + errorMsg, 'Move file error');
            }
        });
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

    function deleteFile(fileToDelete) {
        if (confirm('Delete ' + fileToDelete + ' ?')) {
            modalWindow.show('Deleting file, please wait...', 'Loading', true);
            webdavLayer.deleteFile({
                file: fileToDelete,
                success: function() {
                    refreshFileTree();
                    modalWindow.close();
                },
                error: function(errorCode, errorMsg) {
                    modalWindow.show('Unable to delete file ' + fileToDelete + ':<br />'
                                     + errorCode + ' : ' + errorMsg, 'Delete file error');
                }
            });
        }
    }

    function clearClipboard() {
        $('#fileCut').val('');
    }

    function pasteInRootDir() {
        moveFile($('#fileCut').val(), getFormRootDir());
    }

    // Load get param from URL. 
    $( document ).ready(function() {
        if (queryString.webdavUser) $('#webdavUser').val(queryString.webdavUser);
        if (queryString.webdavRoot) $('#webdavRoot').val(queryString.webdavRoot);
    });

    // Configure right clic menu
    function rightMenuCallback(key, options) {
        var fileRef = this.context.rel;
        switch(key) {
            case 'open':
                openFile(fileRef);
                break;
            case 'createDir':
                createDir(fileRef);
                break;
            case 'cut':
                $('#fileCut').val(fileRef);
                break;
            case 'paste':
                moveFile($('#fileCut').val(), fileRef);
                break;
            case 'delete':
                deleteFile(fileRef);
                break;
        }
    }
    $( document ).ready(function() {
        $.contextMenu({
            selector: '.directory>a', 
            callback: rightMenuCallback,
            items: {
                'createDir': {name: 'New dir', icon: 'edit'},
                /*'cut': {name: 'Cut', icon: 'cut'},*/
                'paste': {name: 'Paste', icon: 'paste'},
                'sep': '---------',
                'delete': {name: 'Delete', icon: 'delete'}
            }
        });
        $.contextMenu({
            selector: '.file>a', 
            callback: rightMenuCallback,
            items: {
                'open': {name: 'Open', icon: 'edit'},
                'cut': {name: 'Cut', icon: 'cut'},
                /*'copy': {name: 'Copy', icon: 'copy'},*/
                'sep': '---------',
                'delete': {name: 'Delete', icon: 'delete'}
            }
        });
    });

    return {
        connect: connect,
        disconnect: disconnect,
        refreshFileTree: refreshFileTree,
        clearClipboard: clearClipboard,
        pasteInRootDir: pasteInRootDir,
        openFile: openFile,
        createDir: createDir,
        uploadFiles: uploadFiles,
        deleteFile: deleteFile
    };

})(jQuery, webdavLayer, queryString, modalWindow);
