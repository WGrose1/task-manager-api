const mongoose = require('mongoose');
var validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        age: {
            type: Number,
            validate(value) {
                if (value < 0) {
                    throw new Error('Must be older than 1!');
                }
            },
            default: 0
        },
        email: {
            type: String,
            unique: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error('Not a valid email!');
                }
            },
            trim: true,
            lowercase: true
        },
        password: {
            type: String,
            validate(value) {
                if (value.toLowerCase().includes('password')) {
                    throw new Error('Not a valid password!');
                }
            },
            required: true,
            trim: true,
            minlength: 7
        },
        tokens: [
            {
                token: {
                    type: String,
                    require: true
                }
            }
        ],
        avatar: {
            type: Buffer
        }
    },
    {
        timestamps: true
    }
);

//not stored in db, just used by mongoose
userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id', //where on the foreign field to get id
    foreignField: 'owner' //name of field on the ref: model that stores this
});

//middleware, called on object before save,  next() fucntion says we are done in here.DO it here rather than in each route request
userSchema.pre('save', async function(next) {
    const user = this;

    //true on first create and any updates
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

//remove a users tasks when they delete profile
userSchema.pre('remove', async function(next) {
    const user = this;
    await Task.deleteMany({ owner: user._id });
    next();
});

//method available on instances of User
userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);

    user.tokens = user.tokens.concat({ token: token });
    await user.save();
    return token;
};

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    delete userObject.password;
    delete userObject.tokens;
    delete userObject.avatar;

    return userObject;
};

//method available on model
userSchema.statics.findByCredentials = async function(email, password) {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('Unable to log in !');
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error('Unable to log in');
    }
    return user;

    next();
};

//create a mongoose model
const User = mongoose.model('User', userSchema);

module.exports = User;

// const me = new User({
//     name: '   Johhny  ',
//     email: 'MYEMAIL@ME.com',
//     password: 'dog12345'
// });

// me.save()
//     .then(() => {
//         console.log(me);
//     })
//     .catch(error => {
//         console.log(error);
//     });
