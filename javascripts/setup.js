const $ = function (id) {
    return document.getElementById(id);
};

// ===== SHARED STATE & CONFIGS =====

let selectedDamageType = null;
let selectedGoldType = null;

const BONUS_TYPE_GOLD = {
  ALL: "All",
  JACKPOT: "Jackpot",
  CHESTERSON: "Chesterson",
  FAIRY: "Fairy Gold",
  SPECIALTY: "Specialty Gold",
  HEART_OF_GOLD: "Heart of Gold",
  BOSS: "Boss Gold",
  HAND_OF_MIDAS: "Hand of Midas",
  MULTI_TITAN: "Multiple Titan",
  PRIZE: "Prize Gold",
  LEGACY: "Legacy Gold",
  HAYST: "All Gold During Hayst"
};

// ===== JSON =====

// Artifacts URLs by damage and gold type
const artifacts = {
  "Heavenly Strike": {
    "Fairy": "https://i.imgur.com/wWXzzuC.png",
    "Heart of Gold": "https://i.imgur.com/rJOdXEv.png",
    "Chesterson": "https://i.imgur.com/6nnvWLP.png"
  },
  "Pet": {
    "Fairy": "https://i.imgur.com/v3DQ6X1.png",
    "Heart of Gold": "https://i.imgur.com/pbtfstB.png",
    "Chesterson": "https://i.imgur.com/VVJLB76.png"
  },
  "Clan Ship": {
    "Fairy": "https://i.imgur.com/17DoSbU.png",
    "Heart of Gold": "https://i.imgur.com/mPOcNnk.png",
    "Chesterson": "https://i.imgur.com/As1deqt.png"
  },
  "Shadow Clone": {
    "Fairy": "https://i.imgur.com/4IoYbBt.png",
    "Heart of Gold": "https://i.imgur.com/pUQQunM.png",
    "Chesterson": "https://i.imgur.com/UU5anmg.png"
  },
  "Dagger": {
    "Fairy": "https://i.imgur.com/5pFWmBS.png",
    "Heart of Gold": "https://i.imgur.com/GQ6maCi.png",
    "Chesterson": "https://i.imgur.com/vwS9M8V.png"
  },
  "Gold Gun": {
    "Fairy": "https://i.imgur.com/PRsQeRj.png",
    "Heart of Gold": "https://i.imgur.com/Wfqvbki.png",
    "Chesterson": "https://i.imgur.com/ZvwWCvx.png"
  }
};

const armorByGoldType = {
  "Fairy": {
    "Primary": [BONUS_TYPE_GOLD.ALL, BONUS_TYPE_GOLD.JACKPOT, BONUS_TYPE_GOLD.CHESTERSON],
    "Secondary": [BONUS_TYPE_GOLD.FAIRY, BONUS_TYPE_GOLD.JACKPOT, BONUS_TYPE_GOLD.SPECIALTY],
    "Unique": {
      "Name": "Titania's Garb",
      "Secondary": [BONUS_TYPE_GOLD.LEGACY, BONUS_TYPE_GOLD.FAIRY, BONUS_TYPE_GOLD.SPECIALTY]
    },
  },
  "Heart of Gold": {
    "Primary": [BONUS_TYPE_GOLD.ALL, BONUS_TYPE_GOLD.JACKPOT, BONUS_TYPE_GOLD.BOSS],
    "Secondary": [BONUS_TYPE_GOLD.HEART_OF_GOLD, BONUS_TYPE_GOLD.JACKPOT, BONUS_TYPE_GOLD.SPECIALTY],
    "Unique": {
      "Name": "Rosabella's Uniform",
      "Secondary": [BONUS_TYPE_GOLD.PRIZE, BONUS_TYPE_GOLD.HEART_OF_GOLD, BONUS_TYPE_GOLD.SPECIALTY]
    },
  },
  "Chesterson": {
    "Primary": [BONUS_TYPE_GOLD.ALL, BONUS_TYPE_GOLD.JACKPOT, BONUS_TYPE_GOLD.CHESTERSON],
    "Secondary": [BONUS_TYPE_GOLD.MULTI_TITAN, BONUS_TYPE_GOLD.JACKPOT, BONUS_TYPE_GOLD.HAND_OF_MIDAS],
    "Unique": {
      "Name": "Jayce's Armor",
      "Secondary": [BONUS_TYPE_GOLD.HAYST, BONUS_TYPE_GOLD.MULTI_TITAN, BONUS_TYPE_GOLD.JACKPOT]
    },
  }
};

