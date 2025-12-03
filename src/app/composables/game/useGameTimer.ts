/**
 * useGameTimer - Composable for managing game phase timers
 *
 * Handles countdown timers for game phases (observation, debate, voting)
 * with automatic synchronization to server time.
 */

export function useGameTimer() {
  const timeRemaining = ref(0);
  const isRunning = ref(false);
  const progress = ref(100);

  let intervalId: ReturnType<typeof setInterval> | null = null;
  let totalDuration = 0;

  /**
   * Start the timer
   * @param endTime - ISO string of when the phase ends
   */
  function start(endTime: string | null) {
    stop();

    if (!endTime) return;

    const end = new Date(endTime).getTime();
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((end - now) / 1000));

    if (remaining <= 0) {
      timeRemaining.value = 0;
      progress.value = 0;
      return;
    }

    totalDuration = remaining;
    timeRemaining.value = remaining;
    isRunning.value = true;
    progress.value = 100;

    intervalId = setInterval(() => {
      const currentNow = Date.now();
      const currentRemaining = Math.max(
        0,
        Math.floor((end - currentNow) / 1000),
      );

      timeRemaining.value = currentRemaining;
      progress.value =
        totalDuration > 0 ? (currentRemaining / totalDuration) * 100 : 0;

      if (currentRemaining <= 0) {
        stop();
      }
    }, 100);
  }

  /**
   * Stop the timer
   */
  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    isRunning.value = false;
  }

  /**
   * Format time as MM:SS
   */
  const formattedTime = computed(() => {
    const minutes = Math.floor(timeRemaining.value / 60);
    const seconds = timeRemaining.value % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  });

  /**
   * Check if time is running low (less than 10 seconds) or finished
   */
  const isLow = computed(() => timeRemaining.value <= 10);

  // Cleanup on unmount
  onUnmounted(() => {
    stop();
  });

  return {
    timeRemaining,
    isRunning,
    progress,
    formattedTime,
    isLow,
    start,
    stop,
  };
}
