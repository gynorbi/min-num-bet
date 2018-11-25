MinNumBet.deployed().then(function(instance){return instance.createNewSession(web3.toWei(1.2,'ether'));});
MinNumBet.deployed().then(function(instance){return instance.placeBet(0,5,{value:web3.toWei(3,'ether')});});
MinNumBet.deployed().then(function(instance){return instance.placeBet(0,4,{value:web3.toWei(3,'ether'),from:"0xA522309b1b164fDd464117493DF604c07972c1af"});});
MinNumBet.deployed().then(function(instance){return instance.placeBet(0,4,{value:web3.toWei(3,'ether'),from:"0xFF21Bb983BF6a8d569ab9d486a7E58a88aE46586"});});
MinNumBet.deployed().then(function(instance){return instance.placeBet(0,5,{value:web3.toWei(3,'ether'),from:"0x3c5528fA5e12e95Cd3252BD73ca7acBDc047A26e"});});
MinNumBet.deployed().then(function(instance){return instance.placeBet(0,6,{value:web3.toWei(3,'ether'),from:"0xaE07D1AF3Fd3595c9d2870e7EC2F37f6f8Bd5478"});});
MinNumBet.deployed().then(function(instance){return instance.closeSession(0);});
MinNumBet.deployed().then(function(instance){return instance.getWinner(0);});
MinNumBet.deployed().then(function(instance){return instance.withdraw(0,{from:"0xe3bf1727e73d2d24dc5a9febea491a752a8c9895"});});

web3.fromWei(web3.eth.getBalance("0x55A8a30De87DE8a2EfBc781cf99B637B4BdCa74d"),'ether').toString()