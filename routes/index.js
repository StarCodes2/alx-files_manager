const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');

const router = express.Router();

router.get('/status', (req, res) => {
  AppController.getStatus(req, res);
});

router.get('/stats', async (req, res) => {
  await AppController.getStats(req, res);
});

router.post('/users', async (req, res) => {
  await UsersController.postNew(req, res);
});

module.exports = router;
