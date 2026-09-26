/** Follow the recording: 0s → 5, 1s → 4, …, 5s → shutter. */
export function startAudioCountdown(
  audio: HTMLAudioElement,
  onCount: (seconds: number) => void,
  onCapture: () => void,
): () => void {
  let stopped = false;
  let lastCount = 5;
  let fallbackStart: number | null = null;
  let fallbackOffset = 0;
  const fallback = () => {
    if (stopped || fallbackStart !== null) return;
    fallbackOffset = Math.min(5, audio.currentTime || 0);
    fallbackStart = performance.now();
    audio.pause();
  };
  audio.addEventListener("error", fallback);
  audio.addEventListener("ended", fallback);
  onCount(5);
  const timer = window.setInterval(() => {
    if (stopped) return;
    const elapsed = fallbackStart === null
      ? audio.currentTime
      : fallbackOffset + (performance.now() - fallbackStart) / 1000;
    if (elapsed >= 5) {
      stopped = true;
      window.clearInterval(timer);
      onCapture();
      return;
    }
    const count = Math.max(1, 5 - Math.floor(elapsed));
    if (count !== lastCount) {
      lastCount = count;
      onCount(count);
    }
  }, 20);
  void audio.play().catch(fallback);
  return () => {
    stopped = true;
    window.clearInterval(timer);
    audio.removeEventListener("error", fallback);
    audio.removeEventListener("ended", fallback);
    // Keep the embedded shutter tail playing during capture and the shot gap.
  };
}
