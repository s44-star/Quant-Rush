// components/GameCanvas.js
'use client';
import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';

export default function GameCanvas({ shards, userId }) {
  const canvasRef = useRef(null);
  const [multiplier, setMultiplier] = useState(1.0);
  const [isLiquidated, setIsLiquidated] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. Initialize Blazing Fast WebGL App
    const app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight - 80, // Adjust for header
      backgroundColor: 0x050505, // Deep OLED Black
      resolution: window.devicePixelRatio || 1,
    });
    
    canvasRef.current.appendChild(app.view);

    // 2. Setup Ticker (The Mascot)
    // In production, replace this graphic with your 3D rendered sprite sheet of the mechanical bull.
    const tickerMascot = new PIXI.Graphics();
    tickerMascot.beginFill(0x00FFCC); // Neon Cyan baseline
    tickerMascot.drawCircle(0, 0, 40);
    tickerMascot.endFill();
    tickerMascot.x = app.screen.width / 2;
    tickerMascot.y = 80;
    app.stage.addChild(tickerMascot);

    // 3. Setup The Market Trendline (Volatility Line)
    const trendline = new PIXI.Graphics();
    app.stage.addChild(trendline);

    let tick = 0;
    
    // 4. The Core 60 FPS Game Loop
    app.ticker.add((delta) => {
      tick += 0.1 * delta;
      
      // Draw a chaotic sine wave simulating a market
      trendline.clear();
      trendline.lineStyle(4, 0x39FF14, 1); // Neon Green
      trendline.moveTo(0, app.screen.height / 2);

      for (let i = 0; i < app.screen.width; i += 10) {
        // High-frequency math for volatility
        const y = (app.screen.height / 2) + Math.sin(tick + (i * 0.05)) * 100 * (1 + (multiplier * 0.1));
        trendline.lineTo(i, y);
      }

      // Dynamic Mascot Reactions based on Multiplier
      if (multiplier > 10) {
        tickerMascot.tint = 0xFF00FF; // Mascot goes Magenta (Excited)
        tickerMascot.scale.set(1 + Math.sin(tick) * 0.1); // Pulsing
      }
    });

    // Cleanup on unmount
    return () => {
      app.destroy(true, true);
    };
  }, [multiplier]);

  // Handle the Margin Call Hook
  const triggerMarginCall = () => {
    setIsLiquidated(true);
    // Here you would pause the Pixi app and show the "Pay 10 Shards to Continue" UI.
  };

  return (
    <div className="relative w-full h-full">
      <div ref={canvasRef} className="absolute inset-0" />
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
         <h1 className="text-4xl font-black text-green-400 drop-shadow-[0_0_10px_rgba(57,255,20,0.8)]">
           {multiplier.toFixed(2)}x
         </h1>
      </div>

      {isLiquidated && (
        <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
          <h2 className="text-4xl font-black text-white mb-2 animate-pulse">LIQUIDATION WARNING</h2>
          <p className="text-xl text-gray-200 mb-6">Ticker is crashing. Deploy liquidity injection?</p>
          <button 
            className="px-8 py-4 bg-magenta-600 text-white font-bold text-2xl rounded shadow-[0_0_20px_rgba(255,0,255,0.6)]"
            onClick={() => {
              // Deduct shards in Supabase and resume game
              setIsLiquidated(false);
              setMultiplier(multiplier + 1);
            }}
          >
            USE 10 SHARDS TO OVERRIDE
          </button>
        </div>
      )}
    </div>
  );
}
