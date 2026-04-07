const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createTransaction, getTransaction, confirmTransaction, completeTransaction, requestReturn, submitRating, getHistory, payTransaction } = require('../controllers/transactionController');

router.use(auth); // all transaction routes require authentication

router.get('/history', getHistory); // must be before /:id
router.get('/:id', getTransaction);
router.post('/', createTransaction);
router.put('/:id/confirm', confirmTransaction);
router.put('/:id/complete', completeTransaction);
router.put('/:id/return', requestReturn);
router.put('/:id/pay', payTransaction);
router.post('/:id/rate', submitRating);

module.exports = router;
