import React from 'react';
import  WsStream  from "./component/WsStream";
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; 
import 'bootstrap-css-only/css/bootstrap.min.css'; 
import 'mdbreact/dist/css/mdb.css';

import ReactGA from 'react-ga';
ReactGA.initialize('UA-165433807-1');
ReactGA.pageview(window.location.pathname + window.location.search);

function App() {
  ReactGA.event({
    category: 'Websocket',
    action: 'Opened'
  });
  return (
    <div className="App">
      <header className="App-header">
      <h1>Certificate Transparency Now!</h1>
      </header>
      <WsStream ReactGA={ReactGA}></WsStream>
    </div>
  );
}

export default App;
