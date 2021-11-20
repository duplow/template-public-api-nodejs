const express = require('express');

const app = express.Router();

app.post('/', (req, res, next) => {
  res.status(201).json('OK');
});

app.get('/', (req, res, next) => {
  res.json('OK');
});

app.get('/:id', (req, res, next) => {
  res.json('OK');
});

app.put('/:id', (req, res, next) => {
  res.json('OK');
});

app.delete('/:id', (req, res, next) => {
  res.json('OK');
});

module.exports = app;