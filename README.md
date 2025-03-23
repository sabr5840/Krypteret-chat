🔐 Krypteret Chat

En sikker proof-of-concept chat, hvor to brugere kan kommunikere sikkert og fortroligt ved brug af kryptografiske principper.
Projektet laver end-to-end kryptering (E2EE) med ECDH nøgleudveksling og AES-GCM (symmetrisk kryptering), bygget i JavaScript og WebSockets.

🛠️ Funktionalitet

✅ Confidentiality (fortrolighed) → Med symmetrisk kryptering (AES-GCM)
✅ Integrity (integritet) → Autentificeret kryptering med AES-GCM
✅ Two-person chat → Chat mellem Alice og Bob
✅ Near real-time → WebSockets muliggør næsten realtids-kommunikation
✅ Klar visuel statusindikator → Grøn/rød forbindelse

🧑‍💻 Teknologi og kryptografi

- ECDH (Elliptic Curve Diffie-Hellman)
  Bruges til at etablere en fælles symmetrisk nøgle, uden at nøglen deles direkte.
- HKDF (implicit i ECDH deriveKey).
  ECDH laver en nøgle, der anvendes som delt/fælles (symmetrisk) krypteringsnøgle.
- AES-GCM
  Symmetrisk kryptering for fortrolighed og integritet af beskeder.
- WebSockets (ws)
  Realtidskommunikation mellem to parter via WebSocket server.

  ⚙️ Installation og opsætning

1. Klon projektet
   git clone https://github.com/sabr5840/Krypteret-chat
   cd krypteret-chat
2. Installer afhængigheder
   npm install
3. Start WebSocket serveren
   node server.js eller npm start
   Serveren kører på ws://localhost:3000
4. Åbn klienterne
   Åbn alice.html i én browserfane
   Åbn bob.html i en anden browserfane
   (Du kan også åbne dem i to forskellige browsere eller maskiner, så længe de har adgang til serveren)

🚀 Sådan virker det

1. Forbindelse etableres
   Bob og Alice opretter forbindelse til serveren.
2. Nøgleudveksling (ECDH)
   Begge parter genererer deres public/private nøglepar og udveksler de offentlige nøgler.
   Ud fra de offentlige nøgler beregnes en fælles symmetrisk krypteringsnøgle.
3. Klar til at chatte
   Når nøglen er etableret, kan Alice og Bob sende krypterede beskeder til hinanden via WebSocket-serveren.
4. AES-GCM beskedkryptering
   Hver besked krypteres med AES-GCM, hvilket sikrer både fortrolighed og integritet.
   Statusindikator

🔐 Sikkerhedsovervejelser

- End-to-End Encryption (E2EE): Kun Alice og Bob kan læse beskederne. Serveren kan ikke dekryptere noget.
- Perfect Forward Secrecy (PFS): Ikke implementeret, men kan tilføjes med ephemeral keys og nøgle-rotation.
- Integritet: AES-GCM sikrer, at beskeder ikke kan manipuleres uden at blive opdaget.
