import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import GangaChat from './GangaChat';

export default function Layout() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8fafc' }}>
      <Sidebar />
      <main className="pt-14 pl-52 min-h-screen">
        <div className="w-full px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
      <GangaChat />
    </div>
  );
}
