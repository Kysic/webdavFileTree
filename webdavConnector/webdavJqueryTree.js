// Webdav connector
// By Kysic

var webdavJqueryTreeConnector = (function() {

    var client = new davlib.DavClient();
    var host, port, protocol, username, password;
    var debug = false;
    var alertOnError = true;

    /**
        The constructor
    
        host - the host name or IP
        port - HTTP port of the host (optional, defaults to 80)
        protocol - protocol part of URLs (optional, defaults to http)
        username - the username for authorization (only Basic auth is supported at that time)
        password - the password to use
    */
    function initialize(webdavHost, webdavPort, webdavProtocol, webdavUsername, webdavPassword) {
        if (debug) console.log('initialize() - Host=' + webdavHost + ' Port=' + webdavPort
                               + ' Protocol=' + webdavProtocol + ' Username=' + webdavUsername);
        host = webdavHost;
        port = webdavPort;
        protocol = webdavProtocol;
        username = webdavUsername;
        password = webdavPassword;
        client.initialize(host, port, protocol, username, password);
    }

    /**
        Extract directory content (dir and file) from webdav server response.
        This methode is "hand made" from the response I get from my server without looking at webdav specification
        or testing it on several browser.
        It will certainly need some corrections to work with another webdav server or configuration
        (in particular the xml tag prefix shortcut "D" for "DAV" and the directory contentType "httpd/unix-directory").
    */
    function extractDirContent(webdavResponse) {
        var dirContent = { dirList: [ ], fileList: [ ] };
        var xmlDoc = $.parseXML(webdavResponse);
        $(xmlDoc).find('response, D\\:response, DAV\\:response').each(function(){
            var fileContentType = $(this).find('getcontenttype, D\\:getcontenttype, DAV\\:getcontenttype').text(); 
            var isDir = fileContentType == 'httpd/unix-directory';
            var fileHref = $(this).find('href, D\\:href, DAV\\:href').text(); 
            var filename = decodeURI(fileHref.replace(/^.*\//, ''));
            if ( isDir ) {
                dirContent.dirList.push(filename);
            } else {
                dirContent.fileList.push(filename);
            }
        });
        dirContent.dirList.sort();
        dirContent.fileList.sort();
        if (debug) console.log(dirContent);
        return dirContent;
    }

    function listDirCallback(dir, connectorCallback) {
        return function(status, statusstr, content) {
            if (status != 207) {
                console.log('listDirCallback() - UnexpectedStatus :' + status + ' - ' + statusstr);
                if (alertOnError) alert('Unable to listDir, unexpected server response : ' + status + ' - ' + statusstr);
                connectorCallback('');
            } else {
                if (debug) console.log('listDirCallback() - Content : ' + content);
                var dirContent = extractDirContent( content);
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
                connectorCallback(jqueryTreeReponse);
            }
        }
    }

    function listDir(dir, connectorCallback) {
        if (debug) console.log('listDir() : dir=' + dir);
        try {
            client.PROPFIND(dir,  listDirCallback(dir, connectorCallback), null, 1);
        } catch (err) {
            console.log(err);
            if (alertOnError) alert('Unable to listDir, internal error : ' + err.name + " - " + err.message);
        }
    }

    function openFile(file) {
        if (debug) console.log('openFile() - File : ' + file);
        try {
            window.open(protocol + "://" + username + ":" + password + "@"+ host + ":" + port + file, '_blank');
        } catch (err) {
            console.log(err);
            window.open(protocol + "://" + host + ":" + port + file, '_blank');
        }
    }

	return { initialize: initialize, listDir: listDir, openFile: openFile };

})();

