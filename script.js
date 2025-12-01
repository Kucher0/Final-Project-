const CONFIG = {
    SAVE_INTERVAL: 5000,
    ANIMATION_DURATION: 1000,
    // ОНОВЛЕННЯ НАЗВ ТА МНОЖНИКІВ
    PRICE_MULTIPLIERS: {
        CLICK_POWER: 1.5,
        ART_DEV: 1.7, 
        ROCKET_DEV: 1.6, 
        BOAT_DEV: 1.8, 
        PLANE_DEV: 2.0, // Нове оновлення
    },
    // ОНОВЛЕННЯ ПОЧАТКОВИХ ВАРТОСТЕЙ
    INITIAL_COSTS: {
        CLICK_POWER: 30, 
        ART_DEV: 150, 
        ROCKET_DEV: 600, 
        BOAT_DEV: 2500, 
        PLANE_DEV: 5000, // Нове оновлення
    },
    // ОНОВЛЕННЯ КІЛЬКОСТІ РАКЕТ ЗА СЕКУНДУ
    LINES_PER_DEVELOPER: {
        ART: 1, 
        ROCKET: 5, 
        BOAT: 20, 
        PLANE: 50, // Нове оновлення
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
        // АРТИЛЕРІЯ
        artDev: {
            button: document.getElementById("buy-art-dev"),
            cost: document.getElementById("art-dev-cost"),
            count: document.getElementById("art-dev-count"),
        },
        // РАКЕТНА УСТАНОВКА
        rocketDev: {
            button: document.getElementById("buy-rocket-dev"),
            cost: document.getElementById("rocket-dev-cost"),
            count: document.getElementById("rocket-dev-count"),
        },
        // РАКЕТОНОСЕЦЬ
        boatDev: {
            button: document.getElementById("buy-boat-dev"),
            cost: document.getElementById("boat-dev-cost"),
            count: document.getElementById("boat-dev-count"),
        },
        // ЛІТАК З РАКЕТАМИ (НОВИЙ)
        planeDev: {
            button: document.getElementById("buy-plane-dev"),
            cost: document.getElementById("plane-dev-cost"),
            count: document.getElementById("plane-dev-count"),
        },
    },
};

const gameState = {
    score: 0,
    linesPerClick: 1,
    linesPerSecond: 0,
    costs: {
        clickPower: CONFIG.INITIAL_COSTS.CLICK_POWER,
        artDev: CONFIG.INITIAL_COSTS.ART_DEV,
        rocketDev: CONFIG.INITIAL_COSTS.ROCKET_DEV,
        boatDev: CONFIG.INITIAL_COSTS.BOAT_DEV,
        planeDev: CONFIG.INITIAL_COSTS.PLANE_DEV, // Додано
    },
    developers: {
        art: 0,
        rocket: 0,
        boat: 0,
        plane: 0, // Додано
    },
};

