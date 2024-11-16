const response  =  (statusCode,data, message, res ) =>{
    res.status(statusCode).json({
        code : statusCode,
        message : message,
        result : data

    });

}

module.exports = response;