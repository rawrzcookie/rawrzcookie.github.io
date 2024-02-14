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
  playerstats["lucky"] = $("lucky").checked;
  playerstats["slash"] = $("slash").value;
  playerstats["tps"] = $("tps").value;
  playerstats["bFury"] = $("bFury").value;
  playerstats["sClone"] = $("sClone").value;
  playerstats["NP"] = $("NP").value;
  playerstats["curRegen"] = $("curRegen").value;
  playerstats["LB"] = $("LB").value;
  playerstats["manaPotion"] = $("manaPotion").value;
  playerstats["CP"] = $("CP").value;
  playerstats["AK"] = $("AK").checked;
  playerstats["CC"] = $("CC").checked;
  playerstats["RF"] = $("RF").checked;
  playerstats["staff"] = $("staff").checked;
  playerstats["neededRegen"] = $("neededRegen").value;
}

function azure_knight(CP) {
  let AK;
  if (playerstats["AK"] == true) {
    AK = 1.2 * 1.002 ** ((CP - 1) ** 0.8);
  } else {
    AK = 1;
  }
  return AK;
}

function chained_clockwork(CP) {
  let CC;
  if (playerstats["CC"] == true) {
    CC = 1.5 * 1.005 ** ((CP - 1) ** 0.8);
  } else {
    CC = 1;
  }
  return CC;
}

function mystic_staff() {
  let staff;
  if (playerstats["staff"] == true) {
    staff = 1.2;
  } else {
    staff = 1;
  }
  return staff;
}

function reckless_firepower() {
  let RF;
  if (playerstats["RF"] == true) {
    RF = 3;
  } else {
    RF = 0;
  }
  return RF;
}

function lucky_foot() {
  let lucky;
  if (playerstats["lucky"] == true) {
    lucky = 1.1;
  } else {
    lucky = 1;
  }
  return lucky;
}

function calcMana(lb_level, siphon_level) {

  playerStats();

  var slash = playerstats["slash"];
  var tps = Number(playerstats["tps"]);
  var bFury = fury[playerstats["bFury"]];
  var sClone = clone[playerstats["sClone"]];
  var NP = puppet[playerstats["NP"]];
  var curRegen = playerstats["curRegen"];
  var LB = limit[playerstats["LB"]]["Mana boost"];
  var manaPotion = potion[playerstats["manaPotion"]];
  var CP = playerstats["CP"];

  // get Azure Knight
  var AK = azure_knight(CP) || 1;

  // get Chained Clockwork
  var CC = chained_clockwork(CP) || 1;

  // get Mystic Staff
  var staff = mystic_staff() || 1;

  // get Reckless Firepower
  var RF = reckless_firepower() || 0;

  // get Lucky Foot (All Prob) Art
  var lucky = lucky_foot();

  // calc Mana Siphon
  var prob = slash * lucky;

  var specAttempts = sClone * CC * NP;

  var siphonAttempts = specAttempts + tps + bFury + RF;

  var siphonChance = 0.005 * prob;

  var manaSiphon = staff * AK * 60 * siphon[siphon_level]["Siphon amount"] * siphonAttempts * siphonChance;

  // calc new regen
  var baseRegen = curRegen / LB;

  var regen = (manaPotion * limit[lb_level]["Mana boost"] * (baseRegen + manaSiphon)).toFixed(2);

  //console.log(regen);
  return regen
}

function getClassName(sumCost) {
  if (sumCost < 20) return 'group-1';
  if (sumCost < 40) return 'group-2';
  if (sumCost < 60) return 'group-3';
  if (sumCost < 80) return 'group-4';
  if (sumCost < 100) return 'group-5';
  if (sumCost < 140) return 'group-6';
  if (sumCost < 180) return 'group-7';
  if (sumCost < 220) return 'group-8';
  if (sumCost < 260) return 'group-9';
  if (sumCost < 300) return 'group-13';
  return 'group-14';
}

var list_by_regen = {};

