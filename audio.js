/* ============================================================
   audio.js — bgm / ambient / sfx manager
   - fade in/out on every volume change (no abrupt cuts)
   - mobile-safe: audio only ever starts inside a real user
     gesture via unlock(), which is called from index/script.js
     on the first tap (ticket flip / start button)
   - missing audio files never break the game: every element
     has an `error` listener that just logs a warning
   - settings (mute + per-category volume) persist in localStorage
   ============================================================ */

class AudioManager {
  constructor() {
    this.STORAGE_KEY = "fair-audio-settings-v1";
    this.settings = this._loadSettings();

    this.unlocked = false;
    this.tracks = {};       // name -> { el, category: 'bgm'|'ambient' }
    this.sfxTemplates = {}; // name -> HTMLAudioElement (cloned per play)

    this.currentBgm = null;
    this.currentAmbient = null;

    this._activeSfxNodes = new Set();

    this._bindVisibilityHandling();
  }

  /* ---------------- persistence ---------------- */

  _loadSettings() {
    const defaults = { muted: false, bgm: 0.55, ambient: 0.5, sfx: 0.7 };
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) return { ...defaults, ...JSON.parse(raw) };
    } catch (e) { /* ignore corrupted storage */ }
    return defaults;
  }

  _saveSettings() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) { /* storage unavailable — non-fatal */ }
  }

  /* ---------------- setup ---------------- */

  /**
   * manifest = {
   *   bgm:     { name: 'src/path.mp3', ... },
   *   ambient: { name: 'src/path.mp3', ... },
   *   sfx:     { name: 'src/path.mp3', ... }
   * }
   */
  init(manifest) {
    Object.entries(manifest.bgm || {}).forEach(([name, src]) => {
      this.tracks[name] = { el: this._buildLoopingTrack(src, name, "bgm"), category: "bgm" };
    });
    Object.entries(manifest.ambient || {}).forEach(([name, src]) => {
      this.tracks[name] = { el: this._buildLoopingTrack(src, name, "ambient"), category: "ambient" };
    });
    Object.entries(manifest.sfx || {}).forEach(([name, src]) => {
      const el = new Audio(src);
      el.preload = "auto";
      el.addEventListener("error", () => console.warn(`[audio] missing sfx "${name}": ${src}`));
      this.sfxTemplates[name] = el;
    });
  }

  _buildLoopingTrack(src, name, category) {
    const el = new Audio(src);
    el.loop = true;
    el.preload = "auto";
    el.volume = 0;
    el.addEventListener("error", () => console.warn(`[audio] missing ${category} "${name}": ${src}`));
    return el;
  }

  /* ---------------- mobile unlock ----------------
     Call this synchronously from inside a click/touchend handler.
     Playing (then immediately pausing) every looping track once,
     inside a real gesture, satisfies iOS/Android autoplay rules
     so later programmatic play() calls (fades, scene changes)
     are allowed without another tap. */
  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    Object.values(this.tracks).forEach(({ el }) => {
      const p = el.play();
      if (p && p.then) {
        p.then(() => el.pause()).catch(() => { /* file missing/blocked — ignore */ });
      } else {
        el.pause();
      }
    });
  }

  /* ---------------- fading ---------------- */

  _fade(el, toVolume, duration = 900) {
    if (!el) return;
    cancelAnimationFrame(el._fadeRAF);
    const from = el.volume;
    const start = performance.now();

    if (toVolume > 0 && el.paused) {
      const p = el.play();
      if (p && p.catch) p.catch(() => { /* still locked — will retry on next gesture */ });
    }

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      el.volume = from + (toVolume - from) * t;
      if (t < 1) {
        el._fadeRAF = requestAnimationFrame(step);
      } else {
        el.volume = toVolume;
        if (toVolume <= 0.001) el.pause();
      }
    };
    el._fadeRAF = requestAnimationFrame(step);
  }

  _categoryVolume(category) {
    if (this.settings.muted) return 0;
    return this.settings[category] ?? 1;
  }

  _activeTrackNames() {
    return [this.currentBgm, this.currentAmbient].filter(Boolean);
  }

  _refreshActiveVolumes(duration = 500) {
    this._activeTrackNames().forEach((name) => {
      const t = this.tracks[name];
      if (t) this._fade(t.el, this._categoryVolume(t.category), duration);
    });
  }

  /* ---------------- public playback API ---------------- */

  playBgm(name, fadeMs = 1600) {
    if (!this.tracks[name]) return;
    if (this.currentBgm === name) return;
    this.currentBgm = name;
    this._fade(this.tracks[name].el, this._categoryVolume("bgm"), fadeMs);
  }

  stopBgm(fadeMs = 1200) {
    if (!this.currentBgm) return;
    this._fade(this.tracks[this.currentBgm].el, 0, fadeMs);
    this.currentBgm = null;
  }

  crossfadeAmbient(name, fadeMs = 1200) {
    if (this.currentAmbient === name) return;
    const prev = this.currentAmbient;
    this.currentAmbient = name || null;
    if (prev && this.tracks[prev]) this._fade(this.tracks[prev].el, 0, fadeMs);
    if (name && this.tracks[name]) this._fade(this.tracks[name].el, this._categoryVolume("ambient"), fadeMs);
  }

  /** One-shot sound effect. Clones the template so overlapping
   *  calls (e.g. rapid firework bursts) can play simultaneously. */
  playSfx(name, { volume = 1 } = {}) {
    const template = this.sfxTemplates[name];
    if (!template) return;
    const vol = this._categoryVolume("sfx") * volume;
    if (vol <= 0.001) return;

    const node = template.cloneNode(true);
    node.volume = Math.min(1, vol);
    this._activeSfxNodes.add(node);
    const cleanup = () => { node.remove?.(); this._activeSfxNodes.delete(node); };
    node.addEventListener("ended", cleanup);
    node.addEventListener("error", cleanup);
    const p = node.play();
    if (p && p.catch) p.catch(cleanup);
  }

  /* ---------------- settings ---------------- */

  setMuted(muted) {
    this.settings.muted = muted;
    this._saveSettings();
    this._refreshActiveVolumes(350);
  }

  toggleMute() {
    this.setMuted(!this.settings.muted);
    return this.settings.muted;
  }

  setCategoryVolume(category, value) {
    this.settings[category] = Math.max(0, Math.min(1, value));
    this._saveSettings();
    this._refreshActiveVolumes(150);
  }

  /* ---------------- tab visibility (mobile-friendly) ---------------- */

  _bindVisibilityHandling() {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this._activeTrackNames().forEach((name) => {
          const t = this.tracks[name];
          if (t) this._fade(t.el, 0, 300);
        });
      } else {
        this._refreshActiveVolumes(600);
      }
    });
  }
}

// single shared instance used by script.js
window.fairAudio = new AudioManager();
