import React, { Component } from "react";
import { Form, Button } from "react-bootstrap";

const EditProject = ({ handleSubmit, title, handleChange, description }) => {
  return (
    <div>
      <h2>Edit the Project</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Title: </Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={title}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>Description: </Form.Label>
          <Form.Control
            type="text"
            name="description"
            value={description}
            onChange={handleChange}
          />
        </Form.Group>
        <Button type="submit">Edit</Button>
      </Form>
    </div>
  );
};

export default EditProject;
