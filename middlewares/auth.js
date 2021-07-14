const jwt = require('jsonwebtoken');
const config = require('config')

let verifyToken = (req, res, next) => {
    let token = req.get('Autorization');
    jwt.verify(token, config.get('configToken.SEED'), (err, data) => {
        if(err){
            return res.status(401).json({
                err
            })
        }
        req.user = data.user;
        next();
    })
}

module.exports = verifyToken;