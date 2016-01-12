# WebDAVFileTree
Pure javascript lib able to display the content of a remote webdav directory on a html page.

It's in fact just a connector between two existing HTML/javascript code :
 - jquery.fileTree from Cory LaViska available at http://www.abeautifulsite.net/jquery-file-tree/
(slightly modified to work with a javascript connector instead of a connector on a remote server).
 - jsdavclient, a "Low-level JavaScript WebDAV client implementation written in Javascript" from Sven vogler,
 available at https://github.com/svogler and use as it is.

Tested successfull only on firefox at the moment :
- with ie, the tree works, but there is a security issue when trying to open a file with the syntax https://user:pwd@host/path/file
- with chrome, there is a problem with a header set in jsdavclient.
