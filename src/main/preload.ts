import { contextBridge, ipcRenderer } from 'electron';

const api = {
  invoke: (channel: string, data?: unknown): Promise<unknown> => {
    const validChannels = [
      'items:search',
      'items:getById',
      'items:sync',
      'forge:startSession',
      'forge:applyRune',
      'forge:getRecommendation',
      'forge:runSimulation',
      'data:syncAll',
      'data:getProviderStatus',
      'data:importJson',
      'settings:get',
      'settings:set',
      'history:getSessions',
      'history:getSession',
    ];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
    return Promise.reject(new Error(`Invalid channel: ${channel}`));
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);