const AudioManager = {
    sounds: {
        click: new Audio("assets/sounds/keyboard-click.mp3"),
        upgrade: new Audio("assets/sounds/upgrade-success.mp3"),
    },

    init() {
        // Переконайтеся, що ви маєте папку assets/sounds
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
    // НОВА ДОПОМІЖНА ФУНКЦІЯ: підсвічує кнопку
    highlightButton(buttonElement) {
        buttonElement.classList.add('purchased-success');
        // Видаляємо клас через 300 мс, щоб створити ефект спалаху
        setTimeout(() => {
            buttonElement.classList.remove('purchased-success');
        }, 300);
    },

    buyClickPower() {
        if (gameState.score >= gameState.costs.clickPower) {
            const button = UI.upgrades.clickPower.button; // Отримуємо елемент кнопки
            
            gameState.score -= gameState.costs.clickPower;
            gameState.linesPerClick++;
            gameState.costs.clickPower = Math.ceil(
                gameState.costs.clickPower * CONFIG.PRICE_MULTIPLIERS.CLICK_POWER
            );
            
            this.highlightButton(button); // <<< ВИКЛИК ПІДСВІЧУВАННЯ
            AudioManager.play("upgrade");
            UIManager.update();
        }
    },

    buyDeveloper(type) {
        // type може бути 'art', 'rocket', 'boat', 'plane'
        const cost = gameState.costs[`${type}Dev`];
        
        // Визначаємо елемент кнопки, який потрібно підсвітити
        let buttonElement;
        if (type === 'art') buttonElement = UI.upgrades.artDev.button;
        else if (type === 'rocket') buttonElement = UI.upgrades.rocketDev.button;
        else if (type === 'boat') buttonElement = UI.upgrades.boatDev.button;
        else if (type === 'plane') buttonElement = UI.upgrades.planeDev.button;

        if (gameState.score >= cost) {
            gameState.score -= cost;
            gameState.developers[type]++;
            gameState.linesPerSecond +=
                CONFIG.LINES_PER_DEVELOPER[type.toUpperCase()];
            gameState.costs[`${type}Dev`] = Math.ceil(
                cost * CONFIG.PRICE_MULTIPLIERS[`${type.toUpperCase()}_DEV`]
            );
            
            this.highlightButton(buttonElement); // <<< ВИКЛИК ПІДСВІЧУВАННЯ
            AudioManager.play("upgrade");
            UIManager.update();
        }
    },

    init() {
        UI.upgrades.clickPower.button.addEventListener("click", () =>
            this.buyClickPower()
        );
        // ПРИВ'ЯЗКА КНОПОК
        UI.upgrades.artDev.button.addEventListener("click", () =>
            this.buyDeveloper("art")
        );
        UI.upgrades.rocketDev.button.addEventListener("click", () =>
            this.buyDeveloper("rocket")
        );
        UI.upgrades.boatDev.button.addEventListener("click", () =>
            this.buyDeveloper("boat")
        );
        UI.upgrades.planeDev.button.addEventListener("click", () => 
            this.buyDeveloper("plane")
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
        UI.upgrades.artDev.cost.textContent = gameState.costs.artDev;
        UI.upgrades.rocketDev.cost.textContent = gameState.costs.rocketDev;
        UI.upgrades.boatDev.cost.textContent = gameState.costs.boatDev;
        UI.upgrades.planeDev.cost.textContent = gameState.costs.planeDev; 

        // Оновлення кількості
        UI.upgrades.artDev.count.textContent = gameState.developers.art;
        UI.upgrades.rocketDev.count.textContent = gameState.developers.rocket;
        UI.upgrades.boatDev.count.textContent = gameState.developers.boat;
        UI.upgrades.planeDev.count.textContent = gameState.developers.plane; 
        
        // Оновлення статусу кнопок (disabled)
        UI.upgrades.clickPower.button.disabled =
            gameState.score < gameState.costs.clickPower;
        UI.upgrades.artDev.button.disabled =
            gameState.score < gameState.costs.artDev;
        UI.upgrades.rocketDev.button.disabled =
            gameState.score < gameState.costs.rocketDev;
        UI.upgrades.boatDev.button.disabled =
            gameState.score < gameState.costs.boatDev;
        UI.upgrades.planeDev.button.disabled = 
            gameState.score < gameState.costs.planeDev;
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

            // ОНОВЛЕННЯ ЗМІННИХ ВАРТОСТІ ПРИ ЗАВАНТАЖЕННІ
            gameState.costs = {
                clickPower: saved.costs?.clickPower || CONFIG.INITIAL_COSTS.CLICK_POWER,
                artDev: saved.costs?.artDev || CONFIG.INITIAL_COSTS.ART_DEV,
                rocketDev: saved.costs?.rocketDev || CONFIG.INITIAL_COSTS.ROCKET_DEV,
                boatDev: saved.costs?.boatDev || CONFIG.INITIAL_COSTS.BOAT_DEV,
                planeDev: saved.costs?.planeDev || CONFIG.INITIAL_COSTS.PLANE_DEV,
            };

            // ОНОВЛЕННЯ ЗМІННИХ КІЛЬКОСТІ ПРИ ЗАВАНТАЖЕННІ
            gameState.developers = {
                art: saved.developers?.art || 0,
                rocket: saved.developers?.rocket || 0,
                boat: saved.developers?.boat || 0,
                plane: saved.developers?.plane || 0,
            };
        }
    },

    startAutoSave() {
        setInterval(() => this.save(), CONFIG.SAVE_INTERVAL);
    },
};

const ResetManager = {
    resetGame() {
        // Скидання всіх параметрів до початкових
        gameState.score = 0;
        gameState.linesPerClick = 1;
        gameState.linesPerSecond = 0;
        gameState.costs = {
            clickPower: CONFIG.INITIAL_COSTS.CLICK_POWER,
            artDev: CONFIG.INITIAL_COSTS.ART_DEV,
            rocketDev: CONFIG.INITIAL_COSTS.ROCKET_DEV,
            boatDev: CONFIG.INITIAL_COSTS.BOAT_DEV,
            planeDev: CONFIG.INITIAL_COSTS.PLANE_DEV, 
        };
        gameState.developers = {
            art: 0,
            rocket: 0,
            boat: 0,
            plane: 0, 
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
