// Special thanks to Aevitas for sharing the original Solo Raid component that made this page possible.

const CARD_CATEGORY = {
    Burst: 'Burst',
    Affliction: 'Affliction',
    Support: 'Support',
};

const enemies = {
    "Enemy1": "Lojak",
    "Enemy2": "Takedar",
    "Enemy3": "Jukk",
    "Enemy4": "Sterl",
    "Enemy5": "Mohaca",
    "Enemy6": "Terro",
    "Enemy7": "Klonk",
    "Enemy8": "Priker",
};

const cards = {
    "MoonBeam": "MoonBeam",
    "Fragmentize": "Fragmentize",
    "SkullBash": "SkullBash",
    "RazorWind": "RazorWind",
    "WhipOfLightning": "WhipOfLightning",
    "BurstCount": "ClanshipBarrage",
    "Purify": "PurifyingBlast",
    "LimbBurst": "PsychicShackles",
    "FlakShot": "FlakShot",
    "Haymaker": "CosmicHaymaker",
    "ChainLightning": "ChainOfVengeance",
    "MirrorForce": "MirrorForce",
    "CelestialStatic": "CelestialStatic",
    "Weaken": "GuardBreak",
    "BarbedMorningstar": "BarbedMorningstar",
    "BurningAttack": "BlazingInferno",
    "PoisonAttack": "AcidDrench",
    "DecayingAttack": "DecayingStrike",
    "Fuse": "FusionBomb",
    "Shadow": "GrimShadow",
    "PlagueAttack": "ThrivingPlague",
    "Disease": "Radioactivity",
    "Swarm": "RavenousSwarm",
    "RuinousRust": "RuinousRain",
    "PowerBubble": "CorrosiveBubbles",
    "RuneAttack": "Maelstrom",
    "MagicPotion": "Amplify",
    "SandsOfTime": "SandsOfTime",
    "CosmicBarb": "ElectroZap", // manual name chance from Cosmic Barb to Electro Zap to match in-game
    "ExecutionersAxe": "CrushingInstinct",
    "CrushingVoid": "InsanityVoid",
    "MentalFocus": "RancidGas",
    "ImpactAttack": "InspiringForce",
    "InnerTruth": "SoulFire",
    "FinisherAttack": "VictoryMarch",
    "SuperheatMetal": "PrismaticRift",
    "BurstBoost": "AncestralFavor",
    "LimbSupport": "GraspingVines",
    "TotemFairySkill": "TotemOfPower",
    "TeamTactics": "TeamTactics",
    "SpinalTap": "SkeletalSmash",
    "AstralEcho": "AstralEcho",
    "TriangleSupport": "RadiantKaliedoscope",
    "BattleDrums": "BattleDrums"
}

const worldInput = document.querySelector('.world');
const floorInput = document.querySelector('.floor');
const includeInactiveCardsInput = document.querySelector('input.includeInactiveCards');

const possibleEnemiesContainer = document.querySelector('.possibleEnemies');
const possibleCombinationsContainer = document.querySelector('.possibleCombinations');
const deckGroupsWrapper = document.querySelector('.deck-group__wrapper');

function setLocalStorage(update) {
    const current = JSON.parse(localStorage.getItem('Solo_Raid') || '{}');
    localStorage.setItem('Solo_Raid', JSON.stringify({ ...current, ...update }));
}

class CSVFileLoader {
    static async loadCSVFile(filePath) {
        const response = await fetch(filePath);
        const csvText = await response.text();

        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    resolve(results.data);
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    }
}

class SoloRaidService {
    soloRaidLevelInfo = [];
    soloRaidDeckInfo = [];
    raidSkillInfo = [];

    _world = 0;
    _floor = 0;
    _includeInactiveCards = false;
    cardNameMap = {};

    maxWorld = 50;
    possibleDeckGroups = [];

    async initialize() {
        const baseUrl = "https://raw.githubusercontent.com/rawrzcookie/TT2_CSV/refs/heads/main/csv";

        this.soloRaidLevelInfo = await CSVFileLoader.loadCSVFile(`${baseUrl}/SoloRaidLevelInfo.csv`);
        this.soloRaidDeckInfo = await CSVFileLoader.loadCSVFile(`${baseUrl}/SoloRaidDeckInfo.csv`);
        this.raidSkillInfo = await CSVFileLoader.loadCSVFile(`${baseUrl}/RaidSkillInfo.csv`);

        this.maxWorld = Math.max(...this.soloRaidLevelInfo.map(value => value.WorldID));

        this.cardNameMap = {};
        this.raidSkillInfo.forEach(skill => {
            this.cardNameMap[skill.CardID] = skill.Name;
        });
        this.cardNameMap['None'] = 'None';

        // Load saved values or use defaults
        const saved = JSON.parse(localStorage.getItem('Solo_Raid') || '{}');

        const savedWorld = saved.world;
        const savedFloor = saved.floor;
        const savedIncludeInactive = saved.includeInactiveCards;

        this._world = savedWorld ? parseInt(savedWorld) : 20;
        this._floor = savedFloor ? parseInt(savedFloor) : 1;
        this._includeInactiveCards = savedIncludeInactive ? savedIncludeInactive === 'true' : false;

        this.generatePossibleDeckGroups();
    }

