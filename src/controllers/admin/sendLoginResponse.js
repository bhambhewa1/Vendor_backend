const pool = require("../../connection/db");
const {
  INTERNAL_SERVER_ERROR,
  OK_AND_COMPLETED
} = require("../../config/const");
const { send_sqlError, send_response } = require("../../config/reponseObject");
const { DecryptedData } = require("../../config/encrypt_decrypt");


const sendLoginResponse = async (req, res) => {
    try{
        req.body.user_id = await DecryptedData(req.body.user_id);
        
      var sql = `update users set Request=? where user_id=?`
      await pool.query(sql, [req.body.requestVal, req.body.user_id], async (err, result) => {
        if (err) {
            console.log(err)
          return send_sqlError(res);
        }
        if (result.affectedRows) {
            const obj = {
              res,
              status: true,
              code: OK_AND_COMPLETED,
              message: "User request updated successfully",
            };
            return send_response(obj);
        }
    })
    } catch(err) {
        const obj = {
            res,
            status: false,
            code: INTERNAL_SERVER_ERROR,
            errors: ["Unable to update the user request"],
          };
          return send_response(obj);
    }
}


module.exports ={
    sendLoginResponse
}