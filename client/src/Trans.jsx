import React, { useEffect, useRef, useState } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

const DailyDeepgram = () => {
  const [isMeetingJoined, setIsMeetingJoined] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const videoRef = useRef(null);
  const callFrame = useRef(null);
  const deepgramSocketRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const dailyRoomURL = "https://project1.daily.co/EQJhN7cHN0Z9YSSslKjm"; // Replace with your Daily room URL
  const deepgramApiKey = 'b4cc6486951a12492673090971ed4736395b59de'; // Replace with your Deepgram API Key

  // Handle joining the meeting
  const joinMeeting = () => {
    // Initialize Daily call frame
    setIsMeetingJoined(true); // Update state to show that meeting is joined
    
    callFrame.current = DailyIframe.createFrame({
      iframeStyle: {
        position: 'absolute',
        width: '100%',
        height: '50%',
        border: '0',
        zIndex: 1, // Set z-index lower than the buttons
      },
      showLeaveButton: true,
    });

    // Attach the call frame to the video container
    callFrame.current.join({ url: dailyRoomURL });

    callFrame.current.on('track-started', (event) => {
        if (event.track.kind === 'audio') {
          const audioTrack = event.track;
          console.log('Audio track started', audioTrack);
          // Send the audio stream to your real-time transcription service
      // Set up MediaStream from the audio track
      const mediaStream = new MediaStream([audioTrack]);

      // Set up MediaRecorder to capture audio
      mediaRecorderRef.current = new MediaRecorder(mediaStream);



        }
      });



      
    // Set up listeners
    callFrame.current.on('joined-meeting', handleJoinedMeeting);

  };

  // Handle joining the Daily meeting and capture audio stream
  const handleJoinedMeeting = async () => {
    console.log('Joined the Daily meeting');

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    console.log("stresmiting audio stream", stream)
    if (stream) {
      mediaRecorderRef.current = new MediaRecorder(stream);
    }
  };

  // Toggle transcription on/off
  const toggleTranscription = () => {
    if (isTranscribing) {
      stopTranscription();
    } else {
      startTranscription();
    }
    setIsTranscribing(!isTranscribing);
  };

  // Start transcription by streaming audio to Deepgram
  const startTranscription = async () => {
    console.log("TRANSCRIPTION STARTED")
    const deepgram = createClient(deepgramApiKey);

    // Create a live transcription connection
    const connection = deepgram.listen.live({
      model: 'nova-2',
      language: 'en-US',
      smart_format: true,
    });
    console.log("connection creted")

    // Listen for live transcription events

    //EXTRACT AUDIO DATA FROM STREAM
    



    connection.on(LiveTranscriptionEvents.Open, () => {
      console.log('Deepgram connection opened.');

      // Capture audio and send to Deepgram
      mediaRecorderRef.current.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          connection.send(event.data);
        }
      };

      mediaRecorderRef.current.start(250); // Send audio every 250ms
    });

    console.log("LISTENING FOR TRANSCRITPITON")
    // Listen for transcriptions
    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        console.log("data ",data)
      const transcript = data.channel.alternatives[0].transcript;
      console.log('Received transcription:', transcript);
      if (transcript) {
        setTranscription((prev) => `${prev}\n${transcript}`);
      }
    });

    connection.on(LiveTranscriptionEvents.Error, (err) => {
      console.error('Deepgram WebSocket error:', err);
    });

    connection.on(LiveTranscriptionEvents.Close, () => {
      console.log('Deepgram connection closed.');
    });

    deepgramSocketRef.current = connection;
  };

  // Stop transcription and close WebSocket connection
  const stopTranscription = () => {
    if (deepgramSocketRef.current) {
      deepgramSocketRef.current.close();
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setTranscription(''); // Clear transcription text
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Show "Join Meeting" button initially */}
      {!isMeetingJoined ? (
        <button
          onClick={joinMeeting}
          style={{
            padding: '10px 20px',
            backgroundColor: 'blue',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Join Meeting
        </button>
      ) : (
        <>
          {/* Video container */}
          <div
            ref={videoRef}
            style={{ position: 'relative', zIndex: 1 }}
          />

          {/* Transcription overlay */}
          {isTranscribing && (
            <div style={{
              top: '10px',
              left: '10px',
              width: '780px',
              height: '100px',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              padding: '10px',
              overflowY: 'auto',
              borderRadius: '8px',
              zIndex: 2, // Ensure transcription is above the iframe
            }}>
              <h4>Live Transcription:</h4>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{transcription}</pre>
            </div>
          )}

          {/* Toggle transcription button */}
          <button
            onClick={toggleTranscription}
            style={{
              position: 'absolute',
              top: '620px',
              left: '10px',
              padding: '10px 20px',
              backgroundColor: isTranscribing ? 'red' : 'green',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              zIndex: 2, // Ensure button is above the iframe
            }}
          >
            {isTranscribing ? 'Stop Transcription' : 'Start Transcription'}
          </button>
        </>
      )}
    </div>
  );
};

export default DailyDeepgram;
