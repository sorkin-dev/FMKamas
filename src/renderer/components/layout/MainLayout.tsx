import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Page } from '../../App';

interface MainLayoutProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  children: React.ReactNode;
}

export default function MainLayout({ currentPage, onNavigate, children }: MainLayoutProps): React.ReactElement {
  return (
    <div className="flex flex-col h-screen">
      <Header currentPage={currentPage} onNavigate={onNavigate} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
