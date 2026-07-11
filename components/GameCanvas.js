'use client';
import { useEffect, useRef, useState } from 'react';
import { Application, Graphics, Text, TextStyle } from 'pixi.js';

export default function GameCanvas({ shards, userId }) {
  const canvasContainer = useRef(null);
  const [multiplier, setMultiplier] = useState(1.0);
  const [isLiquidated, setIsLiquidated] = useState(false);
  const appRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let playerY = window.innerHeight / 2; // Track user finger position
    let targetY = window.innerHeight / 2;
    let scoreMultiplier = 1.0;
    let gameActive = true;

    const initPixi = async () => {
      const app = new Application();
      await app.init({
        width: window.innerWidth,
        height: window.innerHeight - 90, 
        backgroundColor: 0x020205, // Ultra dark Cyberpunk Blue/Black
        resolution: window.devicePixelRatio || 1,
      });

      if (!isMounted) {
        app.destroy(true, true);
        return;
      }

      appRef.current = app;
      canvasContainer.current.appendChild(app.canvas);

      // 1. Grid Background (Bloomberg Terminal Look)
      const grid = new Graphics();
      grid.lineStyle(1, 0x112211, 0.4);
      for (let i = 0; i < app.screen.width; i += 40) {
        grid.moveTo(i, 0).lineTo(i, app.screen.height);
      }
      for (let j = 0; j < app.screen.height; j += 40) {
        grid.moveTo(0, j).lineTo(app.screen.width, j);
      }
      app.stage.addChild(grid);

      // 2. The Volatility Trendline
      const trendline = new Graphics();
      app.stage.addChild(trendline);

      // 3. The Player's "Data Drifter" Slider (The unit you control)
      const playerSlider = new Graphics();
      playerSlider.rect(-15, -15, 30, 30).fill(0xFF00FF); // Neon Magenta Square
      playerSlider.x = 80; // Fixed X position, moves vertically
      app.stage.addChild(playerSlider);

      // 4. Ticker Mascot (Floating Companion - Smaller & Animated)
      const tickerMascot = new Graphics();
      tickerMascot.circle(0, 0, 20).fill(0x00FFCC); 
      tickerMascot.x = app.screen.width - 50;
      tickerMascot.y = 50;
      app.stage.addChild(tickerMascot);

      // Capture Touch / Drag Movement Natively
      app.stage.eventMode = 'static';
      app.stage.hitArea = app.screen;
      app.stage.on('pointermove', (event) => {
        if (gameActive) {
          playerY = event.global.y;
        }
      });

      let tick = 0;
      
      app.ticker.add(({ deltaTime }) => {
        if (!gameActive) return;
        
        tick += 0.15 * deltaTime;
        
        // Calculate the exact wave height at the player's X position (80px)
        targetY = (app.screen.height / 2) + Math.sin(tick + (80 * 0.05)) * 120 * (1 + (scoreMultiplier * 0.05));
        
        // Render the moving market chart
        trendline.clear();
        trendline.moveTo(0, app.screen.height / 2);
        for (let i = 0; i < app.screen.width; i += 8) {
          const y = (app.screen.height / 2) + Math.sin(tick + (i * 0.05)) * 120 * (1 + (scoreMultiplier * 0.05));
          trendline.lineTo(i, y);
        }
        trendline.stroke({ width: 3, color: 0x39FF14 }); // Toxic Green Line

        // Smoothly move player slider toward their finger touch point
        playerSlider.y += (playerY - playerSlider.y) * 0.3;

        // Core Game Loop Logic: Check distance between Player Slider and Market Target Line
        const accuracy = Math.abs(playerSlider.y - targetY);
        
        if (accuracy < 40) {
          // Locked in the zone! Multiplier ramps up
          scoreMultiplier += 0.02 * deltaTime;
          setMultiplier(scoreMultiplier);
          playerSlider.tint = 0xFFFFFF; // Flashes bright white when safe
          tickerMascot.y = 50 + Math.sin(tick * 2) * 5; // Happy bounce
        } else {
          // Out of bounds! Sudden Liquidation Crash Risk
          scoreMultiplier -= 0.05 * deltaTime;
          if (scoreMultiplier < 1.0) scoreMultiplier = 1.0;
          setMultiplier(scoreMultiplier);
          playerSlider.tint = 0xFF0000; // Turns emergency red

          // Chance to trigger instant liquidation flash if they stay out of bounds too long
          if (accuracy > 100 && Math.random() < 0.02) {
            gameActive = false;
            setIsLiquidated(true);
          }
        }
      });
    };

    initPixi();

    return () => {
      isMounted = false;
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full select-none touch-none">
      <div ref={canvasContainer} className="absolute inset-0" />
      
      {/* Heads Up Display */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
         <span className="text-xs text-green-500 font-bold tracking-widest block mb-1">MARKET VOLATILITY</span>
         <h1 className="text-5xl font-black text-green-400 drop-shadow-[0_0_15px_rgba(57,255,20,0.6)]">
           {multiplier.toFixed(2)}x
         </h1>
      </div>

      {isLiquidated && (
        <div className="absolute inset-0 bg-red-950/90 flex flex-col items-center justify-center z-50 backdrop-blur-md p-6 text-center animate-fade-in">
          <div className="border-2 border-red-500 p-8 max-w-sm bg-black box-glow">
            <h2 className="text-3xl font-black text-red-500 mb-2 tracking-tighter">⚠️ MARGIN CALL</h2>
            <p className="text-sm text-gray-400 mb-6 font-sans">Your position was completely liquidated by the market volatility protocol.</p>
            <button 
              className="w-full py-4 bg-magenta-600 hover:bg-magenta-700 text-white font-bold text-lg tracking-wide shadow-[0_0_20px_rgba(255,0,255,0.4)] transition-all"
              onClick={() => {
                window.location.reload(); // Quick reset loop for testing
              }}
            >
              INJECT 10 SHARDS TO RECOVER
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

