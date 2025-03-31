const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
});

let localStream; // 📌 Guardar la referencia del stream de la cámara

// Capturar medios del usuario
async function setupMedia() {
    let constraints = {
        video: true,
        audio: true
    };

    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        handleStream(stream);
        return stream;
    } catch (error) {
        console.warn("⚠️ No se pudo acceder al video:", error);

        // 🔄 Reintentar solo con audio si el video falla
        try {
            const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            return audioOnlyStream;
        } catch (audioError) {
            console.error("❌ No se pudo obtener ni el audio ni el video.", audioError);
            return null;
        }
    }
}



function handleStream(stream) {
    stream.getTracks().forEach(track => {
        const sender = peerConnection.getSenders().find(s => s.track?.kind === track.kind);
        if (sender) {
            sender.replaceTrack(track);  // ✅ Reemplazar la pista existente en lugar de agregarla de nuevo
        } else {
            peerConnection.addTrack(track, stream);  // ✅ Solo agregar si no existe
        }
    });

    const videoElement = document.createElement("video");
    videoElement.srcObject = stream;
    videoElement.autoplay = true;
    videoElement.playsInline = true;
    videoElement.muted = true;

    document.querySelector(".pip-video .video-wrapper").innerHTML = "";
    document.querySelector(".pip-video .video-wrapper").appendChild(videoElement);
}


// 🔹 Manejar pistas remotas (evitar duplicados)
peerConnection.ontrack = (event) => {
    if (event.track.kind === "video") {
        console.log("📺 Recibiendo pista de video:", event.track);
        const remoteVideo = document.querySelector(".main-video video");
        if (remoteVideo) {
            // Actualiza el stream completo para refrescar la vista
            remoteVideo.srcObject = event.streams[0];
        } else {
            // Si no existe, créalo
            const newVideo = document.createElement("video");
            newVideo.srcObject = event.streams[0];
            newVideo.autoplay = true;
            newVideo.playsInline = true;
            document.querySelector(".main-video .video-wrapper").innerHTML = "";
            document.querySelector(".main-video .video-wrapper").appendChild(newVideo);
        }
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
    console.log("📥 Oferta recibida.");
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit("answer", { roomId, answer });
});

// Recibir respuesta
socket.on("answer", async (answer) => {
    console.log("📥 Respuesta recibida.");
    await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
});

// Recibir candidatos ICE
socket.on("candidate", async (candidate) => {
    try {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
        console.warn("⚠️ Error al agregar candidato ICE:", error);
    }
});

async function call() {
    console.log("📞 Iniciando llamada...");

    if (!localStream) {
        localStream = await setupMedia();
    }

    if (!localStream) {
        console.error("❌ No se pudo obtener el stream de la cámara.");
        return;
    }

    localStream.getTracks().forEach(track => {
        const sender = peerConnection.getSenders().find(s => s.track?.kind === track.kind);
        if (!sender) {
            peerConnection.addTrack(track, localStream);
        }
    });



    handleStream(localStream);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("offer", { roomId, offer });
    console.log("📤 Oferta enviada.");
}

async function shareScreen() {
    try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const newScreenTrack = screenStream.getVideoTracks()[0];

        let videoSender = peerConnection.getSenders().find(s => s.track?.kind === "video");

        if (!videoSender) {
            console.log("No se encontró sender de video, agregando la pista de pantalla.");
            peerConnection.addTrack(newScreenTrack, screenStream);

            // Renegociar la conexión
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit("offer", { roomId, offer });
        } else {
            await videoSender.replaceTrack(newScreenTrack);
            console.log("🖥️ Compartiendo pantalla...");

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            socket.emit("offer", { roomId, offer });
        }

        // Actualizar la vista local para mostrar la pantalla compartida
        const pipWrapper = document.querySelector(".pip-video .video-wrapper");
        pipWrapper.innerHTML = ""; // Limpiar contenido previo
        const previewVideo = document.createElement("video");
        previewVideo.srcObject = screenStream;
        previewVideo.autoplay = true;
        previewVideo.playsInline = true;
        previewVideo.muted = true; // Para evitar eco
        pipWrapper.appendChild(previewVideo);

        // Cuando se deje de compartir la pantalla, volver a la cámara (si está disponible)
        newScreenTrack.onended = async () => {
            console.log("La pantalla compartida se detuvo.");
            const cameraStream = await setupMedia();
            if (cameraStream) {
                if (videoSender) {
                    await videoSender.replaceTrack(cameraStream.getVideoTracks()[0]);
                    const offer = await peerConnection.createOffer();
                    await peerConnection.setLocalDescription(offer);
                    socket.emit("offer", { roomId, offer });
                }
                // Restaurar la vista local a la cámara:
                pipWrapper.innerHTML = "";
                const localVideo = document.createElement("video");
                localVideo.srcObject = cameraStream;
                localVideo.autoplay = true;
                localVideo.playsInline = true;
                localVideo.muted = true;
                pipWrapper.appendChild(localVideo);
            }
        };
    } catch (error) {
        console.error("❌ Error al compartir pantalla:", error);
    }
}




// Iniciar cámara/micrófono al cargar
setupMedia();



// 📌 Vincular botones
document.getElementById("startCallBtn").addEventListener("click", call);
document.querySelector(".control-btn[title='Present now']").addEventListener("click", shareScreen);
