import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import axios from "axios"

class App extends Component {
  state = {
    text: "",
    notes: []
  }
  componentDidMount(){
    this.loadNotes();
  }
  handleChange = event => {
    this.setState({text: event.target.value});
  }
  loadNotes = () => {
    axios.get("/api/notes").then(res => {
      console.log(res);
      this.setState({notes: res.data})
    })
  }
  sendNote = event => {
    axios.post("/api/create", { text: this.state.text}).then(res => {
      this.loadNotes();
    });
  }
  render() {
    return (
      <div>
        <div>
          Text: <input name="text" onChange={this.handleChange}value={this.state.value} />
          <button onClick={this.sendNote}>Click</button>
        </div>
        <div>
          <ul>
            {this.state.notes.map(note => {
              return (
                <li key={note._id}>{note.text}</li>
              )
            })}
          </ul>
        </div>
      </div>
    );
  }
}

export default App;
