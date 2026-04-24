import { uuid } from '../utils.js';

export function addLog(store, entry) {
  store.data.log.push({
    id: uuid(),
    ...entry,
    createdAt: Date.now()
  });
  store.save();
}

export function getLogs(store) {
  return store.data.log.sort((a,b)=>b.createdAt-a.createdAt);
}
