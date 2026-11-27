const express = require('express');
const { controller } = require('../controllers/userController');
const router = express.Router();

router.get('/', controller.list);
router.post('/', controller.create);
router.patch('/:uid', controller.update);
router.delete('/:uid', controller.remove);

module.exports = router;
