const express = require('express')
const jwt = require('jsonwebtoken')
const config  = require('config')
const User = require('../models/user_model')
const route = express.Router();
const Joi = require('joi')
const bcrypt = require('bcrypt')
const verifyToken = require('../middlewares/auth')


const schema = Joi.object({
    name: Joi.string()        
        .min(3)
        .max(10)
        .required(),

    password: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),    
    
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
})



route.get('/', verifyToken, (req, res) => {
    let result = listActiveUsers();
    result.then((users) => {
        res.json(users)
    }).catch(e => {
        res.status(400).json({
            error: e
        })
    })
})

route.post('/', verifyToken, (req, res) => {
    let body = req.body;    

    const {error, value} = schema.validate({
        name    : body.name,
        email   : body.email
    })

    if(!error){
        let result = createUser(body);

        result.then( user => {
            if(user){
                res.json({
                    name: user.name,
                    email: user.email
                })
            }else{
                res.status(400).json({
                    error: 'User already exists'
                })
            }
            
        }).catch( e => {
            res.status(400).json({
                error: e
            })
        })
    }else{
        res.status(400).json({
            error: error
        })
    }

    
})

route.put('/:email', verifyToken, (req, res) => {
    let body = req.body;

    const {error, value} = schema.validate({
        name    : body.name        
    })

    if(!error){
        let result = updateUser(req.params.email, body);
        result.then(value => {
            res.json({
                name: value.name,
                email: value.email
            })
        }).catch(e => {
            res.status(400).json({
                error: e
            })
        })
    }else{
        res.status(400).json({
            error: error
        })
    }

    
})

route.delete('/:email', verifyToken, (req, res) => {
    let result = disableUser(req.params.email);
    result.then(value => {
        res.json({
            name: value.name,
            email: value.email
        })
    }).catch(e => {
        res.json(400).json({
            error: e
        })
    })
})

async function listActiveUsers() {
    let users = await User.find({"state": true})
    .select({name: 1, email: 1});
    return users;
}
async function createUser(body) {
    let validate = await User.findOne({email: body.email})
    if(validate){
        return;
    }else{
        let user = new User({
            email       : body.email,
            name        : body.name,
            password    : bcrypt.hashSync(body.password, 10)
        });
        return await user.save();
    }    
}

async function updateUser(email, body) {
    let user = await User.findOneAndUpdate({"email": email}, {
        $set: {
            name: body.name,
            password: body.password
        }
    }, {new: true});

    return user;
}

async function disableUser(email) {
    let user = await User.findOneAndUpdate({"email": email}, {
        $set: {
            state: false
        }
    }, {new: true})
    return user;
}

module.exports = route;