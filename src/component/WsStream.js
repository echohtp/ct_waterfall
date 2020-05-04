import React from 'react';
import Websocket from 'react-websocket';
import { MDBDataTable } from 'mdbreact';
import { getPublicSuffix } from 'tldjs';
import Axios from 'axios';

class WsStream extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      limit: 200,
      tData: [],
      issuers: {},
      tlds: {},
      done: false,
      filter_tlds: [],
      filter_issuers: []
    };

    this.handleInputChange = this.handleInputChange.bind(this)

  }

  entropy(str) {
    const len = str.length

    // Build a frequency map from the string.
    const frequencies = Array.from(str)
      .reduce((freq, c) => (freq[c] = (freq[c] || 0) + 1) && freq, {})

    // Sum the frequency of each character.
    return Object.values(frequencies)
      .reduce((sum, f) => sum - f / len * Math.log2(f / len), 0)
  }


  handleData(data) {


    console.log("data handled")
    let message = JSON.parse(data);

    if (message['message_type'] !== "certificate_update")
      return


    let nc = this.state.count + 1
    let tdata = this.state.tData;
    let iData = this.state.issuers;
    let tldData = this.state.tlds;
    // DO THE THINGS HERE



    for (let i = 0; i < message["data"]["leaf_cert"]["all_domains"].length; i++) {
      let t_before = new Date(message["data"]["leaf_cert"]["not_before"] * 1000)
      let t_after = new Date(message["data"]["leaf_cert"]["not_after"] * 1000)
      let t_dmn = {
        not_before: String(t_before.getMonth() + 1) + "/" + String(t_before.getDate()) + "/" + String(t_before.getFullYear()) + "  " + String(t_before.getHours()) + ":" + String(t_before.getMinutes() < 10 ? "0" + t_before.getMinutes() : t_before.getMinutes()) + ":" + String(t_before.getHours() < 12 ? "AM" : "PM"),
        not_after: String(t_after.getMonth() + 1) + "/" + String(t_after.getDate()) + "/" + String(t_after.getFullYear()) + "  " + String(t_after.getHours()) + ":" + String(t_after.getMinutes() < 10 ? "0" + t_after.getMinutes() : t_after.getMinutes()) + ":" + String(t_after.getHours() < 12 ? "AM" : "PM"),
        message: message,
        domain: message["data"]["leaf_cert"]["all_domains"][i],
        issuer: message['data']['chain'][0]['subject']['CN'],
        entropy: this.entropy(message["data"]["leaf_cert"]["all_domains"][i]),
        cert_link: message["data"]["cert_link"],
        ip: []

      }
      //getPublicSuffix
      if (t_dmn["domain"].charAt(0) !== "*") {

        Axios.get('https://dns.google.com/resolve?name=' + t_dmn["domain"] + '&type=A').then(function (response) {
          // handle success
          response.data.Answer.map((ip) => {
            t_dmn["ip"].push(ip["data"])
            return 1
          })
        })
          .catch(function (error) {
            // handle error
            console.log(error);
          })
          .then(function () {
            // always executed
            tldData[getPublicSuffix(message["data"]["leaf_cert"]["all_domains"][i])] = (typeof tldData[getPublicSuffix(message["data"]["leaf_cert"]["all_domains"][i])] != 'undefined' && tldData[getPublicSuffix(message["data"]["leaf_cert"]["all_domains"][i])] instanceof Array) ? tldData[getPublicSuffix(message["data"]["leaf_cert"]["all_domains"][i])] : []
            tldData[getPublicSuffix(message["data"]["leaf_cert"]["all_domains"][i])].push(t_dmn)
          });

      } else {
        t_dmn['ip'] = ["X"]
      }
      iData[message['data']['chain'][0]['subject']['CN']] = (typeof iData[message['data']['chain'][0]['subject']['CN']] != 'undefined' && iData[message['data']['chain'][0]['subject']['CN']] instanceof Array) ? iData[message['data']['chain'][0]['subject']['CN']] : []
      iData[message['data']['chain'][0]['subject']['CN']].push(t_dmn)
      tdata.push(t_dmn);
      this.setState({ tData: tdata, issuers: iData, tlds: tldData });
    }



    let done = false
    if (nc === this.state.limit) {
      done = true

      this.props.ReactGA.event({
        category: 'Websocket',
        action: 'We hit our internal limit'
      });
    }
    this.setState({ count: nc, done: done });

  }

  handleInputChange(e) {
    if (e.target.name === "tlds") {
      let filter_arr = this.state.filter_tlds
      if (filter_arr.includes(e.target.id) === true) {
        let idx = filter_arr.indexOf(e.target.id)
        filter_arr.splice(idx, 1)
      } else {
        filter_arr.push(e.target.id)
      }
      this.setState({ filter_tlds: filter_arr })
    }
    if (e.target.name === "issuers") {
      let filter_arr = this.state.filter_issuers
      if (filter_arr.includes(e.target.id) === true) {
        let idx = filter_arr.indexOf(e.target.id)
        filter_arr.splice(idx, 1)
      } else {
        filter_arr.push(e.target.id)
      }
      this.setState({ filter_issuers: filter_arr })
    }


    console.log(e.target.id)
  }

  render() {


    let rows = []
    if (this.state.filter_issuers.length > 0 || this.state.filter_tlds.length > 0) {
      let tArr = []
      this.state.filter_issuers.map((i) => {
        tArr.push(...this.state.issuers[i])
        return 1
      })

      this.state.filter_tlds.map((i) => {
        tArr.push(...this.state.tlds[i])
        return 1
      })
      tArr.map((i) => { rows.push({ "cert_link": <a href={i['cert_link']} rel="noopener noreferrer" target="_blank"> <span role="img" aria-label="visit this site">📜</span></a>, "domain": [i['domain'], <a href={"https://" + i['domain']} rel="noopener noreferrer" target="_blank"> <span role="img" aria-label="visit this site">⤴️</span></a>], ip: i["ip"].join(), issuer: i["issuer"], entropy: i['entropy'], not_before: i["not_before"], not_after: i["not_after"], "vt": <a href={"https://www.virustotal.com/gui/search/" + i['domain']} rel="noopener noreferrer" target="_blank"> <span role="img" aria-label="to vt">🦠❓</span></a> }); return 1; })
    } else {
      this.state.tData.map((i) => { rows.push({ "cert_link": <a href={i['cert_link']} rel="noopener noreferrer" target="_blank"> <span role="img" aria-label="visit this site">📜</span></a>, "domain": [i['domain'], <a href={"https://" + i['domain']} rel="noopener noreferrer" target="_blank"> <span role="img" aria-label="visit this site">⤴️</span></a>], ip: i["ip"].join(), issuer: i["issuer"], entropy: i['entropy'], not_before: i["not_before"], not_after: i["not_after"], "vt": <a href={"https://www.virustotal.com/gui/search/" + i['domain']} rel="noopener noreferrer" target="_blank"> <span role="img" aria-label="to vt">🦠❓</span></a> }); return 1; })
    }
    const data = {
      columns: [
        {
          label: ['certificate', <br />, <small>the certificate issued</small>],
          field: 'cert_link',
          width: 75
        },
        {
          label: ['domain', <br />, <small>filter on TLDs using the widget</small>],
          field: 'domain',
          sort: 'asc',
          width: 100
        },
        {
          label: ['ip', <br />, <small>ip addresses associated with domain</small>],
          field: 'ip',
          sort: 'asc',
          width: 100
        },
        {
          label: ['issuer', <br />, <small>certificate issuer</small>],
          field: 'issuer',
          sort: 'asc',
          width: 100
        },
        {
          label: ['not_before', <br />, <small>not valid before date</small>],
          field: 'not_before',
          sort: 'asc',
          width: 100
        },
        {
          label: ['not_after', <br />, <small>not valid after date</small>],
          field: 'not_after',
          sort: 'asc',
          width: 100
        },
        {
          label: ["entropy", <br />, <small>higher numbers = greater entropy</small>],
          field: "entropy",
          sort: 'asc',
          width: 100
        },
        {
          label: ["virustotal", <br />, <small>check the domain</small>],
          field: "vt",
          width: 75
        }
      ],
      rows: rows
    }


    return (
      <div style={{ margin: 0, padding: 0 }}>
        <div style={{ width: "98%", paddingLeft: "1%" }}>

          {
            !this.state.done && <Websocket url='wss://certstream.calidog.io' onMessage={this.handleData.bind(this)} /> 
            
          }

          {!this.state.done && <div><div className="loadingio-spinner-cube-fpz0k51mnpw"><div className="ldio-x6fsq21hkv">
            <div></div><div></div><div></div><div></div>
          </div></div> <p>Processing the first <strong>{this.state.count}/{this.state.limit}</strong> certificates</p></div>}


          {this.state.done &&


            <div className="row data_container">
              <div className="col-1 d_c_left" style={{ borderRight: "1px solid lightgrey" }}>
                <br /><br /><br />
                <small>filter issuers</small>

                <div className="filter-box">
                  <ul style={{ textDecoration: "none", textJustify: "left" }}>
                    {Object.keys(this.state.issuers).map((i) => (<div className="form-check" key={Math.random()}><input className="form-check-input" name="issuers" type="checkbox" checked={this.state.filter_issuers.includes(i) ? true : false} id={i} onChange={this.handleInputChange} /><label className="form-check-label" >{i}</label></div>))}
                  </ul>
                </div>
                <hr className="filter-hr" />
                <small>filter TLDs</small>

                <div className="filter-box">
                  <ul style={{ textDecoration: "none", textJustify: "left" }}>
                    {Object.keys(this.state.tlds).map((i) => (<div className="form-check" key={Math.random()}><input className="form-check-input" name="tlds" type="checkbox" checked={this.state.filter_tlds.includes(i) ? true : false} id={i} onChange={this.handleInputChange} /><label className="form-check-label" >.{i}</label></div>))}
                  </ul>
                </div>
              </div>
              <div className="col-11 d_c_left" >
                <MDBDataTable small bordered striped data={data} />
              </div>
            </div>
          }

        </div>
        <hr style={{ width: "100% !important", margin: 0 }} />
      </div>
    );
  }
}

export default WsStream;