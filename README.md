# React Authentication

## Backend

### Some of the code snippets for the backend logic are slightly different than what is in the code above. But the logic will be exactly the same.

```bash
$ npm install passport-local passport bcrypt  express-session connect-mongo
```

#### We add session and passport to our application.

```js
// app.js
//
const session = require('express-session');
const passport = require('passport');

require('./configs/passport');
```

#### And the express session configuration.

```js
// app.js
const MongoStore = require('connect-mongo')(session);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
  })
);
app.use(passport.initialize());
app.use(passport.session());
```

#### Remember to also add the SESSION_SECRET in the .env

```
// .env
SESSION_SECRET=XYZ
```

#### Now we add the configs folder with the passport configuration.

```bash
$ mkdir configs
$ touch configs/passport.js
```

```js
// configs/passport.js
const User = require('../models/User');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt'); // !!!
const passport = require('passport');

passport.serializeUser((loggedInUser, cb) => {
  cb(null, loggedInUser._id);
});

passport.deserializeUser((userIdFromSession, cb) => {
  User.findById(userIdFromSession, (err, userDocument) => {
    if (err) {
      cb(err);
      return;
    }
    cb(null, userDocument);
  });
});

passport.use(
  new LocalStrategy((username, password, next) => {
    User.findOne({ username }, (err, foundUser) => {
      if (err) {
        next(err);
        return;
      }

      if (!foundUser) {
        next(null, false, { message: 'Incorrect username.' });
        return;
      }

      if (!bcrypt.compareSync(password, foundUser.password)) {
        next(null, false, { message: 'Incorrect password.' });
        return;
      }

      next(null, foundUser);
    });
  })
);
```

#### Now let's add some auth routes.

```bash
$ touch routes/auth.js
```

#### The auth routes should seem familiar. We only add one that returns the logged in user.

```js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const passport = require('passport');

router.post('/signup', (req, res) => {
  const { username, password } = req.body;

  if (!password || password.length < 8) {
    return res
      .status(400)
      .json({ message: 'Your password must be 8 char. min.' });
  }
  if (!username) {
    return res.status(400).json({ message: 'Your username cannot be empty' });
  }

  User.findOne({ username: username })
    .then(found => {
      if (found) {
        return res
          .status(400)
          .json({ message: 'This username is already taken' });
      }

      const salt = bcrypt.genSaltSync();
      const hash = bcrypt.hashSync(password, salt);

      return User.create({ username: username, password: hash }).then(
        dbUser => {

          req.login(dbUser, err => {
            if (err) {
              return res
                .status(500)
                .json({ message: 'Error while attempting to login' });
            }
            res.json(dbUser);
          });
        }
      );
    })
    .catch(err => {
      res.json(err);
    });
});

router.post('/login', (req, res) => {
  passport.authenticate('local', (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Error while authenticating' });
    }
    if (!user) {
      return res.status(400).json({ message: 'Wrong credentials' });
    }
    req.login(user, err => {
      if (err) {
        return res
          .status(500)
          .json({ message: 'Error while attempting to login' });
      }
      return res.json(user);
    });
  })(req, res);
});

router.delete('/logout', (req, res) => {
  req.logout();
  res.json({ message: 'Successful logout' });
});

// returns the logged in user
router.get('/loggedin', (req, res) => {
  res.json(req.user);
});

module.exports = router;
```

#### And then we reference them in app.js

```js
// app.js
//
app.use('/api/auth', require('./routes/auth'));
```

#### We also have to add the User model.

```bash
$ touch models/User.js
```

```js
// models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: String,
    password: String
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);
module.exports = User;
```

#### After adding the user we also add an owner field to the projects model.

```js
// models/User.js
//
const projectSchema = new Schema({
  title: String,
  description: String,
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  tasks: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Task'
    }
  ]
});
```

#### We will also update the projects routes to add the owner.

```js
// routes/project.js
//
router.post('/', (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const owner = req.user._id;
  const tasks = [];

  Project.create({
    title,
    description,
    owner,
    tasks,
  })
//
```

#### Now we are done with the backend. 💪

## Frontend

#### First we need some methods to call the signup, login and logout routes on our backend.

```bash
$ touch mkdir src/services
$ touch src/services/auth.js
```

