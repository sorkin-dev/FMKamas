import React, { useState } from 'react';
import { ItemTemplate } from '../../../domain/models/Item';
import { StatLine } from '../../../domain/models/Stat';
import { ForgeAttempt } from '../../../domain/models/Forge';
import { Recommendation } from '../../../domain/models/Strategy';
import ItemSearch from '../item/ItemSearch';
import ItemCard from '../item/ItemCard';
import ItemStatPanel from '../item/ItemStatPanel';
import ItemTargetPanel from '../item/ItemTargetPanel';
import SinkDisplay from './SinkDisplay';
import RuneRecommendation from './RuneRecommendation';
import ForgeHistory from './ForgeHistory';
import { SinkEngine } from '../../../domain/engine/SinkEngine';
import { StatType } from '../../../domain/constants/StatWeights';

const sinkEngine = new SinkEngine();

interface ForgeSimulatorProps {
  initialItem?: ItemTemplate | null;
}

export default function ForgeSimulator({ initialItem }: ForgeSimulatorProps): React.ReactElement {
  const [selectedItem, setSelectedItem] = useState<ItemTemplate | null>(initialItem ?? null);
  const [currentStats, setCurrentStats] = useState<StatLine[]>([]);
  const [targetStats, setTargetStats] = useState<StatLine[]>([]);
  const [attempts, setAttempts] = useState<ForgeAttempt[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectItem = (item: ItemTemplate): void => {
    setSelectedItem(item);
    const initial = item.stats.map(s => ({ type: s.type, value: s.min }));
    setCurrentStats(initial);
    const targets = item.stats.map(s => ({ type: s.type, value: s.max }));
    setTargetStats(targets);
    setAttempts([]);
    setRecommendation(null);
  };

  const handleStatChange = (type: string, value: number): void => {
    setCurrentStats(prev => {
      const existing = prev.findIndex(s => s.type === type);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { type: type as StatType, value };
        return updated;
      }
      return [...prev, { type: type as StatType, value }];
    });
  };

  const handleTargetChange = (type: string, value: number): void => {
    setTargetStats(prev => {
      const existing = prev.findIndex(s => s.type === type);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { type: type as StatType, value };
        return updated;
      }
      return [...prev, { type: type as StatType, value }];
    });
  };

  const getMaxStats = (): Record<StatType, number> => {
    const maxStats: Record<StatType, number> = {} as Record<StatType, number>;
    if (selectedItem) {
      for (const s of selectedItem.stats) maxStats[s.type] = s.max;
    }
    return maxStats;
  };

  const currentSink = selectedItem
    ? sinkEngine.calculateSink(currentStats, getMaxStats())
    : 0;

  const handleGetRecommendation = async (): Promise<void> => {
    if (!selectedItem || !window.electronAPI) return;
    setIsLoading(true);
    try {
      // Start a local calculation based on current state
      const { DecisionEngine } = await import('../../../domain/engine/DecisionEngine');
      const { RuneRepository: _RuneRepository } = await import('../../../infrastructure/persistence/repositories/RuneRepository');

      const engine = new DecisionEngine();
      const rec = engine.getRecommendation({
        currentStats,
        targetStats,
        maxStats: getMaxStats(),
        availableRunes: [],
        availableSink: currentSink,
        sessionAttempts: attempts.length,
        runePrices: {},
      });
      setRecommendation(rec);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Left column */}
      <div className="space-y-4">
        <ItemSearch onSelect={handleSelectItem} />
        {selectedItem && <ItemCard item={selectedItem} />}
        <SinkDisplay currentSink={currentSink} />
      </div>

      {/* Middle column */}
      <div className="space-y-4">
        {selectedItem ? (
          <>
            <ItemStatPanel
              title="📊 Stats Actuelles"
              stats={currentStats}
              statRanges={selectedItem.stats}
              targetStats={targetStats}
              onStatChange={handleStatChange}
              editable={true}
            />
            <ItemTargetPanel
              statRanges={selectedItem.stats}
              targetStats={targetStats}
              onTargetChange={handleTargetChange}
            />
          </>
        ) : (
          <div className="rounded-lg p-8 text-center" style={{ background: '#1a1a2e', border: '1px solid #2a2a4a' }}>
            <p className="text-4xl mb-3">⚒️</p>
            <p className="text-sm" style={{ color: '#94a3b8' }}>Sélectionnez un objet pour commencer</p>
          </div>
        )}
      </div>

      {/* Right column */}
      <div className="space-y-4">
        {selectedItem && (
          <button
            onClick={handleGetRecommendation}
            disabled={isLoading}
            className="w-full py-2 rounded font-medium text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ background: '#f59e0b', color: '#0f0f23' }}
          >
            {isLoading ? '⏳ Analyse...' : '🤖 Obtenir Recommandation (Ctrl+R)'}
          </button>
        )}
        <RuneRecommendation recommendation={recommendation} />
        <ForgeHistory attempts={attempts} />
      </div>
    </div>
  );
}
