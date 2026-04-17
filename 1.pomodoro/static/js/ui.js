document.addEventListener("DOMContentLoaded", () => {
  const timer = new PomodoroTimer();

  // DOM要素の取得
  const timeDisplay = document.querySelector(".timer-display .time");
  const modeLabel = document.querySelector(".timer-display .mode-label");
  const startBtn = document.getElementById("start-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const resetBtn = document.getElementById("reset-btn");
  const completedCount = document.getElementById("completed-count");
  const progressRingFg = document.querySelector(".progress-ring__fg");

  // プログレスリングの設定
  const radius = progressRingFg.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  progressRingFg.style.strokeDasharray = `${circumference}`;
  progressRingFg.style.strokeDashoffset = "0";

  let intervalId = null;

  // 通知権限のリクエスト
  function requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  // タイマー終了通知の送信
  function sendNotification(nextMode) {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }

    const messages = {
      work: { title: "休憩終了！", body: "作業を再開しましょう 💪" },
      shortBreak: { title: "ポモドーロ完了！", body: "短い休憩を取りましょう ☕" },
      longBreak: { title: "ポモドーロ完了！", body: "長い休憩を取りましょう 🎉" },
    };

    const msg = messages[nextMode];
    new Notification(msg.title, { body: msg.body });
  }

  function getTotalDuration() {
    switch (timer.mode) {
      case "work":
        return timer.workDuration;
      case "shortBreak":
        return timer.shortBreakDuration;
      case "longBreak":
        return timer.longBreakDuration;
      default:
        console.warn(`Unknown timer mode: ${timer.mode}. Falling back to work duration.`);
        return timer.workDuration;
    }
  }

  function updateDisplay() {
    timeDisplay.textContent = timer.formatTime();
    modeLabel.textContent = timer.getModeLabel();
    completedCount.textContent = timer.completedPomodoros;
    document.body.dataset.mode = timer.mode;

    // プログレスリングの更新
    const total = getTotalDuration();
    const elapsed = total - timer.timeRemaining;
    const offset = (elapsed / total) * circumference;
    progressRingFg.style.strokeDashoffset = `-${offset}`;
  }

  function startTimer() {
    if (intervalId !== null) return;

    // ユーザー操作時に通知権限をリクエスト
    requestNotificationPermission();

    timer.start();
    intervalId = setInterval(() => {
      const completed = timer.tick();
      updateDisplay();

      if (completed) {
        stopInterval();
        // 通知を送信し、次のモードで自動的にタイマーを開始
        sendNotification(timer.mode);
        updateDisplay();
        startTimer();
      }
    }, 1000);
  }

  function pauseTimer() {
    timer.pause();
    stopInterval();
  }

  function resetTimer() {
    timer.reset();
    stopInterval();
    updateDisplay();
  }

  function stopInterval() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  // イベントバインド
  startBtn.addEventListener("click", startTimer);
  pauseBtn.addEventListener("click", pauseTimer);
  resetBtn.addEventListener("click", resetTimer);

  // 初期表示
  updateDisplay();
});
