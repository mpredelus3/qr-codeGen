import { useEffect, useState } from "react";
import axios from "axios";

function ViewQRCodes() {
  const [qrCodes, setQRCodes] = useState([]);

  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/get-qr-codes");
        setQRCodes(response.data);
      } catch (err) {
        console.error("Error fetching QR Codes:", err);
      }
    };

    fetchQRCodes();
  }, []);

  return (
    <div className="app">
      <h1>Stored QR Codes</h1>
      <ul>
        {qrCodes.map((qrCode, index) => (
          <li key={index}>
            ID: {qrCode.QRCodeid}, URL: {qrCode.RedirectUrl}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ViewQRCodes;
