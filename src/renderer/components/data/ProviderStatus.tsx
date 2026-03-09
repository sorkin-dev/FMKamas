import React from 'react';
import Badge from '../common/Badge';

interface Provider {
  name: string;
  available: boolean;
  lastChecked: Date;
}

interface ProviderStatusProps {
  providers: Provider[];
}

export default function ProviderStatus({ providers }: ProviderStatusProps): React.ReactElement {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold" style={{ color: '#f59e0b' }}>🔌 Sources de données</h3>
      {providers.length === 0 ? (
        <p className="text-xs" style={{ color: '#94a3b8' }}>Vérification en cours...</p>
      ) : (
        providers.map(p => (
          <div key={p.name} className="flex items-center justify-between rounded p-2" style={{ background: '#2a2a4a' }}>
            <span className="text-sm" style={{ color: '#e2e8f0' }}>{p.name}</span>
            <Badge label={p.available ? 'Disponible' : 'Hors ligne'} variant={p.available ? 'success' : 'danger'} />
          </div>
        ))
      )}
    </div>
  );
}
