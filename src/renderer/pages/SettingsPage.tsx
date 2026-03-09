import React from 'react';
import DataSyncPanel from '../components/data/DataSyncPanel';
import { useSettingsStore } from '../store/settingsStore';

export default function SettingsPage(): React.ReactElement {
  const { defaultSimIterations, setDefaultSimIterations, showAdvancedStats, setShowAdvancedStats } = useSettingsStore();

  return (
    <div className="h-full flex flex-col gap-6 max-w-2xl">
      <h2 className="text-xl font-bold" style={{ color: '#f59e0b' }}>⚙️ Paramètres</h2>

      <section>
        <h3 className="text-sm font-semibold mb-3" style={{ color: '#e2e8f0' }}>🔄 Synchronisation des données</h3>
        <DataSyncPanel />
      </section>

      <section className="rounded-lg p-4 space-y-4" style={{ background: '#1a1a2e', border: '1px solid #2a2a4a' }}>
        <h3 className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>🎲 Simulation</h3>
        <div className="flex items-center gap-4">
          <label className="text-sm" style={{ color: '#94a3b8' }}>Itérations Monte Carlo</label>
          <input
            type="number"
            min={100}
            max={100000}
            step={100}
            value={defaultSimIterations}
            onChange={e => setDefaultSimIterations(Number(e.target.value))}
            className="w-24 px-2 py-1 rounded text-sm"
            style={{ background: '#2a2a4a', border: '1px solid #3a3a5a', color: '#e2e8f0' }}
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="advancedStats"
            checked={showAdvancedStats}
            onChange={e => setShowAdvancedStats(e.target.checked)}
            style={{ accentColor: '#f59e0b' }}
          />
          <label htmlFor="advancedStats" className="text-sm cursor-pointer" style={{ color: '#94a3b8' }}>
            Afficher les statistiques avancées
          </label>
        </div>
      </section>

      <section className="rounded-lg p-4" style={{ background: '#1a1a2e', border: '1px solid #2a2a4a' }}>
        <h3 className="text-sm font-semibold mb-2" style={{ color: '#e2e8f0' }}>⌨️ Raccourcis clavier</h3>
        <div className="space-y-1 text-xs" style={{ color: '#94a3b8' }}>
          <div className="flex justify-between"><span>Rechercher un objet</span><kbd className="px-1.5 py-0.5 rounded" style={{ background: '#2a2a4a' }}>Ctrl+F</kbd></div>
          <div className="flex justify-between"><span>Obtenir recommandation</span><kbd className="px-1.5 py-0.5 rounded" style={{ background: '#2a2a4a' }}>Ctrl+R</kbd></div>
          <div className="flex justify-between"><span>Sauvegarder session</span><kbd className="px-1.5 py-0.5 rounded" style={{ background: '#2a2a4a' }}>Ctrl+S</kbd></div>
          <div className="flex justify-between"><span>Annuler tentative</span><kbd className="px-1.5 py-0.5 rounded" style={{ background: '#2a2a4a' }}>Ctrl+Z</kbd></div>
          <div className="flex justify-between"><span>Fermer fenêtres</span><kbd className="px-1.5 py-0.5 rounded" style={{ background: '#2a2a4a' }}>Escape</kbd></div>
        </div>
      </section>

      <section className="rounded-lg p-4" style={{ background: '#1a1a2e', border: '1px solid #2a2a4a' }}>
        <h3 className="text-sm font-semibold mb-2" style={{ color: '#e2e8f0' }}>ℹ️ À propos</h3>
        <div className="text-xs space-y-1" style={{ color: '#94a3b8' }}>
          <p><strong style={{ color: '#f59e0b' }}>FMKamas v1.0.0</strong> — Forgemagie Assistant pour Dofus 3.5</p>
          <p>Outil indépendant. Pas de lecture mémoire, pas d'injection, pas d'automatisation.</p>
          <p>Les probabilités sont des estimations communautaires. Utilisez-les à titre indicatif.</p>
        </div>
      </section>
    </div>
  );
}