// Other equipment by damage type
const equipmentByDamageType = {
  "Heavenly Strike": {
    "Sword": {
      "Primary": ["All Damage", "Critical", "Tap"],
      "Secondary": ["All Spell", "Heavenly Strike", "Twilight Fairy", "Fire Sword"],
      "Unique": {
        "Name": "Alpha Heart Blade",
        "Secondary": ["Damage Per Total Card Level", "Heavenly Strike", "Twilight Fairy"]
      },
    },
    "Helmet": {
      "Primary": ["Gunblade"],
      "Secondary": ["All Damage", "Critical", "Boss"],
      "Unique": {
        "Name": "Burden of the Oathkeeper",
        "Secondary": ["Snap", "All Damage", "Critical"]
      },
    },
    "Aura": {
      "Primary": ["Sword", "Slash"],
      "Secondary": ["Stage / Titan Skip", "Mana Boost", "Multiple Fairy"],
      "Unique": {
        "Name": "Lightning Metal Wings",
        "Secondary": ["Companion Attack Rate", "Stage / Titan Skip", "Mana Boost"]
      },
    },
    "Slash": {
      "Primary": ["Heavenly Strike"],
      "Secondary": ["All Probability", "Portar"],
      "Unique": {
        "Name": "Kronus' Flame",
        "Secondary": ["Twilight Fairy Stage Skip", "Portar", "All Probability"]
      },
    }
  },
  "Pet": {
    "Sword": {
      "Primary": ["All Damage", "Critical", "Tap"],
      "Secondary": ["All Spell", "Fire Sword", "Dual Summon"],
      "Unique": {
        "Name": "Alpha Heart Blade",
        "Secondary": ["Damage Per Total Card Level", "Dual Summon", "Fire Sword" ]
      },
    },
    "Helmet": {
      "Primary": ["Highest Hero"],
      "Secondary": ["All Damage", "Critical", "Pet", "Boss"],
      "Unique": {
        "Name": "Elder Snow Cap",
        "Secondary": ["War Cry", "Pet", "All / Critical Damage"]
      },
    },
    "Aura": {
      "Primary": ["Sword", "Slash"],
      "Secondary": ["Stage / Titan Skip", "Mana Boost", "Multiple Fairy"],
      "Unique": {
        "Name": "Sophia's Faith",
        "Secondary": ["Companion Deadly Strike", "Stage / Titan Skip", "Mana Boost"]
      },
    },
    "Slash": {
      "Primary": ["Pet"],
      "Secondary": ["All Probability", "Portar", "Companion Cooldown Red."],
      "Unique": {
        "Name": "Drunken Hammer's Smash",
        "Secondary": ["Portar", "All Probability", "Critical Chance"]
      },
    }
  },
  "Clan Ship": {
    "Sword": {
      "Primary": ["All Damage", "Critical", "All Hero"],
      "Secondary": ["All Spell", "War Cry", "Thunder Ship"],
      "Unique": {
        "Name": "Alpha Heart Blade",
        "Secondary": ["Damage Per Total Card Level", "War Cry", "Thunder Ship"]
      },
    },
    "Helmet": {
      "Primary": ["Highest Hero"],
      "Secondary": ["All Damage", "Critical", "Clan Ship", "Boss"],
      "Unique": {
        "Name": "Elder Snow Cap",
        "Secondary": ["War Cry", "Clan Ship", "All / Critical Damage"]
      },
    },
    "Aura": {
      "Primary": ["Sword", "Helmet", "Slash"],
      "Secondary": ["Stage / Titan Skip", "Mana Boost", "Multiple Fairy"],
      "Unique": {
        "Name": "Sophia's Faith",
        "Secondary": ["Companion Deadly Strike", "Stage / Titan Skip", "Mana Boost"]
      },
    },
    "Slash": {
      "Primary": ["Clan Ship"],
      "Secondary": ["All Probability", "Portar", "Companion Cooldown Red."],
      "Unique": {
        "Name": "Power of D.O.S.",
        "Secondary": ["Astral Awakening", "Portar", "All Probability"]
      },
    }
  },
  "Shadow Clone": {
    "Sword": {
      "Primary": ["All Damage", "Critical"],
      "Secondary": ["All Spell", "Shadow Clone", "Twilight Fairy"],
      "Unique": {
        "Name": "Alpha Heart Blade",
        "Secondary": ["Damage Per Total Card Level", "Shadow Clone", "Twilight Fairy"]
      },
    },
    "Helmet": {
      "Primary": ["Gunblade", "Highest Hero"],
      "Secondary": ["All Damage", "Critical", "Boss"],
      "Unique": {
        "Name": "Elder Snow Cap",
        "Secondary": ["War Cry", "All Damage", "Critical Damage"]
      },
    },
    "Aura": {
      "Primary": ["Sword", "Slash"],
      "Secondary": ["Stage / Titan Skip", "Mana Boost", "Multiple Fairy"],
      "Unique": {
        "Name": "Sophia's Faith",
        "Secondary": ["Companion Deadly Strike", "Stage / Titan Skip", "Mana Boost"]
      },
    },
    "Slash": {
      "Primary": ["Shadow Clone"],
      "Secondary": ["All Probability", "Portar"],
      "Unique": {
        "Name": "Kronus' Flame",
        "Secondary": ["Twilight Fairy Stage Skip", "Portar", "All Probability"]
      },
    }
  },
  "Dagger": {
    "Sword": {
      "Primary": ["All Damage", "Critical", "Tap"],
      "Secondary": ["All Spell", "Fire Sword", "Blade Stream"],
      "Unique": {
        "Name": "Alpha Heart Blade",
        "Secondary": ["Damage Per Total Card Level", "Blade Stream", "Fire Sword"]
      },
    },
    "Helmet": {
      "Primary": ["Gunblade"],
      "Secondary": ["All Damage", "Critical", "Boss"],
      "Unique": {
        "Name": "Elder Snow Cap",
        "Secondary": ["War Cry", "Dagger", "All / Critical Damage"]
      },
    },
    "Aura": {
      "Primary": ["Sword", "Slash"],
      "Secondary": ["Stage / Titan Skip", "Mana Boost", "Multiple Fairy"],
      "Unique": {
        "Name": "Lightning Metal Wings",
        "Secondary": ["Companion Attack Rate", "Stage / Titan Skip", "Mana Boost"]
      },
    },
    "Slash": {
      "Primary": ["Dagger"],
      "Secondary": ["All Probability", "Portar"],
      "Unique": {
        "Name": "Drunken Hammer's Smash",
        "Secondary": ["Portar", "All Probability", "Critical Chance"]
      },
    }
  },
  "Gold Gun": {
    "Sword": {
      "Primary": ["All Damage", "Critical"],
      "Secondary": ["All Spell", "War Cry"],
      "Unique": {
        "Name": "Alpha Heart Blade",
        "Secondary": ["Damage Per Total Card Level", "War Cry"]
      },
    },
    "Helmet": {
      "Primary": ["Highest Hero"],
      "Secondary": ["All Damage", "Critical", "Gold Gun", "Boss"],
      "Unique": {
        "Name": "Elder Snow Cap",
        "Secondary": ["War Cry", "Gold Gun", "All / Critical Damage"]
      },
    },
    "Aura": {
      "Primary": ["Sword", "Slash"],
      "Secondary": ["Stage / Titan Skip", "Mana Boost", "Multiple Fairy"],
      "Unique": {
        "Name": "Tiny Titan Tree's Bloom",
        "Secondary": ["Sprout Chance", "Stage / Titan Skip", "Mana Boost"]
      },
    },
    "Slash": {
      "Primary": ["Gold Gun"],
      "Secondary": ["All Probability", "Portar"],
      "Unique": {
        "Name": "Power of D.O.S.",
        "Secondary": ["Astral Awakening", "Portar", "All Probability"]
      },
    }
  }
};

