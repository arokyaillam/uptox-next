"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFeedSSE } from "@/hooks/useFeedSSE";
import { useMarketStore } from "@/stores/useMarketStore";
import { feedController } from "@/lib/feedController";

const DEFAULT_KEY = "NSE_INDEX|NIFTY_50";

export default function MarketPage() {
  const [key, setKey] = useState(DEFAULT_KEY);
  const { stats, isConnected, error } = useFeedSSE(key);
  const feed = useMarketStore((s) => s.byKey[key]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">📊 Live Feed (Upstox + SSE) - Mock Data Mode</h1>

      <div className="flex gap-3">
        <Input
          className="w-96"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter instrument key (e.g., NSE_INDEX|NIFTY_50)"
        />
        <Button
          onClick={async () => {
            setKey(key);
            setIsSubscribed(true);
          }}
          disabled={!key || isConnected}
        >
          {isConnected ? "Connected" : "Subscribe"}
        </Button>
        <Button
          variant="outline"
          onClick={async () => {
            setIsTestingConnection(true);
            try {
              const accessToken = process.env.UPSTOX_ACCESS_TOKEN;
              if (!accessToken) {
                alert("Please set UPSTOX_ACCESS_TOKEN environment variable");
                return;
              }

              feedController.setAccessToken(accessToken);
              if (!feedController.isConnected()) {
                feedController.connect();
              }

              const isAuthValid = await feedController.testAuth();
              if (isAuthValid) {
                alert("✅ Connection successful! You can now subscribe to instruments.");
              } else {
                alert("❌ Connection failed. Please check your access token.");
              }
            } catch (error) {
              alert(`❌ Connection test failed: ${error}`);
            } finally {
              setIsTestingConnection(false);
            }
          }}
          disabled={isTestingConnection}
        >
          {isTestingConnection ? "Testing..." : "Test Connection"}
        </Button>
      </div>

      {/* Connection Status */}
      <div className="flex gap-4 text-sm items-center">
        <div className={`flex items-center gap-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-600 animate-pulse' : 'bg-red-600'}`} />
          {isConnected ? "🟢 Live Data Connected" : "🔴 Disconnected"}
        </div>
        {error && (
          <div className="text-red-600 bg-red-50 px-2 py-1 rounded">
            ❌ {error}
          </div>
        )}
        {isSubscribed && !isConnected && !error && (
          <div className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
            ⏳ Connecting...
          </div>
        )}
      </div>

      <div className="border rounded p-4 w-96 shadow-sm space-y-2">
        <div className="font-mono text-sm text-muted-foreground mb-2">
          {key}
        </div>

        {isSubscribed ? (
          feed ? (
            <>
              <div>LTP: ₹{feed.lastPrice ?? "—"}</div>
              <div>OI: {feed.openInterest ?? "—"}</div>
              <div>Vol: {feed.volume ?? "—"}</div>
              <div>IV: {feed.impliedVolatility ?? "—"}</div>
              <div className="text-xs text-blue-600 mt-2">
                🔄 Mock data - configure UPSTOX_ACCESS_TOKEN for live data
              </div>
            </>
          ) : (
            <div className="text-muted-foreground">Waiting for data…</div>
          )
        ) : (
          <div className="text-muted-foreground">Click Subscribe to start receiving data</div>
        )}
      </div>

      {stats && isSubscribed && (
        <div className="text-xs text-muted-foreground mt-4">
          <p>Last packet: {stats.size} bytes</p>
          <p>Decode time: {stats.elapsed} ms</p>
          <p>Updated: {stats.ts}</p>
        </div>
      )}
    </div>
  );
}
