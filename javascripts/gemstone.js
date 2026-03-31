
const path = "images/gemstones/"
const GOLD_REDUCTION = 0.7;
let selectedDamageType = null;
let selectedGoldType = null;

let saveTimeout = null;

const gemstoneIdToName = {
    "0": "aetherstone",
    "1": "sunstone",
    "2": "moonstone",
    "3": "starstone",
    "4": "strike Gem",
    "5": "pet Gem",
    "6": "clan Ship Gem",
    "7": "shadow Gem",
    "8": "dagger Gem",
    "9": "gold Gun Gem"
}

function clearGroupSelection(buttons) {
    buttons.forEach(btn => btn.classList.remove('selected'));
}

function setupDamageGoldTypeButtons() {
    const allSetupButtons = document.querySelectorAll('.setup-buttons button');

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

            const value = button.dataset.value;

            if (parentSectionTitle === 'Damage Type') {
                selectedDamageType = value;
            } else if (parentSectionTitle === 'Gold Type') {
                selectedGoldType = value;
            }

            updateAllGemstoneTotals();
            triggerSave();
        });
    });
}

function getGemstoneBonusTypes(gemstone, index) {
    const gem = GEMSTONE_INFO[gemstone.toLowerCase()];
    if (!gem) return [];

    const effect = gem.effects.find(e => e.effectIndex === index);

    if (!effect) {
        return [];
    }

    const bonusTypes = effect.pool.map(item => item.bonusType);
    return bonusTypes;
}

function populateGemstoneBonusRows(gemstoneId) {
    const gemstoneContainer = document.getElementById(gemstoneId);
    if (!gemstoneContainer) return;

    // Pre-sort options for each index (0-3 since there are 4 slots)
    const sortedOptionsByIndex = [];

    for (let index = 0; index < 4; index++) {
        const bonusTypes = getGemstoneBonusTypes(gemstoneId, index);

        // Create and sort options for this index
        const sortedOptions = bonusTypes
            .map(bonusType => {
                const localizedName = GEMSTONE_BONUS_INFO[bonusType].BonusTypeLocalized;
                const displayText = localizedName.replace(/([A-Z])/g, ' $1').trim();
                return {
                    value: bonusType,
                    displayText: displayText
                };
            })
            .sort((a, b) => a.displayText.localeCompare(b.displayText));

        sortedOptionsByIndex[index] = sortedOptions;
    }

    // Process both Current and New sides
    const sides = ['.gemstone-current', '.gemstone-new'];

    sides.forEach(sideClass => {
        const bonusRows = gemstoneContainer.querySelectorAll(`${sideClass} .gemstone-bonus-row`);

        bonusRows.forEach((row, index) => {
            const selectElement = row.querySelector('.bonus-select');
            if (!selectElement) return;

            const sortedOptions = sortedOptionsByIndex[index];
            const bonusTypes = sortedOptions.map(opt => opt.value);

            const currentValue = selectElement.value;

            selectElement.innerHTML = '';

            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '';
            selectElement.appendChild(defaultOption);

            sortedOptions.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.value;
                optionElement.textContent = option.displayText;
                selectElement.appendChild(optionElement);
            });

            if (currentValue && bonusTypes.includes(currentValue)) {
                selectElement.value = currentValue;
            }
        });
    });
}

function calculateGemstoneBonus(level, atrBase, powBase, powInc, powExp) {
    const num1Log10 = Math.log10(atrBase);

    const num2Log10 = Math.log10(1 + powInc * level) * powExp;

    const logMax = Math.max(num1Log10, num2Log10);
    const logMin = Math.min(num1Log10, num2Log10);

    const delta = logMin - logMax;

    const result = logMax + Math.log10(1 + Math.pow(10, delta));

    // Handle potential errors (like negative values causing NaN)
    if (isNaN(result) || !isFinite(result)) {
        return 0;
    }

    return result;
}

function getLockStatus(bonusRow, gemstoneItem) {
    const isNewSide = !!bonusRow.querySelector('.bonus-calc');
    let isLocked = false;
    let correspondingRow = null;

    if (isNewSide) {
        const currentSide = gemstoneItem.querySelector('.gemstone-current');
        const slotIndex = Array.from(bonusRow.parentElement.querySelectorAll('.gemstone-bonus-row')).indexOf(bonusRow);
        const currentRow = currentSide?.querySelectorAll('.gemstone-bonus-row')[slotIndex];
        const lockCheckbox = currentRow?.querySelector('.lock-checkbox');
        isLocked = lockCheckbox?.checked || false;
        correspondingRow = currentRow;
    } else {
        const lockCheckbox = bonusRow.querySelector('.lock-checkbox');
        isLocked = lockCheckbox?.checked || false;
        correspondingRow = bonusRow;
    }

    return { isNewSide, isLocked, correspondingRow };
}

function syncLockedRows(gemstoneItem) {
    const currentSide = gemstoneItem.querySelector('.gemstone-current');
    const newSide = gemstoneItem.querySelector('.gemstone-new');

    if (!currentSide || !newSide) return;

    const currentBonusRows = currentSide.querySelectorAll('.gemstone-bonus-row');
    const newBonusRows = newSide.querySelectorAll('.gemstone-bonus-row');

    currentBonusRows.forEach((currentRow, index) => {
        const lockCheckbox = currentRow.querySelector('.lock-checkbox');
        const isLocked = lockCheckbox?.checked || false;
        const newRow = newBonusRows[index];

        if (newRow) {
            const newSelect = newRow.querySelector('.bonus-select');

            if (isLocked) {
                // Locked: disable New side select
                if (newSelect) newSelect.disabled = true;

                // Also ensure the values are synced
                const selectElement = currentRow.querySelector('.bonus-select');
                const valueInput = currentRow.querySelector('.bonus-value');
                const newCalc = newRow.querySelector('.bonus-calc');

                if (newSelect && selectElement.value) {
                    newSelect.value = selectElement.value;
                }
                if (newCalc && valueInput.value) {
                    newCalc.textContent = valueInput.value;
                    if (valueInput.dataset.logValue) {
                        newCalc.dataset.logValue = valueInput.dataset.logValue;
                    }
                }

                currentRow.classList.add('locked');
                newRow.classList.add('locked');
            } else {
                // Unlocked: enable New side select
                if (newSelect) newSelect.disabled = false;

                currentRow.classList.remove('locked');
                newRow.classList.remove('locked');
            }
        }
    });
}

function copyCurrentToNew(currentRow, newRow) {
    if (!newRow) return;

    const selectElement = currentRow.querySelector('.bonus-select');
    const valueInput = currentRow.querySelector('.bonus-value');
    const newSelect = newRow.querySelector('.bonus-select');
    const newCalc = newRow.querySelector('.bonus-calc');

    if (newSelect && selectElement.value) {
        newSelect.value = selectElement.value;
    }
    if (newCalc && valueInput.value) {
        newCalc.textContent = valueInput.value;
        if (valueInput.dataset.logValue) {
            newCalc.dataset.logValue = valueInput.dataset.logValue;
        } else {
            delete newCalc.dataset.logValue;
        }
    }
}

