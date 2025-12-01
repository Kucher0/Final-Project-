const CONFIG = {
  SAVE_INTERVAL: 5000,
  ANIMATION_DURATION: 1000,
  PRICE_MULTIPLIERS: {
    CLICK_POWER: 1.5,
    JUNIOR_DEV: 1.7,
    MIDDLE_DEV: 1.6,
    SENIOR_DEV: 1.8,
  },
  INITIAL_COSTS: {
    CLICK_POWER: 25,
    JUNIOR_DEV: 100,
    MIDDLE_DEV: 500,
    SENIOR_DEV: 2500,
  },
  LINES_PER_DEVELOPER: {
    JUNIOR: 1,
    MIDDLE: 5,
    SENIOR: 20,
  },
};

const UI = {
  displays: {
    score: document.getElementById("score"),
    lps: document.getElementById("lps"),
    clickButton: document.getElementById("click-button"),
    floatingText: document.getElementById("floating-text-container"),
  },
  upgrades: {
    clickPower: {
      button: document.getElementById("buy-click-power"),
      cost: document.getElementById("click-power-cost"),
    },
    juniorDev: {
      button: document.getElementById("buy-junior-dev"),
      cost: document.getElementById("junior-dev-cost"),
      count: document.getElementById("junior-dev-count"),
    },
    middleDev: {
      button: document.getElementById("buy-middle-dev"),
      cost: document.getElementById("middle-dev-cost"),
      count: document.getElementById("middle-dev-count"),
    },
    seniorDev: {
      button: document.getElementById("buy-senior-dev"),
      cost: document.getElementById("senior-dev-cost"),
      count: document.getElementById("senior-dev-count"),
    },
  },
};

const gameState = {
  score: 0,
  linesPerClick: 1,
  linesPerSecond: 0,
  costs: {
    clickPower: CONFIG.INITIAL_COSTS.CLICK_POWER,
    juniorDev: CONFIG.INITIAL_COSTS.JUNIOR_DEV,
    middleDev: CONFIG.INITIAL_COSTS.MIDDLE_DEV,
    seniorDev: CONFIG.INITIAL_COSTS.SENIOR_DEV,
  },
  developers: {
    junior: 0,
    middle: 0,
    senior: 0,
  },
};

const AudioManager = {
  sounds: {
    click: new Audio("assets/sounds/keyboard-click.mp3"),
    upgrade: new Audio("assets/sounds/upgrade-success.mp3"),
  },

  init() {
    this.sounds.click.volume = 0.2; 
    this.sounds.upgrade.volume = 0.3; 
  },

  play(soundName) {
    const sound = this.sounds[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound
        .play()
        .catch((error) => console.log(`Не вдалося відтворити звук: ${error}`));
    }
  },
};

const EffectsManager = {
  createFloatingText(event) {
    const text = document.createElement("div");
    text.textContent = `+${gameState.linesPerClick}`;
    text.className = "floating-text";

    const rect = UI.displays.floatingText.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    text.style.left = `${x}px`;
    text.style.top = `${y}px`;

    UI.displays.floatingText.appendChild(text);
    setTimeout(() => text.remove(), CONFIG.ANIMATION_DURATION);
  },
};

const ClickManager = {
  handleClick(event) {
    gameState.score += gameState.linesPerClick;
    AudioManager.play("click");
    EffectsManager.createFloatingText(event);
    UIManager.update();
  },

  init() {
    UI.displays.clickButton.addEventListener("click", this.handleClick);
  },
};

const UpgradeManager = {
  buyClickPower() {
    if (gameState.score >= gameState.costs.clickPower) {
      gameState.score -= gameState.costs.clickPower;
      gameState.linesPerClick++;
      gameState.costs.clickPower = Math.ceil(
        gameState.costs.clickPower * CONFIG.PRICE_MULTIPLIERS.CLICK_POWER
      );
      AudioManager.play("upgrade");
      UIManager.update();
    }
  },

  buyDeveloper(type) {
    const cost = gameState.costs[`${type}Dev`];
    if (gameState.score >= cost) {
      gameState.score -= cost;
      gameState.developers[type]++;
      gameState.linesPerSecond +=
        CONFIG.LINES_PER_DEVELOPER[type.toUpperCase()];
      gameState.costs[`${type}Dev`] = Math.ceil(
        cost * CONFIG.PRICE_MULTIPLIERS[`${type.toUpperCase()}_DEV`]
      );
      AudioManager.play("upgrade");
      UIManager.update();
    }
  },

  init() {
    UI.upgrades.clickPower.button.addEventListener("click", () =>
      this.buyClickPower()
    );
    UI.upgrades.juniorDev.button.addEventListener("click", () =>
      this.buyDeveloper("junior")
    );
    UI.upgrades.middleDev.button.addEventListener("click", () =>
      this.buyDeveloper("middle")
    );
    UI.upgrades.seniorDev.button.addEventListener("click", () =>
      this.buyDeveloper("senior")
    );
  },
};

