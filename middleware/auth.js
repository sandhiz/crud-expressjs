require('dotenv').config();
const jwt = require('jsonwebtoken');
const UserModel = require('../models/usermodel');

const secretKey = process.env.SECRET_KEY;

const blacklist = [];

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ message: 'Silakan Login Untuk Mendapatkan JWT' });

  jwt.verify(token, secretKey, (err, user) => {
    if(err){
      if (err.name === 'TokenExpiredError'){
        UserModel.deleteToken()
        return res.status(401).json({
          message: 'Token Expired Silakan Login Lagi',
          error : err
         
         });
      }else{

        return res.status(401).json({
          message: 'Invalid Token',
          error : err
         
         });
      }
    }  


    if (blacklist.includes(token)) {
      UserModel.deleteToken()
      return res.status(401).json({ message: 'Token telah dicabut Silakan Login Lagi' });
    }

    if (req.path === '/logout') {
                 return next(); 
              }

    
    if (user.role === 'user') {
        if (req.path.startsWith('/products')) {
            next();
        } else {
            res.status(403).json({ message: 'Anda Tidak Di Perbolehkan mengakses endpoint ini' });
        }
    } else if (user.role === 'accounting' && req.path === '/payments') {
        next();
    } else {
        res.status(403).json({ message: 'Anda Tidak Di Perbolehkan mengakses endpoint ini' });
    }

  });
};

module.exports = {authenticateToken, blacklist, jwt, secretKey};