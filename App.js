import { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

const API_BASE_URL = process.env.REACT_APP_API_URL || "https://testomgeving.onrender.com/";
const socket = io(API_BASE_URL);

export default function App() {
  const [clients, setClients] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [newQuote, setNewQuote] = useState({ client: "", total_amount: "" });

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/clients`).then((res) => setClients(res.data));
    axios.get(`${API_BASE_URL}/api/quotes`).then((res) => setQuotes(res.data));
    
    socket.on("quoteUpdated", (updatedQuotes) => {
      setQuotes(updatedQuotes);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE_URL}/api/quotes`, newQuote).then(() => {
      setNewQuote({ client: "", total_amount: "" });
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">CRM Dashboard</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <select 
          value={newQuote.client} 
          onChange={(e) => setNewQuote({ ...newQuote, client: e.target.value })} 
          required
          className="border p-2 mr-2"
        >
          <option value="">Select Client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
        <input 
          type="number" 
          placeholder="Total Amount" 
          value={newQuote.total_amount} 
          onChange={(e) => setNewQuote({ ...newQuote, total_amount: e.target.value })} 
          required 
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">Add Quote</button>
      </form>
      <h2 className="text-lg font-bold">Quotes</h2>
      <table className="border-collapse border w-full">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Client</th>
            <th className="border p-2">Total Amount</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((quote) => (
            <tr key={quote.id}>
              <td className="border p-2">{quote.id}</td>
              <td className="border p-2">{clients.find(c => c.id === quote.client)?.name || "Unknown"}</td>
              <td className="border p-2">${quote.total_amount}</td>
              <td className="border p-2">{quote.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
