require("dotenv").config();
const { INTERNAL_SERVER_ERROR, CONFLICT } = require("../../config/const");
const { DecryptedData } = require("../../config/encrypt_decrypt");
const { send_sqlError, send_response } = require("../../config/reponseObject");
const pool = require("../../connection/db");

const uniqueEmail = async (req, res, next) => {
  // console.log("req.body",req.body)
  if (req.body.user_id !== undefined) {
    var sql = `SELECT * FROM users WHERE email=? AND user_id != ?`;
    var sqlValues = [req.body.email, req.body.user_id];
  } else {
    sql = `SELECT * FROM users WHERE email=?`;
    sqlValues = [req.body.email];
  }

  await pool.query(sql, sqlValues, (err, result) => {
    if (err) {
      return send_sqlError(res)
      // return res.status(INTERNAL_SERVER_ERROR).json({
      //   status: false,
      //   code: INTERNAL_SERVER_ERROR,
      //   errors:
      //     req.body.staff_id !== undefined
      //       ? ["Unable to save staff member's details"]
      //       : ["Unable to save customer details"],
      // });
    }
    else if(result.length) {
      const obj = {
        res,
        status: false,
        code: CONFLICT,
        errors: ["Email already exist"],
      };
      return send_response(obj)
    } else {
      next();
    }
  });
};

module.exports = uniqueEmail;
