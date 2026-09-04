const scanResult = document.getElementById("scan-result");
const dotsAnimation = document.getElementById("dots");

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    let dots = 1;
    let sessionEnded = false;
    
    if (dotsAnimation) {
        setInterval(() => {
            dotsAnimation.innerText = ".".repeat(dots);
            dots++

            if (dots > 3) {
                dots = 1;
            }
        }, 500);
    }

    const QRscanner= new Html5Qrcode("QR-reader");

    QRscanner.start(
        { facingMode: "environment" },
        {
            fps: 10,
            qrbox: { width: 280, height: 280 }
        },
        async (qrCode) => {
            if (sessionEnded) return;

            scanResult.innerText = `QR Scanned ${qrCode}`;

            await QRscanner.stop();

            window.location.href = `/reading_room?qrCode=${encodeURIComponent(qrCode)}` + `&code=${encodeURIComponent(code)}`;
        },
        (errorMessage) => {
            // Ignore continuous QR scanning errors
        }
    ).catch(error => {
        console.error("Camera error: ", error);
        scanResult.innerText = "Unable to access camera";
    });

    async function checkSessionStatus() {
        if (!code) return;

        try {
            const result = await fetch(`/api/session/status?code=${encodeURIComponent(code)}`);
            const data = await result.json();

            if (result.ok) {
                if (data.status === "ended") {
                    sessionEnded = true;

                    if (QRscanner.isScanning) {
                        await QRscanner.stop();
                    }

                    window.location.href = `/leaderboard?code=${encodeURIComponent(code)}`;
                }
            } else {
                console.error(data.message);
            }
        } catch (error) {
            console.error("Error: ", error);
        }
    }

    checkSessionStatus();
    
    setInterval(checkSessionStatus, 2000);
});