import type { BigFatFile } from './Graph.tsx';

self.onmessage = (e) => {
  try {
    const data: BigFatFile = JSON.parse(e.data);
    self.postMessage({ ok: true, data });
  } catch (err) {
    self.postMessage({ ok: false, error: err.message });
  }
};
