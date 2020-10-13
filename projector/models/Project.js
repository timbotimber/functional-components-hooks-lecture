const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const projectSchema = new Schema({
  title: String,
  description: String,
  owner: { type: Schema.Types.ObjectId, ref: 'User' }
});

const project = mongoose.model('Project', projectSchema);
module.exports = project;