function clearBonusRow(row, isNewSide) {
    if (!row) return;

    const bonusCalc = row.querySelector('.bonus-calc');
    const bonusValueInput = row.querySelector('.bonus-value');
    const displayElement = bonusCalc || bonusValueInput;

    if (displayElement) {
        displayElement.textContent = isNewSide ? '—' : '';
        delete displayElement.dataset.logValue;
        if (bonusValueInput) bonusValueInput.value = '';
    }
}

function calculateNewSideBonus(row, level, selectedBonusType) {
    const slotType = row.dataset.slotType;
    const usePrimaryExponent = (slotType === 'primary');

    const bonusTypeData = GEMSTONE_BONUS_INFO[selectedBonusType];
    if (!bonusTypeData) return null;

    const powExp = usePrimaryExponent ? bonusTypeData.PowerExpPrimary : bonusTypeData.PowerExpSecondary;

    return calculateGemstoneBonus(level, bonusTypeData.AttributeBase, bonusTypeData.PowerBase, bonusTypeData.PowerInc, powExp);
}

function storeCurrentSideValue(valueInput) {
    const userInput = valueInput ? valueInput.value : '';

    if (userInput && userInput !== '') {
        const logValue = convertToLogValue(userInput);
        if (logValue !== null && !isNaN(logValue)) {
            valueInput.dataset.logValue = logValue;
        } else {
            delete valueInput.dataset.logValue;
        }
    } else {
        delete valueInput.dataset.logValue;
    }
}

function handleLockedCurrentRow(bonusRow, gemstoneItem) {
    const bonusValueInput = bonusRow.querySelector('.bonus-value');
    if (bonusValueInput) {
        storeCurrentSideValue(bonusValueInput);
    }

    // Copy to New side
    const newSide = gemstoneItem.querySelector('.gemstone-new');
    const slotIndex = Array.from(bonusRow.parentElement.querySelectorAll('.gemstone-bonus-row')).indexOf(bonusRow);
    const newBonusRow = newSide?.querySelectorAll('.gemstone-bonus-row')[slotIndex];

    if (newBonusRow) {
        const selectElement = bonusRow.querySelector('.bonus-select');
        const valueInput = bonusRow.querySelector('.bonus-value');
        const newSelect = newBonusRow.querySelector('.bonus-select');
        const newCalc = newBonusRow.querySelector('.bonus-calc');

        // Copy bonus type (including blank selection)
        if (newSelect) {
            newSelect.value = selectElement?.value || '';

            // If bonus type is blank, also clear the value
            if (!selectElement?.value && newCalc) {
                newCalc.textContent = '—';
                delete newCalc.dataset.logValue;
            }
        }

        // Copy value if there is one and bonus type is not blank
        const currentValue = valueInput?.value || '';
        const currentBonusType = selectElement?.value || '';

        if (newCalc && currentBonusType && currentValue !== '') {
            newCalc.textContent = currentValue;

            if (valueInput?.dataset.logValue) {
                newCalc.dataset.logValue = valueInput.dataset.logValue;
            } else {
                const logValue = convertToLogValue(currentValue);
                if (logValue !== null && !isNaN(logValue)) {
                    newCalc.dataset.logValue = logValue;
                }
            }
        } else if (newCalc && !currentBonusType) {
            newCalc.textContent = '—';
            delete newCalc.dataset.logValue;
        }
    }

    updateGemstoneTotals(bonusRow);
}

function handleEmptySelection(bonusRow, isNewSide, isLocked, gemstoneItem) {
    clearBonusRow(bonusRow, isNewSide);

    // If Current side was locked, also clear New side
    if (!isNewSide && isLocked) {
        const newSide = gemstoneItem.querySelector('.gemstone-new');
        const slotIndex = Array.from(bonusRow.parentElement.querySelectorAll('.gemstone-bonus-row')).indexOf(bonusRow);
        const newBonusRow = newSide?.querySelectorAll('.gemstone-bonus-row')[slotIndex];
        clearBonusRow(newBonusRow, true);
    }

    updateGemstoneTotals(bonusRow);
}

// Main function - now much cleaner
function updateBonusCalculation(bonusRow) {
    const gemstoneItem = bonusRow.closest('.gemstone-item');
    if (!gemstoneItem) return;

    // Get lock status
    const { isNewSide, isLocked, correspondingRow } = getLockStatus(bonusRow, gemstoneItem);

    // Handle locked rows
    if (isLocked) {
        if (isNewSide) {
            // New side locked - don't update
            return;
        } else {
            handleLockedCurrentRow(bonusRow, gemstoneItem);
            return;
        }
    }

    // Get level and selected bonus type
    const levelInput = bonusRow.closest('.gemstone-current, .gemstone-new').querySelector('.level-input');
    const level = parseInt(levelInput.value) || 1;
    const selectElement = bonusRow.querySelector('.bonus-select');
    const selectedBonusType = selectElement.value;

    const bonusCalc = bonusRow.querySelector('.bonus-calc');
    const bonusValueInput = bonusRow.querySelector('.bonus-value');
    const displayElement = bonusCalc || bonusValueInput;

    // Handle empty selection
    if (!selectedBonusType) {
        handleEmptySelection(bonusRow, isNewSide, isLocked, gemstoneItem);
        return;
    }

    // Process based on side
    if (isNewSide) {
        const logBonusValue = calculateNewSideBonus(bonusRow, level, selectedBonusType);

        if (logBonusValue === null) {
            if (displayElement) {
                displayElement.textContent = 'Error';
                delete displayElement.dataset.logValue;
            }
        } else if (displayElement) {
            displayElement.dataset.logValue = logBonusValue;
            displayElement.textContent = formatLogValue(logBonusValue);
        }
    } else {
        storeCurrentSideValue(bonusValueInput);
    }

    // Update totals
    updateGemstoneTotals(bonusRow);
}

function formatLogValue(logValue) {
    if (logValue === -Infinity || logValue === 0) return '0';

    const exponent = Math.floor(logValue);
    const mantissa = Math.pow(10, logValue - exponent);

    if (exponent >= 15) {
        const mantissaFormatted = mantissa.toFixed(2);
        return `${mantissaFormatted}e${exponent}`;
    }

    // For smaller numbers, convert to actual value and use K/M/B/T suffixes
    const actualValue = mantissa * Math.pow(10, exponent);

    if (actualValue >= 1e12) {
        return (actualValue / 1e12).toFixed(2) + 'T';
    }
    if (actualValue >= 1e9) {
        return (actualValue / 1e9).toFixed(2) + 'B';
    }
    if (actualValue >= 1e6) {
        return (actualValue / 1e6).toFixed(2) + 'M';
    }
    if (actualValue >= 1e3) {
        return (actualValue / 1e3).toFixed(2) + 'K';
    }

    // For numbers less than 1
    if (actualValue < 1 && actualValue > 0) {
        return actualValue.toFixed(4);
    }

    return actualValue.toFixed(2);
}

function formatBonusValue(value) {
    if (value === 0) return '0';
    const logValue = Math.log10(value);
    return formatLogValue(logValue);
}

