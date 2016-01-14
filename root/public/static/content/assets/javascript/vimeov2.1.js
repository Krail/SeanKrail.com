function loadVimeoVideo(id) {
    'use strict';
    var getJSON = function(url) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open('get', url, true);
            xhr.responseType = 'json';
            xhr.onload = function() {
                var status = xhr.status;
                console.log(('status: ').concat(status));
                if (status == 200) { resolve(xhr.response); }
                else { reject(status); }
            };
            xhr.send();
        });
    };
    console.log(('url: ').concat(('https://player.vimeo.com/video/').concat(id, '/config')));
    getJSON(('https://player.vimeo.com/video/').concat(id, '/config')).then(
        function(data) {
            console.log(('data: ')).concat(data);
            console.log(('data.data: ')).concat(data.data);
            console.log(('data.result: ')).concat(data.result);
            document.getElementById(id).getElementsByTagName('source')[0].setAttribute('src', (JSON.parse(data.result)).request.files.h264.sd.url);
            console.log(('src: ').concat(document.getElementById(id).getElementsByTagName('source')[0].getAttribute('src')));
        }, function(status) { //error detection....
            console.log(('Error: status: ').concat(status));
        }
    );
}