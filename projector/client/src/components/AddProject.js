import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";

const AddProject = (props) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    axios
      .post("/api/projects", {
        title: title,
        description: description,
      })
      .then(() => {
        setTitle("");
        setDescription("");
        props.getData();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "title") {
      setTitle(value);
    }

    if (name === "description") {
      setDescription(value);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label htmlFor="title">Title: </Form.Label>
        <Form.Control
          type="text"
          id="title"
          name="title"
          value={title}
          onChange={handleChange}
        />
      </Form.Group>
      <Form.Group>
        <Form.Label htmlFor="description">Description: </Form.Label>
        <Form.Control
          type="text"
          id="description"
          name="description"
          value={description}
          onChange={handleChange}
        />
      </Form.Group>

      <Button type="submit">Add a project</Button>
    </Form>
  );
};

export default AddProject;