function attachGemstoneEventListeners() {
    const gemstoneItems = document.querySelectorAll('.gemstone-item');

    gemstoneItems.forEach(gemstoneItem => {
        // Handle New side
        const newSide = gemstoneItem.querySelector('.gemstone-new');
        if (newSide) {
            const bonusRows = newSide.querySelectorAll('.gemstone-bonus-row');
            const levelInput = newSide.querySelector('.level-input');

            bonusRows.forEach(bonusRow => {
                const selectElement = bonusRow.querySelector('.bonus-select');
                if (!selectElement) return;

                const triggerCalculation = () => {
                    updateBonusCalculation(bonusRow);
                };

                selectElement.addEventListener('change', triggerCalculation);
                if (levelInput) {
                    levelInput.addEventListener('input', triggerCalculation);
                }
            });
        }

        // Handle Current side
        const currentSide = gemstoneItem.querySelector('.gemstone-current');
        if (currentSide) {
            const valueInputs = currentSide.querySelectorAll('.bonus-value');

            valueInputs.forEach(valueInput => {
                const triggerConversion = () => {
                    const bonusRow = valueInput.closest('.gemstone-bonus-row');
                    if (bonusRow) {
                        updateBonusCalculation(bonusRow);
                    }
                };

                valueInput.addEventListener('change', triggerConversion);
                valueInput.addEventListener('input', triggerConversion);
            });

            // Also update totals when level changes on Current side
            const levelInput = currentSide.querySelector('.level-input');
            if (levelInput) {
                levelInput.addEventListener('input', () => {
                    updateGemstoneTotals(gemstoneItem);
                });
            }


            const bonusRows = currentSide.querySelectorAll('.gemstone-bonus-row');
            bonusRows.forEach(bonusRow => {
                const selectElement = bonusRow.querySelector('.bonus-select');
                if (selectElement) {
                    selectElement.addEventListener('change', () => {
                        const valueInput = bonusRow.querySelector('.bonus-value');
                        const selectedBonusType = selectElement.value;


                        if (!selectedBonusType && valueInput) {
                            valueInput.value = '';
                            delete valueInput.dataset.logValue;
                        }

                        updateBonusCalculation(bonusRow);
                    });
                }
            });
        }
    });
}

function initializeCollapsibleGemstones() {
    const gemstoneItems = document.querySelectorAll('.gemstone-item');

    gemstoneItems.forEach(gemstoneItem => {
        const header = gemstoneItem.querySelector('.gemstone-header');

        // Add collapse toggle indicator if it doesn't exist
        if (!header.querySelector('.collapse-toggle')) {
            const toggle = document.createElement('span');
            toggle.className = 'collapse-toggle';
            toggle.textContent = '▼';
            header.appendChild(toggle);
        }

        // Set initial state (expanded by default)
        gemstoneItem.classList.remove('collapsed');

        // Add click handler
        header.addEventListener('click', (e) => {
            gemstoneItem.classList.toggle('collapsed');

            // Update toggle icon
            const toggle = header.querySelector('.collapse-toggle');
            if (gemstoneItem.classList.contains('collapsed')) {
                toggle.textContent = '▶';
            } else {
                toggle.textContent = '▼';
            }
        });
    });
}

function initializeCollapsibleExtras() {
    const extras = document.querySelector('.extras-container');
    if (!extras) return;
    
    const header = extras.querySelector('.extras-header');
    if (!header) return;

    // Add collapse toggle indicator if it doesn't exist
    if (!header.querySelector('.collapse-toggle')) {
        const toggle = document.createElement('span');
        toggle.className = 'collapse-toggle';
        toggle.textContent = '▶';
        header.appendChild(toggle);
    }

    // Set initial state (expanded by default)
    extras.classList.add('collapsed');

    // Add click handler
    header.addEventListener('click', (e) => {
        extras.classList.toggle('collapsed');

        // Update toggle icon
        const toggle = header.querySelector('.collapse-toggle');
        if (extras.classList.contains('collapsed')) {
            toggle.textContent = '▶';
        } else {
            toggle.textContent = '▼';
        }
    });
}

function handleLockToggle(checkbox, bonusRow, gemstoneItem) {
    const isLocked = checkbox.checked;
    const side = bonusRow.closest('.gemstone-current');
    const slotType = bonusRow.dataset.slotType;
    const slotIndex = Array.from(side.querySelectorAll('.gemstone-bonus-row')).indexOf(bonusRow);

    // Get the corresponding New side bonus row
    const newSide = gemstoneItem.querySelector('.gemstone-new');
    const newBonusRows = newSide.querySelectorAll('.gemstone-bonus-row');
    const newBonusRow = newBonusRows[slotIndex];

    if (isLocked) {
        // Locked: Copy Current values to New side and disable New side inputs
        const selectElement = bonusRow.querySelector('.bonus-select');
        const valueInput = bonusRow.querySelector('.bonus-value');

        const bonusType = selectElement.value;
        const bonusValue = valueInput.value;
        const logValue = valueInput.dataset.logValue;

        // Copy to New side
        const newSelect = newBonusRow.querySelector('.bonus-select');
        const newCalc = newBonusRow.querySelector('.bonus-calc');

        if (newSelect && bonusType) {
            newSelect.value = bonusType;
        }
        if (newCalc && bonusValue) {
            newCalc.textContent = bonusValue;
            if (logValue) {
                newCalc.dataset.logValue = logValue;
            }
        }

        // Disable New side inputs
        if (newSelect) newSelect.disabled = true;

        // Add locked class for visual feedback
        bonusRow.classList.add('locked');
        newBonusRow.classList.add('locked');

        // Trigger recalculation of New side total
        updateGemstoneTotals(gemstoneItem);
    } else {
        // Unlocked: Re-enable New side inputs and clear locked values
        const newSelect = newBonusRow.querySelector('.bonus-select');
        const newCalc = newBonusRow.querySelector('.bonus-calc');

        // Re-enable New side inputs
        if (newSelect) {
            newSelect.disabled = false;
            // Clear the locked value
            newSelect.value = '';
        }
        if (newCalc) {
            newCalc.textContent = '—';
            delete newCalc.dataset.logValue;
        }

        // Remove locked class
        bonusRow.classList.remove('locked');
        newBonusRow.classList.remove('locked');

        // Trigger recalculation
        updateGemstoneTotals(gemstoneItem);
    }
}

function sciToLetter(sci) {
    let [base, exponent] = sci.split(/e/i).map(parseFloat);
    let power = 10 ** (exponent % 3);
    const fixedValue = Math.abs(2 - (exponent % 3)); // get the reverse of modulo for toFixed
    let suffix = "";
    // if magnitude is 15 or more, then convert to gamehive letter
    // else use KMBT abbreviations
    if ((Math.floor(exponent / 3) * 3) >= 15) {
        // 27 to 'start' after the 26 letters at 'aa'
        exponent = 27 + Math.floor((exponent - 15) / 3);
        while (exponent > 0) {
            suffix = String.fromCharCode(65 + ((exponent - 1) % 26)) + suffix;
            exponent = Math.floor((exponent - 1) / 26);
        }
        suffix = suffix.toLowerCase()
    } else {
        suffix = ["", "K", "M", "B", "T"][Math.floor(exponent / 3)];
    }
    base = (base * power).toFixed(fixedValue);
    return `${base}${suffix}`;
}

