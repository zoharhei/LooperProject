# LooperProject
This project yields a responsive web page where users could amuse themselves by playing audio files in a loop machine.
The project contains three files: index.html, script.js, style.css.
1.	index.html: describes buttons of two kinds: audio-button and control-buttons.  The audio buttons are linked (by 'id') to different mp3 files, whereas the control-buttons are used for starting or stopping the audio playback.

2.	style.css: the overall layout was designed using a 3x4 CSS grid. The top 3x3 cells are dedicated to the audio buttons whereas the bottom row is kept for the control buttons. The audio buttons were designed with an illuminating effect. Hover and click effects were included for better user experience.

3.	script.js: The main logic of the project. Includes:
  a.	Converting all mp3 files to AudioBuffer objects upon a user's first interaction with the page. Intialization of the Audio context file
  b.	Defining callbacks for the clickable buttons: audio buttons control individual track playback, the play button initiates the playback for all active tracks and the stop button stops the playback completely.
  c.	Adding/removing tracks from the loop: indicated by adding and removing a class to the pressed button.
  d.	Starting the playback: creating a BufferSource object from each active button using JQuery and a class CSS selector and playing them.
  e.	Looping: the loop property of the BufferSource is not used. Instead, looping is achieved by binding to the 'onended' event of the played tracks.
    i.	The 'onended' event is fired when a track finished playing or was stopped, it verifies whether the track is the last one playing, and initiates another loop (of all selected tracks) accordingly.
    ii.	This approach was chosen in order to allow the synchronization of playback between already playing tracks and newly requested ones, as they are played in the next loop. 
    iii.	Other approaches for looping were considered: combining all chosen tracks into a single AudioBuffer (can be seen under the 'mixActiveTracks' function). This approach is highly accurate in timing but lacks the ability to stop individual tracks mid-playback.
  f.	Stopping individual tracks: the callback function for the Audio Buttons is able to stop the specific playback using the BufferSource object which is stored globally in a map, and matched using the 'id' of the clicked button.


Hope you enjoy the experience!
