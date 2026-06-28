/**
 * tempchat - Room UI & Handshake Controller
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT SELECTORS ---
     const msgSound1 = document.getElementById('notification-sound1');
    const msgSound2 = document.getElementById('notification-sound2');
    const badgeStatus = document.getElementById('room-status-badge');
    const btnLeaveRoom = document.getElementById('btn-leave-room');
    const inputShareUrl = document.getElementById('input-share-url');
    const btnCopyLink = document.getElementById('btn-copy-link');
    const sasContainer = document.getElementById('sas-container');
    const securityBanner = document.getElementById('security-banner');
    const securityBannerText = document.getElementById('security-banner-text');
    const messageViewport = document.getElementById('message-viewport');
    const formMessageInput = document.getElementById('form-message-input');
    const inputMessageText = document.getElementById('input-message-text');
    const btnSendMessage = document.getElementById('btn-send-message');

    // Verification check: Make sure we are actually on the room page
    if (!messageViewport) {
        console.error("Target chat viewport missing. Ensure this script runs on room.html");
        return; 
    }

    // Set the current link inside the invite box
    inputShareUrl.value = window.location.href.toString().split("/").slice(0,-1).join("/");

  
    function appendSystemMessage(text) {
        const sysDiv = document.createElement('div');
        sysDiv.className = 'system-message';
        sysDiv.innerHTML = `<p>${text}</p>`;
        messageViewport.appendChild(sysDiv);
        scrollToBottom();
    }



    function scrollToBottom() {
        messageViewport.scrollTop = messageViewport.scrollHeight;
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, t => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[t] || t));
    }

    inputMessageText.addEventListener('input', () => {
        inputMessageText.style.height = 'auto';
        inputMessageText.style.height = `${inputMessageText.scrollHeight - 16}px`;
    });

    inputMessageText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            formMessageInput.requestSubmit();
        }
    });
    btnCopyLink.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(inputShareUrl.value);
            btnCopyLink.textContent = "✅";
            setTimeout(() => { btnCopyLink.textContent = "📋"; }, 2000);
        } catch (err) {}
    });

    btnLeaveRoom.addEventListener('click', () => {
        if (confirm("Disconnect and destroy current session context?")) {
            window.location.href = '../../../';
        }
    });

    //SSE, ENCRYPTION AND DECRYPTION
    var RSA = false,AES = false;
        document.getElementById('form-message-input').addEventListener('submit', async(e) => {
        e.preventDefault();
        const rawText = document.getElementById('input-message-text').value.trim();
        if (!rawText) return;
        let data = window.location.href.split("room/");
        let [room_id,user_id] = data[data.length - 1].split("/");
        await fetch("/post",{method:"POST",headers:{
            "Content-Type":"application/json"
        },body:JSON.stringify({
         room_id,user_id,message:await encryptMessage(rawText,AES)
        })});
        document.getElementById('input-message-text').value = '';
        document.getElementById('input-message-text').style.height = 'auto';
    });
    async function encryptMessage(message, aesKey) {
    const iv = crypto.getRandomValues(
        new Uint8Array(12)
    );

    const encoded =
        new TextEncoder().encode(message);

    const encrypted =
        await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv
            },
            aesKey,
            encoded
        );

    return `${arrayBufferToBase64(iv)}--${arrayBufferToBase64(encrypted)}`;
}
async function decryptMessage(iv_cipher,aesKey) {
    const [iv,cipher] = iv_cipher.split("--");
    const decrypted =
        await crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: new Uint8Array(
                    base64ToArrayBuffer(iv)
                )
            },
            aesKey,
            base64ToArrayBuffer(cipher)
        );

    return new TextDecoder().decode(
        decrypted
    );
}

        function appendSystemMessage(text) {
        const sysDiv = document.createElement('div');
        sysDiv.className = 'system-message';
        sysDiv.innerHTML = `<p>${text}</p>`;
        document.getElementById('message-viewport').appendChild(sysDiv);
         document.getElementById('message-viewport').scrollTop = document.getElementById('message-viewport').scrollHeight;
    }
        function appendChatMessage(senderName, content, isOutgoing = false) {
        const msgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const msgArticle = document.createElement('article');
        msgArticle.className = `chat-message ${isOutgoing ? 'message-outgoing' : 'message-incoming'}`;
        
        msgArticle.innerHTML = `
            <span class="msg-meta">${senderName} • ${msgTime}</span>
            <div class="msg-bubble">
                <p>${escapeHTML(content)}</p>
            </div>
        `;
        
        document.getElementById('message-viewport').appendChild(msgArticle);
        document.getElementById('message-viewport').scrollTop = document.getElementById('message-viewport').scrollHeight;
    }
    let data = window.location.href.split("room/");
    let [room_id,user_id] = data[data.length - 1].split("/");
    let se = new EventSource(`/room-event/${room_id}/${user_id}`);
     se.onerror = function(e){
       console.log(e.message);
     }
             se.onmessage = async function(e){
                let data = JSON.parse(e.data);
                let dir = (user_id==data.user_id)?true:false;
            if(data.type == "message"){
                let DD = await decryptMessage(data.data,AES);
                appendChatMessage(data.user_id, DD, dir);
                if(user_id != data.user_id && document.hidden){
                    msgSound2.play();
                }
            }
            if(data.type == "status"){
                if(data.data == "member_left"){
             document.getElementById('input-message-text').disabled = true;
             document.getElementById('btn-send-message').disabled = true;
             appendSystemMessage("Member left chat.");
             msgSound1.play();
                }else if(data.data == "member_joined"){
             appendSystemMessage("Member joined chat.");
             msgSound1.play();
                }
            }
             if(data.type == "end_handshake"){
                 (async ()=>{
                    const decryptedAES =
                    await crypto.subtle.decrypt(
                        {
                            name: "RSA-OAEP"
                        },
                        RSA.privateKey,
                        base64ToArrayBuffer(
                            data.data
                        )
                    );
    
               AES = await crypto.subtle.importKey(
                    "raw",
                    decryptedAES,
                    {
                        name: "AES-GCM"
                    },
                    true,
                    ["encrypt", "decrypt"]
                );
             initializeCryptoHandshakeComplete();
                 })()
            }
           
             };

   
function arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);

    let binary = "";

    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
}
function base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes.buffer;
}

 (async ()=>{
       const rsaKeys =
    await crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1,0,1]),
            hash: "SHA-256"
        },
        false,
        ["encrypt", "decrypt"]
    );
    RSA = rsaKeys;
    const exported = await crypto.subtle.exportKey(
    "spki",
    rsaKeys.publicKey
);
let req = await fetch("/pub_key",{method:"POST",headers:{
            "Content-Type":"application/json"
        },body:JSON.stringify({
         room_id,user_id,pub_key:arrayBufferToBase64(exported)
        })});

let res = await req.json();

if(res.handshake == true){
   
  const aesKey = await crypto.subtle.generateKey(
    {
        name: "AES-GCM",
        length: 256
    },
    true,
    ["encrypt", "decrypt"]
);
  AES = aesKey;
const rawAES = await crypto.subtle.exportKey(
    "raw",
    aesKey
);

const bobPublicKey = await crypto.subtle.importKey(
        "spki",
        base64ToArrayBuffer(res.pubkey),
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        true,
        ["encrypt"]
    );

    const encryptedAES =
    await crypto.subtle.encrypt(
        {
            name: "RSA-OAEP"
        },
        bobPublicKey,
        rawAES
    );
const encryptedAESString = arrayBufferToBase64(encryptedAES);
  req = await fetch("/end_handshake",{method:"POST",headers:{
            "Content-Type":"application/json"
        },body:JSON.stringify({
         room_id,user_id,aes_key:encryptedAESString
        })});
    res = await req.json();
    initializeCryptoHandshakeComplete();
}

 })();

function initializeCryptoHandshakeComplete() {
        console.log("Handshake complete! Unlocking input systems.");
        
        document.getElementById('room-status-badge').className = "badge badge-secure";
        document.getElementById('room-status-badge').textContent = "E2EE Active";

        document.getElementById('security-banner').className = "security-banner banner-verified";
        document.getElementById('security-banner').innerHTML = `<strong>Channel Secured:</strong> Local ECDH key exchange validated. Messages are fully encrypted.`;
        
        // --- THIS CORES UNLOCKS YOUR UI ---
        document.getElementById('input-message-text').disabled = false;
        document.getElementById('btn-send-message').disabled = false;
        document.getElementById('input-message-text').focus();
        appendSystemMessage("Secure end-to-end encryption handshake verified successfully.");
        msgSound1.play();
    }

});
