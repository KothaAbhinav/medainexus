import React from 'react';
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Header from "./components/Header";
import Error from "./pages/Error";
import Detection from './pages/Detection';
import Extracted from './pages/Extracted';
import Extracts from './pages/Extracts';

const App = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Extracted />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/home" element={<Home />} />
        <Route path="/detection" element={<Detection />} />
        <Route path="/extracted" element={<Extracted />} />
        <Route path="/extracts" element={<Extracts />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </Router>
  );
}

export default App;