```js
// services/auth.js
import axios from 'axios';

const signup = (username, password) => {
  return axios
    .post('/api/auth/signup', { username, password })
    .then(response => {
      return response.data;
    })
    .catch(err => {
      return err.response.data;
    });
};

const login = (username, password) => {
  return axios
    .post('/api/auth/login', { username, password })
    .then(response => {
      return response.data;
    })
    .catch(err => {
      return err.response.data;
    });
};

const logout = () => {
  return axios
    .delete('/api/auth/logout')
    .then(response => {
      return response.data;
    })
    .catch(err => {
      return err.response.data;
    });
};

export { signup, login, logout };
```

#### When our app starts we want to first check if there is a logged in User in the session and then give this user to App.js as a prop.

```js
// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
// import axios
import axios from 'axios';

// get logged in user and pass it as a prop
axios.get('/api/auth/loggedin')
  .then(response => {
    const user = response.data;
    ReactDOM.render(
      <BrowserRouter>
        <App user={user} />
      </BrowserRouter>,
      document.getElementById('root')
    );
  });
//
```

#### We want to use a Signup component in the App.js - here we also add the user to the state
#### Therefore we turn App.js into a class component.

#### And we also have to add the state and the setState for the user
```js
// App.js
import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import { Route, Redirect } from 'react-router-dom';
import Projects from './components/Projects';
import Navbar from './components/Navbar';
import ProjectDetails from './components/ProjectDetails';
import TaskDetails from './components/TaskDetails';
import Signup from './components/Signup';

class App extends React.Component {

  state = {
    user: this.props.user
  }

  setUser = user => {
    this.setState({
      user: user
    })
  }

  render() {
    return (
      <div className='App' >
        <Navbar user={this.state.user} setUser={this.setUser} />

        <Route
          exact path='/projects'
          render={props => {
            if (this.state.user) return <Projects {...props}/>
            else return <Redirect to='/' />
          }}
        />
        <Route
          exact path='/projects/:id'
          render={props => <ProjectDetails {...props} user={this.state.user} />}
        />
        <Route
          exact path='/tasks/:id'
          component={TaskDetails}
        />
        <Route
          exact
          path='/signup'
          // to the Signup we have to pass a reference to the setUser method
          // this we cannot do via component={<some component>}
          // For this we use the render prop - The term “render prop” refers to a technique for sharing 
          // code between React components using a prop whose value is a function.
          // A component with a render prop takes a function that returns a React element and calls it 
          // instead of implementing its own render logic.
          render={props => <Signup setUser={this.setUser} {...props} />}
        />
      </div>
    );
  }
}

export default App;
```

#### Now let's add the signup component

```bash
$ touch components/Signup.js
```

```js
// components/Signup.js
import React, { Component } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { signup } from '../services/auth';

export default class Signup extends Component {
  state = {
    username: '',
    password: '',
    message: ''
  };

  handleChange = event => {
    const { name, value } = event.target;

    this.setState({
      [name]: value
    });
  };

  handleSubmit = event => {
    event.preventDefault();

    const { username, password } = this.state;

    signup(username, password).then(data => {
      if (data.message) {
        this.setState({
          message: data.message,
          username: '',
          password: ''
        });
      } else {
        this.props.setUser(data);
        this.props.history.push('/projects');
      }
    });
  };

  render() {
    return (
      <>
        <h2>Signup</h2>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group>
            <Form.Label htmlFor='username'>Username: </Form.Label>
            <Form.Control
              type='text'
              name='username'
              value={this.state.username}
              onChange={this.handleChange}
              id='username'
            />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='password'>Password: </Form.Label>
            <Form.Control
              type='password'
              name='password'
              value={this.state.password}
              onChange={this.handleChange}
              id='password'
            />
          </Form.Group>
          {this.state.message && (
            <Alert variant='danger'>{this.state.message}</Alert>
          )}
          <Button type='submit'>Signup</Button>
        </Form>
      </>
    );
  }
}
```

#### And let's also update the Navbar

