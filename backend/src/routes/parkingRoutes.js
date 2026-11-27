const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');
const { allowRoles } = require('../middleware/auth');

router.get('/status', allowRoles('admin', 'manager', 'staff'), parkingController.getStatus);
router.post('/barrier', allowRoles('admin', 'manager', 'staff'), parkingController.triggerBarrier);
router.get('/logs', allowRoles('admin', 'manager', 'staff'), parkingController.getLogs);

module.exports = router;
