const router = require('express').Router();
const User = require('../model/User');
const jwt = require('jsonwebtoken');

router.get('/confirmation/:token', async (req, res) => {
    const {token} = req.params;

    try{
        const payload = jwt.verify(token, process.env.TOKEN_SECRET);
        
        const user = await User.findOne({_id: payload.id});
        if (!user) return res.status(400).send('User not found');

        if (user.confirmed) return res.send('Email already confirmed');

        await User.updateOne({_id: payload.id}, {confirmed: true});
        res.status(200).send('Email Confirmed');
    } catch(err){
        res.status(400).send(err);
    }
});

module.exports = router;