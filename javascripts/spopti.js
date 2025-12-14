var $ = function (id) {
    return document.getElementById(id);
};

let player;
let user = JSON.parse(localStorage.getItem("playerInfo"));
let playerstats;
let playerskills;
let playersaves;
if (user) {
  playerstats = user["stats"];
  playerskills = user["skills"];
  playersaves = user["saves"];
}
const getCumulativeSP = ((skillInfo) => {
  const result = {};
  for (const [key, skill] of Object.entries(skillInfo)) {
    let total = 0;
    result[key] = [0]; // Level 0 costs 0 SP
    for (let level = 1; level <= skill.MaxLevel; level++) {
      const cost = parseFloat(skill[`Co${level - 1}`] || 0);
      total += cost;
      result[key].push(total);
    }
  }
  return result;
})(skillInfo);

// Calculate the maximum skill level from skillInfo
const MAX_SKILL_LEVEL = Math.max(...Object.values(skillInfo).map(skill => skill.MaxLevel));

// Calculate array size as (MaxLevel * 2) + 1
const EFFECTS_ARRAY_SIZE = (MAX_SKILL_LEVEL * 2) + 1;

// Define the mid-point for the efficiency array
const MID_POINT = MAX_SKILL_LEVEL;

function playerStats() {
    const inputs = ["typeDamage", "typeGold", "goldWeight", "FB", "FF", "tFA", "Shae", "Ignus", "Ironheart", "Kor", "Styxsis", "Rygal", "CP", "sClone", "TimeToKill", "SkillPoints", "buildVersion", "MaxStage"];
    inputs.reduce((_, input) => {
      playerstats[input] = $(input).type === "checkbox" ? $(input).checked : $(input).value;
    }, {});
    PageHelper.saveSkillInfo();
}

class Player {
  constructor() {
    this.initStats();
    return this;
  }
  

  initStats() {
    if (user) {

      // initialize user data from playerstats
      this.typeDamage = playerstats["typeDamage"];
      this.typeGold = playerstats["typeGold"];
      this.goldWeight = playerstats["goldWeight"];
      this.FB = Number(playerstats["FB"] ? 1 : 0);
      this.FF = Number(playerstats["FF"] ? 1 : 0);
      this.tFA = playerstats["tFA"];
      this.Shae = Number(playerstats["Shae"] ? 1.01 : 1);
      this.Ignus = Number(playerstats["Ignus"] ? 1.01 : 1);
      this.Ironheart = Number(playerstats["Ironheart"] ? 1.01 : 1);
      this.Kor = Number(playerstats["Kor"] ? 1.01 : 1);
      this.Styxsis = Number(playerstats["Styxsis"] ? 1.01 : 1);
      this.Rygal = Number(playerstats["Rygal"] ? 1.01 : 1);
      this.CP = playerstats["CP"];
      this.sClone = playerstats["sClone"];
      this.TimeToKill = playerstats["TimeToKill"];
      this.SkillPoints = playerstats["SkillPoints"];
      this.MaxStage = Number(playerstats["MaxStage"]);
    }
  }

  setStats() {
    PageHelper.save();
    this.initStats();
  }

  getCurrLevels() {
    this.setStats();
    return PageHelper.processSkills(input => [input.value], [0]);
  }

  effArray() {
    this.setStats();
    
    // Define mythic mapping once outside the loop
    const branchToMythicMap = {
      "BranchRed": this.Shae,
      "BranchOrange": this.Ignus,
      "BranchYellow": this.Ironheart,
      "BranchBlue": this.Kor,
      "BranchGreen": this.Styxsis,
      "BranchPurple": this.Rygal
    };
    
    const skillArray = [];

    for (const talentID in skillInfo) {
        const skill = skillInfo[talentID]['Name'];
        if (!(skill in playerskills)) {
            continue;
        }
        const skillData = skillInfo[talentID];
        const mythic = branchToMythicMap[skillData.Branch] || 1;
        
        let currEffs = Array(EFFECTS_ARRAY_SIZE).fill(1 * mythic);
        
        const currLevel = +playerskills[skill]['Level'];
        const maxLevel = +skillData.MaxLevel;
        const stageReq = +skillData.S0;
        
        const talentCumSP = getCumulativeSP[talentID]; // Get precomputed array for this skill
        for (let i = 0; i <= maxLevel; i++) {
          if (i >= currLevel) {
            const j = i - currLevel;
            currEffs[MID_POINT + j] = talentCumSP[i];
          }
        }

        if (playerskills[skill]['Selection'] === false || (this.MaxStage && this.MaxStage < stageReq)) {
          skillArray.push(currEffs);
          continue;
        }
        
        for (let j = currLevel; j < maxLevel; j++) {
            const k = j - currLevel;
            
            const currA = +skillData["A" + currLevel];
            const nextA = +skillData["A" + (j + 1)];
            const currB = +skillData["B" + currLevel];
            const nextB = +skillData["B" + (j + 1)];
            const currC = +skillData["C" + currLevel];
            const nextC = +skillData["C" + (j + 1)];
            const cost = currEffs[MID_POINT + 1 + k] - currEffs[MID_POINT];
            const reduction = reductions[talentID][this.typeDamage] + (reductions[talentID][this.typeGold] * this.goldWeight);

            const efficiency = this._calcEff(
                talentID, currA, nextA, currB, nextB, currC, nextC,
                cost, reduction, this.FB, this.FF, this.goldWeight, "efficiency"
            );

            currEffs[k] = efficiency * mythic;
        }
        
        skillArray.push(currEffs);
    }

    return skillArray;
  }

  totalEffects() {
    this.setStats();

    const branchToMythicMap = {
      "BranchRed": this.Shae,
      "BranchOrange": this.Ignus,
      "BranchYellow": this.Ironheart,
      "BranchBlue": this.Kor,
      "BranchGreen": this.Styxsis,
      "BranchPurple": this.Rygal
    };
  
    const effectArr = [];

    for (const talentID in skillInfo) {
      const skill = skillInfo[talentID]['Name'];
      if (!(skill in playerskills)) {
          continue;
      }
      const skillData = skillInfo[talentID];
      const mythic = branchToMythicMap[skillData.Branch] || 1;

      const currLevel = +playerskills[skill]['Level'];
      const maxLevel = +skillData.MaxLevel;

          // Get the cost directly from talentCumSP
    const cost = getCumulativeSP[talentID][currLevel];
    
    // Extract values directly without repeated lookups
    const currA = +skillData["A" + currLevel];
    const nextA = 1;
    const currB = +skillData["B" + currLevel];
    const nextB = 1;
    const currC = +skillData["C" + currLevel];
    const nextC = 1;
    
    const reduction = reductions[talentID][this.typeDamage] + (reductions[talentID][this.typeGold] * this.goldWeight);
    
    const efficiency = this._calcEff(
      talentID, currA, nextA, currB, nextB, currC, nextC, 
      1, reduction, this.FB, this.FF, this.goldWeight, "curr"
    );
    
    // Calculate final value directly
    const currEffs = efficiency * (mythic ** cost);
    
    effectArr.push(currEffs);
    }
    return effectArr;
  }

