import { Box, Button } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import "./style.css";
// const User = require("../Models/UserModel");
const ENDPOINT = "http://localhost:5000";
var socket;
let localStream;
let screenSharingStream;
let localPeerId;
let roomId;
var pcs = {};
const rtcConfig = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};
const mediaConstraints = {
  audio: true,
  video: true,
};
const offerOptions = {
  offerToReceiveVideo: 1,
  offerToReceiveAudio: 1,
};
const VideoCall = () => {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const { room, user, isGroup, name } = useParams();

  console.log(user);
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("join room", {
      roomId: room + "vc",
      peerUUID: user,
    });
    // roomId = room +"vc"
  }, [user]);

  useEffect(() => {
    socket.on("room_joined", async (event) => {
      localPeerId = event.peerId;
      console.log(roomId);
      await setLocalStream(mediaConstraints);
      socket.emit("start_call", {
        roomId: event.roomId,
        senderId: localPeerId,
      });
    });

    socket.on("start_call", async (event) => {
      const remotePeerId = event.senderId;
      pcs[remotePeerId] = new RTCPeerConnection(rtcConfig);
      addLocalTrack(pcs[remotePeerId]);
      pcs[remotePeerId].ontrack = (e) => setRemoteStream(e, remotePeerId);
      pcs[remotePeerId].oniceconnectionstatechange = (e) =>
        checkPeerDisconnect(remotePeerId);
      pcs[remotePeerId].onicecandidate = (e) => sendCandidate(e, remotePeerId);
      await createOffer(pcs[remotePeerId], remotePeerId);
    });

    socket.on("webrtc_offer", async (event) => {
      const remotePeerId = event.senderId;
      pcs[remotePeerId] = new RTCPeerConnection(rtcConfig);
      pcs[remotePeerId].setRemoteDescription(event.sdp);
      addLocalTrack(pcs[remotePeerId]);
      pcs[remotePeerId].ontrack = (e) => setRemoteStream(e, remotePeerId);
      pcs[remotePeerId].oniceconnectionstatechange = (e) =>
        checkPeerDisconnect(remotePeerId);
      pcs[remotePeerId].onicecandidate = (e) => sendCandidate(e, remotePeerId);
      await createAnswer(pcs[remotePeerId], remotePeerId);
    });
    socket.on("webrtc_answer", async (event) => {
      console.log("receive answer");
      pcs[event.senderId].setRemoteDescription(
        new RTCSessionDescription(event.sdp)
      );
    });
    socket.on("webrtc_ice_candidate", (event) => {
      console.log("receive ice");
      const senderPeerId = event.senderId;
      var candidate = new RTCIceCandidate({
        sdpMLineIndex: event.label,
        candidate: event.candidate,
      });
      pcs[senderPeerId].addIceCandidate(candidate);
    });
    socket.on("room_created", async (event) => {
      console.log("room created");
      localPeerId = event.peerId;
      await setLocalStream(mediaConstraints);
    });

    socket.on("end call", async (data) => {
      const remotePeerId = data.senderId;
      pcs[remotePeerId].close();
      console.log("END CALL");
      console.log(pcs[remotePeerId]);
      checkPeerDisconnect(remotePeerId);
      // delete pcs[remotePeerId];
    });
  }, [pcs]);

  const sendCandidate = (e, remotePeerId) => {
    if (e.candidate) {
      console.log(
        `sending ice from peer ${localPeerId} to peer ${remotePeerId}`
      );
      socket.emit("webrtc_ice_candidate", {
        senderId: localPeerId,
        receiverId: remotePeerId,
        roomId: roomId,
        label: e.candidate.sdpMLineIndex,
        candidate: e.candidate.candidate,
      });
    }
  };

  const checkPeerDisconnect = (remotePeerId) => {
    console.log("okas");
    var state = pcs[remotePeerId].iceConnectionState;
    console.log(`connection with peer ${remotePeerId}:${state}`);
    if (state === "failed" || state === "disconnected" || state === "closed") {
      console.log(`Peer ${remotePeerId} has disconnected`);
      const videoDisconnected = document.getElementById(
        "remotevideo_" + remotePeerId
      );
      videoDisconnected.remove();
    }
  };
  const addLocalTrack = (peer) => {
    localStream.getTracks().forEach((track) => {
      peer.addTrack(track, localStream);
    });
    console.log("Local tracks added");
  };
  const setLocalStream = async (mediaConstraints) => {
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);

      const localVideo = document.getElementById("localVideo");
      localStream = stream;
      console.log("local stream set");
      localVideo.srcObject = localStream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };
  const createOffer = async (peer, remotePeerId) => {
    let sessionDescription;
    try {
      sessionDescription = await peer.createOffer(offerOptions);
      peer.setLocalDescription(sessionDescription);
    } catch (error) {
      console.log(error);
    }
    console.log(`Sending offer from peer${localPeerId} to ${remotePeerId}`);
    socket.emit("webrtc_offer", {
      type: "webrtc_offer",
      sdp: sessionDescription,
      roomId: roomId,
      senderId: localPeerId,
      receiverId: remotePeerId,
    });
  };

  const createAnswer = async (peer, remotePeerId) => {
    let sessionDescription;
    try {
      sessionDescription = await peer.createAnswer(offerOptions);
      peer.setLocalDescription(sessionDescription);
    } catch (error) {
      console.log(error);
    }
    console.log(`sendeing answer from peer ${localPeerId} to ${remotePeerId}`);
    socket.emit("webrtc_answer", {
      type: "webrtc_answer",
      sdp: sessionDescription,
      roomId: roomId,
      senderId: localPeerId,
      receiverId: remotePeerId,
    });
  };
  const setRemoteStream = (e, remotePeerId) => {
    if (e.track.kind === "video") {
      const videoREMOTE = document.createElement("video");
      const videoContainer = document.getElementById("video-container");
      const remoteVideoDiv = document.createElement("div");
      remoteVideoDiv.id = "remotevideodiv_" + remotePeerId;

      videoREMOTE.srcObject = e.streams[0];
      videoREMOTE.id = "remotevideo_" + remotePeerId;
      if (isGroup === "false") videoREMOTE.className = "video video-single";
      if (isGroup === "true") videoREMOTE.className = "video";

      videoREMOTE.setAttribute("autoplay", "");
      remoteVideoDiv.append(videoREMOTE);
      videoContainer.append(remoteVideoDiv);
      console.log("remote stream set");
    }
  };

  const endCall = async () => {
    socket.emit("end call request", {
      roomId: room + "vc",
      senderId: localPeerId,
    });

    var keys = Object.keys(pcs);
    keys.forEach(async (key) => {
      pcs[key].close();
      checkPeerDisconnect(key);

      console.log("close ice");
    });

    // pcs.forEach((peer) => {
    //   peer.close();
    // });
    window.close();
  };
  const onMicCam = (type) => {
    const videoTrack = localStream.getVideoTracks()[0];
    const audioTrack = localStream.getAudioTracks()[0];
    const cambtn = document.getElementById("cambtn");
    const micbtn = document.getElementById("micbtn");
    if (type === "cam") {
      if (!videoTrack.enabled) {
        videoTrack.enabled = true;
        setVideoOn(true);
        cambtn.style.background = "white";
        return;
      }
      videoTrack.enabled = false;
      setVideoOn(false);
      cambtn.style.background = "red";
      return;
    }

    if (type === "mic") {
      if (!audioTrack.enabled) {
        audioTrack.enabled = true;
        setMicOn(true);
        micbtn.style.background = "white";
        return;
      }
      audioTrack.enabled = false;
      setMicOn(false);
      micbtn.style.background = "red";
      return;
    }
  };
  return (
    <>
      <Box
        className="video-container"
        id="video-container"
        display={"flex"}
      ></Box>
      <Box id="local-video-container">
        <video
          id="localVideo"
          className="video"
          playsInline
          autoPlay
          muted
        ></video>
      </Box>
      <Box
        position="fixed"
        bottom="0"
        left="0"
        width="100%"
        display="flex"
        justifyContent="center"
        p="4"
        boxShadow="0px -2px 5px 0px rgba(0, 0, 0, 0.1)"
      >
        <Button
          variant="solid"
          colorScheme="red"
          m="2"
          onClick={() => {
            endCall();
          }}
        >
          End call
        </Button>
        <Button
          id="micbtn"
          variant="solid"
          background={"white"}
          textColor={"black"}
          m="2"
          onClick={() => {
            onMicCam("mic");
          }}
        >
          Mic
        </Button>
        <Button
          id="cambtn"
          variant="solid"
          background={"white"}
          textColor={"black"}
          m="2"
          onClick={() => {
            onMicCam("cam");
          }}
        >
          Cam
        </Button>
      </Box>
    </>
  );
};

export default VideoCall;
