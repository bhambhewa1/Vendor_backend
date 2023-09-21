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
const { imageValidation } = require("../ImagesUpload/Images");


const productAdd = async (req, res, next) => {
    try {
        if (req.body.product_id === undefined || req.body.product_id === "") {
            let keys = ["user_id", "product_name", "product_price", "description"]
            let values = [req.body.user_id, req.body.product_name, req.body.product_price, req.body.description]
            var sql = `INSERT INTO products (${keys}) VALUES (?)`;

            const insertResult = await new Promise((resolve, reject) => {
                pool.query(sql, [values], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });

            // Second Query: Fetch last inserted product_id
            const selectSql = `SELECT product_id FROM products ORDER BY product_id DESC LIMIT 1`;
            const selectResult = await new Promise((resolve, reject) => {
                pool.query(selectSql, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });

            if (selectResult.length > 0) {
                req.body.product_id = selectResult[0].product_id;
            }

            const imgArray = req.body.moreImg;
            for (let i = 0; i < imgArray.length; i++) {
                if (imgArray[i].id === "") {
                    await productImagesAdd(req, res, { img_url: imgArray[i].path })
                    // await imageValidation(req, res, {img_url: imgArray[i].path})
                }
            }

            const obj = {
                res,
                status: true,
                code: CREATED,
                message: "Product added successfully",
            };
            return send_response(obj);


        } else {
            next();
        }
    } catch (err) {
        const obj = {
            res,
            status: false,
            code: INTERNAL_SERVER_ERROR,
            errors: ["Unable to add product details"],
        };
        return send_response(obj);
    }
}



const productUpdate = async (req, res) => {
    try {
        let values = [req.body.product_name, req.body.product_price, req.body.description, req.body.product_id];
        sql = `UPDATE products SET product_name=?, product_price=?, description=? WHERE product_id = ?`;
        const updateResult = await new Promise((resolve, reject) => {
            pool.query(sql, values, (err, result) => {
                if (err) {
                    console.log(err)
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        const imgArray = req.body.moreImg;
            for (let i = 0; i < imgArray.length; i++) {
                if (imgArray[i].id === "") {
                    await productImagesAdd(req, res, { img_url: imgArray[i].path })
                }
            }

            const obj = {
                res,
                status: true,
                code: OK_AND_COMPLETED,
                message: "Product updated successfully",
            };
            return send_response(obj);

    } catch (err) {
        const obj = {
            res,
            status: false,
            code: INTERNAL_SERVER_ERROR,
            errors: ["Unable to update product details"],
        };
        return send_response(obj);
    }
}


const deleteProduct = async (req, res) => {
    try{
        sql = `DELETE FROM images WHERE product_id = ?`
        const deleteImgResult = await new Promise((resolve, reject) => {
            pool.query(sql, [req.body.product_id], (err, result) => {
                if (err) {
                    console.log(err)
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        sql = `DELETE FROM products WHERE product_id = ?`
        const deleteResult = await new Promise((resolve, reject) => {
            pool.query(sql, [req.body.product_id], (err, result) => {
                if (err) {
                    console.log(err)
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        const obj = {
            res,
            status: true,
            code: OK_AND_COMPLETED,
            message: "Product deleted successfully",
        };
        return send_response(obj);

    }catch(err) {
        const obj = {
            res,
            status: false,
            code: INTERNAL_SERVER_ERROR,
            errors: ["Unable to delete product"],
        };
        return send_response(obj);
    }
}

module.exports = { productAdd, productUpdate, deleteProduct }