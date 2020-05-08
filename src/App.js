import React from 'react';
import  WsStream  from "./component/WsStream";
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; 
import 'bootstrap-css-only/css/bootstrap.min.css'; 
import 'mdbreact/dist/css/mdb.css';


import {Button, Modal, Navbar, Nav } from 'react-bootstrap';


import ReactGA from 'react-ga';
ReactGA.initialize('UA-165433807-1');
ReactGA.pageview(window.location.pathname + window.location.search);

function MyVerticallyCenteredModal(props) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {props.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {props.body}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}



function App() {
  ReactGA.event({
    category: 'Websocket',
    action: 'Opened'
  });

  const [modalFAQShow, setModalFAQShow] = React.useState(false);
  const [modalFeedbackShow, setModalFeedbackShow] = React.useState(false);


  return (
    <div className="App">
      
  <Navbar bg="dark" variant="dark">
    <Navbar.Brand>
      cert transparency now!
    </Navbar.Brand>
    <Nav className="ml-auto">
      <Nav.Link href="#" onClick={() => setModalFAQShow(true)}>FAQ</Nav.Link>
      <Nav.Link href="#" onClick={() => setModalFeedbackShow(true)} >Feedback</Nav.Link>
    </Nav>
  </Navbar>

      <WsStream ReactGA={ReactGA}></WsStream>

      <MyVerticallyCenteredModal
        show={modalFAQShow}
        onHide={() => setModalFAQShow(false)}
        title={"What is this?"}
        body={<div><h3>Certificate Transparency</h3><blockquote>An Internet security standard and open source framework for monitoring and auditing digital certificates. The standard creates a system of public logs that seek to eventually record all certificates issued by publicly trusted certificate authorities, allowing efficient identification of mistakenly or maliciously issued certificates.<footer class="blockquote-footer"><cite>Wikipedia</cite></footer></blockquote><p>These enriched audit logs enable researchers to identify atomic indicators of interest at a glance.<br/>Use the shortcut links to view key pieces of certificate data as well as visit various threat intelligence portals.</p><p>~Happy Hunting!</p></div>}
      />

      <MyVerticallyCenteredModal
        show={modalFeedbackShow}
        onHide={() => setModalFeedbackShow(false)}
        title={"Feedback"}
        body={<form action="https://formspree.io/xyynyqba" method="POST" target="_blank"><label>Your email: <input className="form-control" type="text" name="_replyto"/></label><br/><label>Your message:<textarea  className="form-control"name="message"></textarea></label><br/><button className="btn btn-primary" type="submit" value="Send">Send</button></form>}
      />

    </div>
  );
}

export default App;
