import 'babel-polyfill'
import { Connect, SimpleSigner } from 'uport-connect'
import {encode, decode, isMNID} from 'mnid'

import React from 'react';
import ReactDOM from 'react-dom';

const uport = new Connect('test app', {
  clientId: '2okax78bVo3dQEAYTGR6RCt8Mdy73oTTsEN',
  signer: SimpleSigner('44cf7c14e2ef2e9c237263aacb3e9b35a1721f4940fbf9910bbc2fb5a55c73b0')
})

const web3 = uport.getWeb3();

const UPORT_SAMPLE_APP_USER_CREDENTIALS_KEY = 'UPORT_SAMPLE_APP_USER_CREDENTIALS_KEY'

class App extends React.Component {
  async login() {
    try {
      const credentials = await uport.requestCredentials({
        // requested: ['name', 'phone', 'country'],
        notifications: true,
      })
      window.localStorage.setItem(UPORT_SAMPLE_APP_USER_CREDENTIALS_KEY, JSON.stringify(credentials))
      window.location.reload()
    } catch (e) {
      if (e.message !== 'Request Cancelled') {
        throw e
      } else {
        console.log(e.message);
      }
    }
  }

  async verify() {
    /**
     * This is temporary workaround that skip login flow if user has been logged in.
     * Must not use this in production.
     */
    const credentials = this.currentAccountCredentials();
    uport.pushToken = credentials.pushToken
    uport.address = credentials.address
    uport.publicEncKey = credentials.publicEncKey

    const res = await uport.attestCredentials({
      sub: this.currentAccountCredentials().address,
      claim: {
        "name": "takashi"
      },
      exp: new Date().getTime() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    })
    console.log(res);
  }

  logout() {
    window.localStorage.removeItem(UPORT_SAMPLE_APP_USER_CREDENTIALS_KEY);
    window.location.reload();
  }

  isUserLoggedIn() {
    return !!this.currentAccountCredentials()
  }

  currentAccountCredentials() {
    const credentials = window.localStorage.getItem(UPORT_SAMPLE_APP_USER_CREDENTIALS_KEY)
    return credentials ? JSON.parse(credentials) : credentials;
  }

  render() {
    return (
      <div>
        {
          this.isUserLoggedIn() ?
          <div>
            <button onClick={this.logout.bind(this)}>logout</button>
            <button onClick={this.verify.bind(this)}>send verification</button>
          </div> :
          <button onClick={this.login.bind(this)}>login with uport</button>
        }
      </div>
    )
  }
}

ReactDOM.render(<App />, document.querySelector('#app'));