const spellSetup = {
  "Heavenly Strike": [
    "Heavenly Strike",
    "Twilight Fairies",
    "Hand of Midas",
    "Fire Sword",
    "War Cry",
    "Shadow Clone"
  ],
  "Pet": [
    "Dual Summon",
    "Deadly Strike",
    "Hand of Midas",
    "Fire Sword",
    "War Cry",
    "Shadow Clone"
  ],
  "Clan Ship": [
    "Thunder Ship",
    "Deadly Strike",
    "Hand of Midas",
    "Fire Sword",
    "War Cry",
    "Shadow Clone"
  ],
  "Shadow Clone": [
    "Twilight Fairies",
    "Deadly Strike",
    "Hand of Midas",
    "Fire Sword",
    "War Cry",
    "Shadow Clone"
  ],
  "Dagger": [
    "Blade Stream",
    "Deadly Strike",
    "Hand of Midas",
    "Fire Sword",
    "War Cry",
    "Shadow Clone"
  ],
  "Gold Gun": [
    "Golden Missile",
    "Deadly Strike",
    "Hand of Midas",
    "Fire Sword",
    "War Cry",
    "Shadow Clone"
  ]
}

// Spell name to spell id
const spellNameToId = {
  "Heavenly Strike": "ActiveSkillBurstDamage",
  "Twilight Fairies": "ActiveSkillTwilightFairy",
  "Fire Sword": "ActiveSkillTapBoost",
  "War Cry": "ActiveSkillHelperBoost",
  "Hand of Midas": "ActiveSkillHandMidas",
  "Shadow Clone": "ActiveSkillShadowClone",
  "Dual Summon": "ActiveSkillDualPet",
  "Deadly Strike": "ActiveSkillCritBoost",
  "Thunder Ship": "ActiveSkillClanShipVoltage",
  "Blade Stream": "ActiveSkillStreamOfBlades",
  "Golden Missile": "ActiveSkillGoldenMissile"
};


