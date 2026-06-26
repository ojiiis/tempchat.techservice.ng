/**
 * tempchat - Landing Page Controller
 */
const random = (len = 10)=>{
 if(len == 0)return '';
  let limit = 0,result = "";
  while(limit < len){
  result += Math.random().toString().split(".")[1][0];
  limit++;
  }
  return result;
}
document.addEventListener('DOMContentLoaded', () => {
    const btnCreateRoom = document.getElementById('btn-create-room');
    const formJoinRoom = document.getElementById('form-join-room');
    const inputRoomId = document.getElementById('input-room-id');

  //  if (!btnCreateRoom || !formJoinRoom) return; // Guard clause to protect pages

    const ROOM_ID_LENGTH = 12;

    function generateSecureRoomId(length = 16) {
        const array = new Uint8Array(ROOM_ID_LENGTH / 2);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(length).padStart(2, '0')).join('');
    }

    function parseRoomId(input) {
        const trimmed = input.trim();
        if (!trimmed) return null;
        try {
            const url = new URL(trimmed);
            const pathParts = url.pathname.split('/');
            const roomIdx = pathParts.indexOf('room');
            if (roomIdx !== -1 && pathParts[roomIdx + 1]) {
                return pathParts[roomIdx + 1];
            }
        } catch (_) {}
        const sanitized = trimmed.replace(/[^a-zA-Z0-9]/g, '');
        return sanitized.length > 0 ? sanitized : null;
    }

    function setButtonLoading(element, isLoading, defaultText) {
        if (isLoading) {
            element.disabled = true;
            element.innerHTML = `⏳ Processing...`;
            element.style.opacity = '0.7';
        } else {
            element.disabled = false;
            element.innerHTML = defaultText;
            element.style.opacity = '1';
        }
    }

    btnCreateRoom.addEventListener('click', (e) => {
        e.preventDefault();
        const defaultText = btnCreateRoom.textContent;
        setButtonLoading(btnCreateRoom, true, defaultText);
        const secureId = generateSecureRoomId();
        const userId = random(4);
        setTimeout(() => {
            window.location.href = `room/${secureId}/user-${userId}`; // Fallback parsing context for local file testing
        }, 600);
    });

});