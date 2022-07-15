const limit =  {
    "0": {
       "SP cost": 0,
       "Cumulative cost": 0,
       "Mana cap": "0",
       "Mana boost": 1
    },
    "1": {
       "SP cost": 1,
       "Cumulative cost": 1,
       "Mana cap": "5",
       "Mana boost": 1.1
    },
    "2": {
       "SP cost": 1,
       "Cumulative cost": 2,
       "Mana cap": "8",
       "Mana boost": 1.15
    },
    "3": {
       "SP cost": 1,
       "Cumulative cost": 3,
       "Mana cap": "12",
       "Mana boost": 1.24
    },
    "4": {
       "SP cost": 2,
       "Cumulative cost": 5,
       "Mana cap": "19",
       "Mana boost": 1.31
    },
    "5": {
       "SP cost": 2,
       "Cumulative cost": 7,
       "Mana cap": "26",
       "Mana boost": 1.38
    },
    "6": {
       "SP cost": 2,
       "Cumulative cost": 9,
       "Mana cap": "35",
       "Mana boost": 1.45
    },
    "7": {
       "SP cost": 2,
       "Cumulative cost": 11,
       "Mana cap": "46",
       "Mana boost": 1.52
    },
    "8": {
       "SP cost": 3,
       "Cumulative cost": 14,
       "Mana cap": "62",
       "Mana boost": 1.59
    },
    "9": {
       "SP cost": 3,
       "Cumulative cost": 17,
       "Mana cap": "80",
       "Mana boost": 1.66
    },
    "10": {
       "SP cost": 3,
       "Cumulative cost": 20,
       "Mana cap": "103",
       "Mana boost": 1.73
    },
    "11": {
       "SP cost": 4,
       "Cumulative cost": 24,
       "Mana cap": "132",
       "Mana boost": 1.8
    },
    "12": {
       "SP cost": 4,
       "Cumulative cost": 28,
       "Mana cap": "168",
       "Mana boost": 1.87
    },
    "13": {
       "SP cost": 5,
       "Cumulative cost": 33,
       "Mana cap": "213",
       "Mana boost": 1.94
    },
    "14": {
       "SP cost": 6,
       "Cumulative cost": 39,
       "Mana cap": "269",
       "Mana boost": 2.01
    },
    "15": {
       "SP cost": 7,
       "Cumulative cost": 46,
       "Mana cap": "337",
       "Mana boost": 2.08
    },
    "16": {
       "SP cost": 8,
       "Cumulative cost": 54,
       "Mana cap": "421",
       "Mana boost": 2.15
    },
    "17": {
       "SP cost": 9,
       "Cumulative cost": 63,
       "Mana cap": "524",
       "Mana boost": 2.22
    },
    "18": {
       "SP cost": 11,
       "Cumulative cost": 74,
       "Mana cap": "652",
       "Mana boost": 2.29
    },
    "19": {
       "SP cost": 12,
       "Cumulative cost": 86,
       "Mana cap": "809",
       "Mana boost": 2.36
    },
    "20": {
       "SP cost": 14,
       "Cumulative cost": 100,
       "Mana cap": "1,000",
       "Mana boost": 2.43
    },
    "21": {
       "SP cost": 16,
       "Cumulative cost": 116,
       "Mana cap": "1,234",
       "Mana boost": 2.5
    },
    "22": {
       "SP cost": 18,
       "Cumulative cost": 134,
       "Mana cap": "1,520",
       "Mana boost": 2.57
    },
    "23": {
       "SP cost": 21,
       "Cumulative cost": 155,
       "Mana cap": "1,870",
       "Mana boost": 2.64
    },
    "24": {
       "SP cost": 24,
       "Cumulative cost": 179,
       "Mana cap": "2,295",
       "Mana boost": 2.71
    },
    "25": {
       "SP cost": 28,
       "Cumulative cost": 207,
       "Mana cap": "2,815",
       "Mana boost": 2.78
    }
 }
 
 const siphon = {
    "0": {
       "SP cost": 0,
       "Cumulative cost": 0,
       "Siphon amount": 0
    },
    "1": {
       "SP cost": 1,
       "Cumulative cost": 1,
       "Siphon amount": 1.4
    },
    "2": {
       "SP cost": 1,
       "Cumulative cost": 2,
       "Siphon amount": 1.596
    },
    "3": {
       "SP cost": 2,
       "Cumulative cost": 4,
       "Siphon amount": 1.827
    },
    "4": {
       "SP cost": 2,
       "Cumulative cost": 6,
       "Siphon amount": 2.086
    },
    "5": {
       "SP cost": 2,
       "Cumulative cost": 8,
       "Siphon amount": 2.378
    },
    "6": {
       "SP cost": 2,
       "Cumulative cost": 10,
       "Siphon amount": 2.717
    },
    "7": {
       "SP cost": 3,
       "Cumulative cost": 13,
       "Siphon amount": 3.109
    },
    "8": {
       "SP cost": 3,
       "Cumulative cost": 16,
       "Siphon amount": 3.55
    },
    "9": {
       "SP cost": 3,
       "Cumulative cost": 19,
       "Siphon amount": 4.056
    },
    "10": {
       "SP cost": 4,
       "Cumulative cost": 23,
       "Siphon amount": 4.636
    },
    "11": {
       "SP cost": 4,
       "Cumulative cost": 27,
       "Siphon amount": 5.298
    },
    "12": {
       "SP cost": 5,
       "Cumulative cost": 32,
       "Siphon amount": 6.054
    },
    "13": {
       "SP cost": 6,
       "Cumulative cost": 38,
       "Siphon amount": 6.926
    },
    "14": {
       "SP cost": 7,
       "Cumulative cost": 45,
       "Siphon amount": 7.917
    },
    "15": {
       "SP cost": 8,
       "Cumulative cost": 53,
       "Siphon amount": 9.052
    },
    "16": {
       "SP cost": 9,
       "Cumulative cost": 62,
       "Siphon amount": 10.35
    },
    "17": {
       "SP cost": 11,
       "Cumulative cost": 73,
       "Siphon amount": 11.842
    },
    "18": {
       "SP cost": 12,
       "Cumulative cost": 85,
       "Siphon amount": 13.551
    },
    "19": {
       "SP cost": 14,
       "Cumulative cost": 99,
       "Siphon amount": 15.505
    },
    "20": {
       "SP cost": 16,
       "Cumulative cost": 115,
       "Siphon amount": 17.735
    },
    "21": {
       "SP cost": 18,
       "Cumulative cost": 133,
       "Siphon amount": 20.296
    },
    "22": {
       "SP cost": 21,
       "Cumulative cost": 154,
       "Siphon amount": 23.229
    },
    "23": {
       "SP cost": 24,
       "Cumulative cost": 178,
       "Siphon amount": 26.58
    },
    "24": {
       "SP cost": 28,
       "Cumulative cost": 206,
       "Siphon amount": 30.424
    },
    "25": {
       "SP cost": 32,
       "Cumulative cost": 238,
       "Siphon amount": 34.82
    }
 }
 
 // NP Level : x Special Attempts
 const puppet = {
   "0": 1.00,
   "1": 1.01,
   "2": 1.02,
   "3": 1.03,
   "4": 1.04,
   "5": 1.05,
   "6": 1.06,
   "7": 1.07,
   "8": 1.08,
   "9": 1.09,
   "10": 1.10,
   "11": 1.11,
   "12": 1.12,
   "13": 1.13,
   "14": 1.14,
   "15": 1.15,
   "16": 1.16,
   "17": 1.17,
   "18": 1.18
 }
 
 // BF Level : Bonus Taps
 const fury = {
   "0": 0,
   "1": 1,
   "2": 2,
   "3": 3,
   "4": 4,
   "5": 5,
   "6": 6,
   "7": 8,
   "8": 10,
   "9": 12,
   "10": 15,
   "11": 18,
   "12": 21,
   "13": 24,
   "14": 27,
   "15": 30,
   "16": 30
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
 