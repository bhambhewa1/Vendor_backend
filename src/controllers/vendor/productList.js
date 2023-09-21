require("dotenv").config();
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
const { productImagesAdd } = require("./productImagesAdd");


const productList = async (req, res) => {
try{
    var sql = `SELECT * FROM products WHERE user_id = ?`;
    let selectResult = await new Promise((resolve, reject) => {
        pool.query(sql, [req.body.user_id], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });


    selectResult = selectResult.map((item) => {
        item.product_id = EncryptedData(item.product_id);
        delete item.user_id;
        return item; // Add this line to return the modified item
    });
     
    const obj = {
        res,
        status: true,
        code: OK_AND_COMPLETED,
        message: selectResult?.length
          ? "Products found successfully"
          : "No record found",
        data: {
        product_list: selectResult,
        }
      };
      return send_response(obj);

}catch(err) {
    const obj = {
        res,
        status: false,
        code: INTERNAL_SERVER_ERROR,
        errors: ["Unable to fetch product list"],
      };
      return send_response(obj);
}
} 

const productDetails = async (req, res) => {
    try{
        var sql = `SELECT * FROM products WHERE product_id = ?`;
        let selectResult = await new Promise((resolve, reject) => {
            pool.query(sql, [req.body.product_id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    
        delete selectResult[0].product_id;
        delete selectResult[0].user_id;

        sql = `SELECT * FROM images WHERE product_id = ?`
        let imageResult = await new Promise((resolve, reject) => {
            pool.query(sql, [req.body.product_id], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
// console.log("before",imageResult)
        imageResult = imageResult.map((item) => {
            item.id = EncryptedData(item.image_id);
            delete item.user_id;
            delete item.product_id;
            item.path = item.image_url;
            item.src = `http://localhost:5000/upload/${item.image_url}`
            delete item.image_id;
            delete item.image_url;
            return item; // Add this line to return the modified item
        });
        // console.log("After",imageResult)
        const obj = {
            res,
            status: true,
            code: OK_AND_COMPLETED,
            message: selectResult?.length
              ? "Product details found successfully"
              : "No record found",
            data: {
            product_details: selectResult[0],
            product_images: imageResult
            }
          };
          return send_response(obj);
    
    }catch(err) {
        const obj = {
            res,
            status: false,
            code: INTERNAL_SERVER_ERROR,
            errors: ["Unable to fetch product details"],
          };
          return send_response(obj);
    }
    } 


module.exports = {productList, productDetails}