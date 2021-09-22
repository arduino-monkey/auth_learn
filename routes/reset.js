const router = require('express').Router();
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

router.post('/forgot-password', async (req, res) => {
    const user = await User.findOne({email: req.body.email});
    if (!user) return res.status(400).send('Email doesnot exist');

    const secret = process.env.TOKEN_SECRET + user.password;
    const payload = {email: user.email, id: user._id};
    const token = jwt.sign(payload, secret, {expiresIn: '15m'});

    const link = `http://localhost:3000/api/user/reset-password/${user.id}/${token}`;

    res.send({link: link});
});

router.post('/reset-password/:id/:token', async (req, res) => {
    const {id, token} = req.params;

    const user = await User.findOne({_id: id});

    if(!user) return res.status(400).send('User doesnot exist');

    const secret = process.env.TOKEN_SECRET + user.password;
    
    try {
        const payload = jwt.verify(token, secret);

        const salt = await bcrypt.genSalt();
        const newPassword = await bcrypt.hash(req.body.newPassword, salt);
        
        await User.updateOne({_id: id}, {password: newPassword});
        res.send('Password updated');
    } catch (err){
        res.status(400).send(err);
        return;
    }

    

});

module.exports = router;