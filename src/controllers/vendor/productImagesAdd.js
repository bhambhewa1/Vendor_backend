const bcrypt = require("bcrypt");
const pool = require("../../connection/db");
const {
  INTERNAL_SERVER_ERROR,
  CREATED,
  PROMPT_CODE,
  OK_AND_COMPLETED,
  BAD_REQUEST,
  OK_WITH_CONFLICT,
  OK,
} = require("../../config/const");
const { send_sqlError, send_response } = require("../../config/reponseObject");
const {
  DecryptedData,
  EncryptedData,
} = require("../../config/encrypt_decrypt");

const productImagesAdd = async (req, res, data) => {
  try{
    let keys = ["user_id", "product_id", "image_url"];
    let values = [req.body.user_id, req.body.product_id, data.img_url];
    var sql = `INSERT INTO images (${keys}) VALUES (?)`;
    
    await pool.query(sql, [values], async (err, result) => {
        if (err) {
            console.log(err)
            return;
        }

    })


  }catch(err) {
    const obj = {
        res,
        status: false,
        code: INTERNAL_SERVER_ERROR,
        errors: ["Unable to add images"],
      };
      return send_response(obj);
  }
}

module.exports = {
    productImagesAdd,
}