  _calcEff(id, currA, nextA, currB, nextB, currC, nextC, cost, reduction, FB, FF, goldWeight, returnValue) {
    let multicast = FB + FF;
    let efficiency;
    let reduction_2;
    let gold_2;
    let curr;
    let next;
    let active_spells;
    let curr_spell_damage;
    let next_spell_damage;

    let reductionFactor = reduction / cost;

    switch (id) {
        // if multicasts
        case "BurstDamageMultiCastSkill":
        case "TapBoostMultiCastSkill":
        case "DualPetMultiCast":
        case "HelperBoostMultiCastSkill":
        case "ClanShipVoltageMultiCastSkill":
        case "ShadowCloneMultiCastSkill":
        case "GuidedBlade":
        case "StreamOfBladesMultiCastSkill":
          next = ((10 * nextA) ** (nextB + multicast)) ** (reductionFactor);
          curr = ((10 * (currA ?? 1)) ** (!currB ? 0 : (currB + multicast))) ** (reductionFactor);
          efficiency = next / curr;
          break;
        
        // twilight multicast includes gloom damage
        case "TwilightGatheringMultiCastSkill":
          next = (((10 * nextA) ** (nextB + multicast)) ** (reductionFactor)) * (nextC ** (reductionFactor));
          curr = (((10 * (currA ?? 1)) ** (!currB ? 0 : (currB + multicast))) ** (reductionFactor)) * ((currC || 1) ** (reductionFactor));
          efficiency = next / curr;
          break;

        case "TwilightBell": // Twilight Bell
          active_spells = ["BurstDamage", "TwilightFairy"];
          curr_spell_damage = this._spellDamage(active_spells, currB);
          next_spell_damage = this._spellDamage(active_spells, nextB);

          next = (nextA ** (reductionFactor)) * (next_spell_damage ** reductionFactor);
          curr = (returnValue === "curr" && currB === 0) 
            ? 1 
            : ((currA || 1) ** reductionFactor) * (curr_spell_damage ** reductionFactor);
          efficiency = next / curr;
          break;

        case "PetBonusBoost": // Ember Arts
          reduction_2 = Number(reductions["TapDmg"][this.typeDamage]);
          next = (nextA ** (reductionFactor)) * (nextB ** (reduction_2 / cost));
          curr = ((currA || 1) ** (reductionFactor)) * ((currB || 1) ** (reduction_2 / cost));
          efficiency = next / curr;
          break;

        case "BossDmgQTE": // Flash Zip
          next = (nextA ** (reductionFactor)) * ((nextB || 1) ** (reductionFactor));
          curr = ((currA || 1) ** (reductionFactor)) * ((currB || 1) ** (reductionFactor));
          efficiency = next / curr;
          break;

        case "SummonerAutoTap": // Echoflurry Onslaught
          active_spells = ["DualPet", "TapBoost"];
          curr_spell_damage = this._spellDamage(active_spells, currB);
          next_spell_damage = this._spellDamage(active_spells, nextB);

          next = (nextA ** (reductionFactor)) * (next_spell_damage ** reductionFactor);
          curr = (returnValue === "curr" && currB === 0) 
            ? 1 
            : ((currA || 1) ** reductionFactor) * (curr_spell_damage ** reductionFactor);
          efficiency = next / curr;
          break;

        case "HelperBoost": // Tactical Insight
          next = ((1 + nextA) ** (reductionFactor));
          curr = ((1 + currA) ** (reductionFactor));
          efficiency = next / curr;
          break;
        
        case "HelperInspiredWeaken": // Searing Light
          next = ((nextA * nextB) ** (reductionFactor));
          curr = (((currA || 1) * (currB || 1)) ** (reductionFactor));
          efficiency = next / curr;
          //efficiency = ((nextA * nextB) / (currA || 1) * (currB || 1)) ** (reductionFactor);
          break;

        case "HelperDmgQTE": // Astral Awakening
          next = (nextA ** (5 * reductionFactor));
          curr = ((currA || 1) ** (5 * reductionFactor));
          efficiency = next / curr;
          break;

        // Voltaic Sails, Weakpoint Throw
        case "ClanShipVoltage":
        case "CriticalHit":
          next = ((nextA * nextB) ** (reductionFactor));
          curr = (((currA || 1) * (currB || 1)) ** (reductionFactor));
          efficiency = next / curr;
          break;

        // Loaded Dice, Quick Fortune
          case "LoadedDice":
          case "QuickFortune":
          reduction_2 = goldWeight;
          next = (nextA ** (reductionFactor)) * (nextB ** (reduction_2 / cost));
          curr = ((currA || 1) ** (reductionFactor)) * ((currB || 1) ** (reduction_2 / cost));
          efficiency = next / curr;
          break;

        case "CloneDmg": // Phantom Vengeance
          next = ((nextA * (4 + nextB)) ** (reductionFactor));
          curr = (((currA || 1) * (4 + currB)) ** (reductionFactor));
          if (returnValue == "curr") {
            curr = (((currA || 1) * (4 + currB) / 4) ** (reductionFactor));
          }
          efficiency = next / curr;
          break;

        case "CritSkillBoost": // Lightning Strike
          let LS = this._lightningStrike(currA, nextA, currB, nextB);
          next = (LS[0] ** (reductionFactor));
          curr = (LS[1] ** (reductionFactor));
          efficiency = next / curr;
          break;

        case "TerrifyingPact": // Terrifying Pact
          const focoActive = playerskills["Forbidden Contract"]["Selection"] === true || playerskills["Forbidden Contract"]["Level"] >= 1;
          const rocoActive = playerskills["Royal Contract"]["Selection"] === true || playerskills["Royal Contract"]["Level"] >= 1;

          const focoReduction = focoActive ? reductionFactor : 0;
          const rocoReduction = rocoActive ? 1 : 0;

          next = (nextA ** focoReduction) * (nextB ** (rocoReduction / cost));
          curr = ((currA || 1) ** focoReduction) * ((currB || 1) ** (rocoReduction / cost));
          efficiency = next / curr;
          break;

        case "PoisonedBlade": // Poison Edge
          next = ((1 + (nextA * 10)) ** (reductionFactor));
          curr = ((1 + (currA * 10)) ** (reductionFactor));
          efficiency = next / curr;
          break;

        case "HandOfMidasMultiCastSkillBoost": // Midas Overflow
          gold_2 = this.typeGold !== "Chesterson" ? 1 : 0;
          let mc_bonus_A = [1, 100, 10000, 1000000, 100000000, 1000000000]
          let mc_bonus_B = [1, 10, 100, 1000, 10000, 50000]
          next = (((mc_bonus_A[nextB + multicast]) * (nextA) ** (nextB + multicast)) ** (reductionFactor)) * ((mc_bonus_B[(nextB + multicast)]) ** (gold_2 * goldWeight / cost));
          curr = (((mc_bonus_A[(!currB ? 0 : (currB + multicast))]) * ((currA ?? 1) ** (!currB ? 0 : (currB + multicast)))) ** (reductionFactor)) * ((mc_bonus_B[(!currB ? 0 : (currB + multicast))]) ** (gold_2 * goldWeight / cost));
          efficiency = next / curr;
          //efficiency = (((100 * nextA) ** (nextB + FB)) / ((100 * (currA ?? 1)) ** (!currB ? 0 : (currB + FB)))) ** (reductionFactor) * (((10) ** (nextB + FB)) / ((10) ** (!currB ? 0 : (currB + FB)))) ** (gold_2 * goldWeight / cost);
          break;

        case "KratosSummon": // Sprouting Salts
          next = ((nextA ** nextB) ** (reductionFactor));
          curr = ((currA ** currB || 1)) ** (reductionFactor);
          efficiency = next / curr;
          break;

        default:
          next = (nextA ** (reductionFactor));
          curr = ((currA || 1) ** (reductionFactor));
          efficiency = next / curr;
          //efficiency = (nextA / (currA || 1)) ** (reductionFactor);
    }

    switch (returnValue) {
      case "efficiency":
        return efficiency;

      case "curr":
        return curr;
      
      default:
        return efficiency;
    }
  }

  _lightningStrike(currA, nextA, currB, nextB) {
    let specialAttempt;
    let CC = player["CC"] ? 1.5 * 1.005 ** ((this.CP - 1) ** 0.8) : 1;

    specialAttempt = clone[this.sClone] * CC;
    
    let LS_Attempts = Math.floor(0.022 * specialAttempt * this.TimeToKill);
    let LS_Next = 1.0;
    let LS_Curr = 1.0;

    let powerCurr = 1;
    let powerNext = 1;

    for (let i = 0; i < LS_Attempts; i++) {
        LS_Curr *= 1 - currA * powerCurr;
        LS_Next *= 1 - nextA * powerNext;
        powerCurr *= currB;
        powerNext *= nextB;

        /*
        let next = 1 - (nextA * (nextB ** i));
        let curr = 1 - (currA * (currB ** i));
        */
    }
    
    LS_Next = 1 / LS_Next;
    LS_Curr = 1 / LS_Curr;

    return [LS_Next, LS_Curr];
  }

  _spellDamage(spells, extraLevels) {
    let damage = 1;
    let currLevel = player.tFA ? 34 : 29; // index 0, max spell level of 30 or 35 (29 or 34)

    for (const k of spells) {
      const level = currLevel + extraLevels;
      const base = spellInfo[k]["A" + level];
      const reduction = spell_reductions[k][this.typeDamage];

      damage *= base ** reduction;
    }

    return damage;
  }

