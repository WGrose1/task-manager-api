const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async function(req, res, next) {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

        if (!user) {
            throw new Error();
        }

        //adds property onto req object so callback in route handler has access to it
        req.user = user;
        req.token = token;
        next();

        console.log('Authenticated ' + user.name);
    } catch (error) {
        res.status(401).send({ Error: 'Please Authenticate' });
    }
};

module.exports = auth;
