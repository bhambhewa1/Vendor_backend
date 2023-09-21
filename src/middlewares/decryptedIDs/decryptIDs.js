const { DecryptedData } = require("../../config/encrypt_decrypt");

const decryptedIDs = async (req, res, next) => {
    if(req.body.user_id !== undefined && req.body.user_id !== ""){
        req.body.user_id = await DecryptedData(req.body.user_id);
    }
    if(req.body.product_id !== undefined && req.body.product_id !== ""){
        req.body.product_id = await DecryptedData(req.body.product_id);
    }  
    if(req.body.image_id !== undefined && req.body.image_id !== ""){
        req.body.image_id = await DecryptedData(req.body.image_id);
    } 
    
    next();
}

module.exports = decryptedIDs;