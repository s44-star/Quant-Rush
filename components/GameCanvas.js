'use client';
import { useEffect, useRef, useState } from 'react';
import { Application, Graphics } from 'pixi.js';

export default function GameCanvas({ shards, userId }) {
  const canvasContainer = useRef(null);
  const [multiplier, setMultiplier] = useState(1.0);
  const [isLiquidated, setIsLiquidated] = useState(false);
  const appRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const initPixi = async () => {
      const app = new Application();
      await app.init({
        width: window.innerWidth,
        height: window.innerHeight - 80, 
        backgroundColor: 0x050505, 
        resolution: window.devicePixelRatio || 1,
      });

      if (!isMounted) {
        app.destroy(true, true);
        return;
      }

      appRef.current = app;
      canvasContainer.current.appendChild(app.canvas);

      // Ticker Mascot Setup
      const tickerMascot = new Graphics();
      tickerMascot.circle(0, 0, 40).fill(0x00FFCC);
      tickerMascot.x = app.screen.width / 2;
      tickerMascot.y = 80;
      app.stage.addChild(tickerMascot);

      // Market Volatility Trendline Setup
      const trendline = new Graphics();
      app.stage.addChild(trendline);

      let tick = 0;
      
      app.ticker.add(({ deltaTime }) => {
        tick += 0.1 * deltaTime;
        
        trendline.clear();
        trendline.moveTo(0, app.screen.height / 2);

        for (let i = 0; i < app.screen.width; i += 10) {
          const y = (app.screen.height / 2) + Math.sin(tick + (i * 0.05)) * 100 * (1 + (multiplier * 0.1));
          trendline.lineTo(i, y);
        }
        
        trendline.stroke({ width: 4, color: 0x39FF14 });

        if (multiplier > 10) {
          tickerMascot.tint = 0xFF00FF; 
          tickerMascot.scale.set(1 + Math.sin(tick) * 0.1); 
        }
      });
    };

    initPixi();

    return () => {
      isMounted = false;
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
      }
    };
  }, [multiplier]);

  return (
    <div className="relative w-full h-full">
      <div ref={canvasContainer} className="absolute inset-0" />
      
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
