const KEY='show-the-way:v1';
function memoryBackend() { const data=new Map(); return { getItem:key=>data.get(key)??null, setItem:(key,value)=>data.set(key,value) }; }
function read(backend) { try { return JSON.parse(backend.getItem(KEY)) || {}; } catch { return {}; } }
export function createStorage(backend = globalThis.localStorage ?? memoryBackend()) {
  const save=data=>{try{backend.setItem(KEY,JSON.stringify(data));}catch{}};
  return {
    loadBest(levelId) { return read(backend).best?.[levelId] ?? null; },
    saveBest(levelId,record) { const data=read(backend); data.best={...(data.best||{}),[levelId]:record};save(data); },
    loadSettings() { const settings=read(backend).settings||{}; return { hintsEnabled:settings.hintsEnabled ?? false,reducedMotion:settings.reducedMotion ?? null }; },
    saveSettings(settings) { const data=read(backend);data.settings={...this.loadSettings(),...settings};save(data); }
  };
}
