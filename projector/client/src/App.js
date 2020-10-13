import React, { Component } from 'react';
import { Route, Redirect } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.css';
import Projects from './components/Projects';
import Signup from './components/Signup';
import Login from './components/Login';
import ProjectDetails from './components/ProjectDetails';
import Navbar from './components/Navbar';

class App extends Component {

  state = {
    user: this.props.user
  }

  setUser = user => {
    this.setState({
      user: user
    });
  }

  render() {
    return (
      <div className="App" >
        <Navbar user={this.state.user} setUser={this.setUser} />

        {/* <Route
          exact
          path='/projects'
          component={Projects}
        /> */}

        <Route
          exact
          path='/projects'
          render={props => {
            if (this.state.user) {
              return <Projects {...props} />
            } else return <Redirect to='/' />
          }}
        />

        <Route
          exact
          path='/projects/:id'
          render={props => <ProjectDetails user={this.state.user} {...props} />}
        />

        <Route
          exact
          path='/signup'
          render={props => <Signup setUser={this.setUser} {...props} />}
        />
        <Route
          exact
          path='/login'
          render={props => <Login setUser={this.setUser} {...props} />}
        />
      </div>
    );
  }
}

export default App;
