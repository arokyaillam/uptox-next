'use client';

import { useState, useEffect } from "react";

export default function TestFeed() {
  const [token, setToken] = useState("");
  const [instrumentKey, setInstrumentKey] = useState("NSE_INDEX|Nifty 50");
  const [log, setLog] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [eventSource, setEventSource] = useState(null);


  const connectSSE = async () => {
    if (!token) {
      alert("Enter a valid access token");
      return;
    }

    try {
      // Use Next.js API route as proxy to avoid CORS issues
      const sseUrl = `/api/market-feed/connect?token=${encodeURIComponent(token)}&instrumentKey=${encodeURIComponent(instrumentKey)}`;

      console.log("Connecting to:", sseUrl);
      const es = new EventSource(sseUrl);

      es.onopen = () => {
        setIsConnected(true);
        setLog(prev => [...prev, "✅ Connected to SSE"]);
      };

      es.onmessage = (event) => {
        console.log("RAW DATA:", event.data);
        setLog(prev => [...prev.slice(-50), "📦 " + event.data]);
      };

      es.onerror = (err) => {
        console.error("SSE error:", err);
        setIsConnected(false);
        setLog(prev => [...prev, "❌ SSE Error or disconnected"]);
        es.close();
      };

      setEventSource(es);
    } catch (err) {
      setLog(prev => [...prev, "⚠️ Error: " + err.message]);
      console.error(err);
    }
  };

  const disconnect = () => {
    if (eventSource) {
      eventSource.close();
      setEventSource(null);
      setIsConnected(false);
      setLog(prev => [...prev, "🔌 Disconnected"]);
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial', maxWidth: 800, margin: '0 auto' }}>
      <h2>🔍 Upstox Market Feed Test</h2>
      <p style={{ color: '#6b7280' }}>Check if Upstox Market Data Feed (SSE) works with your token.</p>

      <input
        type="text"
        placeholder="Enter your Upstox Access Token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 10, border: '1px solid #ddd', borderRadius: 6 }}
      />

      <input
        type="text"
        placeholder="Instrument Key (e.g., NSE_INDEX|Nifty 50)"
        value={instrumentKey}
        onChange={(e) => setInstrumentKey(e.target.value)}
        style={{ width: '100%', padding: 10, marginBottom: 10, border: '1px solid #ddd', borderRadius: 6 }}
      />

      {!isConnected ? (
        <button
          onClick={connectSSE}
          style={{ background: '#2563eb', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          Connect
        </button>
      ) : (
        <button
          onClick={disconnect}
          style={{ background: '#ef4444', color: 'white', padding: '10px 20px', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          Disconnect
        </button>
      )}

      <div style={{ marginTop: 20, background: '#f9fafb', padding: 10, borderRadius: 8, height: 400, overflowY: 'auto', fontSize: 12 }}>
        {log.length === 0 ? (
          <p style={{ color: '#6b7280', textAlign: 'center' }}>No messages yet</p>
        ) : (
          log.map((msg, i) => <div key={i}>{msg}</div>)
        )}
      </div>
    </div>
  );
}
