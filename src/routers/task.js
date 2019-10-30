const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');

router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body);
    const task = new Task({
        //spread operator that puts everthing from req.body here
        ...req.body,
        owner: req.user._id
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

// GET /tasks?completed=true
// /tasks/limit=10&skip
//?sortBy=createdAt-asc
router.get('/tasks', auth, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'; //workaround to get bool value from querystring
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split('-');
        console.log(parts);
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    const owner = req.user._id;
    try {
        //const tasks = await Task.find({ owner });
        await req.user
            .populate({
                path: 'tasks',
                match,
                options: {
                    limit: parseInt(req.query.limit),
                    skip: parseInt(req.query.skip),
                    sort
                }
            })
            .execPopulate(); //same result as above but populates virtual field on user
        res.send(req.user.tasks);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findOne({
            _id,
            owner: req.user._id
        });
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidOperation = updates.every(update => {
        return allowedUpdates.includes(update);
    });

    if (!isValidOperation) {
        return res.status(400).send('Error, Invalid updates!');
    }

    try {
        //const task = await Task.findById(req.params.id);
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            return res.status(404).send();
        }
        //dynamically update properties, works with middleware
        updates.forEach(update => {
            task[update] = req.body[update];
        });
        //actually where middleware gets executed
        await task.save();

        res.send(task);
    } catch (error) {
        res.status(500).send();
    }
});

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        //const task = await Task.findByIdAndDelete(req.params.id);
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (error) {
        res.status(500).send();
    }
});

module.exports = router;
