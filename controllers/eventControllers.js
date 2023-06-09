const express = require('express');
const model = require('../models/event');
const rsvpModel = require('../models/rsvp');

//GET /connections: sends all events to user
exports.connections = (req, res, next)=>{
    model.find()
    .then(events=>res.render('./connections/index', {events}))
    .catch(err=>next(err));
};

//GET /connections/new: sends html form for creating a new event
exports.new = (req, res) => {
    res.render('./connections/newConnection');
};

//POST /connections: create a new event
exports.create = (req, res, next) => {
    let event = new model(req.body);
    event.host = req.session.user;
    if (event.category === "kpop") {
        event.src = "/images/kpop.png";
    } else {
        event.src = "/images/study.png";
    }
    
    event.save()
    .then((event)=>res.redirect('/connections'))
    .catch(err=> {
        if(err.name === "ValidationError") {
            err.status = 400;
        } else {
            err.status = 500;
        }
        next(err);
    })
    
};

//GET /connections/:id: send details of event identified by id
exports.show = (req, res, next) => {
    let id = req.params.id;

    Promise.all([model.findById(id).populate('host', 'username'), rsvpModel.countDocuments({ event: id, attendance: 'YES'})])
    .then(result=> {
        const [event, rsvp] = result;
        if(result) {
            return res.render('./connections/connection', {event, count: rsvp});
        } else {
            let err = new Error('Cannot find an event with id ' + id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err=>next(err));
};

//GET /connections/:id/edit: send html form to edit event
exports.edit = (req, res, next) => {
    let id = req.params.id;

    model.findById(id)
    .then(event=> {
        if(event) {
            return res.render('./connections/edit', {event});
        } else {
            let err = new Error('Cannot find an event with id ' + id);
            err.status = 404;
            return next(err);
        }
    })
    .catch(err=>next(err));
};

//PUT /connections/:id: update event identified by id
exports.update = (req, res, next) => {
    let event = req.body;
    let id = req.params.id;

    if (event.category === "kpop") {
        event.src = "/images/kpop.png";
    } else {
        event.src = "/images/study.png";
    }

    model.findByIdAndUpdate(id, event, { useFindAndModify: false, runValidators: true })
    .then(event=> {
        if(event) {
            res.redirect('/connections/' + id);
        } else {
            let err = new Error('Cannot find an event with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=> {
        if(err.name === "ValidationError") {
            err.status = 404;
        } else {
            err.status = 500;
        }
        next(err);
    })
    
};

//DELETE /connections/:id: delete the event identified by id
exports.delete = (req, res, next)=> {
    let id = req.params.id;

    Promise.all([model.findByIdAndDelete(id, { useFindAndModify: false, runValidators: true }), rsvpModel.deleteMany({ event: id })])
    .then(result=> {
        if(result) {
            res.redirect('/connections');
        } else {
            let err = new Error('Cannot find an event with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=> {
        if(err.name === "ValidationError") {
            err.status = 404;
        } else {
            err.status = 500;
        }
        next(err);
    });
    
};

//rsvp
exports.rsvp = (req, res, next)=> {
    let rsvp = new rsvpModel(req.body);
    let user = req.session.user;
    let event = req.params.id;


    rsvpModel.findOneAndUpdate({ user: user, event: event }, { event: event, attendance: rsvp.attendance }, {
        upsert: true
    })
    .then(()=> res.redirect('/user/profile'))
    .catch(err=> {
        if(err.name === "ValidationError") {
            err.status = 400;
        } else {
            err.status = 500;
        }
        next(err);
    });
};