# WebDAVFileTree
Pure javascript lib able to display the content of a remote webdav directory on a html page.

## Description

It's in fact just a connector between two existing HTML/javascript code :
 - jquery.fileTree from Cory LaViska available at http://www.abeautifulsite.net/jquery-file-tree/
(slightly modified to work with a javascript connector instead of a connector on a remote server).
 - jsdavclient, a "Low-level JavaScript WebDAV client implementation written in Javascript" from Sven vogler,
 available at https://github.com/svogler (slightly modified to avoid a compatibilty problem with chrome).

## Compatibilty
### Browsers
Tested successfull on firefox, chrome and internet explorer 11.

## Webdav server
Tested with a webdav lighttpd server accessed through a apache reverse proxy, both on port 443.
The apache server also host the html pages, so there is no cross domain request from client point of view.
