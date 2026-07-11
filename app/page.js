'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { WalletConnect } from '../components/TonConnectProvider';
import dynamic from 'next/dynamic';

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
        }
      }
    };
    initApp();
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-black">
      <header className="flex justify-between items-center p-4 border-b border-green-900 bg-black z-10 relative">
        <div className="flex items-center gap-3">
          {userContext?.photo_url ? (
             <img src={userContext.photo_url} alt="Profile" className="w-10 h-10 rounded-full border border-magenta-500" />
          ) : (
             <div className="w-10 h-10 rounded-full bg-gray-800 border border-green-500" />
          )}
          <div className="flex flex-col">
             <span className="font-bold text-sm tracking-wider text-green-400">
               {userContext?.first_name || 'GUEST_AGENT'}
             </span>
             <span className="text-xs text-magenta-400">SHARDS: {shards}</span>
          </div>
        </div>
        <WalletConnect />
      </header>

      <section className="flex-grow relative bg-black">
         <GameEngine shards={shards} userId={userContext?.id} />
      </section>
    </main>
  );
}
