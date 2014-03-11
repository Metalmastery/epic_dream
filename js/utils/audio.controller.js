// audio scheme
// sound - pan - gain - filter (for all sounds) - output

// TODO normalize all sounds

var audioController = new audioCtrl();

function audioCtrl (){
    var soundURLs = {
            projectile : [
                'sound/laser_1.wav',
                'sound/laser_2.wav',
                'sound/laser_3.wav',
                'sound/laser_4.wav',
                'sound/laser_5.wav'
            ],
            rocket : [
                'sound/rocket_1.wav'
            ],
            beam : [
                'sound/beam_1.wav'
            ],
            explosion : [
                'sound/explosion_1.wav'
            ]
        },
        musicURLs = [
            'sound/music/rez_kenet_-_unreeeal_superhero_3.mp3'
        ],
        musicAudioElements = [],
        audioBuffers = {},
        listener = {x : 0, y : 0},
        context = null,
        soundsGainNode = null,
        soundsPannerNode = null,
        listenerPannerNode = null,
        musicPannerNode = null,
        musicGainNode = null,
        listenerGainNode = null,
        previousValues = {};

    try {
        window.AudioContext = window.AudioContext||window.webkitAudioContext;
        context = new window.AudioContext();
    } catch (e) {
        alert('No audio context on device');
        return false;
    }

    if (context){
        init();
    }

    function init(){
        soundsGainNode = context.createGain();
        soundsGainNode.connect(context.destination);
//        gainNode.gain.value = 0.1;

        soundsPannerNode = context.createPanner();
        soundsPannerNode.connect(soundsGainNode);
        soundsPannerNode.rolloffFactor = 0.05;

        musicGainNode = context.createGain();
        musicGainNode.connect(context.destination);
        musicGainNode.gain.value = 0.1;

        musicPannerNode = context.createPanner();
        musicPannerNode.connect(musicGainNode);
//        musicPannerNode.rolloffFactor = 0.1;

        listenerGainNode = context.createGain();
        listenerGainNode.connect(context.destination);
        listenerGainNode.gain.value = 0.2;

        listenerPannerNode = context.createPanner();
        listenerPannerNode.connect(listenerGainNode);
//        listenerPannerNode.rolloffFactor = 0.1;

        loadResources();
    }

    function attachListener (obj){
        listener = obj;
    }

    function loadSound(url, successCb, errorCb) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';

        // Decode asynchronously
        request.onload = function() {
            context.decodeAudioData(request.response, successCb, errorCb);
        };
        request.send();
    }

    function loadResources(){
        for (var i in soundURLs){
            if (!audioBuffers.hasOwnProperty(i)){
                audioBuffers[i] = [];
            }
            for (var j = 0; j < soundURLs[i].length; j++) {
                var url = soundURLs[i][j];
                (function(){
                    var tmp = i;
                    loadSound(url, function(buffer){
                        console.log(tmp);
                        audioBuffers[tmp].push(buffer);
                    })
                })();
            }
        }

        for (var j = 0; j < musicURLs.length; j++) {
            var url = musicURLs[j];
            (function(){
                console.warn('!!!!! prepare');
                var audio = new Audio();
                audio.addEventListener('loadeddata', function(){
                    console.warn('!!!!! load', this);
                    musicAudioElements.push(this);
                    if (musicAudioElements.length == musicURLs.length){
                        playMusic();
                    }
                });
                audio.src = url;
                audio.load();
                console.log(audio, url);
            })();
        }
    }

    function playSound(type, x, y) {
        var panner = listenerPannerNode   ;
        x = x || 0;
        y = y || 0;
        if (x - listener.x !== 0 && y - listener.y !== 0){
            soundsPannerNode.setPosition(x - listener.x, y - listener.y, 0);
            panner = soundsPannerNode;
        }
        var source = context.createBufferSource();
        source.buffer = audioBuffers[type][Math.random()*audioBuffers[type].length >> 0];
        source.connect(panner);
        source.start(0);
    }

    function playMusic(){
        console.warn('!!!!! play music');
        var audioElement = musicAudioElements[Math.random() * musicAudioElements.length >> 0];
        var mediaSourceNode = context.createMediaElementSource(audioElement);
        mediaSourceNode.connect(musicPannerNode);
        window.so = audioElement;
        audioElement.play();
    }

    function play(){
        for (var i in previousValues){
            console.log(this[i], i);
            this[i].gain.value = previousValues[i];
        }
    }

    function mute(){
        previousValues = {
            'listenerGainNode' : listenerGainNode.gain.value,
            'soundsGainNode' : soundsGainNode.gain.value,
            'musicGainNode' : musicGainNode.gain.value
        };
        listenerGainNode.gain.value = 0;
        soundsGainNode.gain.value = 0;
        musicGainNode.gain.value = 0;

    }

//    loadSound('sound/laser_1.wav', loadSuccess, function(){console.log(arguments)});

//    this.buffers = audioBuffers;
    this.playSound = playSound;
//    this.panner = musicPannerNode;
//    this.gain = musicGainNode;
    this.attachListener = attachListener;
    this.mute = mute;
    this.play = play;

    this.soundsGainNode = soundsGainNode;
    this.musicGainNode = musicGainNode;
    this.listenerGainNode = listenerGainNode;

}