// ===== BUTTONS AND SELECTION =====
const allSetupButtons = document.querySelectorAll('.setup-buttons button');

function clearGroupSelection(buttons) {
    buttons.forEach(btn => btn.classList.remove('selected'));
}

allSetupButtons.forEach(button => {
    button.addEventListener('click', () => {
        const parentSectionTitle = button
            .closest('.tablestats')
            .querySelector('span')
            .textContent
            .trim();

        const groupButtons = button.parentElement.querySelectorAll('button');

        clearGroupSelection(groupButtons);
        button.classList.add('selected');

        const value = button.textContent.trim();

        if (parentSectionTitle === 'Damage Type') {
            selectedDamageType = value;
        } else if (parentSectionTitle === 'Gold Type') {
            selectedGoldType = value;
        }

        updateArtifact();
        updateSpells();
        updateEquipment();
    });
});

// ===== ARTIFACTS =====
const artifactImg = document.getElementById('artifact-image');
const magnifyElement = document.querySelector('.artifact-display-magnify');
const artifactImageModal = document.getElementById('artifactImageModal');
const modalImage = document.getElementById('artifactImageModal-image');
const closeBtn = document.querySelector('.artifactImageModal-close');

function updateArtifact() {
    if (!selectedDamageType || !selectedGoldType) return;
    
    const path = "images/artifacts/"
    const damageFormatted = selectedDamageType.replace(/ /g, '_');
    const goldFormatted = selectedGoldType.replace(/ /g, '_');
    const fileName = `${damageFormatted}_${goldFormatted}.png`;
    
    const artifactUrl = path + fileName;

    if (artifactUrl) {
        artifactImg.src = artifactUrl;
    }
}

