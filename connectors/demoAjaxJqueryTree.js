// Simple pure ajax demo
// By Kysic

var demoAjaxJqueryTreeConnector = (function() {

    function listDir(dir, connectorCallback) {
        connectorCallback('<ul class="jqueryFileTree" style="display: none;">' +
               '<li class="directory collapsed"><a href="#" rel="'+dir+'Rep1/">Rep1</a></li>' +
               '<li class="directory collapsed"><a href="#" rel="'+dir+'Rep2/">Rep2</a></li>' +
               '<li class="file ext_txt"><a href="#" rel="'+dir+'File1.txt">File1.txt</a></li>' +
               '<li class="file ext_zip"><a href="#" rel="'+dir+'File2.zip">File2.zip</a></li>' +
               '</ul>');
    }

    return {
        listDir : listDir
    };

})();
