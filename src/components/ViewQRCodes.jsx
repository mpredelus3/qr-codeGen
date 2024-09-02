import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ViewQRCodes() {
  const [qrCodes, setQRCodes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQRCodes = async () => {
      try {
        const response = await axios.get("http://localhost:5001/api/get-qr-codes");
        console.log(response.data); // Log to check the received data
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
      <ul className="qr-list">
        {qrCodes.map((qrCode, index) => (
          <li key={index} className="qr-item">
            <strong>ID:</strong> {qrCode.QRCodeid} <br />
            <strong>URL:</strong> {qrCode.RedirectUrl}
          </li>
        ))}
      </ul>
      <button onClick={() => navigate(-1)} style={backButtonStyle}>
        Back
      </button>
    </div>
  );
}

const backButtonStyle = {
  backgroundColor: 'transparent',
  border: 'none',
  color: '#2bcb4b',
  fontSize: '1.5rem',
  cursor: 'pointer',
  marginTop: '2rem',
};

export default ViewQRCodes;
