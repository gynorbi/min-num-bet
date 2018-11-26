import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-item';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/iron-ajax/iron-request.js';
import '@polymer/paper-card/paper-card.js';


/**
 * `session-details`
 * Displays all information about a session
 *
 */
class SessionDetails extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
        table {
          table-layout: fixed;
          width: 70%;
          border-collapse: collapse;
        }
        
        thead th:nth-child(1) {
          width: 70%;
        }
        
        thead th:nth-child(2) {
          width: 30%;
        }
        
        th, td {
          padding: 20px;
        }

        thead td {
          text-align: center;
        }

        tbody td {
          text-align: left;
        }
        
        .card-container {
          display: inline-block;
          width: 33.33%;
          color: black;
          text-decoration: none;
        }
        paper-card {
          display: block;
          margin: 5px;
        }
        paper-card h2 {
          margin: 4px;
          font-weight: normal;
        }
        paper-card p {
          margin: 4px;
          color: #999;
        }
        @media (max-width: 960px) {
          .card-container {
            width: 50%;
          }
        }

        @media (max-width: 719px) {
          .card-container {
            width: 100%;
          }
        }
      </style>
      <iron-request id="getContract"></iron-request>
      
      <paper-card>
        <div class="card-content">
          <iron-icon icon="[[getSessionStatus()]]" slot="item-icon"></iron-icon>
            <span><b>Owner: [[owner]]</b></span> <span>Stake of this session: [[transformToEther(sessionValue)]] ETH</span>
            <span>Winner: [[winner]]</span>
            <iron-collapse opened="{{selected || 1}}">
              <h3>Bets</h3>
              <table>
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Bet</th>
                  </tr>
                </thead>
                <tbody>
                <template is="dom-repeat" items=[[bets]] as="bet">
                  <tr>
                    <td>[[bet.player]]</td>
                    <td>[[showBet(bet.bet)]]</td>
                  </tr>
                </template>
                </tbody>
              </table>
            </iron-collapse>
              <div>
                <paper-input id="sendBet" label="Your bet" value={{currentBet}} required  auto-validate pattern="[0-9]*" error-message="Numbers only" invalid="{{invalidBet}}"></paper-input>
                <paper-button raised on-click="submitBet" session-id="[[id]]" bet="[[currentBet]]" session-value="[[sessionValue]]" disabled="[[disableBet(invalidBet, currentBet.length)]]">Bet</paper-button>
                <paper-button raised on-click="closeSession" session-id="[[id]]" disabled="[[disableCloseSession(isOpen,owner)]]">Close session</paper-button>
                <paper-button raised on-click="withdraw" session-id="[[id]]" disabled="[[disableWithdraw(hasBeenPaid, winner)]]">Withdraw</paper-button>
              </div>
        </div>
      </paper-card>
    `;
  }
  static get properties() {
    return {
      web3Provider: {
        type: Object,
        value: null
      },
      contracts: {
        type: Object,
        value: {}
      },
      bettingInstance: {
        type: Object,
        value: {}
      },
      id: {
        type: Number
      },
      isOpen: {
        type: Boolean
      },
      owner: {
        type: String
      },
      winner: {
        type: String
      },
      sessionValue: {
        type: Number
      },
      hasBeenPaid: {
        type: Boolean
      },
      bets: {
        type: Array
      }
    };
  }

  constructor(){
    super();
    this.init();
  }
  
  async init() {
    await this.initWeb3();
    await this.initContract();
    this.bettingInstance.NewBet({sessionId:this.id},{fromBlock:'latest'},this.updateBets.bind(this));
  }
  async initWeb3() {
    // Modern dapp browsers...
    if (window.ethereum) {
      this.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      this.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      this.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(this.web3Provider);
  }
  async initContract() {
    var contractData = await this.$.getContract.send({ url: "/build/contracts/MinNumBet.json", handleAs: "json" });
    // Get the necessary contract artifact file and instantiate it with truffle-contract
    var MinNumBetArtifact = contractData.response;
    this.contracts.MinNumBet = TruffleContract(MinNumBetArtifact);

    // Set the provider for our contract
    this.contracts.MinNumBet.setProvider(this.web3Provider);

    // Set up the instance of the contract
    this.bettingInstance = await this.contracts.MinNumBet.deployed();
  }
  getSessionStatus() {
    return this.isOpen ? "check" : this.hasBeenPaid ? "euro-symbol" : "block";
  }
  isThereWinner() {
    return this.winner !== '0x0000000000000000000000000000000000000000';
  }
  showBet(betAmmount) {
    return betAmmount < 0 ? "*****" : betAmmount;
  }
  disableBet(isBetInvalid, betInputLength) {
    if (isBetInvalid === undefined) return true;
    return isBetInvalid || betInputLength < 1;
  }
  disableCloseSession() {
    return !this.isOpen || this.owner !== web3.eth.accounts[0];
  }
  disableWithdraw() {
    return this.hasBeenPaid || this.winner !== web3.eth.accounts[0];

  }
  transformToEther(betInWei){
    return web3.fromWei(betInWei,'ether');
  }
  async updateBets(error, event) {
    if (!error) {
      var sessionId = event.args.sessionId.toNumber();
      var playerId = event.args.playerId.toNumber();
      if (playerId >= this.bets.length) {
        var playerData = await this.bettingInstance.getPlayerData(sessionId, playerId);
        this.push('bets',{ player: playerData[0], bet: playerData[1].toNumber() });
      }
    }
  }
  async submitBet(event) {
    var sessionId = event.currentTarget.sessionId;
    var bet = event.currentTarget.bet;
    var value = event.currentTarget.sessionValue;
    console.log(`Bet: ${bet}, SessionId: ${sessionId}, Value in ether: ${value}`);
    try {
      await this.bettingInstance.placeBet(sessionId, bet, { value: value });
    }
    catch (error) {
      console.log("Somthing went wrong: " + error);
    }
    this.$.sendBet.value="";
  }
  async closeSession(event) {
    var sessionId = event.currentTarget.sessionId;
    console.log(`Closing session with id '${sessionId}'.`);
    try {
      await this.bettingInstance.closeSession(sessionId);
    }
    catch (error) {
      console.log("Somthing went wrong: " + error);
    }
  }
  async withdraw(event) {
    var sessionId = event.currentTarget.sessionId;
    console.log(`Withdrawing winnings form session with id '${sessionId}'.`);
    try {
      await this.bettingInstance.withdraw(sessionId);
    }
    catch (error) {
      console.log("Somthing went wrong: " + error);
    }
  }
}

window.customElements.define('session-details', SessionDetails);
