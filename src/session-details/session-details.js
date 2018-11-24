import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-item';
import '@polymer/iron-collapse/iron-collapse.js';


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
      </style>
      <session-details tabindex="-1"
            id="[[item.id]]"
            is-open="[[item.isOpen]]" 
            owner="[[item.owner]]"
            winner="[[item.winner]]"
            value="[[item.value]]"
            has-been-paid="[[item.hasBeenPaid]]"
            bets="[[item.bets]]"
            >
          </session-details>
      <paper-icon-item focused="{{selected}}">
        <iron-icon icon="[[getSessionStatus()]]" slot="item-icon"></iron-icon>
        <paper-item-body>
          <span><b>Owner: [[owner]]</b></span> <span>Bet of this session: [[value]] ETH</span>
          <dom-if if="[[isThereWinner()]]">
            <span>Winner: [[winner]]</span>
          </dom-if>
          <iron-collapse opened="[[selected]]">
            <h3>Bets</h3>
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Bet</th>
                </tr>
              </thead>
              <tbody>
              <template is="dom-repeat" items=[[bets]]>
                <tr>
                  <td>[[item.player]]</td>
                  <td>[[showBet(item.bet)]]</td>
                </tr>
              </template>
              </tbody>
            </table>
          </iron-collapse>
        </paper-item-body>
      </paper-icon-item>
    `;
  }
  static get properties() {
    return {
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
      value: {
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
  getSessionStatus(){
    return this.isOpen ? "check" : this.hasBeenPaid ? "euro-symbol":"block";
  }
  isThereWinner(){
    return !this.winner === '0x0000000000000000000000000000000000000000';
  }
  showBet(bet){
    return bet < 0 ? "*****" : bet;
  }
}

window.customElements.define('session-details', SessionDetails);
