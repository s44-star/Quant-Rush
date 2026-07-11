// app/page.js
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { WalletConnect } from '../components/TonConnectProvider';
import dynamic from 'next/dynamic';

// Dynamically import the canvas so PixiJS doesn't break Server-Side Rendering
const GameEngine = dynamic(() => import('../components/GameCanvas'), { ssr: false });

export default function QuantRushHome() {
  const [userContext, setUserContext] = useState(null);
  const [shards, setShards] = useState(0);

  useEffect(() => {
    const initApp = async () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand(); 

        const user = tg.initDataUnsafe?.user;
        if (user) {
          setUserContext(user);
          
          // Upsert user into Supabase and fetch their Shards balance
          const { data, error } = await supabase
            .from('users')
            .upsert({
              id: user.id,
              username: user.username,
              first_name: user.first_name,
              profile_photo_url: user.photo_url || null
            })
            .select('data_shards')
            .single();
            
          if (data) setShards(data.data_shards);
          if (error) console.error("DB Sync Error:", error);
        }
      }
    };
    initApp();
  }, []);

  return (
    <main className="min-h-screen flex flex-col overflow-hidden">
      <header className="flex justify-between items-center p-4 border-b border-green-900 bg-gray-950 z-10 relative">
        <div className="flex items-center gap-3">
          {userContext?.photo_url ? (
             <img src={userContext.photo_url} alt="Profile" className="w-10 h-10 rounded-full border border-magenta-500" />
          ) : (
             <div className="w-10 h-10 rounded-full bg-gray-800 animate-pulse border border-green-500" />
          )}
          <div className="flex flex-col">
             <span className="font-bold text-sm tracking-wider">{userContext?.first_name || 'GUEST_AGENT'}</span>
             <span className="text-xs text-magenta-400">SHARDS: {shards}</span>
          </div>
        </div>
        <WalletConnect />
      </header>

      <section className="flex-grow relative bg-gray-900">
         {/* Load the WebGL Engine */}
         <GameEngine shards={shards} userId={userContext?.id} />
      </section>
    </main>
  );
}