  nextLevels() {
    let skillNames = Object.keys(skillInfo);
    let currLevels = this.currLevels;
    let skillArr = this.skillArray;
    let maxEffs = [[],[],[],[],[]];
    let length = skillArr.length;
    
    for (let i = 0; i < length; i++) {
      let arr = skillArr[i].slice(0, MID_POINT);
      let costs = skillArr[i].slice(MID_POINT, EFFECTS_ARRAY_SIZE);
      let max = Math.max(...arr);
      let steps = Number(arr.indexOf(max)) + 1;
      let skillName = skillNames[i];
      let currLevel = Number(currLevels[i][0]);
      let cost = costs[steps] - costs[0];

      if (currLevel >= skillInfo[skillName]["MaxLevel"]) {
        //steps = 0;
        continue
      }

      if (cost == 1.01 || cost <= 0) {
        cost = 0;
      }

      maxEffs[0].push(skillInfo[skillName]["Name"]);
      maxEffs[1].push(currLevel);
      maxEffs[2].push(currLevel + steps);
      maxEffs[3].push(max.toFixed(4));
      maxEffs[4].push(cost);
    }

    // Create an array of objects
    let combined = maxEffs[0].map((item, i) => {
      return {
          name: item,
          value1: maxEffs[1][i],
          value2: maxEffs[2][i],
          value3: maxEffs[3][i],
          value4: maxEffs[4][i]
      };
    });

    // Sort the array of objects by max efficiency
    combined.sort((a, b) => b.value3 - a.value3);

    // Extract the sorted arrays
    let sortedMaxEffs = [
      combined.map(item => item.name),
      combined.map(item => item.value1),
      combined.map(item => item.value2),
      combined.map(item => item.value3),
      combined.map(item => item.value4)
    ];

    return sortedMaxEffs;
  }

  get skillArray() {
    return this.effArray();
  }

  get currLevels() {
    return PageHelper.currSkillInfo()[0];
  }

  get currSelections() {
    return PageHelper.currSkillInfo()[1];
  }

  get currLocks() {
    return PageHelper.currSkillInfo()[2];
  }

  get totalEffect() {
    let effects = this.totalEffects();
    let total = 0;
    for (let i of effects) {
      total += (Math.log10(i));
    }

    let result = (10 ** (total - Math.floor(total))).toFixed(2) + "e" + Math.floor(total);
    return [total.toFixed(3), result];
  }

}

let flagop = 1;

class Optimize {

  // Dorijanko's modified
  static getImportant(a) {
    const imp = [];
    let maxSF = -Infinity;

    for (let i = 0; i < a.length; ++i) {
      if (i < 101) {
        imp.push(i);
        maxSF = Math.max(maxSF, a[i]);
      } else if (a[i] > maxSF) {
        imp.push(i);
        maxSF = a[i];
      }
    }

    return imp;
  }


  static mergeEff(a, b, req, goodMasks) {
    /*
    1 = previous skill taken
    2 = two skills ago taken
    4 = three skills ago taken

    choose binary sequence that meets T4 reqs
    [0,1,0,1,0,1,0,1]; //T5 right; 1, 3, 5, 7
    [0,0,1,1,0,0,1,1]; //T5 mid; 2, 3, 6, 7
    [0,0,0,0,1,1,1,1]; //T5 left; 4, 5, 6, 7
    */
    // Pre-allocate arrays with correct size once
    const resultLength = a.length + b[0].length - 1;
    
    // Create arrays once with proper initialization
    const c = Array(8).fill().map(() => new Array(resultLength).fill(-100000));
    const d = Array(8).fill().map(() => new Array(resultLength).fill(-100000));
  
    // Cache important indices of b arrays outside loop
    const bImportantIndices = [];
    for (let mask = 0; mask < 8; mask++) {
      bImportantIndices[mask] = this.getImportant(b[mask]);
    }
  
    // Main processing loop
    for (let i = 0; i < a.length; i++) {
      if (a[i] < 0) continue;
      
      for (let mask = 0; mask < 8; mask++) {
        if (i > 0 && goodMasks[mask] === 0) continue;
        
        const newMask = (mask * 2 + (i > 0 ? 1 : 0)) % 8;
        const b1 = b[mask];
        const impj = bImportantIndices[mask];
        
        for (let jIdx = 0; jIdx < impj.length; jIdx++) {
          const j = impj[jIdx];
          const idx = i + j;
          if ((i === 0 || j >= req) && idx < resultLength) {
            const sum = a[i] + b1[j];
            if (sum > c[newMask][idx]) {
              c[newMask][idx] = sum;
              d[newMask][idx] = i;
            }
          }
        }
      }
    }
  
    return [c, d];
  }
  
  static mergeTrees(a, b, totSP) {
    const tot = totSP + 1000;
    const c = [];
    const d = [];

    // Pre-calculate important indices once
    const impj = this.getImportant(b);
    const impi = [];
    for (let mask = 0; mask < 8; ++mask) {
      impi[mask] = this.getImportant(a[mask]);
    }

    for (let mask = 0; mask < 8; ++mask) {
      const a1 = a[mask];
      const lenAB = Math.min(a1.length + b.length, tot + 1);
      const c1 = new Array(lenAB).fill(-100000);
      const d1 = new Array(lenAB).fill(-100000);
      
      const currentImpi = impi[mask];
      
      for (let iIdx = 0; iIdx < currentImpi.length; iIdx++) {
        const i = currentImpi[iIdx];
        if (a1[i] < 0) continue;
        
        for (let jIdx = 0; jIdx < impj.length; jIdx++) {
          const j = impj[jIdx];
          const index = i + j;
          if (index > tot) break;
          
          const sum = a1[i] + b[j];
          if (sum > c1[index]) {
            c1[index] = sum;
            d1[index] = i;
          }
        }
      }

      c.push(c1);
      d.push(d1);
    }
    return [c, d];
  }


  static intoOne(a, b, which) {
    const len = a[0].length;
    const c = new Array(len).fill(-100000);
    const d = new Array(len).fill().map(() => [-1, -1]);
    
    for (let x = 0; x < which.length; ++x) {
      const i = which[x];
      const ai = a[i];
      
      for (let j = 0; j < ai.length; ++j) {
        if (ai[j] > c[j]) {
          c[j] = ai[j];
          d[j] = [b[i][j], i];
        }
      }
    }
    return [c, d];
  }

  
  static intoOneFastc(a, which) {
    const c = new Array(a[0].length).fill(-100000);
    
    for (let x = 0; x < which.length; ++x) {
      const i = which[x];
      const ai = a[i];
      
      for (let j = 0; j < ai.length; ++j) {
        if (ai[j] > c[j]) {
          c[j] = ai[j];
        }
      }
    }
    return [c];
  }
  
  static intoOneFastd(a, b, which, totSP) {
    let c = Number.NEGATIVE_INFINITY;
    let d = [-1, -1];
    
    for (let x = 0; x < which.length; ++x) {
      const i = which[x];
      if (totSP < a[i].length && a[i][totSP] > c) {
        c = a[i][totSP];
        d = [b[i][totSP], i];
      }
    }
    return d;
  }

  static treeBranch() {
    return Object.values(skillInfo).map(obj => [obj.Branch]);
  }