    get world() {
        return this._world;
    }

    set world(value) {
        this._world = value;
        setLocalStorage({ world: value });
        this.generatePossibleDeckGroups();
    }

    get floor() {
        return this._floor;
    }

    set floor(value) {
        this._floor = value;
        setLocalStorage({ floor: value });
        this.generatePossibleDeckGroups();
    }

    get includeInactiveCards() {
        return this._includeInactiveCards;
    }

    set includeInactiveCards(value) {
        this._includeInactiveCards = value;
        setLocalStorage({ includeInactiveCards: value });
        this.generatePossibleDeckGroups();
    }

    get anyInactiveCards() {
        return this.raidSkillInfo?.some(value => !value.IsActive) || false;
    }

    get possibleEnemies() {
        return this.soloRaidLevelInfo
            .find(value => value.WorldID == this.world && value.LevelID == this.floor)
            ?.EnemyIDs?.split(',') || [];
    }

    get deckGroupsWithNames() {
        return this.possibleDeckGroups.map(group =>
            group.map(deck =>
                deck.map(card => this.cardNameMap[card] || card)
            )
        );
    }

    generatePossibleDeckGroups() {
        const soloRaidDeckInfoFiltered = this.soloRaidDeckInfo.filter(value =>
            this.world >= value.MinWorld &&
            this.world <= value.MaxWorld &&
            this.floor >= value.MinFloor &&
            this.floor <= value.MaxFloor
        );

        this.possibleDeckGroups.length = 0;

        soloRaidDeckInfoFiltered.forEach(value => {
            const cardsA = this.getRandomCards(value.CardA, value.ExcludeCards);
            const cardsB = this.getRandomCards(value.CardB, value.ExcludeCards);
            const cardsC = this.getRandomCards(value.CardC, value.ExcludeCards);

            const result = this.generateDeckGroup(cardsA, cardsB, cardsC);

            this.possibleDeckGroups.push(result);
        });
    }

    get possibleCombinations() {
        return this.possibleDeckGroups.flat().length;
    }

    generateDeckGroup(cardsA, cardsB, cardsC) {
        const results = [];

        for (const cardA of cardsA) {
            for (const cardB of cardsB) {
                for (const cardC of cardsC) {
                    if ((
                        cardA === cardB ||
                        cardA === cardC ||
                        cardB === cardC) &&
                        cardC !== 'None'
                    ) {
                        continue;
                    }
                    results.push([cardA, cardB, cardC]);
                }
            }
        }
        return results;
    }

    getRandomCards(baseCard, excludedCards) {
        switch (baseCard) {
            case 'RandomBurst':
                return this.getValidCardsForCategory(CARD_CATEGORY.Burst, excludedCards);
            case 'RandomAffliction':
                return this.getValidCardsForCategory(CARD_CATEGORY.Affliction, excludedCards);
            case 'RandomSupport':
                return this.getValidCardsForCategory(CARD_CATEGORY.Support, excludedCards);
            default:
                return baseCard ? [baseCard] : [];
        }
    }

    getValidCardsForCategory(category, excludedCards) {
        return this.raidSkillInfo
            .filter(skill =>
                skill.Category === category &&
                (skill.IsActive === "TRUE" || this.includeInactiveCards) &&
                !excludedCards.includes(skill.CardID)
            )
            .map(skill => skill.CardID);
    }

    validateDeck(deck) {
        const [cardA, cardB, cardC] = deck;
        const permutations = [
            [cardA, cardB, cardC],
            [cardA, cardC, cardB],
            [cardB, cardA, cardC],
            [cardB, cardC, cardA],
            [cardC, cardA, cardB],
            [cardC, cardB, cardA]
        ];
        const validLocations = [];

        // Check deck has exactly 3 cards
        if (deck.length !== 3) {
            return {
                valid: false,
                validLocations: []
            };
        }

        // Check all worlds and floors (1 to maxWorld, 1 to 10)
        for (let world = 1; world <= this.maxWorld; world++) {
            for (let floor = 1; floor <= 10; floor++) {
                // Find ALL matching deck info for this location
                const matchingDeckInfos = this.soloRaidDeckInfo.filter(value =>
                    world >= value.MinWorld &&
                    world <= value.MaxWorld &&
                    floor >= value.MinFloor &&
                    floor <= value.MaxFloor
                );

                if (matchingDeckInfos.length === 0) {
                    continue;
                }

                // Check if ANY matching deck info validates this deck
                let validDeckInfo = null;

                for (const matchingDeckInfo of matchingDeckInfos) {
                    const validCardsA = this.getRandomCards(matchingDeckInfo.CardA, matchingDeckInfo.ExcludeCards);
                    const validCardsB = this.getRandomCards(matchingDeckInfo.CardB, matchingDeckInfo.ExcludeCards);
                    const validCardsC = this.getRandomCards(matchingDeckInfo.CardC, matchingDeckInfo.ExcludeCards);

                    const cardsValid = permutations.some(([a, b, c]) =>
                        validCardsA.includes(a) &&
                        validCardsB.includes(b) &&
                        validCardsC.includes(c)
                    );

                    const noDuplicateIssue = !((cardA === cardB || cardA === cardC || cardB === cardC) && cardC !== 'None');

                    if (cardsValid && noDuplicateIssue) {
                        validDeckInfo = matchingDeckInfo;
                        break;
                    }
                }

                if (validDeckInfo) {
                    validLocations.push({ world, floor, deckInfo: validDeckInfo });
                }
            }
        }

        return {
            valid: validLocations.length > 0,
            validLocations
        };
    }
}

