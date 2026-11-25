const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');

router.get('/', cardController.getAllCards);
router.post('/', cardController.upsertCard);
router.patch('/:uid/toggle', cardController.toggleCardStatus);
router.delete('/:uid', cardController.deleteCard);

module.exports = router;
