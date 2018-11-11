MinNumBet.deployed().then(function(instance){return instance.createNewSession();});
MinNumBet.deployed().then(function(instance){return instance.placeBet(0,5);});
MinNumBet.deployed().then(function(instance){return instance.placeBet(0,4,{from:"0xA522309b1b164fDd464117493DF604c07972c1af"});});
MinNumBet.deployed().then(function(instance){return instance.placeBet(0,4,{from:"0xFF21Bb983BF6a8d569ab9d486a7E58a88aE46586"});});
MinNumBet.deployed().then(function(instance){return instance.placeBet(0,5,{from:"0x3c5528fA5e12e95Cd3252BD73ca7acBDc047A26e"});});
MinNumBet.deployed().then(function(instance){return instance.placeBet(0,6,{from:"0xaE07D1AF3Fd3595c9d2870e7EC2F37f6f8Bd5478"});});
MinNumBet.deployed().then(function(instance){return instance.closeSession(0);});
MinNumBet.deployed().then(function(instance){return instance.getWinner(0);});