import React from 'react';
import  WsStream  from "./component/WsStream";
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; 
import 'bootstrap-css-only/css/bootstrap.min.css'; 
import 'mdbreact/dist/css/mdb.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
      <h1>Certificate Transparency Now!</h1>
      </header>
      <WsStream></WsStream>
    </div>
  );
}

export default App;