  static optTree(efficiencies, currLevels, SP) {
    const optData = efficiencies;
    const goodRows = optData.length;
    const branches = this.treeBranch();
    const trees = [];
    const baseB = [[0],[0],[0],[0],[0],[0],[0],[0]];
    let tree = [[baseB,[]]];
    
    // Cache common mask arrays
    const T5Prev1 = [0,1,0,1,0,1,0,1]; //T5 right; 1, 3, 5, 7
    const T5Prev2 = [0,0,1,1,0,0,1,1]; //T5 mid; 2, 3, 6, 7
    const T5Prev3 = [0,0,0,0,1,1,1,1]; //T5 left; 4, 5, 6, 7
    const allMask = [1,1,1,1,1,1,1,1];
    const standardMasks = [0,1,2,3,4,5,6,7];
    
    const spIndexGroups = {
      Prev1: [11, 23, 34],
      Prev2: [10, 56, 57],
      Prev3: [22, 45, 68, 69]
    }
    
    for (let i = 0; i < goodRows; ++i) {
      if (i > 0 && branches[i][0] != branches[i-1][0]) {
        trees.push(tree);
        tree = [[baseB,[]]];
      }
      
      // Find maxLevInc more efficiently
      let maxLevInc = 0;
      while (maxLevInc < MID_POINT && optData[i][maxLevInc+MID_POINT] < optData[i][maxLevInc+MID_POINT+1]) ++maxLevInc;
      
      const newArray = new Array(optData[i][maxLevInc+MID_POINT] + 1).fill(-100000);
      const SPU = optData[i][MID_POINT];
      newArray[SPU] = 0;
      
      for (let j = 1; j <= maxLevInc; ++j) {
        const SPC = optData[i][j+MID_POINT];
        newArray[SPC] = (SPC-SPU) * Math.log10(optData[i][j-1]);
      }
      
      // Determine SPReq based on tree length
      let SPReq = 0;
      if (tree.length >= 2) SPReq = 3;
      if (tree.length >= 5) SPReq = 20;
      if (tree.length >= 8) SPReq = 50;
      if (tree.length >= 11) SPReq = 100;
      
      // Determine goodMasks based on conditions
      let goodMasks;
      if (tree.length === 1) {
        goodMasks = allMask;
      } else if (tree.length >= 5 && tree.length < 11) {
        goodMasks = T5Prev3;
      } else if (spIndexGroups.Prev1.includes(i)) {
        goodMasks = T5Prev1; //T5 right
      } else if (spIndexGroups.Prev2.includes(i)) {
        goodMasks = T5Prev2; //T5 mid
      } else if (spIndexGroups.Prev3.includes(i)) {
        goodMasks = T5Prev3; //T5 left
      } else {
        goodMasks = [0,1,1,1,1,1,1,1];
      }
      
      tree.push(this.mergeEff(newArray, tree[tree.length-1][0], SPReq, goodMasks));
    }
    trees.push(tree);
    
    let totSP = SP;
    const prefTrees = [[baseB, baseB]];
    
    for (let i = 0; i < trees.length; ++i) {
      const oldVal = this.intoOneFastc(prefTrees[i][0], standardMasks)[0];
      prefTrees.push(this.mergeTrees(trees[i][trees[i].length-1][0], oldVal, totSP));
    }
    
    // Check for optimize mode
    const mode = document.querySelector('.optimizeMode').getAttribute("data-maxCumlEff") === 'true';
    if (mode) {
      const effVals = this.intoOneFastc(prefTrees[trees.length][0], standardMasks)[0];
      const SPused = Number(PageHelper.spUsed());
      let maxCumEff = effVals[totSP] / (totSP - SPused);
      
      for (let i = totSP + 1; i < effVals.length; ++i) {
        const currentEff = effVals[i] / (i - SPused);
        maxCumEff = Math.max(maxCumEff, currentEff);
      }
      
      for (let i = totSP; i > SPused; --i) {
        if (effVals[i] / (i - SPused) >= maxCumEff) {
          totSP = i;
          break;
        }
      }
    }
    
    const levels = [];
    const oldLevels = currLevels;
    
    for (let i = trees.length; i >= 1; --i) {
      const vaalFast = this.intoOneFastd(prefTrees[i][0], prefTrees[i][1], standardMasks, totSP);
      let totSPinTree = vaalFast[0];
      let usedMasks = [vaalFast[1]];
      
      for (let j = trees[i-1].length-1; j >= 1; --j) {
        const curValFast = this.intoOneFastd(trees[i-1][j][0], trees[i-1][j][1], usedMasks, totSPinTree);
        const SPHere = curValFast[0];
        const curMask = curValFast[1];
        
        let levHere = 0;
        while (levHere < optData[0].length && optData[goodRows-levels.length-1][levHere+MID_POINT] !== SPHere) {
          ++levHere;
        }
        
        totSPinTree -= SPHere;
        levels.push(levHere);

        const getValidMasksForSkill = (skillIndex, treePosition) => {
          if (treePosition === 1) {
            return [0,1,2,3,4,5,6,7]; // allMask
          } else if (treePosition >= 5 && treePosition < 11) {
            return [4,5,6,7]; // minMask 4
          } else if (spIndexGroups.Prev1.includes(skillIndex)) {
            return [1,3,5,7]; // T5Prev1
          } else if (spIndexGroups.Prev2.includes(skillIndex)) {
            return [2,3,6,7]; // T5Prev2
          } else if (spIndexGroups.Prev3.includes(skillIndex)) {
            return [4,5,6,7]; // T5Prev3
          } else {
            return [1,2,3,4,5,6,7]; // default
          }
        };

        const currentSkillIndex = goodRows - levels.length;
        const validMasks = getValidMasksForSkill(currentSkillIndex, j);
        const cand = Math.floor(curMask/2);

        usedMasks = [];
        if (validMasks.includes(cand) || SPHere === 0) usedMasks.push(cand);
        usedMasks.push(cand+4);
      }
      
      totSP -= vaalFast[0];
    }
    
    const newLevels = [];
    for (let i = 0; i < goodRows; ++i) {
      if (oldLevels[i].length === 0) {
        newLevels.push([levels[goodRows-i-1]]);
      } else {
        newLevels.push([Number(levels[goodRows-i-1]) + Number(oldLevels[i][0])]);
      }
    }
    
    return newLevels;
  }
}

class PageHelper {

  static findSkillInput(talentId) {
    const skill = skillInfo[talentId];
    const branch = skill.Branch;
    const slot = skill.Slot;
    const treeNameElement = document.querySelector(`.trees .grid-item.treeName#${branch}`);
    return treeNameElement?.parentElement?.querySelector(`input#slot${slot}`); // use ?. optional chaining rather than checking null for each element
  }

  static processSkills(callback, defaultValue = null) {
    return Object.keys(skillInfo).map(talentId => {
        const input = this.findSkillInput(talentId);
        return input ? callback(input, talentId) : defaultValue;
    });
  }

  static getMaxLevels() { // get max skill levels from skillInfo
    let max = [];
    for (let talentID in skillInfo) {
        let maxLevel = skillInfo[talentID]["MaxLevel"];
        max.push(maxLevel);
    }
    return max;
  }

  static setMinMax() { // apply min and max values for each skill
    const maxLevels = this.getMaxLevels();
    
    Object.keys(skillInfo).forEach((talentId, index) => {
        const input = this.findSkillInput(talentId);
        if (input && index < maxLevels.length) {
            input.setAttribute("min", "0");
            input.setAttribute("max", maxLevels[index]);
            input.setAttribute("oninput", "PageHelper.checkValue(this);");
        }
    });
  }

  static checkValue(input) { // check if skill evel is valid within bounds
    let minValue = Number(input.getAttribute("min"));
    let maxValue = Number(input.getAttribute("max"));
    let val = Number(input.value);
    input.value = parseInt(val);
    
    if (val > maxValue) {
      input.value = maxValue;
    }
    
    if (val < minValue) {
      input.value = null;
    }
    
  }

  static setBuildName() { // set name of build in the skill tree
    let dmg = $('typeDamage').value;
    let gold = $('typeGold').value;
    let buildName = dmg + " " + gold;
    document.querySelector('#buildName').firstChild.nodeValue = buildName;
  }

  static resetTree() { // reset skill levels in the tree
    if (document.getElementById("lockSettings").style.display !== "none") {
      toggleBtn('lock');
      document.getElementById("lockSettings").style.display = "none";
    }
    if (document.getElementById("selectSettings").style.display !== "none") {
      toggleBtn('select');
      document.getElementById("selectSettings").style.display = "none";
    }

    // reset skill levels
    for (let talentId of Object.keys(skillInfo)) {
        const input = this.findSkillInput(talentId);
        if (input) {
            let locked = input.getAttribute("data-lock") === 'true';
            if (!locked) { // only reset if unlocked
                input.value = 0;
            }
        }
    }

    // reset tree SP totals
    document.querySelectorAll('.spTotal').forEach((item) => {
        item.innerHTML = 0;
    });

    // save sequence

    this.save();
    this.treeSP()
    this.buildExport();
    this.totalEffect();
  }

  static treeSP() { // obtain total SP for each tree and apply to tree
    let optData = player.skillArray;
    let branches = Optimize.treeBranch();
    let treeTotals = [];
    let uniqueBranch = new Set(branches.flat());
    let sumTotal = 0;
    
    for (let branch of uniqueBranch) {
        let sum = 0;
        for (let i = 0; i < branches.length; i++) {
          if (branches[i][0] == branch) {
            if (optData[i] && optData[i][MID_POINT] !== undefined) {
                sum += optData[i][MID_POINT];
                sumTotal += optData[i][MID_POINT];
            }
          } 
        }
        treeTotals.push(sum);
    }
    
    let gridItems = document.querySelectorAll('.spTotal');
    let i = 0;

    gridItems.forEach((item) => {
        item.innerHTML = treeTotals[i];
        i++;
    })


    let playerSP = playerstats["SkillPoints"];
    let remainingSP = playerSP - sumTotal;
    document.querySelector('#buildSP').innerHTML = `${sumTotal} / ${playerSP} (${remainingSP} SP remaining)`;
    
    return treeTotals;
  }

