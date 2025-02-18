import { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

const API_BASE_URL = "https://testomgeving.onrender.com"; // Live backend URL
console.log("Using API_BASE_URL:", API_BASE_URL);

const socket = io(API_BASE_URL);

export default function App() {
  const [clients, setClients] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [newQuote, setNewQuote] = useState({ client: "", total_amount: "" });
  const [statusMessage, setStatusMessage] = useState("Initializing...");

  useEffect(() => {
    setStatusMessage("Fetching clients...");
    console.log("Fetching clients from:", `${API_BASE_URL}/api/clients`);
    axios.get(`${API_BASE_URL}/api/clients`)
      .then((res) => {
        console.log("Clients fetched successfully:", res.data);
        setClients(res.data);
        setStatusMessage("Clients loaded successfully");
      })
      .catch((error) => {
        console.error("Error fetching clients:", error);
        setStatusMessage("Failed to load clients");
      });

    setStatusMessage("Fetching quotes...");
    console.log("Fetching quotes from:", `${API_BASE_URL}/api/quotes`);
    axios.get(`${API_BASE_URL}/api/quotes`)
      .then((res) => {
        console.log("Quotes fetched successfully:", res.data);
        setQuotes(res.data);
        setStatusMessage("Quotes loaded successfully");
      })
      .catch((error) => {
        console.error("Error fetching quotes:", error);
        setStatusMessage("Failed to load quotes");
      });

    socket.on("quoteUpdated", (updatedQuotes) => {
      console.log("Received WebSocket update:", updatedQuotes);
      setQuotes(updatedQuotes);
      setStatusMessage("Quotes updated via WebSocket");
    });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">CRM Dashboard</h1>
      <p className="text-sm text-gray-500">{statusMessage}</p>
    </div>
  );
}
