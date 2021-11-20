const express = require('express');

const app = express.Router();

app.get('/fields', (req, res) => {
  try {
    res.json({
      returning: req.resolveFields(['id', 'name', 'createdAt', 'deletedAt'], ['id', 'name'])
    });
  } catch (e) {
    console.log(e);
    throw e;
  }
});

app.get('/alloc', (req, res) => {
  setTimeout(() => {
    let arr = Array(1e7).fill("some string");
    res.json({
      size: arr.length
    });

  }, 10000);
});

module.exports = app;