```js
// components/Navbar.js

import React from 'react'
import { Link } from 'react-router-dom';
import { Navbar as Nav } from 'react-bootstrap';
import { logout } from '../services/auth';

const handleLogout = props => {
  logout().then(() => {
    props.setUser(null);
  });
};

const Navbar = props => {
  return (
    <Nav className='nav justify-content-end' bg='primary'>
      {props.user && <Nav.Brand>Welcome, {props.user.username}</Nav.Brand>}
      <Nav.Brand>
        <Link to='/'>Home</Link>
      </Nav.Brand>
      {props.user ? (
        <>
          <Nav.Brand>
            <Link to='/projects'>Projects</Link>
          </Nav.Brand>
          <Nav.Brand>
            <Link to='/' onClick={() => handleLogout(props)}>
              Logout
            </Link>
          </Nav.Brand>
        </>
      ) : (
          <>
            <Nav.Brand>
              <Link to='/signup'>Signup</Link>
            </Nav.Brand>
            <Nav.Brand>
              <Link to='/login'>Login</Link>
            </Nav.Brand>
          </>
        )}
    </Nav>
  )
}

export default Navbar;
```

#### We already referenced the Login component in Navbar.js so let's create it.

```bash
$ touch components/Login.js
```

```js
// components/Login.js

import React, { Component } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { login } from '../services/auth';

export default class Login extends Component {
  state = {
    username: '',
    password: '',
    message: ''
  };

  handleChange = event => {
    const { name, value } = event.target;

    this.setState({
      [name]: value
    });
  };

  handleSubmit = event => {
    event.preventDefault();

    const { username, password } = this.state;

    login(username, password).then(data => {
      if (data.message) {
        this.setState({
          message: data.message,
          username: '',
          password: ''
        });
      } else {
        // successfully logged in
        // update the state for the parent component
        this.props.setUser(data);
        this.props.history.push('/projects');
      }
    });
  };

  render() {
    return (
      <>
        <h2>Login</h2>
        <Form onSubmit={this.handleSubmit}>
          <Form.Group>
            <Form.Label htmlFor='username'>Username: </Form.Label>
            <Form.Control
              type='text'
              name='username'
              value={this.state.username}
              onChange={this.handleChange}
              id='username'
            />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor='password'>Password: </Form.Label>
            <Form.Control
              type='password'
              name='password'
              value={this.state.password}
              onChange={this.handleChange}
              id='password'
            />
          </Form.Group>
          {this.state.message && (
            <Alert variant='danger'>{this.state.message}</Alert>
          )}
          <Button type='submit'>Login</Button>
        </Form>
      </>
    );
  }
}
```

#### Now we also want to add a route to the Login component.

```js
// App.js
import Login from './components/Login';
// 
        <Route
          exact
          path='/login'
          render={(props) => <Login setUser={this.setUser} {...props}/>}
        />
//
```

#### Now we can use the logged in user in the ProjectDetails component to check if the user is allowed to delete the project.

```js
// components/ProjectDetails.js
  render() {
    if (this.state.error) return <div>{this.state.error}</div>
    if (!this.state.project) return (<></>)

    // we set a boolean if there is a loggedInUser and the user is also the owner of the project
    let allowedToDelete = false;
    const user = this.props.user;
    const owner = this.state.project.owner;
    if (user && user._id === owner) allowedToDelete = true;

    return (
      <div>
        <h1>{this.state.project.title}</h1>
        <p>{this.state.project.description}</p>
        // then we only show the button if the the deletion is allowed 
        {allowedToDelete && (
          <Button variant="danger" onClick={this.deleteProject}>
            Delete project
          </Button>
        )}
```

## Bonus

#### If we want to protect a route we can do it like this

```js
// App.js
        <Route
          exact
          path='/projects'
          // instead of component={Projects} we use a render props and an if else statement
          render={props => {
            if (this.state.user) return <Projects {...props} />
            else return <Redirect to='/' />
          }}
        />
```

#### We can create a custom component to protect a route.

```js
// components/ProtectedRoute
import React from 'react';
import { Route, Redirect } from 'react-router-dom';

// here we destructure the props - we rename the component prop by using the colon
const ProtectedRoute = ({
  component: Component,
  user,
  path,
  redirectPath = '/',
  ...rest
}) => {
  return (
    <Route
      path={path}
      render={props => {
        return user ? (
          <Component {...props} {...rest} user={user} />
        ) : (
            <Redirect to={redirectPath} />
          );
      }}
    />
  );
};

export default ProtectedRoute;
```

#### And use it in App.js

```js
// components/App.js
import ProtectedRoute from './components/ProtectedRoute';
// 
<ProtectedRoute
  exact
  path='/projects'
  // this is an additional prop that is taken care of with ...rest
  foo='bar'
  user={this.state.user}
  component={Projects}
/>
//
```
