function loadVimeoVideo(id) {
    'use strict';
    
    // set up request service
    var req, json, cdn, url;
    if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
        req = new XMLHttpRequest();
    } else { // code for IE6, IE5
        req = new ActiveXObject('Microsoft.XMLHTTP');
    }
    console.log(('window.XMLHttpRequest: ').concat(window.XMLHttpRequest));
    console.log(('req: ').concat(req));
    req.onreadystatechange = function () {
        console.log(('req.readyState: ').concat(req.readyState));
        console.log(('req.status: ').concat(req.status));
        if (req.readyState === 4 && req.status === 200) {
            console.log(('req.responseText: ').concat(req.responseText));
            json = JSON.parse(req.responseText);
            console.log(('json: ').concat(json));
            cdn = json.request.files.h264.sd.url;
            console.log(('cdn: ').concat(cdn));
            document.getElementById(id).getElementsByTagName('source')[0].setAttribute('src', cdn);
            console.log(('src: ').concat(document.getElementById(id).getElementsByTagName('source')[0].getAttribute('src')));
        }
    };
    
    // send a request
    url = ('assets/php/vimeov5.php?id=').concat(id);
    console.log(('url: ').concat(url));
    req.open('GET', url, true);
    req.send();
}