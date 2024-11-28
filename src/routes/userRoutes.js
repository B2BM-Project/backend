const express = require('express');
const router = express.Router();
const detail = require('../controllers/detail');
const propositionController = require('../controllers/proposition');

router.get('/proposition', propositionController.getAllPropositions);
router.get('/proposition/:id', propositionController.getPropositionById);
router.post('/proposition', propositionController.createProposition);
router.put('/proposition/:id', propositionController.updateProposition);
router.delete('/proposition/:id', propositionController.deleteProposition);


// เส้นทางสำหรับตรวจสอบ JWT /users/verify
router.get('/detail/:id',  detail.getById);
router.get('/detail', detail.getAll);


module.exports = router;
