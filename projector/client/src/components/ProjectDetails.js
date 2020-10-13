import React, { Component } from 'react'
import axios from 'axios';
import { Button } from 'react-bootstrap';
import EditProject from './EditProject';

export default class ProjectDetails extends Component {

  state = {
    project: null,
    error: null,
    title: '',
    description: '',
    editForm: false
  }

  getData = () => {
    const id = this.props.match.params.id;
    axios.get(`/api/projects/${id}`)
      .then(response => {
        this.setState({
          project: response.data,
          title: response.data.title,
          description: response.data.description,
        })
      })
      .catch(error => {
        if (error.response.status === 404) {
          this.setState({
            error: 'Not found'
          })
        }
      })
  }

  deleteProject = () => {
    const id = this.props.match.params.id;
    axios.delete(`/api/projects/${id}`)
      .then(() => {
        this.props.history.push('/projects');
      })
      .catch(error => {
        console.log(error);
      })
  }

  handleChange = event => {
    const { name, value } = event.target;
    this.setState({
      [name]: value
    })
  }


  handleSubmit = event => {
    event.preventDefault();
    const id = this.props.match.params.id;
    axios.put(`/api/projects/${id}`, {
      title: this.state.title,
      description: this.state.description
    })
      .then((response) => {
        this.setState({
          project: response.data,
          title: response.data.title,
          description: response.data.description,
          editForm: false
        });
      })
      .catch(error => {
        console.log(error);
      })
  }

  toggleEditForm = () => {
    this.setState((state) => ({
      editForm: !state.editForm
    }))
  }

  componentDidMount() {
    this.getData();
  }

  render() {
    if (this.state.error) return <div>{this.state.error}</div>
    if (!this.state.project) return <p>Loading ...</p>

    let allowedToDelete = false;
    const user = this.props.user;
    const owner = this.state.project.owner;
    if (user && user._id === owner) allowedToDelete = true;

    return (
      <div>
        <h1>{this.state.project.title}</h1>
        <p>{this.state.project.description}</p>

        {allowedToDelete && (
          <Button variant='danger' onClick={this.deleteProject}>
            Delete Project
          </Button>
        )}

        <Button onClick={this.toggleEditForm}>
          Show Edit Form
        </Button>
        {this.state.editForm && (
          <EditProject
            {...this.state}
            handleChange={this.handleChange}
            handleSubmit={this.handleSubmit}
          />
        )}
      </div>
    )
  }
}