function populate() {

  // reset lists
  for (var entry in list_by_regen) delete list_by_regen[entry];

  // loop over table and calculate Mana Regen
  const table = document.querySelector("#table");
  const lb = Object.keys(limit);
  const lbLength = lb.length;
  const ms = Object.keys(siphon);
  const msLength = ms.length;

  
  while (table.rows.length > 2) {
    table.deleteRow(2);
  }

  let row = table.insertRow();
  for (let j = 0; j < msLength+1; j++) {
      let cell = row.insertCell();
      if (j === 0) {
          cell.innerHTML = ''; // Top-left cell is empty
          cell.classList.add('sticky-second-col');
      } else {
          cell.innerHTML = j - 1; // Other cells in the first row
      }
  }
  
  //for (var i = 3; i < table.rows.length; i++) {
  for (let i = 0; i < lbLength; i++) {
    let row = table.insertRow(); // Insert a new row
    let cell = row.insertCell();
    cell.innerHTML = i;
    cell.classList.add('sticky-second-col');

    //for (var j = 1; j < table.rows[i].cells.length; j++) {
    for (let j = 0; j < msLength; j++) {
      let cell = row.insertCell(); // Insert a new cell in the row
      let manaRegen = calcMana(i,j);
      cell.innerHTML = manaRegen;
      
      let sumCost = limit[i]["Cumulative cost"] + siphon[j]["Cumulative cost"];

      // add to regen list
      list_by_regen[manaRegen] = {};
      list_by_regen[manaRegen]["Siphon Level"] = j;
      list_by_regen[manaRegen]["LB Level"] = i;
      list_by_regen[manaRegen]["SP Cost"] = sumCost;

      if (i >= 0) {
        cell.classList.add(getClassName(sumCost));
      }
    }
  }
}

var sortedRegen = {};
var sortedSP = {};

// sort the lists and get best values
function sorted() {

  // reset lists
  for (var entry in sortedRegen) delete sortedRegen[entry];
  for (var entry in sortedSP) delete sortedSP[entry];

  // sort regen list
  let sortedRegenKeys = Object.keys(list_by_regen).sort((a, b) =>
    a - b
  );

  sortedRegenKeys.forEach((element) => {
    sortedRegen[element] = list_by_regen[element]
  });

  // sort SP list
  let sortedSPKeys = Object.keys(list_by_regen).sort((a, b) =>
    list_by_regen[a]["SP Cost"] - list_by_regen[b]["SP Cost"] || b - a
  );

  sortedSPKeys.forEach((element) => {
    sortedSP[element] = list_by_regen[element]
  })

}

var suggested;
var better = "None Found";

function suggestion() {

  if (Object.keys(list_by_regen).length == 0) {
    return;
  } else {
    var neededRegen = Number($("neededRegen").value);

    // get new values
    populate();

    // sort the regen lists
    sorted();

    // check for suggested levels
    for (keys in sortedRegen) {
      if (keys > neededRegen) {
        var suggested = keys;
        break;
      }
    };

    for (keys in sortedSP) {
      if ((Number(keys) > Number(suggested)) && (sortedSP[keys]["SP Cost"] < sortedRegen[suggested]["SP Cost"])) {
        var better = keys;
        break;
      } else {
        var better = "None Found";
      }
    };

    $("suggestedRegen").innerHTML = suggested || "None Found";
    $("suggestedSiphon").innerHTML = suggested ? sortedRegen[suggested]["Siphon Level"] : "None Found";
    $("suggestedLB").innerHTML = suggested ? sortedRegen[suggested]["LB Level"] : "None Found";
    $("suggestedCost").innerHTML = suggested ? sortedRegen[suggested]["SP Cost"] : "None Found";

    if (better == "None Found") {
      $("betterRegen").innerHTML = better;
      $("betterSiphon").innerHTML = better;
      $("betterLB").innerHTML = better;
      $("betterCost").innerHTML = better;
    } else {
      $("betterRegen").innerHTML = better;
      $("betterSiphon").innerHTML = sortedRegen[better]["Siphon Level"];
      $("betterLB").innerHTML = sortedRegen[better]["LB Level"];
      $("betterCost").innerHTML = sortedRegen[better]["SP Cost"];
    };

  }
}

function save() {
  playerStats();
  localStorage.setItem("playerInfo", JSON.stringify(user));
  user = JSON.parse(localStorage.getItem("playerInfo"));
  playerstats = user["stats"];
}

function load() {
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
          continue;
      } else if (["lucky", "AK", "CC", "RF", "staff"].includes(key)) {
        $(key).checked = stats[key];
      } else {
        $(key).value = stats[key];
      }
    }
  }
}