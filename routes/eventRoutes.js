const express = require('express');
const controller = require('../controllers/eventControllers');
const {isLoggedIn, isHost, notHost} = require('../middlewares/auth');
const {validateId, validateResult, validateEvent} = require('../middlewares/validator');
const router = express.Router();

//GET /connections: sends all events to the user
router.get('/', controller.connections);

//GET /connections/new: send html form for creating a new event
router.get('/new', isLoggedIn, controller.new);

//POST /connections: create a new event
router.post('/', isLoggedIn, validateEvent, validateResult, controller.create);

//GET /connections/:id: send details of story identified by id
router.get('/:id', validateId, controller.show);

//GET /connections/:id/edit: send html form for editing an existing story
router.get('/:id/edit', isLoggedIn, validateId, isHost, controller.edit);

//PUT /connections/:id: update the event identified by id
router.put('/:id', isLoggedIn, validateId, isHost, validateEvent, validateResult, controller.update);

//DELETE /connections/:id: delete the story identified by id
router.delete('/:id', isLoggedIn, validateId, isHost, controller.delete);

//RSVP func
router.post('/:id/rsvp', isLoggedIn, validateId, notHost, controller.rsvp);

module.exports = router;