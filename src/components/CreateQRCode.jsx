import QRCode from "qrcode";
import { useState } from "react";
import axios from "axios";

function CreateQRCode() {
  const [url, setUrl] = useState("");
  const [qrId, setQrId] = useState("");
  const [squareColor, setSquareColor] = useState("#000000");
  const [eyeColor, setEyeColor] = useState("#000000");
  const [qrcode, setQrcode] = useState("");

  const GenerateQRCode = async () => {
    try {
      // Generate the QR code locally to display on the frontend
      const qrDataURL = await QRCode.toDataURL(url, {
        width: 800,
        margin: 2,
        color: {
          dark: squareColor,
          light: "#FFFFFF", // Background color (typically white)
        },
      });
      setQrcode(qrDataURL);

      // Save the QR code data to local storage
      localStorage.setItem('qrCodeData', JSON.stringify({ 
        qrId, 
        redirectURL: url, 
        squareColor, 
        eyeColor, 
        qrDataURL 
      }));

      // Optionally, send the QR code details to the backend
      await axios.post("http://localhost:5001/api/create-qr", {
        qrId,
        redirectURL: url,
        squareColor,
        eyeColor,
      });

      console.log("QR Code saved successfully!");
    } catch (err) {
      console.error("Error generating QR Code:", err);
    }
  };

  return (
    <div className="app">
      <h1>QR Code Generator</h1>
      <input
        type="text"
        placeholder="Enter QR ID"
        value={qrId}
        onChange={(e) => setQrId(e.target.value)}
      />
      <input
        type="text"
        placeholder="e.g https://google.com"
        value={url}
        onChange={(evt) => setUrl(evt.target.value)}
      />
      <input
        type="color"
        value={squareColor}
        onChange={(e) => setSquareColor(e.target.value)}
      />
      <input
        type="color"
        value={eyeColor}
        onChange={(e) => setEyeColor(e.target.value)}
      />
      <button onClick={GenerateQRCode}>Generate</button>
      {qrcode && (
        <>
          <img src={qrcode} alt="Generated QR Code" />
          <a href={qrcode} download="qrcode.png">Download</a>
        </>
      )}
    </div>
  );
}

export default CreateQRCode;