async function initializeSoloRaid() {
    await SoloRaid.initialize();

    window.soloRaid = SoloRaid;

    const saved = JSON.parse(localStorage.getItem('Solo_Raid') || '{}');

    const savedWorld = saved.world;
    const savedFloor = saved.floor;
    const savedIncludeInactive = saved.includeInactiveCards;

    if (savedWorld != null) {
        const parsedWorld = parseInt(savedWorld);
        worldInput.value = parsedWorld;
        SoloRaid.world = parsedWorld;
    } else {
        worldInput.value = 20;
    }

    if (savedFloor != null) {
        const parsedFloor = parseInt(savedFloor);
        floorInput.value = parsedFloor;
        SoloRaid.floor = parsedFloor;
    } else {
        floorInput.value = 1;
    }

    if (savedIncludeInactive != null) {
        const parsedIncludeInactive = savedIncludeInactive === true || savedIncludeInactive === 'true';
        includeInactiveCardsInput.checked = parsedIncludeInactive;
        SoloRaid.includeInactiveCards = parsedIncludeInactive;
    }

    worldInput.max = SoloRaid.maxWorld;

    render();

    worldInput.addEventListener('change', (e) => {
        SoloRaid.world = parseInt(e.target.value);
        render();
    });

    floorInput.addEventListener('change', (e) => {
        SoloRaid.floor = parseInt(e.target.value);
        render();
    });

    includeInactiveCardsInput.addEventListener('change', (e) => {
        SoloRaid.includeInactiveCards = e.target.checked;
        render();
    });
}

function render() {
    renderEnemies();
    renderDeckGroups();
}

function renderEnemies() {
    const container = document.querySelector('.enemies-container');
    container.innerHTML = '';

    SoloRaid.possibleEnemies.forEach((enemyId) => {
        const enemyName = enemies[enemyId] || enemyId;
        const imagePath = `/images/titans/${enemyName}.png`;

        const wrapper = document.createElement('div');
        wrapper.className = 'enemy-item';

        const img = document.createElement('img');
        img.src = imagePath;
        img.alt = enemyName;

        const label = document.createElement('div');
        label.textContent = enemyName;

        wrapper.appendChild(img);
        wrapper.appendChild(label);

        container.appendChild(wrapper);
    });
}

function renderDeckGroups() {
    const countEl = document.querySelector('.deck-count');
    const wrapper = document.querySelector('.deck-group__wrapper');

    countEl.textContent = `${SoloRaid.possibleCombinations || 0} deck combinations`;

    wrapper.innerHTML = '';

    SoloRaid.possibleDeckGroups.forEach((deckGroup, groupIndex) => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'deck-group';

        const groupInfo = document.createElement('div');
        groupInfo.className = 'deck-group-data';
        groupInfo.textContent =
            `Group chance: 1 / ${SoloRaid.possibleDeckGroups.length}`;

        const deckWrapper = document.createElement('div');
        deckWrapper.className = 'deck__wrapper';

        deckGroup.forEach((deck, deckIndex) => {
            const deckDiv = document.createElement('div');
            deckDiv.className = 'deck';

            const deckInfo = document.createElement('div');
            deckInfo.className = 'deck-data';
            deckInfo.textContent = `Deck chance: 1 / ${deckGroup.length}`;

            const cardWrapper = document.createElement('div');
            cardWrapper.className = 'card__wrapper';

            deck.forEach((cardId) => {
                if (cardId === 'None') return;

                const cardName = cards[cardId] || cardId;

                const img = document.createElement('img');
                img.className = 'raid-card';
                img.src = `/images/cards/${cardName}.png`;
                img.alt = cardName;

                cardWrapper.appendChild(img);
            });

            deckDiv.appendChild(deckInfo);
            deckDiv.appendChild(cardWrapper);

            deckWrapper.appendChild(deckDiv);
        });

        groupDiv.appendChild(groupInfo);
        groupDiv.appendChild(deckWrapper);

        wrapper.appendChild(groupDiv);
    });
}

const SoloRaid = new SoloRaidService();
initializeSoloRaid();