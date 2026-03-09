import React, { useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import ForgePage from './pages/ForgePage';
import ItemBrowserPage from './pages/ItemBrowserPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

export type Page = 'forge' | 'items' | 'history' | 'settings';

export default function App(): React.ReactElement {
  const [currentPage, setCurrentPage] = useState<Page>('forge');

  const renderPage = (): React.ReactElement => {
    switch (currentPage) {
      case 'forge': return <ForgePage />;
      case 'items': return <ItemBrowserPage />;
      case 'history': return <HistoryPage />;
      case 'settings': return <SettingsPage />;
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#0f0f23' }}>
      <MainLayout currentPage={currentPage} onNavigate={setCurrentPage}>
        {renderPage()}
      </MainLayout>
    </div>
  );
}