const UIManager = {
  update() {
    // Оновлення основних показників
    UI.displays.score.textContent = Math.floor(gameState.score);
    UI.displays.lps.textContent = gameState.linesPerSecond;

    // Оновлення цін покращень
    UI.upgrades.clickPower.cost.textContent = gameState.costs.clickPower;
    UI.upgrades.juniorDev.cost.textContent = gameState.costs.juniorDev;
    UI.upgrades.middleDev.cost.textContent = gameState.costs.middleDev;
    UI.upgrades.seniorDev.cost.textContent = gameState.costs.seniorDev;

    // Оновлення кількості розробників
    UI.upgrades.juniorDev.count.textContent = gameState.developers.junior;
    UI.upgrades.middleDev.count.textContent = gameState.developers.middle;
    UI.upgrades.seniorDev.count.textContent = gameState.developers.senior;

    UI.upgrades.clickPower.button.disabled =
      gameState.score < gameState.costs.clickPower;
    UI.upgrades.juniorDev.button.disabled =
      gameState.score < gameState.costs.juniorDev;
    UI.upgrades.middleDev.button.disabled =
      gameState.score < gameState.costs.middleDev;
    UI.upgrades.seniorDev.button.disabled =
      gameState.score < gameState.costs.seniorDev;
  },
};

const AutoIncomeManager = {
  start() {
    setInterval(() => {
      gameState.score += gameState.linesPerSecond;
      UIManager.update();
    }, 1000);
  },
};

const SaveManager = {
  save() {
    localStorage.setItem("codeClickerSave", JSON.stringify(gameState));
  },

  load() {
    const savedGame = localStorage.getItem("codeClickerSave");
    if (savedGame) {
      const saved = JSON.parse(savedGame);

      gameState.score = saved.score || 0;
      gameState.linesPerClick = saved.linesPerClick || 1;
      gameState.linesPerSecond = saved.linesPerSecond || 0;

      gameState.costs = {
        clickPower: saved.costs?.clickPower || CONFIG.INITIAL_COSTS.CLICK_POWER,
        juniorDev: saved.costs?.juniorDev || CONFIG.INITIAL_COSTS.JUNIOR_DEV,
        middleDev: saved.costs?.middleDev || CONFIG.INITIAL_COSTS.MIDDLE_DEV,
        seniorDev: saved.costs?.seniorDev || CONFIG.INITIAL_COSTS.SENIOR_DEV,
      };

      gameState.developers = {
        junior: saved.developers?.junior || 0,
        middle: saved.developers?.middle || 0,
        senior: saved.developers?.senior || 0,
      };
    }
  },

  startAutoSave() {
    setInterval(() => this.save(), CONFIG.SAVE_INTERVAL);
  },
};

const ResetManager = {
    resetGame() {
        gameState.score = 0;
        gameState.linesPerClick = 1;
        gameState.linesPerSecond = 0;
        gameState.costs = {
            clickPower: CONFIG.INITIAL_COSTS.CLICK_POWER,
            juniorDev: CONFIG.INITIAL_COSTS.JUNIOR_DEV,
            middleDev: CONFIG.INITIAL_COSTS.MIDDLE_DEV,
            seniorDev: CONFIG.INITIAL_COSTS.SENIOR_DEV
        };
        gameState.developers = {
            junior: 0,
            middle: 0,
            senior: 0
        };
        
        localStorage.removeItem('codeClickerSave');
        UIManager.update();
    },

    showResetModal() {
        document.getElementById('modal-overlay').classList.remove('hidden');
    },

    hideResetModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
    },

    init() {
        const resetButton = document.getElementById('reset-button');
        const confirmButton = document.getElementById('reset-confirm');
        const cancelButton = document.getElementById('reset-cancel');
        const modalOverlay = document.getElementById('modal-overlay');

        resetButton.addEventListener('click', () => this.showResetModal());
        
        confirmButton.addEventListener('click', () => {
            this.resetGame();
            this.hideResetModal();
        });
        
        cancelButton.addEventListener('click', () => this.hideResetModal());
        
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                this.hideResetModal();
            }
        });
    }
};

const Game = {
    init() {
        SaveManager.load();
        AudioManager.init();
        ClickManager.init();
        UpgradeManager.init();
        ResetManager.init();
        AutoIncomeManager.start();
        SaveManager.startAutoSave();
        UIManager.update();
  },
};

window.addEventListener("load", () => Game.init());