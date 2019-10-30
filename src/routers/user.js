const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
//es6 destructuring
const { sendWelcomeEmail, sendCancelEmail } = require('../Emails/account');

//auth = middleware, only calls callback on next()
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);

    // try {
    //     const users = await User.find({});
    //     res.send(users);
    // } catch (error) {
    //     res.status(500).send();
    // }
});

router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        //shorthand object syntax, could be {user:user,token:token}
        res.status(201).send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (e) {
        res.status(400).send();
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            //loop through all tokens and return true for each one that isnt this sessions token, meaning the false on is filtered out
            return token.token !== req.token;
        });
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send();
    }
});

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send();
    } catch (e) {
        res.status(500).send();
    }
});

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every(update => {
        return allowedUpdates.includes(update);
    });

    if (!isValidOperation) {
        return res.status(400).send('Error, Invalid updates!');
    }

    try {
        const user = req.user;

        //dynamically update properties, works with middleware
        updates.forEach(update => {
            user[update] = req.body[update];
        });

        //actually where middleware gets executed
        await user.save();

        //bypasses mongoose, meaning middleware doesnt run.
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

        res.send(user);
    } catch (error) {
        res.status(500).send();
    }
});

router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id);
        // if (!user) {
        //     return res.status(404).send();
        // }
        // res.send(user);

        await req.user.remove();
        sendCancelEmail(req.user.email, req.user.name);
        res.send(req.user);
    } catch (error) {
        res.status(500).send();
    }
});

//location uploads from multer will be stored
const upload = multer({
    // dest: 'avatars', //destination of upload in filesystem
    limits: {
        fileSize: 3000000 //3mb. Limit In Bytes, always set !!
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return callback(new Error('File Must be a JPG, JPEG or PNG'));
        }

        return callback(undefined, true);
        // callback(new Error('File Must be a PDF')); //reject upload
        // callback(undefined,true); //accept upload
        // callback(undefined, false);  //silently reject upload
    }
});

//avatar is the key name in the form-data
router.post(
    '/users/me/avatar',
    auth,
    upload.single('avatar'),
    async (req, res) => {
        const buffer = await sharp(req.file.buffer)
            .resize({ width: 250, height: 250 })
            .png()
            .toBuffer();

        req.user.avatar = buffer;
        await req.user.save();
        res.send('File Uploaded');
    },
    (error, req, res, next) => {
        res.status(400).send({ error: error.message });
    }
);

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send('Avatar Deleted');
});

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (error) {
        res.status(404).send();
    }
});

module.exports = router;

// //==={id: parameter}
// //dynamic parameter after :
// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id;
//     try {
//         const user = await User.findById(_id);
//         if (!user) {
//             return res.status(404).send();
//         }
//         res.send(user);
//     } catch (error) {
//         res.status(500).send();
//     }
// });
