/* GLOBAL VARS */
var audio_buffers_dict = {};
var audioCtx = null;
var initalized = false;
var isPlayButtonPressed = false;
var playingStreams = {};



// Wrapper function to create audioBuffer objects from all mp3 files
function getAllAudioBuffers(){
    // Get a list of all audio file names
    var audio_file_ids = [];
    audio_button_elements = $('.audioButton');
    for (elem of audio_button_elements){
        audio_file_ids.push(elem.id);
    }
    // Get AudioBuffer for each audio file
    for (let i=0;i<audio_file_ids.length;i++){
        getAudioFile(audio_file_ids[i]);
    }
}
// Receives a single audio file name (without .mp3), fetches it and appends to a map of audioBuffers
function getAudioFile(audio_file_id) {
    full_path = "audio/" + audio_file_id + ".mp3";

    var request = new XMLHttpRequest();
    request.open('GET', full_path, true);
    request.responseType = 'arraybuffer';
  
    request.onload = function() {
      var audioData = request.response;
      audioCtx.decodeAudioData(audioData, function(buffer) {
        audio_buffers_dict[audio_file_id] = buffer;
        },
        function(e){ console.log("Error with decoding audio data" + e.err); });
    }
  
    request.send();
}

// After the page is loaded - define click actions on audio buttons
$(document).ready(function() {
    $('.audioButton').click(buttonClicked);
  });

// Perform initialization on the first click anywhere on the page
$(document).bind('touchstart mousedown', function(){
    if (!initalized){
        audioCtx = new AudioContext();
        getAllAudioBuffers();
        initalized = true;
    }
});

// Handles the callback for any of the audio buttons
function buttonClicked(){
    $(this).toggleClass("playing");
    if (this.id in playingStreams){ 
        playingStreams[this.id].stop();
    }
    else if (Object.keys(playingStreams).length == 0){
        playActive();
    }
}
/* This is the callback for when a specific track has ended or was stopped, 
It should remove itself from playingStreams, and call the next "loop" if it was the last one playing
*/
function trackEndedOrStopped(){
    for(const [id,buf] of Object.entries(playingStreams)){
        // Remove the current track from playing streams
        if(buf===this){
            delete(playingStreams[id]);
        }
    }
    // All tracks finished playing => next loop
    if (Object.keys(playingStreams).length == 0){
        playActive();
    }
}

// Handles the callback for the "PLAY" button
function startGlobalPlaying(){
    $("#play").addClass("playPressed");
    if (!isPlayButtonPressed){
        isPlayButtonPressed = true;
        playActive();
    }
}

/* Iterate over the "active" tracks and play them immediately, if the play button is pressed.
Called when:
1. Clicking the global play button
2. Clicking an audio button
3. All tracks have finished or were stopped from playing (as part of the trackEndedOrStopped callback)
*/
function playActive(){
    if (!isPlayButtonPressed){
        return;
    }
    for (elem of $('.playing')){
        cur_buf = audioCtx.createBufferSource();
        cur_buf.buffer=audio_buffers_dict[elem.id];
        cur_buf.connect(audioCtx.destination);
        cur_buf.start(0);
        cur_buf.onended = trackEndedOrStopped;
        playingStreams[elem.id] = cur_buf;
    }
}

// Handles the "STOP" button callback
function stopPlaying(){
    $("#play").removeClass("playPressed");
    isPlayButtonPressed = false;
    stopAllPlayingStreams();
}

function stopAllPlayingStreams(){
    for (buf of Object.values(playingStreams)){
        buf.stop();
    }
}
/* Alternative working methods - First Attmept mixing all streams together
    Better synchronization, but currently cannot stop tracks until the next loop
    Unused in current solution
 */

var playingMix = null; // Global variable

function mixAndPlay(){
    playingMix = audioCtx.createBufferSource();
    playingMix.buffer = mixActiveTracks();
    playingMix.connect(audioCtx.destination);
    playingMix.loop = true;
    //will playback the entire mixdown
    playingMix.start(0)

}

// Mixes several audioBuffer objects into a single audioBuffer than can be played
function mixActiveTracks(){
    //Potential TODO: Remove stopped audio from the mix without recalculating but using -=.
    var activeAudioBuffers = [];
    for (elem of $('.playing')){
        activeAudioBuffers.push(audio_buffers_dict[elem.id])
    }

    //Get maximal audio length
    let maxLength = 0;
    for(let track of activeAudioBuffers){
        if(track.length > maxLength){
            maxLength = track.length;
        }
    }  
    //Based on: https://stackoverflow.com/questions/57155167/web-audio-api-playing-synchronized-sounds
    
    //create a buffer using the totalLength and sampleRate of the first buffer node
    const numberOfChannels = 2; // Stereo - Left and Right

    let finalMix = audioCtx.createBuffer(numberOfChannels , maxLength, activeAudioBuffers[0].sampleRate);

    //first loop for buffer list
    for(let i = 0; i < activeAudioBuffers.length; i++){

           // second loop for each channel ie. left and right (If existing)
           for(let channel = 0; channel < activeAudioBuffers[i].numberOfChannels; channel++){

            //here we get a reference to the final mix buffer data
            let buffer = finalMix.getChannelData(channel);

                //last is loop for updating/summing the track buffer with the final mix buffer 
                for(let j = 0; j < activeAudioBuffers[i].length; j++){
                    buffer[j] += activeAudioBuffers[i].getChannelData(channel)[j];
                }
           }
    }

    return finalMix;
}