  static spUsed() { // obtain total SP used
    let optData = player.skillArray;
    let sumTotal = 0;

    for (let i = 0; i < optData.length; i++) {
      sumTotal += optData[i][MID_POINT];
    }
    return sumTotal;
  }

  
  static toTree(levels) { // take array of skill levels and apply them to the tree
    
    // Loop through each skill in skillInfo to match with the levels array
    Object.keys(skillInfo).forEach((talentId, index) => {
        const input = this.findSkillInput(talentId);
        if (input && index < levels.length) {
            input.value = (levels[index] == 0) ? "" : levels[index];
        }
    });

    // save sequence
    save();
    this.buildExport();
    this.treeSP();
  }

  static saveSkillInfo() {  // get info for each skill and save to playerInfo
    playerskills = Object.assign({}, 
        playerInfo.skills, // Default structure
        playerskills       // Existing data overwrites defaults
    );
    user.skills = playerskills;

    let skillinfo = this.currSkillInfo();
    let playerLevels = skillinfo[0];
    let selections = skillinfo[1];
    let locks = skillinfo[2];
    let i = 0;

    Object.values(playerskills).forEach((talent) => {
        let level = playerLevels[i][0];
        let selection = selections[i][0]
        let locked = locks[i][0];
        talent["Level"] = level;
        talent["Selection"] = selection;
        talent["Locked"] = locked;
        i++;
    });
  }

  static currSkillInfo() { // obtain info for each skill
    const currLevels = this.processSkills(input => [input.value], [0]);
    const currSelections = this.processSkills(input => [input.getAttribute("data-select") === 'true'], [false]);
    const currLocks = this.processSkills(input => [input.getAttribute("data-lock") === 'true'], [false]);
    
    return [currLevels, currSelections, currLocks];
  }

  static buildExport() { // take current skill levels and create the import string
    let importString = {
      Version: $("buildVersion").value,
      Skills: {}
    };
  
    for (let i in playerskills) {
      if (Number(playerskills[i]["Level"]) != 0) {
        importString.Skills[playerskills[i]["ID"]] = playerskills[i]["Level"];
      }
    }
  
    importString = JSON.stringify(importString);
  
    document.querySelector('#exportString').innerHTML=importString;
    return importString;
  }

  static setTree() { // apply tree sp and import string
    this.treeSP();
    this.buildExport();
  }

  static toggleBtn(type) {
  const inputs = document.querySelectorAll('.grid-item input');

  inputs.forEach(input => {
    const currentType = input.type;
    const currentDataType = input.getAttribute('data-type');

    const isCheckbox = currentType === 'checkbox';
    const isNumber = currentType === 'number';

    // Handle number => checkbox toggle
    if (isNumber) {
      input.setAttribute('data-original-value', input.value);
      input.setAttribute('data-type', type);
      input.type = 'checkbox';
      input.setAttribute('onclick', 'PageHelper.checkboxCheck(this)');
      return;
    }

    // Handle checkbox => number toggle (when reverting)
    if (isCheckbox && currentDataType === type) {
      input.value = input.getAttribute('data-original-value') || 0;
      input.type = 'number';
      input.setAttribute('data-type', 'number');
      return;
    }

    // Handle staying as checkbox but changing its mode
    if (isCheckbox && currentDataType !== type) {
      input.setAttribute('data-type', type);

      if (type === 'lock') {
        document.getElementById('selectSettings').style.display = 'none';
      } else if (type === 'select') {
        document.getElementById('lockSettings').style.display = 'none';
      }
    }
  });
  }

  static checkboxCheck(element) { // handle locking and selecting of skills
    let type = element.getAttribute("data-type");
    let attribute = "data-" + type;
    element.setAttribute(attribute, element.getAttribute(attribute) === 'true' ? "false" : "true");
  }

  static toggleMode(element) { // toggle between optimizing modes
    let mode = element.getAttribute("data-maxCumlEff") === 'true';
    element.setAttribute("data-maxCumlEff", String(!mode));
    element.innerHTML = mode ? 'Mode: Spend All' : 'Mode: Cuml. Eff';
  }

  static toggleQol(element) {
    let mode = element.getAttribute("data-qol") === 'true';
    element.setAttribute("data-qol", String(!mode));
    playerstats["AutoQol"] = !mode;
    PageHelper.save();
    element.innerHTML = mode ? 'Auto QoL: Off' : 'Auto QoL: On';

    // Show/hide the icon based on QoL mode
    let icon = document.querySelector('#buildName span');
    if (icon) {
      icon.style.display = !mode ? 'inline' : 'none';
    }
  }

  static doAll(element) { // lock/unlock/select/deselect all skills
    let mode = element.className;

    document.querySelectorAll('.grid-item input').forEach(function(input) {
      switch (mode) {
        case "lockAll":
          input.setAttribute("data-lock", "true");
          break;

        case "unlockAll":
          input.setAttribute("data-lock", "false");
          break;

        case "selectAll":
          input.setAttribute("data-select", "true");
          break;

        case "deselectAll":
          input.setAttribute("data-select", "false");
          break;
      }
    });
    this.save();
  }

  static totalEffect() { // get total effect of build and apply to tree
    let effect = player.totalEffect;
    let content = document.querySelector('#totalEffect');
    content.setAttribute('data-format', 'sci');
    content.innerHTML = "Estimated Total Effect: " + effect[1];
  }

