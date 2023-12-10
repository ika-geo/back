//Dependencies Imported :
const jwt = require('jsonwebtoken')
var config = require('../config/config.json')

//Importing Constants :
var constants_function = require('../constants/constants')
var constants = constants_function()

//Function to check authentication for Admin :
module.exports = async (req, res, next) => {
  try {
    //Verifying the Token :
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]
    const decoded = await jwt.verify(token, config.ADMIN_JWT_KEY)
    req.adminData = decoded
    next()

    //Error Catching :
  } catch (err) {
    res.status(401).json({
      status: {
        success: false,
        code: 401,
        message: constants.NOT_AUTHORIZED,
      },
    })
    console.log(err)
  }
}
