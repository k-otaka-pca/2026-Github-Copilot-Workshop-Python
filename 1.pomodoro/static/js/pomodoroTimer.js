class PomodoroTimer {
  constructor(config = {}) {
    this.workDuration = config.workDuration ?? 1500;
    this.shortBreakDuration = config.shortBreakDuration ?? 300;
    this.longBreakDuration = config.longBreakDuration ?? 900;
    this.longBreakInterval = config.longBreakInterval ?? 4;

    this.mode = "work";
    this.timeRemaining = this.workDuration;
    this.isRunning = false;
    this.completedPomodoros = 0;
  }

  tick() {
    if (!this.isRunning || this.timeRemaining <= 0) {
      return false;
    }

    this.timeRemaining--;

    if (this.timeRemaining === 0) {
      this._onComplete();
      return true;
    }

    return false;
  }

  _onComplete() {
    if (this.mode === "work") {
      this.completedPomodoros++;

      if (this.completedPomodoros % this.longBreakInterval === 0) {
        this.switchMode("longBreak");
      } else {
        this.switchMode("shortBreak");
      }
    } else {
      this.switchMode("work");
    }
  }

  switchMode(newMode) {
    let nextTimeRemaining;

    switch (newMode) {
      case "work":
        nextTimeRemaining = this.workDuration;
        break;
      case "shortBreak":
        nextTimeRemaining = this.shortBreakDuration;
        break;
      case "longBreak":
        nextTimeRemaining = this.longBreakDuration;
        break;
      default:
        throw new Error(`Invalid mode: ${newMode}`);
    }

    this.mode = newMode;
    this.timeRemaining = nextTimeRemaining;
    this.isRunning = false;
  }

  start() {
    this.isRunning = true;
  }

  pause() {
    this.isRunning = false;
  }

  reset() {
    this.isRunning = false;
    this.completedPomodoros = 0;
    this.switchMode("work");
  }

  formatTime() {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  getModeLabel() {
    switch (this.mode) {
      case "work":
        return "作業中";
      case "shortBreak":
        return "短休憩";
      case "longBreak":
        return "長休憩";
      default:
        return "不明";
    }
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = PomodoroTimer;
}
