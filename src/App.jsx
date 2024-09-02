import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CreateQRCode from "./components/CreateQRCode";
import ViewQRCodes from "./components/ViewQRCodes";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CreateQRCode />} />
        <Route path="/view-qrcodes" element={<ViewQRCodes />} />
      </Routes>
    </Router>
  );
}

export default App;
