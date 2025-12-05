// Effet sonore style Game Boy lors du typewriter
export function playTypewriterSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const audioContext = new AudioCtx();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Fréquence aléatoire mais toujours "Game Boy-ish"
    oscillator.frequency.value = 900 + Math.random() * 200;
    oscillator.type = "square";

    // Volume très faible
    gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.05
    );

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.05);
  } catch (error) {
    console.warn("Audio error:", error);
  }
}
