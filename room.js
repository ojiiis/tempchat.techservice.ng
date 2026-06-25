/**
 * tempchat - Room UI & Handshake Controller
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT SELECTORS ---
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

    // --- INITIALIZATION HANDSHAKE SIMULATION ---
    // This timer simulates the cryptographic key exchange delay
    // console.log("Starting E2EE simulation timer (2 seconds)...");
    // setTimeout(() => {
    //     initializeCryptoHandshakeComplete();
    // }, 1000);

    // function initializeCryptoHandshakeComplete() {
    //     console.log("Handshake complete! Unlocking input systems.");
        
    //     badgeStatus.className = "badge badge-secure";
    //     badgeStatus.textContent = "E2EE Active";

    //     securityBanner.className = "security-banner banner-verified";
    //     securityBannerText.innerHTML = `<strong>Channel Secured:</strong> Local ECDH key exchange validated. Messages are fully encrypted.`;
        
    //     // --- THIS CORES UNLOCKS YOUR UI ---
    //     inputMessageText.disabled = false;
    //     btnSendMessage.disabled = false;
    //     inputMessageText.focus();

    //     sasContainer.innerHTML = `<span>ALPHA-99-ECHO</span>`;
    //     //appendSystemMessage("Secure end-to-end encryption handshake verified successfully.");
    // }

    function appendSystemMessage(text) {
        const sysDiv = document.createElement('div');
        sysDiv.className = 'system-message';
        sysDiv.innerHTML = `<p>${text}</p>`;
        messageViewport.appendChild(sysDiv);
        scrollToBottom();
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
        
        messageViewport.appendChild(msgArticle);
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

    // formMessageInput.addEventListener('submit', async(e) => {
    //     e.preventDefault();
    //     const rawText = inputMessageText.value.trim();
    //     if (!rawText) return;
    //     let data = window.location.href.split("room/");
    //     let [room_id,user_id] = data[data.length - 1].split("/");
    //     let dispatchedQry = await fetch("http://localhost:3030/post",{method:"POST",headers:{
    //         "Content-Type":"application/json"
    //     },body:JSON.stringify({
    //      room_id,user_id,message:rawText
    //     })});
    //     let dispatched = await dispatchedQry.json();
    //     console.log(dispatched);
    //     //appendChatMessage("You", rawText, true);
    //     inputMessageText.value = '';
    //     inputMessageText.style.height = 'auto';
    // });

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
});


//console.log(event, " event");