  static prettifyJSON() { // beautify JSON when importing
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

  static binarySearch(array, key) {
    const keys = array;
    let left = 0;
    let right = keys.length - 1;
    let count = 0;

    while (left <= right) {
        const mid = left + Math.floor((right - left) / 2);
        count++;
        // console.log(`mid: ${mid} | count: ${count}`);

        if (keys[mid] === key) {
            return mid;
        } else if (keys[mid] < key) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    // If the key is not found, return the value of the previous smallest key
    if (right >= 0) {
        return right;
    } else {
        return null;  // or a default value
    }
}

  static baselineQol() {
    const dmg = player.typeDamage; // get player damage type
    const gold = player.typeGold; // get player gold type
    const sp = Number(player.SkillPoints) || 0; // get player skill points
    const currLevels = player.currLevels; // get player skill levels
    const skillIds = Object.keys(skillInfo); // get skill IDs
    const skillIdToIndex = Object.fromEntries(skillIds.map((id, index) => [id, index]));
    const skillArr = []; // array to hold skill levels
    const build = baseline[dmg][gold]; // get baseline build for player type

    const baselines = Object.keys(build).map(Number);
    
    let sp_index = this.binarySearch(baselines, sp);
    let qol_baselines = build[baselines[sp_index]];
    if (!this.isBaselineValid(qol_baselines, currLevels)) return; 
    
    for (const [i, { Name: skillName }] of Object.entries(skillInfo)) {
      const index = skillIdToIndex[i];
      const curr_level = parseInt(currLevels[index]) || 0;
      const level = parseInt(qol_baselines[i] || 0);

      const value = !playerskills[skillName].Selection ? curr_level : Math.max(level, curr_level);

      skillArr.push(value);
    }

    this.toTree(skillArr);  
  }

  static isBaselineValid(baselineLevels, currLevels) {
    const skillIds = Object.keys(skillInfo); // get skill IDs
    const skillIdToIndex = Object.fromEntries(skillIds.map((id, index) => [id, index]));
    const total_sp = Number(player.SkillPoints) || 0;
    const curr_sp = this.treeSP().reduce((a, b) => a + b, 0); // get current SP used
    const sp_avail = total_sp - curr_sp; // get available SP to spend

    let baselineSpCost = 0;
    for (const i in baselineLevels) {
      const skillIndex = skillIdToIndex[i]; // get index of skill ID
      const currLevel = parseInt(currLevels[skillIndex]?.[0] || 0); // get current skill level
      const baselineLevel = parseInt(baselineLevels[i] || 0); // get baseline skill level
      
      if (currLevel > baselineLevel) {
        continue;
      }

      const spCost = getCumulativeSP[i][baselineLevel] - getCumulativeSP[i][currLevel];
      baselineSpCost += spCost;
    }

    return sp_avail >= baselineSpCost;
  }

  static importSave(string) { // handle importing of player data or build export
    //let string = document.getElementById("saveImport").value;
    let jsonObj = JSON.parse(string);
    let keys = Object.keys(jsonObj);
    let skillsObj;
    let skillArr = [];

    switch (keys[0]) {
  
      // skill tree export string
      case "Version":
        skillsObj = jsonObj["Skills"];
  
        for (let i in skillInfo) {
          let level = skillsObj[i] || 0;
          skillArr.push([parseInt(level)]);
        }
        
        $("buildVersion").value = jsonObj["Version"];
        this.toTree(skillArr);
        break;
  
      // player export string
      case "playerStats":
        skillsObj = jsonObj["skillTree"];
  
        let maxstage = jsonObj["playerStats"]["Max Prestige Stage"];
        let craftingPower = jsonObj["playerStats"]["Crafting Power"];
        let skillPoints = jsonObj["playerStats"]["Skill Points Owned"];
  
        // set skill levels
        for (let i in skillInfo) {
          let level = skillsObj[i] || 0;
          skillArr.push([parseInt(level)]);
        }
        
        // check for equipment sets
        let sets = [
          "MultiCast",
          "Valkyrie",
          "DarkAngel",
          "FairyKnight",
          "FireKnight",
          "ElectricWarlord",
          "WaterSorcerer",
          "EarthRogue",
          "SteampunkKnight"
        ];

        let inputs = ["FB", "FF", "tFA", "Shae", "Ignus", "Ironheart", "Kor", "Styxsis", "Rygal"]
  
        for (let i of sets) {
          let setObj = jsonObj["equipmentSets"];
          let setIndex = sets.indexOf(i);
          $(inputs[setIndex]).checked = setObj.includes(i)
        }
  
        // set shadowclone based off tfa
        let tFA = jsonObj["equipmentSets"].includes("DarkAngel");
        $("sClone").value = (tFA) ? 35 : 30;
        
        $("MaxStage").value = maxstage;
        $("CP").value = craftingPower;
        $("SkillPoints").value = skillPoints;
  
  
        this.toTree(skillArr);
  
        break;
    }
  }

  static copyToClipboard() { // copy build export to clipboard
    $('exportString').select();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText($('exportString').value);
    } else {
      document.execCommand('copy');
    }
  }

  static expand(button, elementId) { // expands hidden fields from button
    let content = document.getElementById(elementId);
    let msg = button.innerHTML;

    if (content.style.display == "none") {
      content.style.display = "";
      if (!(msg == "Toggle Skills" || msg == "Lock Skills" || msg == "Share")) {
        button.innerHTML = msg.slice(0, -1) + '&#9652';
      }
    } else {
      content.style.display = "none";
      if (!(msg == "Toggle Skills" || msg == "Lock Skills" || msg == "Share")) {
        button.innerHTML = msg.slice(0, -1) + '&#9662';
      }
    }
  }

  static builderSave(element) { 
    const mode = element.innerHTML;
    const importString = JSON.parse(this.buildExport());
    const buildType = document.querySelector('#buildName').innerHTML;
    const buildSP = document.querySelector("#buildSP").innerHTML.match(/^\d+(?=\s*\/)/)[0];
    const defaultName = `${buildType}, ${buildSP} SP`;
    const buildName = document.querySelector('#buildSaveName').value || defaultName;
    const oldName = document.querySelector('#buildSaveMode').selectedOptions[0].text;
    let buildNum;
    if (playersaves === undefined || playersaves === null) {
      buildNum = 0;
    } else {
      buildNum = Object.keys(playerInfo["saves"]).length;
    }
  
    if (mode === "Save") {
      this.saveBuild(buildName, importString, buildNum);
    } else if (mode === "Rename") {
      this.renameBuild(oldName, buildName, buildNum);
    }

    document.querySelector('#buildSaveName').value = "";
  
    localStorage.setItem("playerInfo", JSON.stringify(user));
    this.save();
    this.builderNotify(`Successfully Saved as ${buildName}`);
  }
  
  static saveBuild(buildName, importString, buildNum) {
    const saves = playersaves;
    saves[buildName] = importString;
    const option = document.createElement("option");
    option.value = buildNum+1;
    option.text = buildName;
    document.getElementById("buildSaveMode").add(option);
  }
  
  static renameBuild(oldName, newName, buildNum) {
    const saves = playersaves;
    buildNum = buildSaveMode.value - 1;
    const newData = JSON.parse(JSON.stringify(saves).replace(`"${oldName}":`, `"${newName}":`));
    playersaves = newData;
    buildSaveMode.querySelector(`option[value="${buildNum+1}"]`).text = newName;
  }
  
  static builderSaveNames() {
    const saves = playersaves;
    const buildSaveMode = document.getElementById("buildSaveMode");
    if (saves === undefined || saves === null) {
      return;
    }
    buildSaveMode.options.length = 1;
    const buildNames = Object.keys(saves);
  
    for (let i = 0; i < buildNames.length; i++) {
      const option = document.createElement("option");
      option.value = i + 1;
      option.text = buildNames[i];
      buildSaveMode.add(option);
    }
  }
  
  static buildSaveChange(element) {
    const selection = element.querySelector('#buildSaveMode');
    const textarea = element.querySelector('#buildSaveName');
    const button = element.querySelector('button');
    if (selection.value != 0) {
      textarea.placeholder = "Rename this build";
      button.innerHTML = "Rename";
    } else {
      textarea.placeholder = "Name your build";
      button.innerHTML = "Save";
    }
  }

  static builderLoadNames() {
    const saves = playersaves;
    const buildLoadMode = document.getElementById("buildLoadMode");
    if (saves === undefined || saves === null) {
      return;
    }
    while (buildLoadMode.childElementCount > 1) {
      buildLoadMode.removeChild(buildLoadMode.lastChild);
    }
    const buildNames = Object.keys(saves);
  
    for (let i = 0; i < buildNames.length; i++) {
      const div = document.createElement("div");
      div.style.lineHeight = "2";
      div.className = "buildStat";
      div.innerHTML = buildNames[i];
      div.setAttribute("data-buildnum", "build" + i);
      div.setAttribute("onclick", "PageHelper.builderLoadBuild(this);");
      buildLoadMode.appendChild(div);
    }
  }

  static builderLoadBuild(element) {
    const name = element.innerHTML;
    let build = JSON.stringify(playersaves[name]);
    this.importSave(build);
    this.builderNotify(`Successfully Loaded ${name}`);
  }

  static builderDeleteNames() {
    const saves = playersaves;
    const buildDeleteMode = document.querySelector('.buildDeleteMode');
    if (saves === undefined || saves === null) {
      return;
    }
    const elements = buildDeleteMode.children;
    for (var i = elements.length - 1; i > 0; i--) {
      if (elements[i].hasAttribute('data-delete')) {
        buildDeleteMode.removeChild(elements[i]);
      }
    }
    const buildNames = Object.keys(saves);
    const referenceDiv = buildDeleteMode.querySelector('.buildStat');

    for (let i = buildNames.length - 1; i >= 0; i--) {
      const div = document.createElement("div");
      div.style.lineHeight = "2";
      div.className = "buildStat toDelete";
      div.innerHTML = buildNames[i];
      div.setAttribute("data-buildnum", "build" + i);
      div.setAttribute("data-delete", "false");
      div.setAttribute("onclick", "PageHelper.builderDeleteToggle(this);");
      buildDeleteMode.insertBefore(div, referenceDiv.nextSibling);
    }
  }

  static builderDeleteToggle(element) {
    const toDelete = element.getAttribute("data-delete");
    if (toDelete === "false") {
      element.setAttribute("data-delete", "true");
    } else {
      element.setAttribute("data-delete", "false");
    }
  }

  static builderDelete() {
    const elements = document.querySelectorAll('.toDelete');
    let flag = false;
    elements.forEach(element => {
      if (element.getAttribute('data-delete') === "true") {
        flag = true;
        let buildName = element.innerHTML;
        delete playersaves[buildName];
        localStorage.setItem("playerInfo", JSON.stringify(user));
        element.remove();
      }
    });
    if (flag) this.builderNotify("Successfully Deleted");
  }

  static toggleBuilder(element) {
    const actions = {
      buildSave: { toggle: "buildSave", display: "buildSave" },
      buildLoad: { toggle: "buildLoad", display: "buildLoad" },
      buildDelete: { toggle: "buildDelete", display: "buildDelete" }
    };
  
    for (const action in actions) {
      if (element.classList.contains(action)) {
        for (const key in actions) {
          const currentElement = document.querySelector("." + actions[key].toggle);
          const displayElement = document.getElementById(actions[key].display);
          if (key === action && currentElement.getAttribute('data-toggle') === "true") {
            currentElement.setAttribute('data-toggle', "false");
            displayElement.style.display = "none";
          } else {
            const value = key === action ? "true" : "false";
            currentElement.setAttribute('data-toggle', value);
            displayElement.style.display = value === "true" ? "block" : "none";
          }
        }
      }
    }
  }
  
  static builderNotify(msg) {
    Notification.notify.info(msg, 1500);
    /*
    const notifUI = document.querySelector('#builderNotify');
    notifUI.innerHTML = msg;
    notifUI.style.backgroundColor = "#93c47d";
    notifUI.style.display = "";
    setTimeout(function() {
      notifUI.innerHTML = ""
      notifUI.style.backgroundColor = "#d9d9d9";
    }, 1500);
    */
  }

  static genUrl() {
    let curDT = document.querySelector('#typeDamage').value;
    let curGT = document.querySelector('#typeGold').value;
    let buildVer = document.querySelector('#buildVersion').value;
    let SP = document.querySelector('#SkillPoints').value;
    let levels = player.currLevels;

    const damageTypes = {
      "Clan Ship": "CS",
      "Heavenly Strike": "HS",
      "Pet": "Pet",
      "Shadow Clone": "SC",
      "Dagger": "DG",
      "Gold Gun": "GG"
    };
    const goldTypes = {
      "Fairy": "F",
      "HoG": "HoG",
      "Chesterson": "C"
    }

    curDT = damageTypes[curDT] || curDT;
    curGT = goldTypes[curGT] || curGT;

    let buildData = ["rawrzopti", curDT, curGT, buildVer, SP, levels];
    buildData = btoa(JSON.stringify(buildData));
    let currentUrl = window.location.href;
    let newUrl;

    if (currentUrl.includes("?")) {
      newUrl = currentUrl + "&data=" + buildData;
    } else {
      newUrl = currentUrl + "?data=" + buildData;
    }

    const el = document.createElement('textarea');
    el.value = newUrl;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(newUrl);
    } else {
      document.execCommand('copy');
    }
    document.body.removeChild(el);
    return newUrl;
  }

