import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Components/Login";
import Register from "./Components/Register";
import Home from "./Components/Home";
import Dashboard from "./Components/Dashboard"; // Import Dashboard component
import ReportDetails from "./Components/ReportDetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} /> {/* Added Dashboard route */}
        <Route path="/report/:id" element={<ReportDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
