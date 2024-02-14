const limit =  {
   "0": {
      "SP Cost": 0,
      "Cumulative cost": 0,
      "Mana cap": 0,
      "Mana boost": 1
   },
   "1": {
      "SP Cost": 1,
      "Cumulative cost": 1,
      "Mana cap": 4,
      "Mana boost": 1.1
   },
   "2": {
      "SP Cost": 2,
      "Cumulative cost": 3,
      "Mana cap": 10,
      "Mana boost": 1.26
   },
   "3": {
      "SP Cost": 3,
      "Cumulative cost": 6,
      "Mana cap": 22,
      "Mana boost": 1.4
   },
   "4": {
      "SP Cost": 4,
      "Cumulative cost": 10,
      "Mana cap": 42,
      "Mana boost": 1.53
   },
   "5": {
      "SP Cost": 5,
      "Cumulative cost": 15,
      "Mana cap": 72,
      "Mana boost": 1.64
   },
   "6": {
      "SP Cost": 6,
      "Cumulative cost": 21,
      "Mana cap": 114,
      "Mana boost": 1.74
   },
   "7": {
      "SP Cost": 7,
      "Cumulative cost": 28,
      "Mana cap": 169,
      "Mana boost": 1.84
   },
   "8": {
      "SP Cost": 8,
      "Cumulative cost": 36,
      "Mana cap": 240,
      "Mana boost": 1.93
   },
   "9": {
      "SP Cost": 10,
      "Cumulative cost": 46,
      "Mana cap": 338,
      "Mana boost": 2.03
   },
   "10": {
      "SP Cost": 12,
      "Cumulative cost": 58,
      "Mana cap": 469,
      "Mana boost": 2.12
   },
   "11": {
      "SP Cost": 14,
      "Cumulative cost": 72,
      "Mana cap": 635,
      "Mana boost": 2.22
   },
   "12": {
      "SP Cost": 18,
      "Cumulative cost": 90,
      "Mana cap": 870,
      "Mana boost": 2.33
   },
   "13": {
      "SP Cost": 23,
      "Cumulative cost": 113,
      "Mana cap": 1198,
      "Mana boost": 2.44
   },
   "14": {
      "SP Cost": 48,
      "Cumulative cost": 161,
      "Mana cap": 1974,
      "Mana boost": 2.64
   },
   "15": {
      "SP Cost": 69,
      "Cumulative cost": 230,
      "Mana cap": 2850,
      "Mana boost": 2.82
   }
}
 
 const siphon = {
   "0": {
      "SP Cost": 0,
      "Cumulative cost": 0,
      "Siphon amount": 0
   },
   "1": {
      "SP Cost": 1,
      "Cumulative cost": 1,
      "Siphon amount": 1.4
   },
   "2": {
      "SP Cost": 2,
      "Cumulative cost": 3,
      "Siphon amount": 1.72
   },
   "3": {
      "SP Cost": 3,
      "Cumulative cost": 6,
      "Siphon amount": 2.19
   },
   "4": {
      "SP Cost": 4,
      "Cumulative cost": 10,
      "Siphon amount": 2.8
   },
   "5": {
      "SP Cost": 5,
      "Cumulative cost": 15,
      "Siphon amount": 3.55
   },
   "6": {
      "SP Cost": 6,
      "Cumulative cost": 21,
      "Siphon amount": 4.44
   },
   "7": {
      "SP Cost": 7,
      "Cumulative cost": 28,
      "Siphon amount": 5.47
   },
   "8": {
      "SP Cost": 8,
      "Cumulative cost": 36,
      "Siphon amount": 6.64
   },
   "9": {
      "SP Cost": 10,
      "Cumulative cost": 46,
      "Siphon amount": 8.09
   },
   "10": {
      "SP Cost": 12,
      "Cumulative cost": 58,
      "Siphon amount": 9.81
   },
   "11": {
      "SP Cost": 14,
      "Cumulative cost": 72,
      "Siphon amount": 11.8
   },
   "12": {
      "SP Cost": 18,
      "Cumulative cost": 90,
      "Siphon amount": 14.35
   },
   "13": {
      "SP Cost": 23,
      "Cumulative cost": 113,
      "Siphon amount": 17.58
   },
   "14": {
      "SP Cost": 48,
      "Cumulative cost": 161,
      "Siphon amount": 24.25
   },
   "15": {
      "SP Cost": 69,
      "Cumulative cost": 230,
      "Siphon amount": 33.73
   }
}
 
 // NP Level : x Special Attempts
 const puppet = {
   "0": 1.00,
   "1": 1.02,
   "2": 1.04,
   "3": 1.06,
   "4": 1.07,
   "5": 1.08,
   "6": 1.09,
   "7": 1.10,
   "8": 1.11,
   "9": 1.11,
   "10": 1.12,
   "11": 1.13,
   "12": 1.13,
   "13": 1.14,
   "14": 1.14,
   "15": 1.15,
   "16": 1.16,
   "17": 1.16,
   "18": 1.17,
   "19": 1.17,
   "20": 1.17 
 }
 
 // BF Level : Bonus Taps
 const fury = {
   "0": 0,
   "1": 1,
   "2": 3,
   "3": 4,
   "4": 6,
   "5": 7,
   "6": 9,
   "7": 10,
   "8": 12,
   "9": 13,
   "10": 15,
   "11": 16,
   "12": 18,
   "13": 19,
   "14": 21,
   "15": 22,
   "16": 24,
   "17": 26,
   "18": 27,
   "19": 28,
   "20": 30
 }
 
 // Mana Potion Stacks : Mana Multiplier
 const potion = {
   "0": 1,
   "1": 1.5,
   "2": 1.75,
   "3": 2
 }
 
 // SC Level : Special Attempts
 const clone = {
   "1": 1.0,
   "2": 1.9,
   "3": 3.3,
   "4": 5.2,
   "5": 7.3,
   "6": 9.7,
   "7": 12.3,
   "8": 15.1,
   "9": 18.1,
   "10": 21.2,
   "11": 24.6,
   "12": 28.0,
   "13": 31.6,
   "14": 35.4,
   "15": 39.2,
   "16": 43.2,
   "17": 47.3,
   "18": 51.5,
   "19": 55.9,
   "20": 60.3,
   "21": 64.8,
   "22": 69.5,
   "23": 74.2,
   "24": 79.0,
   "25": 84.0,
   "26": 89,
   "27": 94.1,
   "28": 99.3,
   "29": 104.6,
   "30": 109.9,
   "31": 115,
   "32": 120,
   "33": 125,
   "34": 130,
   "35": 135
 }
 