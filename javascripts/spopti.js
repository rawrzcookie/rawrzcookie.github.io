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

function playerStats() {
    const inputs = ["typeDamage", "typeGold", "goldWeight", "FB", "FF", "Shae", "Ignus", "Ironheart", "Kor", "Styxsis", "Rygal", "CP", "sClone", "TimeToKill", "SkillPoints", "buildVersion", "MaxStage"];
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
    let y = [];
    let x = document.querySelectorAll('.grid-item');
    x.forEach((item) => {
      let input = item.querySelector('input');
      if (input) {
          y.push([input.value]);
      }
      });
      
    return y;
  }
  
  effArray() {
    let skillArray = [];
    this.setStats();

    for (let i in playerskills) {
        let talentID = playerskills[i]['ID'];
        let mythic = skillInfo[talentID]["Branch"];
        switch (mythic) {
            case "BranchRed":
                mythic = this.Shae;
                break;
            case "BranchOrange":
                mythic = this.Ignus;
                break;
            case "BranchYellow":
                mythic = this.Ironheart;
                break;
            case "BranchBlue":
                mythic = this.Kor;
                break;
            case "BranchGreen":
                mythic = this.Styxsis;
                break;
            case "BranchPurple":
                mythic = this.Rygal;
                break;
            default:
                mythic = 1;
                break;
        }
        let currEffs = Array(91).fill(1 * mythic);
        
        let currLevel = Number(playerskills[i]['Level']);
        let maxLevel = Number(skillInfo[talentID]['MaxLevel']);
        let stageReq = Number(skillInfo[talentID]["S0"]);

        let cumSP = 0;
        for (let i = 0; i <= maxLevel; i++) {
            if (i >= currLevel) {
            let j = (i - currLevel);
            currEffs[45 + j] = cumSP;
            }
            let cost = Number(skillInfo[talentID]["Co" + i]);
            cumSP += cost;
        }

        if (playerskills[i]['Selection'] == false || (this.MaxStage && this.MaxStage < stageReq)) {
          skillArray.push(currEffs);
          continue;
        }
        
        for (let j = currLevel; j < maxLevel; j++) {
            let k = (j - currLevel);
            
            let currA = Number(skillInfo[talentID]["A" + currLevel]);
            let nextA = Number(skillInfo[talentID]["A" + (j + 1)]);
            let currB = Number(skillInfo[talentID]["B" + currLevel]);
            let nextB = Number(skillInfo[talentID]["B" + (j + 1)]);
            let currC = Number(skillInfo[talentID]["C" + currLevel]);
            let nextC = Number(skillInfo[talentID]["C" + (j + 1)]);
            let cost = Number(currEffs[46 + k] - currEffs[45]);
            let reduction = Number(reductions[talentID][this.typeDamage] + (reductions[talentID][this.typeGold] * this.goldWeight));

            let efficiency = this._calcEff(talentID, currA, nextA, currB, nextB, currC, nextC, cost, reduction, this.FB, this.FF, this.goldWeight, "efficiency");

            currEffs[k] = efficiency * mythic;
        }
        
        skillArray.push(currEffs);
    }

    //this.skillArray = skillArray;
    return skillArray;
  }

  totalEffects() {
    let effectArr = []
    this.setStats();

    for (let i in playerskills) {
        let talentID = playerskills[i]['ID'];
        let mythic = skillInfo[talentID]["Branch"];
        switch (mythic) {
            case "BranchRed":
                mythic = this.Shae;
                break;
            case "BranchOrange":
                mythic = this.Ignus;
                break;
            case "BranchYellow":
                mythic = this.Ironheart;
                break;
            case "BranchBlue":
                mythic = this.Kor;
                break;
            case "BranchGreen":
                mythic = this.Styxsis;
                break;
            case "BranchPurple":
                mythic = this.Rygal;
                break;
            default:
                mythic = 1;
                break;
        }
        let currEffs = Array(91).fill(1 * mythic);
        
        let currLevel = Number(playerskills[i]['Level']);
        let maxLevel = Number(skillInfo[talentID]['MaxLevel']);

        let cumSP = 0;
        for (let i = 0; i <= maxLevel; i++) {
            if (i >= currLevel) {
            let j = (i - currLevel);
            currEffs[45 + j] = cumSP;
            }
            let cost = Number(skillInfo[talentID]["Co" + i]);
            cumSP += cost;
        }
        
        let k = currLevel;
        
        let currA = Number(skillInfo[talentID]["A" + currLevel]);
        let nextA = 1
        let currB = Number(skillInfo[talentID]["B" + currLevel]);
        let nextB = 1
        let currC = Number(skillInfo[talentID]["C" + currLevel]);
        let nextC = 1
        let cost = currEffs[45];
        let reduction = Number(reductions[talentID][this.typeDamage] + (reductions[talentID][this.typeGold] * this.goldWeight));

        let efficiency = this._calcEff(talentID, currA, nextA, currB, nextB, currC, nextC, 1, reduction, this.FB, this.FF, this.goldWeight, "curr");

        currEffs = efficiency * (mythic ** cost);
        
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
          next = ((10 * nextA) ** (nextB + multicast)) ** (reduction / cost);
          curr = ((10 * (currA ?? 1)) ** (!currB ? 0 : (currB + multicast))) ** (reduction / cost);
          efficiency = next / curr;
          break;
        
        // twilight multicast includes gloom damage
        case "TwilightGatheringMultiCastSkill":
          next = (((10 * nextA) ** (nextB + multicast)) ** (reduction / cost)) * (nextC ** (reduction / cost));
          curr = (((10 * (currA ?? 1)) ** (!currB ? 0 : (currB + multicast))) ** (reduction / cost)) * ((currC || 1) ** (reduction / cost));
          efficiency = next / curr;
          break;

        case "PetBonusBoost": // Ember Arts
          reduction_2 = Number(reductions["TapDmg"][this.typeDamage]);
          next = (nextA ** (reduction / cost)) * (nextB ** (reduction_2 / cost));
          curr = ((currA || 1) ** (reduction / cost)) * ((currB || 1) ** (reduction_2 / cost));
          efficiency = next / curr;
          break;

        case "BossDmgQTE": // Flash Zip
          next = (nextA ** (reduction / cost)) * ((nextB || 1) ** (reduction / cost));
          curr = ((currA || 1) ** (reduction / cost)) * ((currB || 1) ** (reduction / cost));
          efficiency = next / curr;
          break;

        case "HelperBoost": // Tactical Insight
          next = ((1 + nextA) ** (reduction / cost));
          curr = ((1 + currA) ** (reduction / cost));
          efficiency = next / curr;
          break;
        
        case "HelperInspiredWeaken": // Searing Light
          next = ((nextA * nextB) ** (reduction / cost));
          curr = (((currA || 1) * (currB || 1)) ** (reduction / cost));
          efficiency = next / curr;
          //efficiency = ((nextA * nextB) / (currA || 1) * (currB || 1)) ** (reduction / cost);
          break;

        case "HelperDmgQTE": // Astral Awakening
          next = (nextA ** (5 * reduction / cost));
          curr = ((currA || 1) ** (5 * reduction / cost));
          efficiency = next / curr;
          break;

        // Voltaic Sails, Weakpoint Throw
        case "ClanShipVoltage":
        case "CriticalHit":
          next = ((nextA * nextB) ** (reduction / cost));
          curr = (((currA || 1) * (currB || 1)) ** (reduction / cost));
          efficiency = next / curr;
          break;

        // Loaded Dice
          case "LoadedDice":
          reduction_2 = goldWeight;
          next = (nextA ** (reduction / cost)) * (nextB ** (reduction_2 / cost));
          curr = ((currA || 1) ** (reduction / cost)) * ((currB || 1) ** (reduction_2 / cost));
          efficiency = next / curr;
          break;

        case "CloneDmg": // Phantom Vengeance
          next = ((nextA * (4 + nextB)) ** (reduction / cost));
          curr = (((currA || 1) * (4 + currB)) ** (reduction / cost));
          if (returnValue == "curr") {
            curr = (((currA || 1) * (4 + currB) / 4) ** (reduction / cost));
          }
          efficiency = next / curr;
          break;

        case "CritSkillBoost": // Lightning Strike
          let LS = this._lightningStrike(currA, nextA, currB, nextB);
          next = (LS[0] ** (reduction / cost));
          curr = (LS[1] ** (reduction / cost));
          efficiency = next / curr;
          break;

        case "TerrifyingPact": // Terrifying Pact
          reduction_2 = playerskills["Royal Contract"]["Selection"] === true ? 1 : 0; // if RoCo is enabled
          next = (nextA ** (reduction / cost)) * (nextB ** (reduction_2 / cost));
          curr = ((currA || 1) ** (reduction / cost)) * ((currB || 1) ** (reduction_2 / cost));
          efficiency = next / curr;
          break;

        case "PoisonedBlade": // Poison Edge
          next = ((1 + (nextA * 10)) ** (reduction / cost));
          curr = ((1 + (currA * 10)) ** (reduction / cost));
          efficiency = next / curr;
          break;

        case "HandOfMidasMultiCastSkillBoost": // Midas Overflow
          gold_2 = this.typeGold !== "Chesterson" ? 1 : 0;
          let mc_bonus_A = [1, 100, 10000, 1000000, 100000000, 1000000000]
          let mc_bonus_B = [1, 10, 100, 1000, 10000, 50000]
          next = (((mc_bonus_A[nextB + multicast]) * (nextA) ** (nextB + multicast)) ** (reduction / cost)) * ((mc_bonus_B[(nextB + multicast)]) ** (gold_2 * goldWeight / cost));
          curr = (((mc_bonus_A[(!currB ? 0 : (currB + multicast))]) * ((currA ?? 1) ** (!currB ? 0 : (currB + multicast)))) ** (reduction / cost)) * ((mc_bonus_B[(!currB ? 0 : (currB + multicast))]) ** (gold_2 * goldWeight / cost));
          efficiency = next / curr;
          //efficiency = (((100 * nextA) ** (nextB + FB)) / ((100 * (currA ?? 1)) ** (!currB ? 0 : (currB + FB)))) ** (reduction / cost) * (((10) ** (nextB + FB)) / ((10) ** (!currB ? 0 : (currB + FB)))) ** (gold_2 * goldWeight / cost);
          break;

        case "KratosSummon": // Sprouting Salts
          next = ((nextA ** nextB) ** (reduction / cost));
          curr = ((currA ** currB || 1)) ** (reduction / cost);
          efficiency = next / curr;
          break;

        default:
          next = (nextA ** (reduction / cost));
          curr = ((currA || 1) ** (reduction / cost));
          efficiency = next / curr;
          //efficiency = (nextA / (currA || 1)) ** (reduction / cost);
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

    for (let i = 0; i < LS_Attempts; i++) {
        let next = 1 - (nextA * (nextB ** i));
        let curr = 1 - (currA * (currB ** i));
        LS_Next *= next;
        LS_Curr *= curr;
    }

    LS_Next = 1 / LS_Next;
    LS_Curr = 1 / LS_Curr;

    return [LS_Next, LS_Curr];
  }

  nextLevels() {
    let skillNames = Object.keys(skillInfo);
    let currLevels = this.currLevels;
    let skillArr = this.skillArray;
    let maxEffs = [[],[],[],[],[]];
    let length = skillArr.length;
    
    for (let i = 0; i < length; i++) {
      let arr = skillArr[i].slice(0,45)
      let costs = skillArr[i].slice(45,91);
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
    let imp = [];
    let maxSF = -Infinity;

    for (let i = 0; i < a.length; ++i) {
        if (i < 101 || a[i] > maxSF) {
            imp.push(i);
            maxSF = Math.max(maxSF, a[i]);
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
    let c = Array(8).fill().map(() => Array(a.length + b[0].length - 1).fill(-100000));
    let d = Array(8).fill().map(() => Array(a.length + b[0].length - 1).fill(-100000));
  
    a.forEach((val, i) => {
      if (val < 0) return;
      for (let mask = 0; mask < 8; mask++) {
        if (i > 0 && goodMasks[mask] === 0) continue;
        let newMask = (mask * 2 + (i > 0 ? 1 : 0)) % 8;
        let b1 = b[mask];
        let impj = this.getImportant(b1);
        impj.forEach(j => {
          if ((i === 0 || j >= req) && a[i] + b1[j] > c[newMask][i + j]) {
            c[newMask][i + j] = a[i] + b1[j];
            d[newMask][i + j] = i;
          }
        });
      }
    });
  
    return [c, d];
  }
  
  static mergeTrees(a, b, totSP) {
    let c = [], d = [];
    const tot = totSP + 1000;

    for (let mask = 0; mask < 8; ++mask) {
        let a1 = a[mask];
        let lenAB = a1.length + b.length;
        let c1 = new Array(lenAB).fill(-100000);
        let d1 = new Array(lenAB).fill(-100000);
        let impi = this.getImportant(a1);
        let impj = this.getImportant(b);

        for (let i of impi) {
            if (a1[i] >= 0) for (let j of impj) {
                let index = i + j;
                if (index > tot) break;
                let sum = a1[i] + b[j];
                if (sum > c1[index]) {
                    c1[index] = sum;
                    d1[index] = i;
                }
            }
        }

        c1.length = d1.length = Math.min(c1.length, tot);
        c.push(c1);
        d.push(d1);
    }
    return [c, d];
}


  static intoOne(a,b,which) {
    let c;
    let d;
    c=[];
    for (var i=0;i<a[0].length;++i) c.push(-100000);
    d=[];
    for (var i=0;i<a[0].length;++i) d.push([-1,-1]);
    for (var x=0;x<which.length;++x) {
      var i=which[x];
      for (var j=0;j<a[i].length;++j) {
        if (a[i][j]>c[j])
        {
          c[j]=a[i][j];
          d[j]=[b[i][j],i];
        }
      }
    }
    return [c,d];
  }

  
  static intoOneFastc(a,b,which) {
    let c = new Array(a[0].length).fill(-100000);
    for (var x=0;x<which.length;++x) {
      var i=which[x];
      for (var j=0;j<a[i].length;++j) {
        if (a[i][j]>c[j])
        {
          c[j]=a[i][j];
        }
      }
    }
    return [c];
  }
  
  static intoOneFastd(a, b, which, totSP) {
    let c = Number.NEGATIVE_INFINITY;;
    let d = [-1, -1];
    const whichLength = which.length;
    for (let x = 0; x < whichLength; ++x) {
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
    var optData = efficiencies;
    var goodRows = optData.length;
    var branches = this.treeBranch();
    var trees=[];
    var baseB=[[0],[0],[0],[0],[0],[0],[0],[0]];
    var tree=[[baseB,[]]];
    for (var i=0;i<goodRows;++i)
    {
      if (i>0 && branches[i][0]!=branches[i-1][0])
      {
        trees.push(tree);
        tree=[[baseB,[]]];
      }
      var maxLevInc=0;
      while (maxLevInc<45 && optData[i][maxLevInc+45]<optData[i][maxLevInc+46]) ++maxLevInc;
      var newArray=[];
      var maxSPCount=optData[i][maxLevInc+45];
      for (var j=0;j<=maxSPCount;++j) newArray.push(-100000);
      var SPU=optData[i][45];
      newArray[SPU]=0;
      for (var j=1;j<=maxLevInc;++j)
      {
        var SPC=optData[i][j+45];
        newArray[SPC]=(SPC-SPU)*Math.log10(optData[i][j-1]);
      }
      var SPReq=0;
      if (tree.length>=2) SPReq=3;
      if (tree.length>=5) SPReq=20;
      if (tree.length>=8) SPReq=50;
      if (tree.length>=11) SPReq=100;
      var goodMasks=[0,1,1,1,1,1,1,1];
      if (tree.length==1) goodMasks=[1,1,1,1,1,1,1,1];
      if (tree.length>=5 && tree.length<11) goodMasks=[0,0,0,0,1,1,1,1];
      if (i==10 || i==32) goodMasks=[0,1,0,1,0,1,0,1]; //T5 right
      if (i==54) goodMasks = [0,0,1,1,0,0,1,1]; //T5 mid
      if (i==43 || i==65) goodMasks=[0,0,0,0,1,1,1,1]; //T5 left
      tree.push(this.mergeEff(newArray,tree[tree.length-1][0],SPReq,goodMasks));
    }
    trees.push(tree);
    var totSP = SP;
    var prefTrees=[[baseB,baseB]];
    for (var i=0;i<trees.length;++i)
    {
      var oldVal=this.intoOneFastc(prefTrees[i][0],prefTrees[i][1],[0,1,2,3,4,5,6,7])[0];
      prefTrees.push(this.mergeTrees(trees[i][trees[i].length-1][0],oldVal,totSP));
    }
    let mode = document.querySelector('.optimizeMode').getAttribute("data-maxCumlEff") === 'true';
    if (mode) {
      let effVals = this.intoOneFastc(prefTrees[trees.length][0], prefTrees[trees.length][1], [0,1,2,3,4,5,6,7])[0];
      let SPused = Number(PageHelper.spUsed());
      let maxCumEff = effVals[totSP] / (totSP - SPused);
      let effValsLength = effVals.length;
      
      for (let i = totSP + 1; i < effValsLength; ++i) {
        let currentEff = effVals[i] / (i - SPused);
        maxCumEff = Math.max(maxCumEff, currentEff);
      }
      
      for (let i = totSP; i > SPused; --i) {
        if (effVals[i] / (i - SPused) >= maxCumEff) {
          totSP = i;
          break;
        }
      }
    }
    let levels=[];
    var oldLevels=currLevels;
    for (var i=trees.length;i>=1;--i)
    {
      var vaalFast=this.intoOneFastd(prefTrees[i][0],prefTrees[i][1],[0,1,2,3,4,5,6,7],totSP);
      var totSPinTree=vaalFast[0];
      var usedMasks=[vaalFast[1]];
      for (var j=trees[i-1].length-1;j>=1;--j)
      {
        var curValFast=this.intoOneFastd(trees[i-1][j][0],trees[i-1][j][1],usedMasks,totSPinTree);
        var SPHere=curValFast[0];
        var curMask=curValFast[1];
        var levHere=0;
        while (optData[goodRows-levels.length-1][levHere+45]!=SPHere)
        {
          ++levHere;
        }
        totSPinTree-=SPHere;
        levels.push(levHere);
        var cand=Math.floor(curMask/2);
        var minMask=0;
        if (j>1) minMask=1;
        if (j>=5 && j<11) minMask=4;
        usedMasks=[];
        if (cand>=minMask || SPHere==0) usedMasks.push(cand);
        usedMasks.push(cand+4);
      }
      totSPinTree=vaalFast[0];
      totSP-=totSPinTree;
    }
    var newLevels=[];
    for (var i=0;i<goodRows;++i)
    {
      if (oldLevels[i].length===0) newLevels.push([levels[goodRows-i-1]]);
      else newLevels.push([Number(levels[goodRows-i-1])+Number(oldLevels[i][0])]);
    }
    return newLevels;
  }
}

class PageHelper {

  static setMaxLevels() { // get max skill levels from skillInfo
    let max = [];
    for (let talentID in skillInfo) {
        let maxLevel = skillInfo[talentID]["MaxLevel"];
        max.push(maxLevel);
    }
    return max;
  }

  static setMinMax() { // apply min and max values for each skill
    // Select all 'div' elements with class "grid-item"
    let gridItems = document.querySelectorAll('.grid-item');
    let maxLevels = this.setMaxLevels();
    let i = 0;

    // Loop through each 'div' element and select its 'input' child element
    gridItems.forEach((item) => {
    let input = item.querySelector('input');
    if (input) {
        let maxLevel = maxLevels[i];
        input.setAttribute("min", "0");
        input.setAttribute("max", maxLevel);
        input.setAttribute("oninput", "PageHelper.checkValue(this);");
        i++;
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
    document.querySelector('#buildName').innerHTML = buildName;
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

    let gridItems;
    let locks = player.currLocks;
    let i = 0;
    
    // reset skill levels
    gridItems = document.querySelectorAll('.grid-item');

    gridItems.forEach((item) => {
      let input = item.querySelector('input');
      if (input) { // select only input fields
        let locked = locks[i][0];
        if (!locked) { // only reset if unlocked
          input.value = 0;
        }
        i++;
      }
    });

    // reset tree SP totals
    gridItems = document.querySelectorAll('.spTotal');

    gridItems.forEach((item) => {
        item.innerHTML = 0;
    })

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
                sum += optData[i][45];
                sumTotal += optData[i][45];
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
      sumTotal += optData[i][45];
    }
    return sumTotal;
  }

  static toTree(levels) { // take array of skill levels and apply them to the tree
    let i;    
    let gridItems; 

    gridItems = document.querySelectorAll('.grid-item');
    i = 0;

    gridItems.forEach((item) => {
    let input = item.querySelector('input');
    if (input) {
        input.value = (levels[i] == 0) ? "" : levels[i];
        i++;
    }
    })

    // save sequence

    save();
    this.buildExport();
    this.treeSP();
  }

  static saveSkillInfo() {  // get info for each skill and save to playerInfo
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
    let currLevels = [];
    let currSelections = [];
    let currLocks = [];
    // Select all 'div' elements with class "grid-item"
    let gridItems = document.querySelectorAll('.grid-item');

    // Loop through each 'div' element and select its 'input' child element
    gridItems.forEach((item) => {
    let input = item.querySelector('input');
    if (input) {
      let selected = input.getAttribute("data-select") === 'true';
      let locked = input.getAttribute("data-lock") === 'true';
      currLevels.push([input.value]);
      currSelections.push([selected]);
      currLocks.push([locked]);
    }
    });

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

  static toggleBtn(type) { // Toggle between value and checkbox for all input elements
    document.querySelectorAll('.grid-item input').forEach(function(input) {
      if (input.type === 'number') {
        // Store the original value in a data attribute
        input.setAttribute('data-original-value', input.value);
        input.setAttribute('data-type', type);
        input.setAttribute('onclick', 'PageHelper.checkboxCheck(this)');
        // Change the input type to checkbox
        input.type = 'checkbox';
      } else if (input.type === 'checkbox') {
        if (input.getAttribute('data-type') === type) {
          // Retrieve the original value from the data attribute
          input.value = input.getAttribute('data-original-value');
          // Change the input type back to number
          input.type = 'number';
          input.setAttribute('data-type', 'number')
        } else {
          input.setAttribute('data-type', type);
          if (type === 'lock') {
            // select then lock
            document.getElementById('selectSettings').style.display = "none";
          } else if (type === 'select') {
            // lock then select
            document.getElementById('lockSettings').style.display = "none";
          }
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
    element.innerHTML = mode ? 'Auto QoL: Off' : 'Auto QoL: On';
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
    let dmg = player.typeDamage;
    let gold = player.typeGold;
    let sp = player.SkillPoints;
    let currLevels = player.currLevels;
    let skillArr = [];

    let build = baseline[dmg][gold];

    let baselines = Object.keys(build).map(Number);
    
    let index = this.binarySearch(baselines, sp);
    let qol_baselines = build[baselines[index]];
    
    for (const [i, { Name: skillName }] of Object.entries(skillInfo)) {
      const index = Object.keys(skillInfo).indexOf(i);
      const curr_level = parseInt(currLevels[index]);
      const level = parseInt(qol_baselines[skillName] || 0);

      const value = !playerskills[skillName].Selection ? curr_level : Math.max(level, curr_level);
      
      skillArr.push(value);
    }

    this.toTree(skillArr);  
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
        for (let i in skillsObj) {
          skillArr.push([skillsObj[i]]);
        }
        
        // check for equipment sets
        let sets = [
          "Forsaken Battlemage",
          "Shae, the Radiant Beacon",
          "Ignus, the Volcanic Phoenix",
          "Ironheart, the Crackling Tiger",
          "Kor, the Whispering Wave",
          "Styxsis, the Single Touch",
          "Rygal, the Brilliant Engineer"
        ];

        let inputs = ["FB", "FF", "Shae", "Ignus", "Ironheart", "Kor", "Styxsis", "Rygal"]
  
        for (let i of sets) {
          let setObj = jsonObj["equipmentSets"];
          let setIndex = sets.indexOf(i);
          $(inputs[setIndex]).checked = setObj.includes(i)
        }
  
        // set shadowclone based off tfa
        let tFA = jsonObj["equipmentSets"].includes("The Fallen Angel");
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
    curGT = goldTypes[curGT] || CustomElementRegistry;

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
    // Get all the div elements with the class .grid-item that have an input child
    const gridItemsWithInput = document.querySelectorAll('.trees .grid-item input');
    let talentIds = Object.keys(skillInfo);
    let i = 0;

    // Loop through the selected elements and apply the style
    gridItemsWithInput.forEach((item, index) => {
      let name = talentIds[index];
      item.parentElement.style.backgroundImage = `linear-gradient(rgba(37,37,37,0.6), rgba(37,37,37,0.6)), url('images/skillicons/${name}.png')`;
      item.parentElement.style.backgroundSize = "cover";
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
    let sortedMaxEffs = player.nextLevels();
    let table = document.querySelector('.effTable');
    let tableCols = sortedMaxEffs[0].length;
    let tableRows = sortedMaxEffs.length;


    while (table.rows.length > 1) {
      table.deleteRow(1);
    }

    // Iterate over the array
    for (let i = 0; i < tableCols; i++) {
        // Create a new row
        let row = table.insertRow();

        // Iterate over the inner array
        for (let j = 0; j < tableRows; j++) {
            // Create a new cell
            let cell = row.insertCell();

            // Add the value from the array to the cell
            cell.textContent = sortedMaxEffs[j][i];
        }
    }
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
          } else if (["FB", "FF", "Shae", "Ignus", "Ironheart", "Kor", "Styxsis", "Rygal"].includes(key)) {
              $(key).checked = stats[key];
          } else {
              $(key).value = stats[key];
          }
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

      let gridItems = document.querySelectorAll('.grid-item');
      let i = 0;

      gridItems.forEach((item) => {
      let input = item.querySelector('input');
      if (input) {
          input.value = levels[i];
          input.setAttribute('data-select', selections[i]);
          input.setAttribute('data-lock', locked[i])
          i++;
      }
      });

      let exportString = this.buildExport();
      document.querySelector('#exportString').innerHTML=exportString;
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
    info: (text, duration) => this.showNotification(text, "notification--info", duration)
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

function test() {
  console.log("hiff");
}
