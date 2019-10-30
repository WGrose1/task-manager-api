const mongoose = require('mongoose');
var validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        description: {
            type: String,
            required: true,
            trim: true
        },
        completed: {
            type: Boolean,
            default: false
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User' //Reference to another mongoose model, must be typed same as when defined
        }
    },
    {
        timestamps: true
    }
);

userSchema.pre('save', async function(next) {
    const task = this;

    next();
});

//create a mongoose model
const Task = mongoose.model('Task', userSchema);

module.exports = Task;

// const task = new Task({
//     description: 'Get foods 111 Shop'
// });

// task.save()
//     .then(() => {
//         console.log(task);
//     })
//     .catch(error => {
//         console.log(error);
//     });
