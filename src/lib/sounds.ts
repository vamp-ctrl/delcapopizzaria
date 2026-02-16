// Programmatic sound generation using Web Audio API
// No external files needed - generates tones on the fly

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new AudioContext();
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

/**
 * Play a sequence of beeps for new order notifications.
 * Loud, attention-grabbing, ~3 seconds long.
 */
export const playOrderNotification = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Play 6 ascending beeps over ~3 seconds
    const frequencies = [523, 659, 784, 523, 659, 784]; // C5, E5, G5 repeated
    const beepDuration = 0.25;
    const gap = 0.2;

    frequencies.forEach((freq, i) => {
      const startTime = now + i * (beepDuration + gap);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
      gain.gain.setValueAtTime(0.3, startTime + beepDuration - 0.05);
      gain.gain.linearRampToValueAtTime(0, startTime + beepDuration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + beepDuration);
    });
  } catch (e) {
    console.warn('Could not play order notification sound:', e);
  }
};

/**
 * Play a pleasant chime when the store opens.
 */
export const playStoreOpenSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Ascending major chord: C E G C
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.15);

      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.15 + 0.03);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.15 + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.5);
    });
  } catch (e) {
    console.warn('Could not play store open sound:', e);
  }
};

/**
 * Play a descending tone when the store closes.
 */
export const playStoreCloseSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Descending: G E C
    const notes = [784, 659, 523];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.2);

      gain.gain.setValueAtTime(0, now + i * 0.2);
      gain.gain.linearRampToValueAtTime(0.2, now + i * 0.2 + 0.03);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.2 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.2);
      osc.stop(now + i * 0.2 + 0.6);
    });
  } catch (e) {
    console.warn('Could not play store close sound:', e);
  }
};