function letterToSci(coef) {
    let [base, magnitude] = parseFloat(coef).toExponential().split('e').map(parseFloat);
    let matchResult = coef.match(/[a-zA-Z]+/);
    let suffix = matchResult && matchResult[0].trim() || ""; // if no suffix, then leave blank
    let exponent;
    if (["", "K", "M", "B", "T"].includes(suffix)) {
        exponent = ["", "K", "M", "B", "T"].indexOf(suffix) * 3;
    } else {
        let power = 0;
        for (let i = 0; i < suffix.length; i++) {
            power = power * 26 + (suffix.charCodeAt(i) - 96);
        }
        exponent = (power - 27) * 3 + 15;
    }
    exponent = exponent + magnitude;
    return `${base}e${exponent}`;
}

function normalizeToScientific(valueStr) {
    if (!valueStr || valueStr === '—' || valueStr === 'Error') return null;

    valueStr = valueStr.trim();

    // If already scientific, return as is
    if (valueStr.includes('e')) return valueStr;

    // If K/M/B/T, convert to number then to scientific
    const kmbtMatch = valueStr.match(/^([\d.]+)([KMBT])$/i);
    if (kmbtMatch) {
        const suffixes = { 'K': 3, 'M': 6, 'B': 9, 'T': 12 };
        const number = parseFloat(kmbtMatch[1]);
        const suffix = kmbtMatch[2].toUpperCase();
        const actualValue = number * Math.pow(10, suffixes[suffix]);
        return actualValue.toExponential(2);
    }

    // If GameHive notation, use your letterToSci function
    if (valueStr.match(/[a-z]/i) && !valueStr.includes('e')) {
        return letterToSci(valueStr);
    }

    // Plain number
    const number = parseFloat(valueStr);
    if (!isNaN(number)) {
        return number.toExponential(2);
    }

    return null;
}

function convertToLogValue(valueStr) {
    const sciNotation = normalizeToScientific(valueStr);
    if (!sciNotation) return null;

    const match = sciNotation.match(/^([\d.]+)e([+-]?\d+)$/i);
    if (!match) return null;

    const mantissa = parseFloat(match[1]);
    const exponent = parseInt(match[2], 10);
    return Math.log10(mantissa) + exponent;
}

function getGemstoneBonuses(gemstoneName, side = 'both') {
    const gemstoneId = gemstoneName.toLowerCase().replace(/\s/g, '');
    const gemstoneItem = document.getElementById(gemstoneId);

    if (!gemstoneItem) return null;

    const result = {};

    // Helper to extract bonuses from a side
    function extractSideBonuses(sideElement) {
        if (!sideElement) return [];

        const bonusRows = sideElement.querySelectorAll('.gemstone-bonus-row');
        return Array.from(bonusRows).map(row => ({
            bonusType: row.querySelector('.bonus-select')?.value || '',
            value: row.querySelector('.bonus-value')?.value || row.querySelector('.bonus-calc')?.textContent || '—'
        }));
    }

    if (side === 'both' || side === 'current') {
        result.current = extractSideBonuses(gemstoneItem.querySelector('.gemstone-current'));
    }

    if (side === 'both' || side === 'new') {
        result.new = extractSideBonuses(gemstoneItem.querySelector('.gemstone-new'));
    }

    return result;
}

function getBonusTypeReduction(bonusType) {
    const damageReduction = GEMSTONE_REDUCTIONS[bonusType][selectedDamageType];
    const goldReduction = GEMSTONE_REDUCTIONS[bonusType][selectedGoldType] * GOLD_REDUCTION;
    return damageReduction + goldReduction;
}

function calculateSideTotal(sideElement) {
    if (!sideElement) return 0;

    let total = 0;
    const bonusRows = sideElement.querySelectorAll('.gemstone-bonus-row');

    bonusRows.forEach(row => {
        const select = row.querySelector('.bonus-select');
        const bonusType = select ? select.value : '';

        if (bonusType) {
            const displayElement = row.querySelector('.bonus-calc') || row.querySelector('.bonus-value');

            // Get the stored log value
            let logBonusValue = null;
            if (displayElement?.dataset?.logValue !== undefined) {
                logBonusValue = parseFloat(displayElement.dataset.logValue);
            }

            if (logBonusValue !== null && !isNaN(logBonusValue)) {
                const reduction = getBonusTypeReduction(bonusType);
                total += logBonusValue * reduction;
            }
        }
    });

    return total;
}

function updateGemstoneTotals(element) {
    // If a bonus row is passed, find the gemstone item
    const gemstoneItem = element.classList?.contains('gemstone-bonus-row')
        ? element.closest('.gemstone-item')
        : element;

    if (!gemstoneItem) return;

    const currentSide = gemstoneItem.querySelector('.gemstone-current');
    const newSide = gemstoneItem.querySelector('.gemstone-new');

    // Calculate and update Current total
    if (currentSide) {
        const currentTotal = calculateSideTotal(currentSide);
        const currentTotalSpan = currentSide.querySelector('.est-total-calc');
        if (currentTotalSpan) {
            currentTotalSpan.textContent = formatLogValue(currentTotal);
            currentTotalSpan.dataset.logValue = currentTotal;
        }
    }

    // Calculate and update New total
    if (newSide) {
        const newTotal = calculateSideTotal(newSide);
        const newTotalSpan = newSide.querySelector('.est-total-calc');
        if (newTotalSpan) {
            newTotalSpan.textContent = formatLogValue(newTotal);
            newTotalSpan.dataset.logValue = newTotal;
        }
    }

    // After totals are updated, compare and highlight the better side
    highlightBetterSide(gemstoneItem);
}

function updateAllGemstoneTotals() {
    const gemstoneItems = document.querySelectorAll('.gemstone-item');
    gemstoneItems.forEach(gemstoneItem => {
        updateGemstoneTotals(gemstoneItem);
    });
}

function getGemstoneTotals(gemstoneItem) {
    const currentSide = gemstoneItem.querySelector('.gemstone-current');
    const newSide = gemstoneItem.querySelector('.gemstone-new');

    const currentTotalSpan = currentSide.querySelector('.est-total-calc');
    const newTotalSpan = newSide.querySelector('.est-total-calc');

    const currentTotal = currentTotalSpan.dataset.logValue;
    const newTotal = newTotalSpan.dataset.logValue;

    return {
        current: currentTotal ? parseFloat(currentTotal) : null,
        new: newTotal ? parseFloat(newTotal) : null
    };
}

function compareGemstoneSides(gemstoneItem) {
    const totals = getGemstoneTotals(gemstoneItem);

    const currentTotal = totals.current ? parseFloat(totals.current) : -Infinity;
    const newTotal = totals.new ? parseFloat(totals.new) : -Infinity;

    // Determine which side is better
    let betterSide = '';
    let difference = null;

    if (currentTotal === newTotal) {
        betterSide = 'equal';
        difference = 0;
    } else if (currentTotal > newTotal) {
        betterSide = 'current';
        difference = currentTotal - newTotal;
    } else {
        betterSide = 'new';
        difference = newTotal - currentTotal;
    }

    return {
        gemstoneId: gemstoneItem.id,
        gemstoneName: gemstoneItem.querySelector('.gemstone-name')?.textContent || gemstoneItem.id,
        currentTotal: totals.current ? parseFloat(totals.current) : null,
        newTotal: totals.new ? parseFloat(totals.new) : null,
        betterSide: betterSide,
        difference: difference,
        differenceFormatted: formatLogValue(difference),
        isCurrentBetter: currentTotal > newTotal,
        isNewBetter: newTotal > currentTotal,
        isEqual: currentTotal === newTotal
    };
}

