require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../../connection/db");
const {
  INTERNAL_SERVER_ERROR,
  BAD_REQUEST,
  SEE_OTHER,
  OK,
} = require("../../config/const");
const { EncryptedData, DecryptedData } = require("../../config/encrypt_decrypt");
const { send_sqlError, send_response } = require("../../config/reponseObject");


const UpdatingRequest = (emailID) => {
  return new Promise((resolve, reject) => {
   let sql = `update users set Request=? where email=?`;
    pool.query(sql, [ 1, emailID ], async (err, result) => {
    if (err) {
      reject(err);
      return send_sqlError(res)
    }
    if (result.affectedRows) {
      resolve(result);
    }
  })
 })
}


const login = async (req, res) => {
  const user_type = req.body.type;

   var sql = "SELECT * FROM users WHERE email = ?";
 
  // Searching user detail for matching credential
  const emailID = req.body.email;
  await pool.query(sql, [emailID], async (err, result) => {
    if (err) {
      send_sqlError(res)
    }
    if (result?.length === 0) {
      const obj = {
        res,
        status: false,
        code: BAD_REQUEST,
        errors: [
          "Email address doesn't exist, please create account first",
        ],
      }
      return send_response(obj)
    } else {
      result[0].user_id = EncryptedData(result[0].user_id);
      const userMatch = result[0];
      const submittedPass = req.body.password;
      const savedPass = userMatch.password;

      // Compare hash and plain password
      const passwordDidMatch = await bcrypt.compare(submittedPass, savedPass);
      if (user_type === result[0].type && passwordDidMatch) {
        if(user_type === "Vendor"){
          if(result[0].Request === 0){
             await UpdatingRequest(emailID);
             const obj = {
              res,
              status: false,
              code: SEE_OTHER,
              errors: ["Your request sent to Admin, Please wait and login again"],
            };
            return send_response(obj);
          }
          if(result[0].Request === 1){
            const obj = {
              res,
              status: false,
              code: SEE_OTHER,
              errors: ["Your request is pending, Please contact to Admin"],
            };
            return send_response(obj);
          }
        }

        // Create and assign new token
        const token = jwt.sign(
          {
            user_id: userMatch.user_id,
          },
          process.env.TOKEN_SECRET_KEY,
          { expiresIn: "1d" }
        );

        res.header("auth-token", token).json({
          status: true,
          code: OK,
          message: `Login successful`,
          token: token,
          user_id: userMatch.user_id,
          user_type: userMatch.type,
          errors: [],
        });
      } else {
        const obj = {
          res,
          status: false,
          code: SEE_OTHER,
          errors: ["Incorrect Credentials !"],
        };
        send_response(obj);
      }
    }
  });
};

module.exports = { login };