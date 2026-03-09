import React, { useState, useEffect } from 'react';
import { ItemTemplate } from '../../domain/models/Item';
import ItemSearch from '../components/item/ItemSearch';
import ItemCard from '../components/item/ItemCard';

export default function ItemBrowserPage(): React.ReactElement {
  const [selectedItem, setSelectedItem] = useState<ItemTemplate | null>(null);
  const [allItems, setAllItems] = useState<ItemTemplate[]>([]);

  useEffect(() => {
    const api = window.electronAPI;
    if (api) {
      api.invoke('items:search', { query: '' }).then(items => {
        setAllItems((items as ItemTemplate[]) ?? []);
      }).catch(console.error);
    }
  }, []);

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold" style={{ color: '#f59e0b' }}>📦 Base de données Items</h2>
        <span className="text-xs px-2 py-0.5 rounded" style={{ background: '#f59e0b22', color: '#f59e0b' }}>
          {allItems.length} items
        </span>
      </div>
      <ItemSearch onSelect={setSelectedItem} />
      {selectedItem && (
        <div className="max-w-sm">
          <ItemCard item={selectedItem} />
        </div>
      )}
      <div className="grid grid-cols-3 gap-3 overflow-y-auto">
        {allItems.slice(0, 30).map(item => (
          <div key={item.id} onClick={() => setSelectedItem(item)} className="cursor-pointer">
            <ItemCard item={item} />
          </div>
        ))}
        {allItems.length === 0 && (
          <div className="col-span-3 text-center py-8" style={{ color: '#94a3b8' }}>
            Aucun item dans la base de données. Synchronisez les données dans les paramètres.
          </div>
        )}
      </div>
    </div>
  );
}