function highlightBetterSide(gemstoneItem) {
    const currentSide = gemstoneItem.querySelector('.gemstone-current');
    const newSide = gemstoneItem.querySelector('.gemstone-new');
    const currentTotalSpan = currentSide.querySelector('.est-total-calc');
    const newTotalSpan = newSide.querySelector('.est-total-calc');

    const totals = getGemstoneTotals(gemstoneItem);
    const currentTotal = parseFloat(totals.current) || -Infinity;
    const newTotal = parseFloat(totals.new) || -Infinity;

    // Remove existing classes
    currentSide.classList.remove('better', 'worse', 'equal');
    newSide.classList.remove('better', 'worse', 'equal');
    currentTotalSpan.classList.remove('better', 'worse', 'equal');
    newTotalSpan.classList.remove('better', 'worse', 'equal');

    // Determine better side
    if (currentTotal > newTotal) {
        currentSide.classList.add('better');
        newSide.classList.add('worse');
        currentTotalSpan.classList.add('better');
        newTotalSpan.classList.add('worse');
    } else if (newTotal > currentTotal) {
        newSide.classList.add('better');
        currentSide.classList.add('worse');
        newTotalSpan.classList.add('better');
        currentTotalSpan.classList.add('worse');
    }
}

function prettifyJSON() { // beautify JSON when importing
    var uglyJSON = document.getElementById('saveImport').value;
    try {
        var parsedJSON = JSON.parse(uglyJSON);
        var prettyJSON = JSON.stringify(parsedJSON, null, 2); // Use 2 spaces for indentation
        document.getElementById('saveImport').value = prettyJSON;
    } catch (error) {
        console.error('Invalid JSON format:', error);
        // Handle the error, e.g., display an error message to the user
    }
}

function importData(string) {
    try {
        const jsonObj = JSON.parse(string);
        const importedGemstones = jsonObj["gemstones"];
        if (!importedGemstones) {
            console.error("No gemstones data found in imported JSON");
            return false;
        }

        // Process each gemstone
        for (const [gemstoneId, gemstoneData] of Object.entries(importedGemstones)) {
            const gemstoneName = gemstoneIdToName[gemstoneId];
            if (!gemstoneName) continue;

            const gemstoneItemId = gemstoneName.toLowerCase().replace(/\s/g, '');
            const gemstoneItem = document.getElementById(gemstoneItemId);
            if (!gemstoneItem) continue;

            const currentSide = gemstoneItem.querySelector('.gemstone-current');
            if (!currentSide) continue;

            // Set level
            const levelInput = currentSide.querySelector('.level-input');
            if (levelInput && gemstoneData.lv) {
                levelInput.value = gemstoneData.lv;
            }

            // Get all bonus rows
            const bonusRows = currentSide.querySelectorAll('.gemstone-bonus-row');

            // Process primary (index 0)
            if (bonusRows[0] && gemstoneData.primary) {
                const [bonusType, value] = gemstoneData.primary.split(":");
                const select = bonusRows[0].querySelector('.bonus-select');
                const valueInput = bonusRows[0].querySelector('.bonus-value');

                if (select && bonusType) select.value = bonusType;
                if (valueInput && value) {
                    valueInput.value = value;
                    const logValue = convertToLogValue(value);
                    if (logValue !== null && !isNaN(logValue)) {
                        valueInput.dataset.logValue = logValue;
                    }
                }
            }

            // Process secondaries (indices 1-3)
            // secondary array always has exactly 3 items
            const secondaries = gemstoneData.secondary || [];
            for (let i = 0; i < 3; i++) {
                const rowIndex = i + 1;
                if (bonusRows[rowIndex] && i < secondaries.length) {
                    const secondaryData = secondaries[i];

                    // Handle case where secondary entry might be empty string
                    if (secondaryData && secondaryData.includes(':')) {
                        const [bonusType, value] = secondaryData.split(":");
                        const select = bonusRows[rowIndex].querySelector('.bonus-select');
                        const valueInput = bonusRows[rowIndex].querySelector('.bonus-value');

                        if (select && bonusType) select.value = bonusType;
                        if (valueInput && value) {
                            valueInput.value = value;
                            const logValue = convertToLogValue(value);
                            if (logValue !== null && !isNaN(logValue)) {
                                valueInput.dataset.logValue = logValue;
                            }
                        }
                    } else {
                        // Empty secondary slot - clear it
                        const select = bonusRows[rowIndex].querySelector('.bonus-select');
                        const valueInput = bonusRows[rowIndex].querySelector('.bonus-value');
                        if (select) select.value = '';
                        if (valueInput) {
                            valueInput.value = '';
                            delete valueInput.dataset.logValue;
                        }
                    }
                }
            }

            // Update totals
            updateGemstoneTotals(gemstoneItem);
        }

        saveToLocalStorage();
        return true;

    } catch (error) {
        console.error("Error importing data:", error);
        return false;
    }
}

function expand(button, elementId) { // expands hidden fields from button
    let content = document.getElementById(elementId);
    let msg = button.innerHTML;

    if (content.style.display == "none") {
        content.style.display = "";
        //button.innerHTML = msg.slice(0, -1) + '&#9652';
    } else {
        content.style.display = "none";
        //button.innerHTML = msg.slice(0, -1) + '&#9662';
    }
}

function attachImportEventListener() {
    document.querySelector('.import').addEventListener('click', function () {
        expand(this, 'import');
    });
    document.querySelector('#importButton').addEventListener('click', () => {
        importData(document.getElementById('saveImport').value);
    });
}

function initializeContentPanel() {
    const buttons = document.querySelectorAll('.content-button');

    // Set default visible panel (About)
    const defaultPanel = document.getElementById('about');
    if (defaultPanel) {
        defaultPanel.style.display = '';
        const defaultButton = document.querySelector('.content-button[data-content="about"]');
        if (defaultButton) defaultButton.classList.add('active');
    }
    
    // Arrow function to handle expanding/collapsing content
    const expandContent = (button, contentId) => {
        const targetPanel = document.getElementById(contentId);
        const allPanels = document.querySelectorAll('.content-panel');
        const allButtons = document.querySelectorAll('.content-button');
        
        // Check if the clicked panel is already open
        const isCurrentlyOpen = targetPanel.style.display !== 'none';
        
        // Close all panels
        allPanels.forEach(panel => {
            panel.style.display = 'none';
        });
        
        // Remove active class from all buttons
        allButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // If the clicked panel wasn't open, open it
        if (!isCurrentlyOpen) {
            targetPanel.style.display = '';
            button.classList.add('active');
        }
        // If it was open, it stays closed (no active class)
    };
    
    // Add click handlers to buttons
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const contentId = button.dataset.content;
            expandContent(button, contentId);
        });
    });
}

