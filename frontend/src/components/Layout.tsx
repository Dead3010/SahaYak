import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import GangaChat from './GangaChat';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <main className="pt-14 md:pl-52 min-h-screen">
        <div className="w-full px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <Outlet />
        </div>
      </main>
      <GangaChat />
    </div>
  );
}
