import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./Components/Login";
import Register from "./Components/Register";
import Home from "./Components/Home";
import Dashboard from "./Components/Dashboard";
import ReportDetails from "./Components/ReportDetails";
import About from "./Components/About"; // ✅ Add this line
import Reports from "./Components/Reports";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/about" element={<About />} /> 
        <Route path="/Reports" element={<Reports />} />
        <Route path="/report/:id" element={<ReportDetails />} />
      </Routes>
    </Router>
  );
}

export default App;