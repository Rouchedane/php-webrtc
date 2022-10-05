mdc.ripple.MDCRipple.attachTo(document.querySelector('.mdc-button'));

// DEfault configuration - Change these if you have a different STUN or TURN server.
const configuration = {
  iceServers: [
    {
      urls: [
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
      ],
    },
  ],
  iceCandidatePoolSize: 10,
};

let peerConnection = null;
let localStream = null;
let remoteStream = null;
let roomDialog = null;
let roomId = null;
let roomData = null;
let remoteCandiddatesArray = [];

function init() {
  document.querySelector('#cameraBtn').addEventListener('click', openUserMedia);
  document.querySelector('#hangupBtn').addEventListener('click', hangUp);
  document.querySelector('#createBtn').addEventListener('click', createRoom);
  document.querySelector('#joinBtn').addEventListener('click', joinRoom);
  roomDialog = new mdc.dialog.MDCDialog(document.querySelector('#room-dialog'));
}

async function createRoom() {
  document.querySelector('#createBtn').disabled = true;
  document.querySelector('#joinBtn').disabled = true;
  //const db = firebase.firestore();

  console.log('Create PeerConnection with configuration: ', configuration);
  peerConnection = new RTCPeerConnection(configuration);

  registerPeerConnectionListeners();



  // Code for creating room above
  
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });

  // Code for creating a room below
    const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  $.post(
    'api/createRoom.php',
    {
      "type": offer.type,
      "sdp": offer.sdp

    },function(data)
    {
      if(data.code == 200)
      {
        roomData = data.data.roomId;
        document.querySelector('#currentRoom').innerText = `Current room is ${data.data.roomKey} - You are the caller!`
        //console.log(data);
        callerCandidatesCollection();
        peerConnection.addEventListener('track', event => {
          console.log('Got remote track:', event.streams[0]);
          event.streams[0].getTracks().forEach(track => {
            console.log('Add a track to the remoteStream:', track);
            remoteStream.addTrack(track);
          });
        });
      
        // Listening for remote session description below
        setInterval(function(){ 
          $.post(
            'api/checkAnswer.php',
            {
              "roomId": roomData,
            
            }, function(data)
            {
              if(data.code == 200)
              {
                  //console.log(data.data);
                  setDescription(data.data);
              }
            });
          
          //console.log("Oooo Yeaaa!");
        }, 1000);
        // Listening for remote session description above
      
        // Listen for remote ICE candidates below
        //console.log(555);
          listeningRemoteCandidates(roomData,"callee");
        // Listen for remote ICE candidates above
      }
    });

  // Code for creating a room above

  

}

function joinRoom() {
  document.querySelector('#createBtn').disabled = true;
  document.querySelector('#joinBtn').disabled = true;

  document.querySelector('#confirmJoinBtn').
      addEventListener('click', async () => {
        roomId = document.querySelector('#room-id').value;
        console.log('Join room: ', roomId);
        document.querySelector(
            '#currentRoom').innerText = `Current room is ${roomId} - You are the callee!`;
        await joinRoomById(roomId);
      }, {once: true});
  roomDialog.open();
}

async function joinRoomById(roomId) {
  //const db = firebase.firestore();
  //const roomRef = db.collection('rooms').doc(`${roomId}`);
  //const roomSnapshot = await roomRef.get();
  console.log('Got room:', true);
  gotRoom = false;
  $.post(
    'api/joinRoom.php',
    {
      "roomKey": roomId,
      "action" : 1
    }, function(data)
    {
      if(data.code == 200)
      {
        gotRoom = true;
        console.log(data);
        roomData = data.data.roomId;
        
     
        setAnswer(data);
        // Code for collecting ICE candidates below
        calleeCandidatesCollection();
        // Code for collecting ICE candidates above
      }
    });

    async function setAnswer(data){
      console.log('Create PeerConnection with configuration: ', configuration);
        peerConnection = new RTCPeerConnection(configuration);
        registerPeerConnectionListeners();
        localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStream);
        });
      
      peerConnection.addEventListener('track', event => {
        console.log('Got remote track:', event.streams[0]);
        event.streams[0].getTracks().forEach(track => {
          console.log('Add a track to the remoteStream:', track);
          remoteStream.addTrack(track);
        });
      });
    // Code for creating SDP answer below
    //console.log('77',data);
    const offer = {
      type: data.data.offerType,
      sdp: data.data.offerSdp
    }
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    console.log(answer);
    
    $.post(
      'api/joinRoom.php',
      {
        "roomId": data.data.roomId,
        "action" : 2,
        "type": answer.type,
        "sdp": answer.sdp
      },function(data)
      {
        if(data.code == 200)
        {
          //console.log(data);
        }
      });
    // Code for creating SDP answer above

    // Listening for remote ICE candidates below
    listeningRemoteCandidates(data.data.roomId,"caller");
    // Listening for remote ICE candidates above
    }
    

}