function attachLockEventListeners() {
    const gemstoneItems = document.querySelectorAll('.gemstone-item');

    gemstoneItems.forEach(gemstoneItem => {
        const currentSide = gemstoneItem.querySelector('.gemstone-current');
        if (!currentSide) return;

        const lockCheckboxes = currentSide.querySelectorAll('.lock-checkbox');

        lockCheckboxes.forEach(checkbox => {
            // Remove any existing listeners to avoid duplicates
            checkbox.removeEventListener('change', checkbox._lockHandler);

            // Create and store the handler
            const handler = (event) => {
                const bonusRow = checkbox.closest('.gemstone-bonus-row');
                handleLockToggle(checkbox, bonusRow, gemstoneItem);
            };

            checkbox._lockHandler = handler;
            checkbox.addEventListener('change', handler);
        });
    });
}

function generateGemstoneHTML() {
    const gemstoneContainer = document.querySelector('.gemstone-container');
    if (!gemstoneContainer) return;

    // Clear existing content (if any)
    gemstoneContainer.innerHTML = '';

    // Loop through each gemstone in GEMSTONE_INFO
    Object.keys(GEMSTONE_INFO).forEach(gemstoneKey => {
        const gemstoneData = GEMSTONE_INFO[gemstoneKey];
        const gemstoneName = gemstoneData.name;

        // Create the gemstone item container
        const gemstoneItem = document.createElement('div');
        gemstoneItem.className = 'gemstone-item';
        gemstoneItem.id = gemstoneKey; // "aetherstone", "sunstone", etc.

        // Build the HTML structure
        gemstoneItem.innerHTML = `
            <div class="gemstone-header">
                <img class="gemstone-icon" src=${path + gemstoneKey + ".png"}>
                <span class="gemstone-name">${gemstoneName}</span>
            </div>
            <div class="gemstone-inputs">
                <!-- Current Side -->
                <div class="gemstone-current">
                    <span class="gemstone-side-label">Current</span>
                    <div class="gemstone-level">
                        <label>Level</label>
                        <input type="number" class="level-input" min="1">
                    </div>
                    <div class="gemstone-bonus-row" data-slot-type="primary">
                        <input type="checkbox" class="lock-checkbox" data-locked="false">
                        <select class="bonus-select"></select>
                        <input type="text" class="bonus-value">
                    </div>
                    <div class="gemstone-bonus-row" data-slot-type="secondary">
                        <input type="checkbox" class="lock-checkbox" data-locked="false">
                        <select class="bonus-select"></select>
                        <input type="text" class="bonus-value">
                    </div>
                    <div class="gemstone-bonus-row" data-slot-type="secondary">
                        <input type="checkbox" class="lock-checkbox" data-locked="false">
                        <select class="bonus-select"></select>
                        <input type="text" class="bonus-value">
                    </div>
                    <div class="gemstone-bonus-row" data-slot-type="secondary">
                        <input type="checkbox" class="lock-checkbox" data-locked="false">
                        <select class="bonus-select"></select>
                        <input type="text" class="bonus-value">
                    </div>
                    <div class="gemstone-est-total">
                        <label>Est. Total</label>
                        <span class="est-total-calc">—</span>
                    </div>
                </div>
                
                <!-- New Side -->
                <div class="gemstone-new">
                    <span class="gemstone-side-label">New</span>
                    <div class="gemstone-level">
                        <label>Level</label>
                        <input type="number" class="level-input" min="1">
                    </div>
                    <div class="gemstone-bonus-row" data-slot-type="primary">
                        <select class="bonus-select"></select>
                        <span class="bonus-calc">—</span>
                    </div>
                    <div class="gemstone-bonus-row" data-slot-type="secondary">
                        <select class="bonus-select"></select>
                        <span class="bonus-calc">—</span>
                    </div>
                    <div class="gemstone-bonus-row" data-slot-type="secondary">
                        <select class="bonus-select"></select>
                        <span class="bonus-calc">—</span>
                    </div>
                    <div class="gemstone-bonus-row" data-slot-type="secondary">
                        <select class="bonus-select"></select>
                        <span class="bonus-calc">—</span>
                    </div>
                    <div class="gemstone-est-total">
                        <label>Est. Total</label>
                        <span class="est-total-calc">—</span>
                    </div>
                </div>

            </div>
            <div class="gemstone-button-container">
                <button class="gemstone-button" data-action="reset-current">Reset Current</button>
                <button class="gemstone-button" data-action="lock">Lock All</button>
                <button class="gemstone-button" data-action="unlock">Unlock All</button>
                <button class="gemstone-button" data-action="take-new">Take New</button>
                <button class="gemstone-button" data-action="reset-new">Reset New</button>
            </div>
        `;

        gemstoneContainer.appendChild(gemstoneItem);
        populateGemstoneBonusRows(gemstoneKey);

        // Add button event listeners for this gemstone
        gemstoneItemButtonEventListener(gemstoneItem);
    });
}

function gemstoneTakeNew(gemstoneItem) {
    const currentSide = gemstoneItem.querySelector('.gemstone-current');
    const newSide = gemstoneItem.querySelector('.gemstone-new');

    if (!currentSide || !newSide) return;

    const currentBonusRows = currentSide.querySelectorAll('.gemstone-bonus-row');
    const newBonusRows = newSide.querySelectorAll('.gemstone-bonus-row');

    currentBonusRows.forEach((currentRow, index) => {
        const newRow = newBonusRows[index];
        if (!newRow) return;

        // Get values from New side
        const newSelect = newRow.querySelector('.bonus-select');
        const newCalc = newRow.querySelector('.bonus-calc');

        // Get Current side elements
        const currentSelect = currentRow.querySelector('.bonus-select');
        const currentValueInput = currentRow.querySelector('.bonus-value');

        // Copy bonus type
        if (currentSelect && newSelect && newSelect.value) {
            currentSelect.value = newSelect.value;
        }

        // Copy value and log value
        if (currentValueInput && newCalc && newCalc.textContent !== '—') {
            currentValueInput.value = newCalc.textContent;
            if (newCalc.dataset.logValue) {
                currentValueInput.dataset.logValue = newCalc.dataset.logValue;
            } else {
                delete currentValueInput.dataset.logValue;
            }
        } else if (currentValueInput) {
            // Clear if New side is empty
            currentValueInput.value = '';
            delete currentValueInput.dataset.logValue;
        }

        // If the row is locked, also update the New side to match (lock sync)
        const lockCheckbox = currentRow.querySelector('.lock-checkbox');
        if (lockCheckbox?.checked) {
            // Update New side to match the new Current side values
            if (newSelect && currentSelect.value) {
                newSelect.value = currentSelect.value;
            }
            if (newCalc && currentValueInput.value) {
                newCalc.textContent = currentValueInput.value;
                if (currentValueInput.dataset.logValue) {
                    newCalc.dataset.logValue = currentValueInput.dataset.logValue;
                }
            }
        }
    });

    // Update totals after copying
    updateGemstoneTotals(gemstoneItem);

    // Clear new side
    //gemstoneReset(gemstoneItem, "new");

    // Trigger save
    triggerSave();
}