  static fromUrl() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const data = urlParams.get('data');
    if (data) {
      let buildData = JSON.parse(atob(data));
      if (buildData[0] === 'rawrzopti') {
        const damageTypes = {
          "CS": "Clan Ship",
          "HS": "Heavenly Strike",
          "Pet": "Pet",
          "SC": "Shadow Clone",
          "DG": "Dagger",
          "GG": "Gold Gun"
        };
        const goldTypes = {
          "F": "Fairy",
          "HoG": "HoG",
          "C": "Chesterson"
        };
        const curDT = document.querySelector('#typeDamage');
        const curGT = document.querySelector('#typeGold');
        const buildVer = document.querySelector('#buildVersion');
        const SP = document.querySelector('#SkillPoints');
        curDT.value = damageTypes[buildData[1]];
        curGT.value = goldTypes[buildData[2]];
        buildVer.value = buildData[3];
        SP.value = buildData[4];
        this.toTree(buildData[5]);
        history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }

  static skillImages() {
    Object.keys(skillInfo).forEach(talentId => {
        const input = this.findSkillInput(talentId);
        if (input) {
            input.parentElement.style.backgroundImage = `linear-gradient(rgba(37,37,37,0.6), rgba(37,37,37,0.6)), url('images/skillicons/${talentId}.png')`;
            input.parentElement.style.backgroundSize = "cover";
        }
    });
  }

  static updateBrightness() {
    const gridItemsWithInput = document.querySelectorAll('.trees .grid-item input');

    // Loop through the selected elements and apply the style
    gridItemsWithInput.forEach((item) => {
      let backgroundImage = item.parentElement.style.backgroundImage;
      let newBG;
      if (item.value > 0) {
        newBG = backgroundImage.replace('rgba(37, 37, 37, 0.6), rgba(37, 37, 37, 0.6)', 'rgba(37, 37, 37, 0.1), rgba(37, 37, 37, 0.1)');
      } else if (item.value == 0) {
        newBG = backgroundImage.replace('rgba(37, 37, 37, 0.1), rgba(37, 37, 37, 0.1)', 'rgba(37, 37, 37, 0.6), rgba(37, 37, 37, 0.6)');
      }
      item.parentElement.style.backgroundImage = newBG;
    });
  }

  static toEffTable() {
    const sortedMaxEffs = player.nextLevels(); // assumed to be [rows][cols]
    const table = document.querySelector('.effTable');

    // Keep the header: clear everything else from tbody
    const tbody = table.querySelector('tbody');

    // Remove all <tr> elements after the first one (the header)
    while (tbody.rows.length > 1) {
      tbody.deleteRow(1);
    }

    // Dimensions
    const tableRows = sortedMaxEffs.length;
    const tableCols = sortedMaxEffs[0].length;

    // Build HTML string instead of creating DOM nodes one by one
    let html = '';

    for (let i = 0; i < tableCols; i++) {
      html += '<tr>';
      for (let j = 0; j < tableRows; j++) {
        html += `<td>${sortedMaxEffs[j][i]}</td>`;
      }
      html += '</tr>';
    }

    // insert table
    tbody.insertAdjacentHTML('beforeend', html);
  }

  static downloadImg() {
    let dmg = $('typeDamage').value;
    let gold = $('typeGold').value;
    let buildName = dmg + " " + gold;
    let imgUrl = document.querySelector('#modalImg').src;
    const a = document.createElement("a");
    a.href = imgUrl;
    a.download = `${buildName}.png`;
    a.click();
  }

  static save() {
    playerStats();
    localStorage.setItem("playerInfo", JSON.stringify(user));
    user = JSON.parse(localStorage.getItem("playerInfo"));
    playerstats = user["stats"];
    playerskills = user["skills"];
    playersaves = user["saves"];
  }

  static load() {
    if (localStorage.getItem("playerInfo") === null) {
        localStorage.setItem("playerInfo", JSON.stringify(playerInfo));
        user = JSON.parse(localStorage.getItem("playerInfo"));
        playerstats = user["stats"];
        playerskills = user["skills"];
        playersaves = user["saves"];
        this.save()
        return;
    } else {
      let stats = user["stats"];
      let key;

      for (key in stats) {
          if ($(key) === null) {
              continue
          } else if (["FB", "FF", "tFA", "Shae", "Ignus", "Ironheart", "Kor", "Styxsis", "Rygal"].includes(key)) {
              $(key).checked = stats[key];
          } else {
              $(key).value = stats[key];
          }
      }

      let autoQolSetting = stats["AutoQol"];
      if (!autoQolSetting) {
        this.toggleQol(document.querySelector('.autoQol'));
      }

      let levels = [];
      let selections = [];
      let locked = [];
      let playerLevels = user["skills"];
      for (key in playerLevels) {
          levels.push(playerLevels[key]["Level"]);
          selections.push(playerLevels[key]["Selection"]);
          locked.push(playerLevels[key]["Locked"]);
      }

      // Loop through each skill in skillInfo to match with the arrays
      Object.keys(skillInfo).forEach((talentId, index) => {
          const inputElement = this.findSkillInput(talentId);
          
          if (inputElement && index < levels.length) {
              inputElement.value = levels[index];
              inputElement.setAttribute('data-select', selections[index]);
              inputElement.setAttribute('data-lock', locked[index]);
          } else if (!inputElement) {
              console.warn(`Could not find input for ${talentId}`);
          }
      });
    }
  }
}

function createClass() {
  player = new Player;
}

function prettifyJSON() {
  var uglyJSON = document.getElementById('saveImport').value;
  try {
    var parsedJSON = JSON.parse(uglyJSON);
    var prettyJSON = JSON.stringify(parsedJSON, null, 2);
    document.getElementById('saveImport').value = prettyJSON;
  } catch (error) {
    console.error('Invalid JSON format:', error);
  }
}

function prntscrn() {
  document.querySelector('body').style.overflow = "hidden";
  const node = document.getElementById('trees');
  const canvas = document.createElement('canvas');
  const modalwidth = `${node.clientWidth}px`;
  const modalheight = `${node.clientHeight}px`;
  canvas.width = node.clientWidth;
  canvas.height = node.clientHeight;

  const gridItems = document.querySelectorAll('.grid-item');
  gridItems.forEach(item => {
    const input = item.querySelector('input');
    if (input) {
      const inputVal = input.value;
      input.style.display = 'none';
      const spanElement = document.createElement('span');
      spanElement.style.width = '100%';
      spanElement.innerHTML = inputVal >= 1 ? inputVal : '&ZeroWidthSpace;';
      item.appendChild(spanElement);
    }
  });

  const modal = document.getElementById('myModal');
  const modalImg = document.getElementById('modalImg');
  modalImg.style.maxWidth = modalwidth;
  modalImg.style.width = "auto";
  modalImg.style.height = "auto";
  const close = modal.querySelector('.close');
  const scale = 2.5;
  const style = {
    transform: 'scale('+scale+')',
    transformOrigin: 'top left',
    width: node.offsetWidth + "px",
     height: node.offsetHeight + "px"
  }

  const param = {
      height: node.offsetHeight * scale,
      width: node.offsetWidth * scale,
        quality: 1,
      style
  }

  domtoimage.toPng(node, param).then(pngDataUrl => {
    const img = new Image();
    img.onload = () => {
      const context = canvas.getContext('2d');
      context.drawImage(img, 0, 0);
    };
    modalImg.src = pngDataUrl;
    const a = document.createElement('a');
    a.href = pngDataUrl;
    a.target = '_blank';
    a.download = 'image.png';
    modal.style.display = 'block';
  });

  close.onclick = () => {
    modal.style.display = 'none';
    document.querySelector('body').style.overflow = "";
    gridItems.forEach(item => {
      const span = item.querySelector('span');
      const input = item.querySelector('input');
      if (span) span.remove();
      if (input) input.style.display = '';
    });
  };
}

function sciToLetter(sci) {
  let [base, exponent] = sci.split(/e/i).map(parseFloat);
  let power = 10 ** (exponent % 3);
  const fixedValue = Math.abs(2 - (exponent % 3)); // get the reverse of modulo for toFixed
  let suffix = "";
  // if magnitude is 15 or more, then convert to gamehive letter
  // else use KMBT abbreviations
  if ((Math.floor(exponent/3)*3)>=15) {
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

// Page Helpers

function setTree() {
  PageHelper.treeSP();
  PageHelper.buildExport();
}

function resetTree() {
  PageHelper.resetTree();
  PageHelper.updateBrightness();
}

function copyToClipboard() {
  PageHelper.copyToClipboard();
}

function expand(button, elementId) {
  PageHelper.expand(button, elementId);
}

function toggleBtn(type) {
  PageHelper.toggleBtn(type);
}

function optimize() {
  if (document.getElementById("lockSettings").style.display !== "none") {
    toggleBtn('lock');
    document.getElementById("lockSettings").style.display = "none";
  }
  if (document.getElementById("selectSettings").style.display !== "none") {
    toggleBtn('select');
    document.getElementById("selectSettings").style.display = "none";
  }
  if (document.querySelector('.autoQol').getAttribute("data-qol") === 'true') {
    PageHelper.baselineQol();
  }
  PageHelper.toTree(Optimize.optTree(player.skillArray, player.currLevels, Number(playerstats["SkillPoints"])));
  PageHelper.totalEffect();
  PageHelper.save();
}

function save() {
  PageHelper.save();
  PageHelper.setBuildName();
  PageHelper.treeSP();
  PageHelper.totalEffect();
  PageHelper.buildExport();
  PageHelper.updateBrightness();
  PageHelper.toEffTable();
}

function load() {
  PageHelper.load();
  PageHelper.setMinMax();
  PageHelper.setBuildName();
  createClass();
  if (user) {
    PageHelper.setTree();
    PageHelper.totalEffect();
    PageHelper.toEffTable();
  }
  setEventListeners();
  
}

function resetPage() {
  var r = confirm("Are you sure you want to reset to default?");
  if (r == true) {
    localStorage.clear();
    caches.keys().then((keyList) => Promise.all(keyList.map((key) => caches.delete(key))))
    location.reload(true);
  }
}


// initialize new web worker
const worker = new Worker('javascripts/worker.js');

function setEventListeners() {

  document.querySelector('.calculate').addEventListener('click', () => {
    let totSP = $('SkillPoints').value;
    let treeSP = PageHelper.treeSP().reduce((partialSum, a) => partialSum + a, 0);
    if (totSP < treeSP) {
      Notification.notify.info('Not enough SP.');
      return;
    }
    // Disable button and notify start
    document.querySelector('.calculate').disabled = true;
    Notification.notify.info("Optimizing started");
    worker.postMessage('start');
  });
  
  worker.onmessage = function(e) {
    if (e.data === 'startOptimization') {
      optimize();
      worker.postMessage('finish');
    }

    if (e.data === 'finOptimization') {
      // Enable button and notify when finished
      document.querySelector('.calculate').disabled = false;
      Notification.notify.info("Optimizing finished");
    }
  };

  document.querySelector('.reset').addEventListener('click', () => {
      resetPage();
  });

  document.querySelector('.resetTree').addEventListener('click', () => {
    resetTree();
  });

  document.querySelector('.toggleSkills').addEventListener('click', function() {
    toggleBtn('select');
    expand(this, 'selectSettings');
  });

  document.querySelector('.toggleLock').addEventListener('click', function() {
    toggleBtn('lock');
    expand(this, 'lockSettings');
  });

  document.querySelector('.optimizeMode').addEventListener('click', () => {
    PageHelper.toggleMode(document.querySelector('.optimizeMode'));
    return false;
  });

  document.querySelector('.autoQol').addEventListener('click', () => {
    PageHelper.toggleQol(document.querySelector('.autoQol'));
    return false;
  });

  document.querySelectorAll('.buttonsTwo').forEach(element => {
    element.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', function() {
        PageHelper.doAll(this);
        return false;
      });
    });
  });

  document.querySelector('.shareImage').addEventListener('click', () => {
    prntscrn();
    return false;
  });

  document.querySelector('.shareLink').addEventListener('click', function() {
    PageHelper.genUrl(this);
    Notification.notify.info("Copied to Clipboard");
    return false;
  });

  document.querySelector('.import').addEventListener('click', function() {
    expand(this, 'import');
  });

  document.querySelector('.instructionsbtn').addEventListener('click', function() {
    expand(this, 'instructions');
  });

  document.querySelector('#importButton').addEventListener('click', () => {
    PageHelper.importSave(document.getElementById('saveImport').value);
  });

  document.querySelector('.advanced').addEventListener('click', function() {
    expand(this, 'advancedOptions');
  });

  document.querySelector('#exportString').addEventListener('click', () => {
    copyToClipboard();
    Notification.notify.info("Copied to Clipboard");
  });

  document.querySelector('.builder').addEventListener('click', function() {
    expand(this, 'builder');
  });

  document.querySelector('.buildSave').addEventListener('click', function() {
    PageHelper.toggleBuilder(this);
    PageHelper.builderSaveNames();
  });

  document.querySelector('.buildSaveMode').addEventListener('click', function() {
    PageHelper.buildSaveChange(this);
  });

  document.querySelector('.builderSave').addEventListener('click', function() {
    PageHelper.builderSave(this);
  });

  document.querySelector('.buildLoad').addEventListener('click', function() {
    PageHelper.toggleBuilder(this);
    PageHelper.builderLoadNames();
  });

  document.querySelector('.buildDelete').addEventListener('click', function() {
    PageHelper.toggleBuilder(this);
    PageHelper.builderDeleteNames();
  });

  document.querySelector('.builderDelete').addEventListener('click', () => {
    PageHelper.builderDelete();
  });

  document.querySelector('#totalEffect').addEventListener('click', function() {
    const element = document.querySelector('#totalEffect');
    const totalEffect = element.innerHTML.split(":");
    const format = element.getAttribute('data-format');
    let newFormat;
    
    switch (format) {
      case "sci":
        element.setAttribute('data-format', 'letter');
        newFormat = sciToLetter(totalEffect[1].trim());
        break;
      
      case "letter":
        element.setAttribute('data-format', 'sci');
        newFormat = letterToSci(totalEffect[1].trim());
        break;
    }
    element.innerHTML = `${totalEffect[0]}: ${newFormat}`;
  });

  document.querySelector('.nextLevels').addEventListener('click', function() {
    PageHelper.toEffTable();
    expand(this, "effTable");
  });

  document.querySelector('.downloadImg').addEventListener('click', function() {
    PageHelper.downloadImg();
  });

};


window.addEventListener('DOMContentLoaded', function() {
  load();
  PageHelper.skillImages();
  PageHelper.updateBrightness();
  PageHelper.fromUrl();
});

window.addEventListener('change', function() {
  save();
})

class Notification {
  static notify = {
    info: (text, duration) => this.showNotification(text, "notification--info", duration),
    warning: (text, duration) => this.showNotification(text, "notification--warning", duration),
  };

  static showNotification(text, elementClass, duration = 2000) {
    const template = document.createElement("div");
    template.classList.add("notification");
    const el = template.cloneNode();
    el.textContent = text;
    el.classList.add(elementClass);
    const container = document.getElementById("notification-container");
    container.appendChild(el);
    setTimeout(() => el.remove(), duration);
  }
}
