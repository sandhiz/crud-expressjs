const db = require('../database/connection');
const md5 = require('md5');

const checkLoginCredential = (body) =>{
   
    const password = md5(body.password)
    const SQLQuery =` SELECT * from users where userid='${body.userid}' and password ='${password}'`;
  
    //console.log(SQLQuery);
    return db.execute(SQLQuery);
  };

  const updateToken = (token,userid) =>{
    //const updatedate = new Date();

    const SQLQuery =`UPDATE users SET token = '${token}' WHERE userid = '${userid}'`;

    return db.execute(SQLQuery);
};

const deleteToken = () =>{
  //const updatedate = new Date();

  const SQLQuery =`UPDATE users SET token = null`;

  return db.execute(SQLQuery);
};

  module.exports = {
    checkLoginCredential,
    updateToken,
    deleteToken
}