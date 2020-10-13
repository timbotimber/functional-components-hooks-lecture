const express = require('express');
const router = express();
const Project = require('../models/Project');

// get all the projects
router.get('/', (req, res) => {
  Project.find()
    .then(projects => {
      res.status(200).json(projects);
    })
    .catch(error => {
      res.json(error);
    })
});

// get a specific project
router.get('/:id', (req, res) => {
  Project.findById(req.params.id)
    .then(project => {
      if (!project) {
        res.status(404).json(project);
      } else {

        res.status(200).json(project);
      }
    })
    .catch(error => {
      res.json(error);
    })
});

// delete a project
router.delete('/:id', (req, res) => {
  Project.findByIdAndDelete(req.params.id)
    .then(project => {
      res.status(200).json({ message: 'ok' });
    })
    .catch(error => {
      res.json(error);
    })
});
// create a new project
router.post('/', (req, res) => {
  const { title, description } = req.body;
  Project.create({
    title,
    description,
    owner: req.user._id
  })
    .then(project => {
      res.status(201).json(project);
    })
    .catch(error => {
      res.json(error);
    })
})

// update a project
router.put('/:id', (req, res) => {
  const { title, description } = req.body;
  Project.findByIdAndUpdate(
    req.params.id,
    { title, description },
    { new: true }
  ).then(project => {
    res.status(200).json(project);
  })
    .catch(error => {
      res.json(error)
    })
})



module.exports = router;