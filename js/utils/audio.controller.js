var audioController = new audioCtrl();

function audioCtrl (){
    var sounds = [
        'sound/laser1.wav'
    ];

    var context = null;

    try {
        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        context = new window.AudioContext();
    } catch (e) {
        alert('No audio context on device');
        return false;
    }

    function loadSound(url, successCb, errorCb) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        // Decode asynchronously
        request.onload = function() {
            context.decodeAudioData(request.response, successCb, errorCb);
        }
        request.send();
    }


}



