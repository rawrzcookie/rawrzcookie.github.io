var $ = function(id) {
  return document.getElementById(id);
};


function azure_knight(CP) {
  if ($("AK").checked == true) {
    return 1.2 * 1.002 ** ((CP - 1) ** 0.8);
  } else {
    return 1;
  }
}

function chained_clockwork(CP) {
  if ($("CC").checked == true) {
    return 1.5 * 1.005 ** ((CP - 1) ** 0.8);
  } else {
    return 1;
  }
}

function calcMana(lb_level, siphon_level) {

  var slash = $("slash").value;
  var tps = Number($("tps").value);
  var bFury = fury[$("bFury").value];
  var sClone = clone[$("sClone").value];
  var NP = puppet[$("NP").value];
  var curRegen = $("curRegen").value;
  var LB = limit[$("LB").value]["Mana boost"];
  var manaPotion = potion[$("manaPotion").value];
  var CP = $("craft").value;

  // get Azure Knight
  var AK = azure_knight(CP);

  // get Chained Clockwork
  var CC = chained_clockwork(CP);

  // get Mystic Staff
  if ($("staff").checked == true) {
    var staff = 1.2;
  } else {
    var staff = 1;
  }

  // get Reckless Firepower
  if ($("RF").checked == true) {
    var RF = 3;
  } else {
    var RF = 0;
  }

  // get Lucky Foot (All Prob) Art
  if ($("lucky").checked == true) {
    var lucky = 1.1;
  } else {
    var lucky = 1;
  }

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

var list_by_regen = {};

function populate() {
  
  // reset lists
  for (var entry in list_by_regen) delete list_by_regen[entry];

  // loop over table and calculate Mana Regen
  var table = $("table");

  for (var i = 3; i < table.rows.length; i++) {


    for (var j = 1; j < table.rows[i].cells.length; j++) {

      var manaRegen = calcMana(i - 3, j - 1);

      table.rows[i].cells[j].innerHTML = manaRegen;

      var sumCost = limit[i - 3]["Cumulative cost"] + siphon[j - 1]["Cumulative cost"];

      // add to regen list
      list_by_regen[manaRegen] = {};
      list_by_regen[manaRegen]["Siphon Level"] = j - 1;
      list_by_regen[manaRegen]["LB Level"] = i - 3;
      list_by_regen[manaRegen]["SP Cost"] = sumCost;

      switch (true) {
        case (sumCost < 20):
          table.rows[i].cells[j].classList.add('group-1');
          break;
        case (sumCost < 40):
          table.rows[i].cells[j].classList.add('group-2');
          break;
        case (sumCost < 60):
          table.rows[i].cells[j].classList.add('group-3');
          break;
        case (sumCost < 80):
          table.rows[i].cells[j].classList.add('group-4');
          break;
        case (sumCost < 100):
          table.rows[i].cells[j].classList.add('group-5');
          break;
        case (sumCost < 120):
          table.rows[i].cells[j].classList.add('group-6');
          break;
        case (sumCost < 140):
          table.rows[i].cells[j].classList.add('group-7');
          break;
        case (sumCost < 160):
          table.rows[i].cells[j].classList.add('group-8');
          break;
        case (sumCost < 180):
          table.rows[i].cells[j].classList.add('group-9');
          break;
        case (sumCost < 200):
          table.rows[i].cells[j].classList.add('group-10');
          break;
        case (sumCost < 220):
          table.rows[i].cells[j].classList.add('group-11');
          break;
        case (sumCost < 240):
          table.rows[i].cells[j].classList.add('group-12');
          break;
        case (sumCost < 260):
          table.rows[i].cells[j].classList.add('group-13');
          break;
        case (sumCost < 280):
          table.rows[i].cells[j].classList.add('group-14');
          break;
        case (sumCost >= 280):
          table.rows[i].cells[j].classList.add('group-15');
      }
    }
  }
  $("tableregen").style.display = "block";
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

    $("suggestedRegen").innerHTML = suggested;
    $("suggestedSiphon").innerHTML = sortedRegen[suggested]["Siphon Level"];
    $("suggestedLB").innerHTML = sortedRegen[suggested]["LB Level"];
    $("suggestedCost").innerHTML = sortedRegen[suggested]["SP Cost"];

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


