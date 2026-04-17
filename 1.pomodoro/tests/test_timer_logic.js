const assert = require("assert");
const PomodoroTimer = require("../static/js/pomodoroTimer");

// ========================================
// tick() の減算テスト
// ========================================

(function testTickDecrementsTime() {
  const timer = new PomodoroTimer({ workDuration: 10 });
  timer.start();

  timer.tick();
  assert.strictEqual(timer.timeRemaining, 9, "tick() で1秒減算される");
})();

(function testTickDoesNotDecrementWhenNotRunning() {
  const timer = new PomodoroTimer({ workDuration: 10 });
  // start() を呼ばない
  timer.tick();
  assert.strictEqual(timer.timeRemaining, 10, "未開始状態では減算されない");
})();

(function testTickDoesNotDecrementWhenPaused() {
  const timer = new PomodoroTimer({ workDuration: 10 });
  timer.start();
  timer.tick(); // 9
  timer.pause();
  timer.tick();
  assert.strictEqual(timer.timeRemaining, 9, "一時停止中は減算されない");
})();

(function testTickReturnsFalseWhenNotComplete() {
  const timer = new PomodoroTimer({ workDuration: 10 });
  timer.start();
  const result = timer.tick();
  assert.strictEqual(result, false, "タイマー未完了時はfalseを返す");
})();

(function testTickReturnsTrueWhenComplete() {
  const timer = new PomodoroTimer({ workDuration: 1 });
  timer.start();
  const result = timer.tick();
  assert.strictEqual(result, true, "タイマー完了時はtrueを返す");
})();

// ========================================
// モード切替テスト
// ========================================

(function testWorkToShortBreak() {
  const timer = new PomodoroTimer({
    workDuration: 1,
    shortBreakDuration: 5,
    longBreakInterval: 4,
  });
  timer.start();
  timer.tick(); // 作業完了 → 短休憩へ

  assert.strictEqual(timer.mode, "shortBreak", "作業完了後に短休憩へ切り替わる");
  assert.strictEqual(timer.timeRemaining, 5, "短休憩の時間が設定される");
  assert.strictEqual(timer.completedPomodoros, 1, "完了ポモドーロ数が1になる");
})();

(function testShortBreakToWork() {
  const timer = new PomodoroTimer({
    workDuration: 10,
    shortBreakDuration: 1,
    longBreakInterval: 4,
  });
  // 作業完了 → 短休憩へ
  timer.start();
  timer.timeRemaining = 1;
  timer.tick();
  assert.strictEqual(timer.mode, "shortBreak");

  // 短休憩完了 → 作業へ
  timer.start();
  timer.tick();
  assert.strictEqual(timer.mode, "work", "短休憩完了後に作業へ切り替わる");
  assert.strictEqual(timer.timeRemaining, 10, "作業時間が再設定される");
})();

(function testLongBreakAfterInterval() {
  const timer = new PomodoroTimer({
    workDuration: 1,
    shortBreakDuration: 1,
    longBreakDuration: 15,
    longBreakInterval: 2,
  });

  // 1回目の作業完了 → 短休憩
  timer.start();
  timer.tick();
  assert.strictEqual(timer.mode, "shortBreak");
  assert.strictEqual(timer.completedPomodoros, 1);

  // 短休憩完了 → 作業
  timer.start();
  timer.tick();
  assert.strictEqual(timer.mode, "work");

  // 2回目の作業完了 → longBreakInterval=2 なので長休憩
  timer.start();
  timer.tick();
  assert.strictEqual(timer.mode, "longBreak", "longBreakInterval回の作業完了後に長休憩へ切り替わる");
  assert.strictEqual(timer.timeRemaining, 15, "長休憩の時間が設定される");
  assert.strictEqual(timer.completedPomodoros, 2);
})();

(function testLongBreakToWork() {
  const timer = new PomodoroTimer({
    workDuration: 1,
    shortBreakDuration: 1,
    longBreakDuration: 1,
    longBreakInterval: 1,
  });

  // 作業完了 → 長休憩（interval=1なので即長休憩）
  timer.start();
  timer.tick();
  assert.strictEqual(timer.mode, "longBreak");

  // 長休憩完了 → 作業
  timer.start();
  timer.tick();
  assert.strictEqual(timer.mode, "work", "長休憩完了後に作業へ切り替わる");
})();

// ========================================
// formatTime() のフォーマットテスト
// ========================================

