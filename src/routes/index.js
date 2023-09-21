const express = require("express");
const { creatingCustomer, updateCustomer, getVendorRequests, getVendorList } = require("../controllers/customers/customers");
const uniqueEmail = require("../middlewares/uniqueFields/uniqueEmail");
const { login } = require("../controllers/auth/login");
const { sendLoginResponse } = require("../controllers/admin/sendLoginResponse");
const { productAdd, productUpdate, deleteProduct } = require("../controllers/vendor/productAdd");
const decryptedIDs = require("../middlewares/decryptedIDs/decryptIDs");
const { productList, productDetails } = require("../controllers/vendor/productList");
const router = express.Router();


router.post("/user/register", uniqueEmail, creatingCustomer, updateCustomer);
router.post("/login", login);
router.post("/admin/requests", getVendorRequests);
router.post("/admin/vendor/list", getVendorList);
router.post("/admin/requests/response", sendLoginResponse);
router.post("/product/add", decryptedIDs, productAdd, productUpdate);
router.post("/product/list", decryptedIDs, productList);
router.post("/product/details", decryptedIDs, productDetails)
router.post("/product/delete", decryptedIDs, deleteProduct)

  

module.exports = router;