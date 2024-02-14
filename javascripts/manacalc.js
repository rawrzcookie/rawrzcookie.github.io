var $ = function (id) {
    return document.getElementById(id);
  };

var playerSpell = {
    "BurstDamage": {
       "Name": "Heavenly Strike",
       "Level": 0
    },
    "CritBoost": {
       "Name": "Deadly Strike",
       "Level": 0
    },
    "HandOfMidas": {
       "Name": "Hand of Midas",
       "Level": 0
    },
    "TapBoost": {
       "Name": "Fire Sword",
       "Level": 0
    },
    "HelperBoost": {
       "Name": "War Cry",
       "Level": 0
    },
    "ShadowClone": {
       "Name": "Shadow Clone",
       "Level": 0
    },
    "DualPet": {
       "Name": "Dual Summon",
       "Level": 0
    },
    "StreamOfBlades": {
       "Name": "Blade Stream",
       "Level": 0
    },
    "ThunderVolley": {
       "Name": "Thunder Ship",
       "Level": 0
    },
    "TwilightFairy": {
       "Name": "Twilight Fairies",
       "Level": 0
    }
 };

 var playerMulticast = {
   "BurstDamage": {
      "Name": "Heavenly Strike",
      "Level": 0
   },
   "CritBoost": {
      "Name": "Deadly Strike",
      "Level": 0
   },
   "HandOfMidas": {
      "Name": "Hand of Midas",
      "Level": 0
   },
   "TapBoost": {
      "Name": "Fire Sword",
      "Level": 0
   },
   "HelperBoost": {
      "Name": "War Cry",
      "Level": 0
   },
   "ShadowClone": {
      "Name": "Shadow Clone",
      "Level": 0
   },
   "DualPet": {
      "Name": "Dual Summon",
      "Level": 0
   },
   "StreamOfBlades": {
      "Name": "Blade Stream",
      "Level": 0
   }
};

// Calculte Contract Stuff

const contracts = {
   "FoCo": 1,
   "RoCo": 0.25 
};

function contractsCost(drain, duration) {

   // Arithmetic Sequence Sum
   var sumCost;

   var sumCost = drain * (((duration ** 2) + (duration)) / 2);

   return sumCost;
}

function contractsDuration(drain, pool) {

   // Arithmetic Sequence Sum; solve for n
   var poolDuration;

   var poolDuration = (-drain + ((drain ** 2) - (4 * drain * (-2 * pool))) ** 0.5) / (2 * drain);

   return poolDuration;
}

function contractsRegen(duration, drain, pool) {

   var poolDuration = contractsDuration(drain, pool);

   var timeRemain;

   if (poolDuration < duration) {
      var timeRemain = duration - poolDuration;
   } else {
      var timeRemain = 0;
   }

   var regenRateDuration = timeRemain * drain;

   var wasted = (regenRateDuration - 1) * (timeRemain / 2);

   var regenNeeded = (regenRateDuration * 60);

   return regenNeeded;

}

console.log(contractsRegen(120, 1.25, 6000))

// Calculate spell stuff


function spellCost(skill, level, arti) {

   //var lvl = "M" + level

   var cost = spell[skill]["M" + level] - artifacts[arti];

   if (cost < 4) {
      cost = 4;
   }

   return cost;
}

