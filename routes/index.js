const express = require('express');
const appController = require('../controllers/AppController');

const router = express.Router();

router.get('/status', (req, res) => {
  appController.getStatus(req, res);
});

router.get('/stats', async (req, res) => {
  await appController.getStats(req, res);
});

module.exports = router;
