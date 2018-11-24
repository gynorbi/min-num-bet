import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/iron-ajax/iron-request.js';
import '@polymer/paper-item/paper-icon-item.js';
import '../session-details/session-details.js';

/**
 * @customElement
 * @polymer
 */
class MinNumFeApp extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <iron-request id="getContract"></iron-request>
      <h1>All sessions</h1>
        <template is="dom-repeat" items=[[sessions]] as="session">
          <paper-icon-item focused="{{session.selected}}">
            <iron-icon icon="[[getSessionStatus(session)]]" slot="item-icon"></iron-icon>
            <paper-item-body>
              <span><b>Owner: [[session.owner]]</b></span> <span>Bet of this session: [[session.value]] ETH</span>
              <dom-if if="[[isThereWinner(session)]]">
                <span>Winner: [[session.winner]]</span>
              </dom-if>
              <iron-collapse opened="{{session.selected || 1}}">
                <h3>Bets</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Bet</th>
                    </tr>
                  </thead>
                  <tbody>
                  <template is="dom-repeat" items=[[session.bets]] as="bet">
                    <tr>
                      <td>[[bet.player]]</td>
                      <td>[[showBet(bet.bet)]]</td>
                    </tr>
                  </template>
                  </tbody>
                </table>
              </iron-collapse>
            </paper-item-body>
          </paper-icon-item>
        </template>
    `;
  }
  static get properties() {
    return {
      sessions: {
        type: Array
      },
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
      }
    };
  }
  constructor() {
    super();
    this.init();
  }
  async init() {
    await this.initWeb3();
    await this.initContract();
    this.sessions = await this.initSessionList();
    //this.addEventListener(this.bettingInstance.NewBet,this.updateSession);
    var t = this.bettingInstance.NewBet(this.updateSession);
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
  async initSessionList() {
    var sessionsLengthBigNumber = await this.bettingInstance.getSessionsLength();
    var sessionsLength = sessionsLengthBigNumber.toNumber();
    var sessions = [];
    for (var i = 0; i < sessionsLength; i++) {
      var sessionData = await this.getSessionData(i);
      sessions.push(sessionData);
    }
    return sessions;
  }
  async getSessionData(sessionId) {
    var sessionData = await this.bettingInstance.sessions(sessionId);
    var playersLengthBigInt = await this.bettingInstance.getNumberOfPlayers(sessionId);
    var playersLength = playersLengthBigInt.toNumber();
    var bets = [];
    for (var i = 0; i < playersLength; i++) {
      var playerData = await this.bettingInstance.getPlayerData(sessionId, i);
      bets.push({ player: playerData[0], bet: playerData[1].toNumber() });
    }
    return {
      id:sessionId,
      isOpen:sessionData[0],
      owner:sessionData[1],
      winner:sessionData[2],
      value:sessionData[3].toNumber(),
      hasBeenPaid:sessionData[4],
      bets:bets
    }
  }
  getSessionStatus(session){
    return session.isOpen ? "check" : session.hasBeenPaid ? "euro-symbol":"block";
  }
  isThereWinner(session){
    return !session.winner === '0x0000000000000000000000000000000000000000';
  }
  showBet(betAmmount){
    return betAmmount < 0 ? "*****" : betAmmount;
  }
  updateSession(error,event){
    if(!error){
      alert(event.args.sessionId.toNumber()+"|"+event.args.playerId.toNumber());
    }
  }
}

window.customElements.define('min-num-fe-app', MinNumFeApp);