function gemstoneReset(gemstoneItem, side = "both") {
    const currentSide = gemstoneItem.querySelector('.gemstone-current');
    const newSide = gemstoneItem.querySelector('.gemstone-new');

    function clearSide(sideElement) {
        if (!sideElement) return;

        // Clear level input
        const levelInput = sideElement.querySelector('.level-input');
        if (levelInput) levelInput.value = '';

        // Clear each bonus row
        const bonusRows = sideElement.querySelectorAll('.gemstone-bonus-row');
        bonusRows.forEach(row => {
            // Clear bonus type select
            const select = row.querySelector('.bonus-select');
            if (select) select.value = '';

            // Clear value/calc and stored log value
            const valueInput = row.querySelector('.bonus-value');
            const calcSpan = row.querySelector('.bonus-calc');

            if (valueInput) {
                valueInput.value = '';
                delete valueInput.dataset.logValue;
            }
            if (calcSpan) {
                calcSpan.textContent = '—';
                delete calcSpan.dataset.logValue;
            }
        });
    }

    if (side === "current" || side === "both") {
        clearSide(currentSide);
    }

    if (side === "new" || side === "both") {
        clearSide(newSide);
    }

    // Update totals after reset
    updateGemstoneTotals(gemstoneItem);

    // Trigger save
    triggerSave();
}

function gemstoneLockAll(gemstoneItem, side = "current") {
    const targetSide = gemstoneItem.querySelector('.gemstone-current');
    if (!targetSide) return;

    const lockCheckboxes = targetSide.querySelectorAll('.lock-checkbox');

    lockCheckboxes.forEach(checkbox => {
        if (!checkbox.checked) {
            checkbox.checked = true;

            // Trigger the lock handler to sync the New side
            const bonusRow = checkbox.closest('.gemstone-bonus-row');
            if (bonusRow) {
                handleLockToggle(checkbox, bonusRow, gemstoneItem);
            }
        }
    });

    // Trigger save
    triggerSave();
}

function gemstoneUnlockAll(gemstoneItem, side = "current") {
    const targetSide = gemstoneItem.querySelector('.gemstone-current');
    if (!targetSide) return;

    const lockCheckboxes = targetSide.querySelectorAll('.lock-checkbox');

    lockCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            checkbox.checked = false;

            // Trigger the lock handler to sync the New side
            const bonusRow = checkbox.closest('.gemstone-bonus-row');
            if (bonusRow) {
                handleLockToggle(checkbox, bonusRow, gemstoneItem);
            }
        }
    });

    // Trigger save
    triggerSave();
}

function gemstoneItemButtonEventListener(gemstoneItem) {
    const buttonContainer = gemstoneItem.querySelector(".gemstone-button-container");
    if (!buttonContainer) return;

    const actionMap = {
        'reset-current': (gemstoneItem) => gemstoneReset(gemstoneItem, 'current'),
        'lock': gemstoneLockAll,
        'unlock': gemstoneUnlockAll,
        'take-new': gemstoneTakeNew,
        'reset-new': (gemstoneItem) => gemstoneReset(gemstoneItem, 'new')
    };

    const buttons = buttonContainer.querySelectorAll('button');

    buttons.forEach(button => {
        const action = button.dataset.action;
        if (action && actionMap[action]) {
            button.addEventListener('click', () => {
                actionMap[action](gemstoneItem);
            });
        }
    });
}

function extrasButtonEventListener() {
    const extrasContainer = document.querySelector('.extras-container');
    if (!extrasContainer) return;
    
    const buttonContainer = extrasContainer.querySelector('.extras-button-container');
    if (!buttonContainer) return;

    const actionMap = {
        'reset-all': () => resetAllGemstones(),
        'lock-all': () => lockAllGemstones(),
        'unlock-all': () => unlockAllGemstones(),
        'collapse-all': () => collapseAll(),
        'expand-all': () => expandAll()
    };

    const buttons = buttonContainer.querySelectorAll('button');

    buttons.forEach(button => {
        const action = button.dataset.action;
        if (action && actionMap[action]) {
            button.addEventListener('click', actionMap[action]);
        }
    });
}

// Global functions for extras
function resetAllGemstones() {
    const gemstoneItems = document.querySelectorAll('.gemstone-item');
    gemstoneItems.forEach(gemstoneItem => {
        gemstoneReset(gemstoneItem, 'both');
    });
    triggerSave();
}

function lockAllGemstones() {
    const gemstoneItems = document.querySelectorAll('.gemstone-item');
    gemstoneItems.forEach(gemstoneItem => {
        gemstoneLockAll(gemstoneItem);
    });
    triggerSave();
}

function unlockAllGemstones() {
    const gemstoneItems = document.querySelectorAll('.gemstone-item');
    gemstoneItems.forEach(gemstoneItem => {
        gemstoneUnlockAll(gemstoneItem);
    });
    triggerSave();
}

function collapseAll() {
    const gemstoneItems = document.querySelectorAll('.gemstone-item');
    
    gemstoneItems.forEach(gemstoneItem => {
        if (!gemstoneItem.classList.contains('collapsed')) {
            gemstoneItem.classList.add('collapsed');
            
            // Update toggle icon
            const header = gemstoneItem.querySelector('.gemstone-header');
            const toggle = header?.querySelector('.collapse-toggle');
            if (toggle) {
                toggle.textContent = '▶';
            }
        }
    });
}

function expandAll() {
    const gemstoneItems = document.querySelectorAll('.gemstone-item');
    
    gemstoneItems.forEach(gemstoneItem => {
        if (gemstoneItem.classList.contains('collapsed')) {
            gemstoneItem.classList.remove('collapsed');
            
            // Update toggle icon
            const header = gemstoneItem.querySelector('.gemstone-header');
            const toggle = header?.querySelector('.collapse-toggle');
            if (toggle) {
                toggle.textContent = '▼';
            }
        }
    });
}

// ===== DATA EXTRACTION FUNCTIONS =====

function extractDamageType() {
    return selectedDamageType;
}

function extractGoldType() {
    return selectedGoldType;
}

function extractSideLevel(sideElement) {
    const levelInput = sideElement?.querySelector('.level-input');
    return levelInput ? levelInput.value : null;
}

function extractBonusRow(row, includeValueAndLock = true) {
    const select = row.querySelector('.bonus-select');
    const bonusData = { bonusType: select ? select.value : '' };

    if (includeValueAndLock) {
        const valueInput = row.querySelector('.bonus-value');
        const lockCheckbox = row.querySelector('.lock-checkbox');

        const logValue = valueInput?.dataset?.logValue;
        bonusData.logValue = logValue ? parseFloat(logValue) : null;
        bonusData.locked = lockCheckbox ? lockCheckbox.checked : false;
    } else {
        const calcSpan = row.querySelector('.bonus-calc');
        const logValue = calcSpan?.dataset?.logValue;
        bonusData.logValue = logValue ? parseFloat(logValue) : null;
    }

    return bonusData;
}

