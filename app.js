document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // TIMER SETTINGS
  // =========================
  const WORK_TIME = 25 * 60;  // 25 minutes
  const BREAK_TIME = 5 * 60;  // 5 minutes

  // =========================
  // STATE
  // =========================
  let timeLeft = WORK_TIME;
  let isWorkMode = true;
  let isRunning = false;
  let timerInterval = null;
  let endTime = null;

  let completedSessions =
    Number(localStorage.getItem("cozyCompletedSessions")) || 0;

  // =========================
  // DOM ELEMENTS
  // =========================
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const modeBadge = document.getElementById("mode-badge");
  const modeText = document.getElementById("mode-text");
  const sessionCountEl = document.getElementById("session-count");

  const startBtn = document.getElementById("start-btn");
  const pauseBtn = document.getElementById("pause-btn");
  const resetBtn = document.getElementById("reset-btn");

  // =========================
  // CHECK HTML
  // =========================
  if (
    !minutesEl ||
    !secondsEl ||
    !startBtn ||
    !pauseBtn ||
    !resetBtn
  ) {
    console.error(
      "Timer Error: Required timer elements are missing."
    );
    return;
  }

  // =========================
  // DISPLAY
  // =========================
  function updateDisplay() {
    const safeTime = Math.max(0, Math.ceil(timeLeft));

    const minutes = Math.floor(safeTime / 60);
    const seconds = safeTime % 60;

    minutesEl.textContent = String(minutes).padStart(2, "0");
    secondsEl.textContent = String(seconds).padStart(2, "0");

    if (sessionCountEl) {
      sessionCountEl.textContent = completedSessions;
    }
  }

  // =========================
  // UPDATE MODE UI
  // =========================
  function updateModeUI() {
    if (isWorkMode) {
      if (modeBadge) {
        modeBadge.textContent = "Focus Time";
        modeBadge.classList.add("work");
        modeBadge.classList.remove("break");
      }

      if (modeText) {
        modeText.textContent = "Pomodoro Mode: 25 min";
      }
    } else {
      if (modeBadge) {
        modeBadge.textContent = "Break Time";
        modeBadge.classList.add("break");
        modeBadge.classList.remove("work");
      }

      if (modeText) {
        modeText.textContent = "Break Mode: 5 min";
      }
    }
  }

  // =========================
  // UPDATE BUTTONS
  // =========================
  function updateButtons() {
    startBtn.disabled = isRunning;
    pauseBtn.disabled = !isRunning;
  }

  // =========================
  // TIMER TICK
  // =========================
  function tick() {
    if (!isRunning || endTime === null) {
      return;
    }

    const remainingMilliseconds = endTime - Date.now();

    if (remainingMilliseconds <= 0) {
      timeLeft = 0;
      updateDisplay();

      stopInterval();
      switchMode();

      return;
    }

    // Calculate from the real clock instead of counting down
    // one second at a time.
    timeLeft = remainingMilliseconds / 1000;

    updateDisplay();
  }

  // =========================
  // START
  // =========================
  function startTimer() {
    if (isRunning) {
      return;
    }

    isRunning = true;

    // Calculate when the current timer should end.
    endTime = Date.now() + timeLeft * 1000;

    // Run immediately so the display updates right away.
    tick();

    timerInterval = setInterval(tick, 250);

    updateButtons();
  }

  // =========================
  // PAUSE
  // =========================
  function pauseTimer() {
    if (!isRunning) {
      return;
    }

    // Save the exact remaining time.
    timeLeft = Math.max(0, (endTime - Date.now()) / 1000);

    isRunning = false;
    endTime = null;

    stopInterval();

    updateDisplay();
    updateButtons();
  }

  // =========================
  // STOP INTERVAL
  // =========================
  function stopInterval() {
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  // =========================
  // RESET
  // =========================
  function resetTimer() {
    isRunning = false;
    endTime = null;

    stopInterval();

    timeLeft = isWorkMode ? WORK_TIME : BREAK_TIME;

    updateDisplay();
    updateButtons();
  }

  // =========================
  // SWITCH WORK / BREAK
  // =========================
  function switchMode() {
    isRunning = false;
    endTime = null;

    stopInterval();

    if (isWorkMode) {
      // Work session completed.
      completedSessions++;

      localStorage.setItem(
        "cozyCompletedSessions",
        String(completedSessions)
      );

      isWorkMode = false;
      timeLeft = BREAK_TIME;
    } else {
      // Break completed.
      isWorkMode = true;
      timeLeft = WORK_TIME;
    }

    updateModeUI();
    updateDisplay();
    updateButtons();

    // Automatically start the next session.
    startTimer();
  }

  // =========================
  // BUTTON EVENTS
  // =========================
  startBtn.addEventListener("click", startTimer);
  pauseBtn.addEventListener("click", pauseTimer);
  resetBtn.addEventListener("click", resetTimer);

  // =========================
  // INITIAL STATE
  // =========================
  updateModeUI();
  updateDisplay();
  updateButtons();
});