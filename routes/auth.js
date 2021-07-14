const express = require('express')
const config = require('config')
const jwt = require('jsonwebtoken')
const User = require('../models/user_model')
const route = express.Router();
//const Joi = require('joi')
const bcrypt = require('bcrypt')


route.post('/', (req, res) => {
    let body = req.body;
    User.findOne({email: body.email})
        .then(data => {
            if(data){
                const validPassword = bcrypt.compareSync(body.password, data.password);
                if(!validPassword){
                    return res.status(400).json({
                        error: 'ok',
                        msg: 'Wrong email or password'
                    })
                }
                const jwtoken = jwt.sign({
                    user: {_id: data._id, name: data.name, email: data.email}
                 }, config.get('configToken.SEED'), { expiresIn: config.get('configToken.expiration') });
                // jwt.sign({_id: data._id, name: data.name, email: data.email}, 'password') 
                res.json({
                    user: {
                        _id: data._id,
                        name: data.name,
                        email: data.email
                    },
                    jwtoken
                })                                
            }else{
                res.status(400).json({
                    error: 'ok',
                    msg: 'Wrong email or password'
                })
            }     

        }).catch(err => {
            res.status(400).json({
                msg: 'Wrong email or password'
            })
        })
    
})

module.exports = route;