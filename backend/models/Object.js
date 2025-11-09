const mongoose = require('mongoose');

const ObjectSchema = new mongoose.Schema({
  name: String,
  size: String,
  condition: String,
  price: Number,
});

module.exports = mongoose.model('Object', ObjectSchema);