// Open modal
function openArtifactModal() {
    artifactImageModal.style.display = 'block';
    modalImage.src = artifactImg.src;
}

// Close modal
function closeArtifactModal() {
    artifactImageModal.style.display = 'none';
}

// Open modal when thumbnail and magnify is clicked
artifactImg.addEventListener('click', openArtifactModal);
magnifyElement.addEventListener('click', openArtifactModal);

// Close modal when X is clicked
closeBtn.addEventListener('click', closeArtifactModal);

// Close modal when clicking outside the image
artifactImageModal.addEventListener('click', function(e) {
    if (e.target === artifactImageModal) {
        closeArtifactModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && artifactImageModal.style.display === 'block') {
        closeArtifactModal();
    }
});

// ===== SPELLS =====
function updateSpells() {
    if (!selectedDamageType) return;

    const path = "images/spellicons/";
    const spells = spellSetup[selectedDamageType];
    const spellItems = document.querySelectorAll('.spell-item');

    if (!spells || !spellItems.length) return;

    spellItems.forEach((item, i) => {
        const spellName = spells[i];
        const img = item.querySelector('img');

        if (!spellName) return;

        const imgName = spellNameToId[spellName];
        img.src = path + imgName + ".png";
    });
}

// ===== EQUIPMENT =====

function updateEquipment() {
    if (!selectedDamageType || !selectedGoldType) return;

    const armorData = armorByGoldType[selectedGoldType];
    const damageData = equipmentByDamageType[selectedDamageType];
    
    if (!armorData || !damageData) return;

    const typeToDataKey = {
        'sword': 'Sword',
        'helmet': 'Helmet',
        'aura': 'Aura',
        'slash': 'Slash'
    };

    const equipmentItems = document.querySelectorAll('.equipment-item');
    
    equipmentItems.forEach(item => {
        const typeSpan = item.querySelector('.equipment-type');
        const equipmentType = typeSpan.id.toLowerCase();
        
        // Left column elements
        const primarySpan = item.querySelector('.equipment-primary');
        const secondarySpans = item.querySelectorAll('.equipment-secondary');
        
        // Right column elements (unique)
        const uniqueNameSpan = item.querySelector('.equipment-unique-name');
        const uniqueBonusSpans = item.querySelectorAll('.equipment-unique-bonus');
        
        // Clear all
        primarySpan.textContent = '';
        secondarySpans.forEach(span => span.textContent = '');
        if (uniqueNameSpan) uniqueNameSpan.textContent = '';
        uniqueBonusSpans.forEach(span => span.textContent = '');
        
        if (equipmentType === 'armor') {
            // Regular armor data
            primarySpan.textContent = armorData.Primary.join(', ');
            armorData.Secondary.slice(0, 3).forEach((bonus, i) => {
                if (secondarySpans[i]) secondarySpans[i].textContent = bonus;
            });
            
            // Unique armor data
            if (armorData.Unique && uniqueNameSpan) {
                uniqueNameSpan.textContent = armorData.Unique.Name;
                armorData.Unique.Secondary.slice(0, 4).forEach((bonus, i) => {
                    if (uniqueBonusSpans[i]) uniqueBonusSpans[i].textContent = bonus;
                });
            }
        } else {
            const dataKey = typeToDataKey[equipmentType];
            const equipmentData = damageData[dataKey];
            if (!equipmentData) return;
            
            // Regular equipment data
            primarySpan.textContent = equipmentData.Primary.join(', ');
            equipmentData.Secondary.slice(0, 3).forEach((bonus, i) => {
                if (secondarySpans[i]) secondarySpans[i].textContent = bonus;
            });
            
            // Unique equipment data
            if (equipmentData.Unique && uniqueNameSpan) {
                uniqueNameSpan.textContent = equipmentData.Unique.Name;
                equipmentData.Unique.Secondary.slice(0, 4).forEach((bonus, i) => {
                    if (uniqueBonusSpans[i]) uniqueBonusSpans[i].textContent = bonus;
                });
            }
        }
    });
}