const STORAGE_PREFIX = 'wv_save_';

export interface SaveData {
  version: number;
  timestamp: number;
  player: { x: number; y: number; hp: number; maxHp: number };
  inventory: { itens: { nome: string; texture: string }[] };
  items: { nome: string; coletado: boolean; x: number; y: number; texture: string }[];
  npcs: { id: number; hasSpoken: boolean; sequenceIndex: number; x: number; y: number; anchorX: number; anchorY: number }[];
  eventZones: { id: string; triggered: boolean }[];
  puzzles: { cemeteryCompleted: boolean; churchCompleted: boolean; ruinsCompleted: boolean; lakeCompleted: boolean };
}

export default class SaveManager {
  static save(slot: number, data: SaveData): void {
    data.version = 1;
    data.timestamp = Date.now();
    localStorage.setItem(STORAGE_PREFIX + slot, JSON.stringify(data));
  }

  static load(slot: number): SaveData | null {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + slot);
      return raw ? (JSON.parse(raw) as SaveData) : null;
    } catch { return null; }
  }

  static deleteSave(slot: number): void {
    localStorage.removeItem(STORAGE_PREFIX + slot);
  }

  static getSlotInfo(slot: number): { exists: boolean; timestamp: number } {
    const data = SaveManager.load(slot);
    return { exists: data !== null, timestamp: data?.timestamp ?? 0 };
  }

  static getAllSlots(): { slot: number; exists: boolean; timestamp: number }[] {
    return [0, 1, 2].map((s) => ({ slot: s, ...SaveManager.getSlotInfo(s) }));
  }

  static exportSlot(slot: number): void {
    const data = SaveManager.load(slot);
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whisper_valley_save_${slot + 1}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static readFile(): Promise<SaveData | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) { resolve(null); return; }
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data = JSON.parse(reader.result as string);
            if (!data?.version || !data?.player || !data?.inventory) {
              alert('Arquivo de save inválido.');
              resolve(null); return;
            }
            resolve(data as SaveData);
          } catch {
            alert('Erro ao ler o arquivo.');
            resolve(null);
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });
  }

  static importData(data: SaveData, slot: number): void {
    SaveManager.save(slot, data);
  }
}