(function testFormatTime25Minutes() {
  const timer = new PomodoroTimer({ workDuration: 1500 });
  assert.strictEqual(timer.formatTime(), "25:00", "25分が25:00にフォーマットされる");
})();

(function testFormatTime5Minutes() {
  const timer = new PomodoroTimer({ workDuration: 300 });
  assert.strictEqual(timer.formatTime(), "05:00", "5分が05:00にフォーマットされる");
})();

(function testFormatTimeWithSeconds() {
  const timer = new PomodoroTimer({ workDuration: 65 });
  assert.strictEqual(timer.formatTime(), "01:05", "65秒が01:05にフォーマットされる");
})();

(function testFormatTimeZero() {
  const timer = new PomodoroTimer({ workDuration: 0 });
  assert.strictEqual(timer.formatTime(), "00:00", "0秒が00:00にフォーマットされる");
})();

(function testFormatTimeSingleDigitSeconds() {
  const timer = new PomodoroTimer({ workDuration: 9 });
  assert.strictEqual(timer.formatTime(), "00:09", "9秒が00:09にフォーマットされる");
})();

// ========================================
// 長休憩間隔の判定テスト
// ========================================

(function testLongBreakIntervalDefault() {
  const timer = new PomodoroTimer();
  assert.strictEqual(timer.longBreakInterval, 4, "デフォルトの長休憩間隔は4");
})();

(function testLongBreakIntervalCustom() {
  const timer = new PomodoroTimer({ longBreakInterval: 3 });
  assert.strictEqual(timer.longBreakInterval, 3, "カスタムの長休憩間隔が設定される");
})();

(function testLongBreakOccursAtCorrectInterval() {
  const timer = new PomodoroTimer({
    workDuration: 1,
    shortBreakDuration: 1,
    longBreakDuration: 1,
    longBreakInterval: 3,
  });

  const modes = [];
  for (let i = 0; i < 6; i++) {
    timer.start();
    timer.tick(); // 作業完了
    modes.push(timer.mode);

    if (timer.mode !== "work") {
      timer.start();
      timer.tick(); // 休憩完了
    }
  }

  // 1回目: shortBreak, 2回目: shortBreak, 3回目: longBreak
  // 4回目: shortBreak, 5回目: shortBreak, 6回目: longBreak
  assert.strictEqual(modes[0], "shortBreak", "1回目の作業後は短休憩");
  assert.strictEqual(modes[1], "shortBreak", "2回目の作業後は短休憩");
  assert.strictEqual(modes[2], "longBreak", "3回目の作業後は長休憩");
  assert.strictEqual(modes[3], "shortBreak", "4回目の作業後は短休憩");
  assert.strictEqual(modes[4], "shortBreak", "5回目の作業後は短休憩");
  assert.strictEqual(modes[5], "longBreak", "6回目の作業後は長休憩");
})();

// ========================================
// reset() テスト
// ========================================

(function testReset() {
  const timer = new PomodoroTimer({
    workDuration: 1,
    shortBreakDuration: 1,
    longBreakInterval: 4,
  });

  timer.start();
  timer.tick(); // 作業完了 → shortBreak
  assert.strictEqual(timer.completedPomodoros, 1);

  timer.reset();
  assert.strictEqual(timer.mode, "work", "リセット後は作業モード");
  assert.strictEqual(timer.timeRemaining, 1, "リセット後は作業時間に戻る");
  assert.strictEqual(timer.isRunning, false, "リセット後は停止状態");
  assert.strictEqual(timer.completedPomodoros, 0, "リセット後は完了数が0");
})();

// ========================================
// デフォルト設定テスト
// ========================================

(function testDefaultConfig() {
  const timer = new PomodoroTimer();
  assert.strictEqual(timer.workDuration, 1500, "デフォルト作業時間は1500秒（25分）");
  assert.strictEqual(timer.shortBreakDuration, 300, "デフォルト短休憩は300秒（5分）");
  assert.strictEqual(timer.longBreakDuration, 900, "デフォルト長休憩は900秒（15分）");
  assert.strictEqual(timer.longBreakInterval, 4, "デフォルト長休憩間隔は4回");
  assert.strictEqual(timer.mode, "work", "初期モードは作業");
  assert.strictEqual(timer.isRunning, false, "初期状態は停止");
  assert.strictEqual(timer.completedPomodoros, 0, "初期完了数は0");
})();

console.log("全テスト合格");
