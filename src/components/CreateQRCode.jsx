import QRCode from "qrcode";
import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function CreateQRCode() {
  const [url, setUrl] = useState("");
  const [qrId, setQrId] = useState("");
  const [squareColor, setSquareColor] = useState("#000000");
  const [eyeColor, setEyeColor] = useState("#000000");
  const [qrcode, setQrcode] = useState("");

  const GenerateQRCode = async () => {
    try {
      const qrDataURL = await QRCode.toDataURL(url, {
        width: 800,
        margin: 2,
        color: {
          dark: squareColor,
          light: "#FFFFFF",
        },
      });
      setQrcode(qrDataURL);

      localStorage.setItem('qrCodeData', JSON.stringify({ 
        qrId, 
        redirectURL: url, 
        squareColor, 
        eyeColor, 
        qrDataURL 
      }));

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
      
      <div className="input-group">
        <input
          type="text"
          placeholder="Enter QR ID"
          value={qrId}
          onChange={(e) => setQrId(e.target.value)}
        />
      </div>

      <div className="input-group">
        <input
          type="text"
          placeholder="e.g https://google.com"
          value={url}
          onChange={(evt) => setUrl(evt.target.value)}
        />
      </div>
      
      <div className="color-group">
        <div className="color-picker">
          <label htmlFor="squareColor">Square Color:</label>
          <input
            id="squareColor"
            type="color"
            value={squareColor}
            onChange={(e) => setSquareColor(e.target.value)}
          />
        </div>

        <div className="color-picker">
          <label htmlFor="eyeColor">Eye Color:</label>
          <input
            id="eyeColor"
            type="color"
            value={eyeColor}
            onChange={(e) => setEyeColor(e.target.value)}
          />
        </div>
      </div>

      <div className="button-group">
        <div className="button-box">
          <button onClick={GenerateQRCode}>Generate</button>
        </div>
        <div className="button-box">
          <Link to="/view-qrcodes">
            <button>View QR Codes</button>
          </Link>
        </div>
      </div>

      {qrcode && (
        <div className="qrcode-display">
          <img src={qrcode} alt="Generated QR Code" />
          <div className="button-box">
            <a href={qrcode} download="qrcode.png">
              <button>Download</button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateQRCode;
