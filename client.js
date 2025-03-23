let socket;
let username = "";
let myKeyPair;
let sharedSecretKey = null;
let remoteUsername = "";
let hasReceivedRemoteKey = false;

const chatBox = document.getElementById('chat');
const messageInput = document.getElementById('message');
const sendButton = document.getElementById('send');

function appendMessage(text, type = 'info') {
  const div = document.createElement('div');
  div.classList.add('message');

  if (type === 'sent') {
    div.classList.add('sent');
  } else if (type === 'received') {
    div.classList.add('received');
  }

  div.innerText = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function startChat(name) {
  username = name;
  appendMessage(`📌 Forbinder som ${username}...`);

  socket = new WebSocket('ws://localhost:3000');

  socket.addEventListener('open', async () => {
    appendMessage("✅ Forbundet til server");
    await generateKeys();
  });

  socket.addEventListener('message', async (event) => {
    try {
      let rawData = event.data;

      if (rawData instanceof Blob) {
        rawData = await rawData.text();
      }

      const msg = JSON.parse(rawData);

      if (msg.type === 'info') {
        appendMessage(`ℹ️ ${msg.message}`);
      }

      if (msg.type === 'public-key' && msg.username !== username) {
        remoteUsername = msg.username;
        appendMessage(`🔑 Modtog public key fra ${remoteUsername}`);

        await deriveSharedSecret(msg.key);

        if (!hasReceivedRemoteKey) {
          hasReceivedRemoteKey = true;

          const publicKey = await window.crypto.subtle.exportKey('raw', myKeyPair.publicKey);
          const publicKeyBase64 = arrayBufferToBase64(publicKey);

          socket.send(JSON.stringify({
            type: 'public-key',
            username: username,
            key: publicKeyBase64
          }));

          appendMessage("📤 Sendte public key til modpart (tilbage)");
        }

        appendMessage("🔐 Symmetrisk krypteringsnøgle etableret");
        appendMessage("✅ Klar til at sende krypterede beskeder!");
      }

      if (msg.type === 'message' && msg.username !== username) {
        if (!sharedSecretKey) {
          appendMessage("❗️ Mangler Symmetrisk krypteringsnøgle!", 'info');
          return;
        }

        const decrypted = await decryptMessage(msg.data);
        appendMessage(`${msg.username}: ${decrypted}`, 'received');
      }

    } catch (error) {
      console.error("❌ Fejl ved behandling af besked:", error);
    }
  });

  sendButton.addEventListener('click', sendEncryptedMessage);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendEncryptedMessage();
  });
}

async function generateKeys() {
  myKeyPair = await window.crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey']
  );

  const publicKey = await window.crypto.subtle.exportKey('raw', myKeyPair.publicKey);
  const publicKeyBase64 = arrayBufferToBase64(publicKey);

  socket.send(JSON.stringify({
    type: 'public-key',
    username: username,
    key: publicKeyBase64
  }));

  appendMessage("📤 Sendte public key til modpart...");
}

async function deriveSharedSecret(theirKeyBase64) {
  const theirKeyRaw = base64ToArrayBuffer(theirKeyBase64);

  const theirPublicKey = await window.crypto.subtle.importKey(
    'raw',
    theirKeyRaw,
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    []
  );

  sharedSecretKey = await window.crypto.subtle.deriveKey(
    { name: 'ECDH', public: theirPublicKey },
    myKeyPair.privateKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  console.log("✅ Shared secret key oprettet!");
}

async function sendEncryptedMessage() {
  if (!sharedSecretKey) {
    appendMessage("❗️ Nøglen er ikke klar endnu.");
    return;
  }

  const message = messageInput.value.trim();
  if (!message) return;

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(message);

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    sharedSecretKey,
    encoded
  );

  socket.send(JSON.stringify({
    type: 'message',
    username: username,
    data: {
      iv: arrayBufferToBase64(iv),
      ciphertext: arrayBufferToBase64(ciphertext)
    }
  }));

  appendMessage(`Du: ${message}`, 'sent');
  messageInput.value = "";
}

async function decryptMessage(data) {
  try {
    const iv = base64ToArrayBuffer(data.iv);
    const ciphertext = base64ToArrayBuffer(data.ciphertext);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      sharedSecretKey,
      ciphertext
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error("❌ Fejl ved dekryptering:", error);
    appendMessage("❌ Fejl: Kunne ikke dekryptere besked", 'info');
    return "[Dekryptering fejlede]";
  }
}

function arrayBufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
