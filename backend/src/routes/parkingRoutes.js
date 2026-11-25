const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');

router.get('/status', parkingController.getStatus);
router.post('/barrier', parkingController.triggerBarrier);
router.get('/logs', parkingController.getLogs);

module.exports = router;
