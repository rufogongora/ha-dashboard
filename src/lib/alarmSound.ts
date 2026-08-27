let audioCtx: AudioContext | null = null;
let intervalId: ReturnType<typeof setInterval> | null = null;

/**
 * Call this on any real user gesture (a tap anywhere in the app) so the
 * AudioContext is created/resumed ahead of time — browsers block audio
 * that's started programmatically with no prior user gesture in the page,
 * and a door-left-open alert fires on a timer, not a tap.
 */
export function primeAudio() {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
}

function beep(ctx: AudioContext, freq: number, startTime: number, duration: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.5, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

/** Starts a repeating two-tone alarm pulse. Safe to call repeatedly —
 * no-ops if already playing. */
export function playAlarm() {
  primeAudio();
  if (!audioCtx || intervalId) return;
  const ctx = audioCtx;

  function pulse() {
    const now = ctx.currentTime;
    beep(ctx, 880, now, 0.25);
    beep(ctx, 660, now + 0.3, 0.25);
  }

  pulse();
  intervalId = setInterval(pulse, 1200);
}

export function stopAlarm() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
