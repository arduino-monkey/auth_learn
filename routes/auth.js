const router = require('express').Router();
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const {registerValidation, loginValidation} = require('../validation');
const bcrypt = require('bcrypt');

router.post('/register', async (req, res) => {
    //validate data
    const {error} = registerValidation(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    //check if email exist
    const emailExist = await User.findOne({email: req.body.email});
    if (emailExist) return res.status(400).send('Email Already exists');

    //hash password
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    //create a new user
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword
    });

    //create confirmation token
    const token = jwt.sign({id: user._id}, process.env.TOKEN_SECRET, {expiresIn: '15m'});

    const link = `http://localhost:3000/api/user/confirmation/${token}`;

    try{
        await user.save();
        res.send({link: link});  
    }catch(err){
        res.status(400).send(err);
    }
});

router.post('/login', async (req, res) => {
    const {error} = loginValidation(req.body); 
    if (error) return res.status(400).send(error.details[0].message);

    //check if email exist
    const user = await User.findOne({email: req.body.email});
    if (!user) return res.status(400).send('Email doesnot exist');

    // check if user has verified email
    if (!user.confirmed){
        const token = jwt.sign({id: user._id}, process.env.TOKEN_SECRET, {expiresIn: '15m'});
        const link = `http://localhost:3000/api/user/confirmation/${token}`;
        return res.send({message: "confirm Email First", link: link});
    }

    //check password
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send('Wrong PassWord');

    const token = jwt.sign({id: user._id}, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);
});

module.exports = router;