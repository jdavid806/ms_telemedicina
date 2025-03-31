const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
});


// Capturar medios del usuario
async function setupMedia() {
    let constraints = {
        video: { facingMode: "user" }, // 📷 Usa la cámara frontal en móviles
        audio: true
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        handleStream(stream);
    } catch (error) {
        console.warn("⚠️ No se pudo acceder al video:", error);
    }
}

function handleStream(stream) {
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

    const videoElement = document.createElement("video");
    videoElement.srcObject = stream;
    videoElement.autoplay = true;
    videoElement.playsInline = true;

    document.querySelector(".pip-video .video-wrapper").innerHTML = "";
    document.querySelector(".pip-video .video-wrapper").appendChild(videoElement);
}

peerConnection.ontrack = (event) => {
    if (event.track.kind === "video") {
        const remoteVideo = document.createElement("video");
        remoteVideo.srcObject = new MediaStream([event.track]);
        remoteVideo.autoplay = true;
        remoteVideo.playsInline = true;

        document.querySelector(".main-video .video-wrapper").innerHTML = "";
        document.querySelector(".main-video .video-wrapper").appendChild(remoteVideo);
    }
};

setupMedia();

// Manejar pistas remotas (audio/video)
peerConnection.ontrack = (event) => {
    console.log("🎧 Se recibió una nueva pista:", event.track.kind);

    if (event.track.kind === "video") {
        const remoteVideo = document.createElement("video");
        remoteVideo.srcObject = new MediaStream([event.track]);
        remoteVideo.autoplay = true;
        remoteVideo.playsInline = true;

        const mainContainer = document.querySelector(".main-video .video-wrapper");
        mainContainer.innerHTML = "";
        mainContainer.appendChild(remoteVideo);

        console.log("📺 Video remoto agregado.");
    } else if (event.track.kind === "audio") {
        const remoteAudio = document.createElement("audio");
        remoteAudio.srcObject = new MediaStream([event.track]);
        remoteAudio.autoplay = true;
        document.body.appendChild(remoteAudio);
        console.log("🔊 Audio remoto agregado.");
    }
};

// Enviar candidatos ICE
peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
        socket.emit("candidate", { roomId, candidate: event.candidate });
    }
};

// Recibir oferta y responder
socket.on("offer", async (offer) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit("answer", { roomId, answer });
});

// Recibir respuesta
socket.on("answer", async (answer) => {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

// Recibir candidatos ICE
socket.on("candidate", (candidate) => {
    peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
});

// Crear oferta si es el primero en la sala
async function call() {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("offer", { roomId, offer });
}

setupMedia();
document.querySelector(".control-btn[title='Present now']").addEventListener("click", call);
