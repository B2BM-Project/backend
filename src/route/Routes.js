const express = require('express');
const router = express.Router();
const { upload, uploadFiles, showPublicFiles } = require('../controller/taskController');

// Route for file upload

router.post('/upload', upload.array('multiFile', 2), uploadFiles);

// Route for showing files in the public directory
router.get('/public', showPublicFiles);

module.exports = router;
