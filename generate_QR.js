const QRCode = require("qrcode");
const path = require("path");

const QRCodeFolder = path.join(__dirname, "public", "qrcodes");

async function generateQRCodes() {
    try {
        for (let number = 1; number <= 40; number++) {
            const qrCodeValue = `QR${String(number).padStart(3, "0")}`;

            const filePath = path.join(
                QRCodeFolder,
                `${qrCodeValue}.png`
            );

            await QRCode.toFile(filePath, qrCodeValue, {
                width: 500,
                margin: 2,
                errorCorrectionLevel: "H"
            });

            console.log(`Generated: ${qrCodeValue}.png`);
        }

        console.log("All 40 QR codes generated successfully");
    } catch (error) {
        console.error("Error: ", error);
    }
};

generateQRCodes();