function extractSide(sideElement, includeValueAndLock = true) {
    if (!sideElement) return null;

    const bonusRows = sideElement.querySelectorAll('.gemstone-bonus-row');
    return {
        level: extractSideLevel(sideElement),
        bonuses: Array.from(bonusRows).map(row => extractBonusRow(row, includeValueAndLock))
    };
}

function extractGemstone(gemstoneItem) {
    const currentSide = gemstoneItem.querySelector('.gemstone-current');
    const newSide = gemstoneItem.querySelector('.gemstone-new');

    return {
        current: extractSide(currentSide, true),  // Current has value and lock
        new: extractSide(newSide, false)          // New has only bonus type
    };
}

// ===== DATA APPLICATION FUNCTIONS =====

function applyDamageType(damageType) {
    if (!damageType) return;
    selectedDamageType = damageType;

    const damageButton = document.querySelector(`.setup-buttons button[data-value="${damageType}"], .setup-buttons button.${damageType}`);
    if (damageButton) {
        const groupButtons = damageButton.parentElement.querySelectorAll('button');
        clearGroupSelection(groupButtons);
        damageButton.classList.add('selected');
    }
}

function applyGoldType(goldType) {
    if (!goldType) return;
    selectedGoldType = goldType;

    const goldButton = document.querySelector(`.setup-buttons button[data-value="${goldType}"], .setup-buttons button.${goldType}`);
    if (goldButton) {
        const groupButtons = goldButton.parentElement.querySelectorAll('button');
        clearGroupSelection(groupButtons);
        goldButton.classList.add('selected');
    }
}

function applySideLevel(sideElement, level) {
    const levelInput = sideElement?.querySelector('.level-input');
    if (levelInput && level) levelInput.value = level;
}

function applyBonusRow(row, bonusData, isNewSide = false, gemstoneItem = null) {
    if (!row || !bonusData) return;

    const select = row.querySelector('.bonus-select');
    if (select && bonusData.bonusType) select.value = bonusData.bonusType;

    // Current side specific
    if (!isNewSide) {
        const valueInput = row.querySelector('.bonus-value');
        const lockCheckbox = row.querySelector('.lock-checkbox');

        if (valueInput && bonusData.logValue !== undefined && bonusData.logValue !== null) {
            // Restore from stored log value
            const logValue = bonusData.logValue;
            valueInput.dataset.logValue = logValue;
            valueInput.value = formatLogValue(logValue);
        } else if (valueInput && bonusData.value) {
            // Fallback for old save data
            valueInput.value = bonusData.value;
            const logValue = convertToLogValue(bonusData.value);
            if (logValue !== null && !isNaN(logValue)) {
                valueInput.dataset.logValue = logValue;
            }
        }
        if (lockCheckbox) lockCheckbox.checked = bonusData.locked || false;
    } else {
        // New side
        const calcSpan = row.querySelector('.bonus-calc');
        if (calcSpan && bonusData.logValue !== undefined && bonusData.logValue !== null) {
            // Restore from stored log value
            const logValue = bonusData.logValue;
            calcSpan.dataset.logValue = logValue;
            calcSpan.textContent = formatLogValue(logValue);
        } else if (calcSpan && bonusData.value) {
            // Fallback for old save data
            calcSpan.textContent = bonusData.value;
            const logValue = convertToLogValue(bonusData.value);
            if (logValue !== null && !isNaN(logValue)) {
                calcSpan.dataset.logValue = logValue;
            }
        }
    }

    // Trigger calculation for New side if needed
    if (isNewSide && gemstoneItem && bonusData.bonusType) {
        // No need to recalculate since we restored from stored value
        // Just ensure totals are updated
        updateGemstoneTotals(gemstoneItem);
    }
}

function applySide(sideElement, sideData, isNewSide = false, gemstoneItem = null) {
    if (!sideElement || !sideData) return;

    applySideLevel(sideElement, sideData.level);

    const bonusRows = sideElement.querySelectorAll('.gemstone-bonus-row');
    bonusRows.forEach((row, index) => {
        if (sideData.bonuses?.[index]) {
            applyBonusRow(row, sideData.bonuses[index], isNewSide, gemstoneItem);
        }
    });
}

function applyGemstone(gemstoneItem, gemstoneData) {
    if (!gemstoneData) return;

    const currentSide = gemstoneItem.querySelector('.gemstone-current');
    const newSide = gemstoneItem.querySelector('.gemstone-new');

    if (gemstoneData.current) applySide(currentSide, gemstoneData.current, false, null);
    if (gemstoneData.new) applySide(newSide, gemstoneData.new, true, gemstoneItem);

    // Sync locked rows
    syncLockedRows(gemstoneItem);

    // Update totals after applying all data
    updateGemstoneTotals(gemstoneItem);
}

// ===== SAVE/LOAD CORE =====

function triggerSave() {
    // Clear existing timeout
    if (saveTimeout) clearTimeout(saveTimeout);

    // Save after 100ms of inactivity
    saveTimeout = setTimeout(() => {
        saveToLocalStorage();
    }, 100);
}

function saveToLocalStorage() {
    const gemstoneItems = document.querySelectorAll('.gemstone-item');
    const saveData = {
        damageType: extractDamageType(),
        goldType: extractGoldType(),
        gemstones: {}
    };

    gemstoneItems.forEach(gemstoneItem => {
        saveData.gemstones[gemstoneItem.id] = extractGemstone(gemstoneItem);
    });

    localStorage.setItem('gemstoneConfig', JSON.stringify(saveData));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('gemstoneConfig');
    if (!savedData) return false;

    const saveData = JSON.parse(savedData);

    applyDamageType(saveData.damageType);
    applyGoldType(saveData.goldType);

    const gemstoneItems = document.querySelectorAll('.gemstone-item');
    gemstoneItems.forEach(gemstoneItem => {
        if (saveData.gemstones[gemstoneItem.id]) {
            applyGemstone(gemstoneItem, saveData.gemstones[gemstoneItem.id]);
        }
    });

    return true;
}

// ===== AUTO-SAVE =====

function attachAutoSave() {
    const gemstoneItems = document.querySelectorAll('.gemstone-item');

    gemstoneItems.forEach(gemstoneItem => {
        gemstoneItem.querySelectorAll('.level-input, .bonus-select, .bonus-value, .lock-checkbox').forEach(element => {
            // Use 'change' for selects and checkboxes, 'input' for text inputs
            const eventType = element.classList.contains('bonus-select') || element.classList.contains('lock-checkbox')
                ? 'change'
                : 'input';
            element.addEventListener(eventType, () => triggerSave());
        });
    });
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function () {
    // 1. Generate HTML structure
    generateGemstoneHTML();

    // 2. Setup damage/gold type buttons (so they're ready for loading)
    setupDamageGoldTypeButtons();

    // 3. Load saved data from localStorage (populates values)
    loadFromLocalStorage();

    // 4. Attach event listeners (so they don't trigger on initial load)
    attachGemstoneEventListeners();
    attachImportEventListener();
    attachLockEventListeners();
    initializeContentPanel();
    initializeCollapsibleExtras();
    extrasButtonEventListener();
    initializeCollapsibleGemstones();
    attachAutoSave();
});