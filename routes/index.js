const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');

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

router.get('/users/me', async (req, res) => {
  await UsersController.getMe(req, res);
});

router.get('/connect', async (req, res) => {
  await AuthController.getConnect(req, res);
});

router.get('/disconnect', async (req, res) => {
  await AuthController.getDisconnect(req, res);
});

module.exports = router;