async function openUserMedia(e) {
  const stream = await navigator.mediaDevices.getUserMedia(
      {video: true, audio: true});
  document.querySelector('#localVideo').srcObject = stream;
  localStream = stream;
  remoteStream = new MediaStream();
  document.querySelector('#remoteVideo').srcObject = remoteStream;

  console.log('Stream:', document.querySelector('#localVideo').srcObject);
  document.querySelector('#cameraBtn').disabled = true;
  document.querySelector('#joinBtn').disabled = false;
  document.querySelector('#createBtn').disabled = false;
  document.querySelector('#hangupBtn').disabled = false;
}

async function hangUp(e) {
  const tracks = document.querySelector('#localVideo').srcObject.getTracks();
  tracks.forEach(track => {
    track.stop();
  });

  if (remoteStream) {
    remoteStream.getTracks().forEach(track => track.stop());
  }

  if (peerConnection) {
    peerConnection.close();
  }

  document.querySelector('#localVideo').srcObject = null;
  document.querySelector('#remoteVideo').srcObject = null;
  document.querySelector('#cameraBtn').disabled = false;
  document.querySelector('#joinBtn').disabled = true;
  document.querySelector('#createBtn').disabled = true;
  document.querySelector('#hangupBtn').disabled = true;
  document.querySelector('#currentRoom').innerText = '';

  document.location.reload(true);
}
function callerCandidatesCollection(){
// Code for collecting ICE candidates below
  //console.log("ice");
  peerConnection.addEventListener('icecandidate', event => {
    if (!event.candidate) {
      console.log('Got final candidate!');
      return;
    }
    //console.log('Got candidate: ', );
    //console.log(roomData);
    $.post(
      'api/candidatesCollection.php',
      {
        "candidate": JSON.stringify(event.candidate.toJSON()),
        "roomId" : roomData,
        "type": "caller"
      },function(data)
      {
        if(data.code == 200)
        {
          //console.log(data);
        }
      });
    //callerCandidatesCollection.add(event.candidate.toJSON());

  });
  // Code for collecting ICE candidates above

}

function calleeCandidatesCollection(){
  peerConnection.addEventListener('icecandidate', event => {
    if (!event.candidate) {
      console.log('Got final candidate!');
      return;
    }
    //console.log('Got candidate: ', event.candidate);
    $.post(
      'api/candidatesCollection.php',
      {
        "candidate": JSON.stringify(event.candidate.toJSON()),
        "roomId" : roomData,
        "type": 'callee'
      },function(data)
      {
        if(data.code == 200)
        {
          //console.log(data);
        }
      });
    //calleeCandidatesCollection.add(event.candidate.toJSON());
  });


}
async function setDescription(answer){
  //console.log(answer);
  if (!peerConnection.currentRemoteDescription) {
    console.log('Got remote description: ', answer);
    const rtcSessionDescription = new RTCSessionDescription(answer);
    await peerConnection.setRemoteDescription(rtcSessionDescription);
  }
}
function listeningRemoteCandidates(roomId,type){
  //console.log(55);
  $.post(
    'api/checkRemoteCandidates.php',
    {
      "roomId": roomId,
      "type" : type
    
    }, function(data)
    {
      //console.log(data);
      if(data.code == 200)
      {
          //console.log(data.data);
          $.each(data.data, function(index, value){
            
            if(remoteCandiddatesArray.includes(value.canditates)){
              
            }else{
              //console.log(value.canditates);
              addCandidates(value.canditates);
              remoteCandiddatesArray.push(value.canditates)
            }
          }); 
      }
      setTimeout(function(){
        listeningRemoteCandidates(roomId,type); 
     }, 1000);

    });
}
async function addCandidates(cata){
  await peerConnection.addIceCandidate(new RTCIceCandidate(JSON.parse(cata)));
}
function registerPeerConnectionListeners() {
  peerConnection.addEventListener('icegatheringstatechange', () => {
    console.log(
        `ICE gathering state changed: ${peerConnection.iceGatheringState}`);
  });

  peerConnection.addEventListener('connectionstatechange', () => {
    console.log(`Connection state change: ${peerConnection.connectionState}`);
  });

  peerConnection.addEventListener('signalingstatechange', () => {
    console.log(`Signaling state change: ${peerConnection.signalingState}`);
  });

  peerConnection.addEventListener('iceconnectionstatechange ', () => {
    console.log(
        `ICE connection state change: ${peerConnection.iceConnectionState}`);
  });
}

init();
