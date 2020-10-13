// src/components/Project.js

import React, { useState, useEffect } from "react";
import axios from "axios";
import ProjectList from "./ProjectList";
import AddProject from "./AddProject";
import Child from "./Child.js";
import { UserContext } from "../contexts/UserContext.js";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState({
    name: "Timmy",
    location: "South Park",
  });

  const getData = async () => {
    let response = await axios.get("api/projects");
    setProjects(response.data);
  };

  useEffect(() => {
    getData();
  }, []);

  // <AddProject getData={getData} />
  // <ProjectList projects={projects} />

  return (
    <div className="projects-container">
      <UserContext.Provider value={{ user, setUser }}>
        <Child />
      </UserContext.Provider>
    </div>
  );
};

export default Projects;
