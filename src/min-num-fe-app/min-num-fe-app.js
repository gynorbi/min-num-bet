import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item';
import '@polymer/iron-ajax/iron-request.js';

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
      <paper-listbox>
        <dom-repeat items=[[listItems]] >
          <template>
            <paper-item>Item [[item]]</paper-item>
          </template>
        </dom-repeat>
      </paper-listbox>
    `;
  }
  static get properties() {
    return {
      
      listItems:{
        type: Array,
        value: [1,2,3]
      },
      web3Provider: {
        type: Object,
        value: null
      },
      contracts: {
        type: Object,
        value: {}
      },
    };
  }
  constructor(){
    super();
    this.init();
  }
  async init() {
    await this.initWeb3();
    await this.initContract();
    this.listItems = await this.initSessionList();
  }
  async initWeb3(){
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
  async initContract(){
    var contractData = await this.$.getContract.send({url:"/build/contracts/MinNumBet.json", handleAs:"json"});
     // Get the necessary contract artifact file and instantiate it with truffle-contract
    var MinNumBetArtifact = contractData.response;
    this.contracts.MinNumBet = TruffleContract(MinNumBetArtifact);

    // Set the provider for our contract
    this.contracts.MinNumBet.setProvider(this.web3Provider);
  }
  async initSessionList(){
    var bettingInstance = await this.contracts.MinNumBet.deployed();
    return await bettingInstance.getSessions().response;
  }
}

window.customElements.define('min-num-fe-app', MinNumFeApp);
