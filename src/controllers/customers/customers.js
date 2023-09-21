require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../../connection/db");
// const uuid = require("uuid");
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

const creatingCustomer = async (req, res, next) => {
  delete req.body.confirm_password;
  // delete req.body.type;

  if (req.body.user_id === undefined || req.body.user_id === "") {
    delete req.body.customer_id; // delete id before storing in database
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashPassword;

    Object.assign(req.body, { type: "Vendor" });
    console.log("jai shree ram", req.body)
    console.log("jai shree ram", req.body.user_id)

    try {
      const keys = [ "firstName", "lastName","dob", "email", "type", "password" ]
      const values = [ req.body.first_name, req.body.last_name, req.body.dob, req.body.email, req.body.type, req.body.password]
      const sql = `INSERT INTO users (${keys}) VALUES (?)`;

      await pool.query(sql, [values], (err, result) => {
        if (err) {
          return send_sqlError(res);
          // return res.status(INTERNAL_SERVER_ERROR).json({
          //   status: false,
          //   code: INTERNAL_SERVER_ERROR,
          //   message: "",
          //   errors: ["Unable to save customer details"],
          // });
        }
        if (result.affectedRows) {
          const obj = {
            res,
            status: true,
            code: CREATED,
            message: "User added successfully",
          };
          return send_response(obj);
        } else {
          const obj = {
            res,
            status: false,
            code: PROMPT_CODE,
            errors: ["Unable to save user details"],
          };
          return send_response(obj);
        }
      });
    } catch (error) {
      const obj = {
        res,
        status: false,
        code: INTERNAL_SERVER_ERROR,
        errors: ["Unable to save user details"],
      };
      return send_response(obj);
    }
  } else {
    next();
  }
};

const updateCustomer = async (req, res) => {
  delete req.body.confirm_password;
  delete req.body.type;
  console.log("req.body", req.body);

  try {
    // if (req.body.password) {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(req.body.password, salt);
      req.body.password = hashPassword;

      // if (req.body.createdOn !== undefined) {
      //   const created_on = new Date();
        var sql = `update users set firstName=?,lastName=?,email=?,password=? where user_id = ?`;
        var sqlValues = [
          req.body.first_name,
          req.body.last_name,
          req.body.email,
          req.body.password,
          req.body.user_id,
        ];
      // } else {
      //   sql = `update users set firstName=?,lastName=?,phone=?,email=?,address=?,password=? where customer_id = ?`;
      //   sqlValues = [
      //     req.body.firstName,
      //     req.body.lastName,
      //     req.body.phone,
      //     req.body.email,
      //     req.body.address,
      //     req.body.password,
      //     req.body.customer_id,
      //   ];
      // }
    // } else {
    //   sql = `update users set firstName=?,lastName=?,email=? where user_id = ?`;
    //   sqlValues = [
    //     req.body.firstName,
    //     req.body.lastName,
    //     // req.body.phone,
    //     req.body.email,
    //     // req.body.address,
    //     req.body.user_id,
    //   ];
    // }

    await pool.query(sql, sqlValues, async (err, result) => {
      if (err) {
        return send_sqlError(res);
        // return res.status(INTERNAL_SERVER_ERROR).json({
        //   status: false,
        //   code: INTERNAL_SERVER_ERROR,
        //   message: "",
        //   errors: ["Unable to update customer details"],
        // });
      }
      if (result.affectedRows) {
        const obj = {
          res,
          status: true,
          code: req.body.createdOn !== undefined ? CREATED : OK_AND_COMPLETED,
          message: "User details updated successfully",
        };
        return send_response(obj);
      } else {
        const obj = {
          res,
          status: false,
          code: BAD_REQUEST,
          errors: ["Unable to update the user details"],
        };
        return send_response(obj);
      }
    });
  } catch (err) {
    const obj = {
      res,
      status: false,
      code: INTERNAL_SERVER_ERROR,
      errors: ["Unable to update the user details"],
    };
    return send_response(obj);
  }
};


const getVendorRequests = async (req, res) => {
  try{
     sql = `select *, DATE_FORMAT(dob,'%d/%m/%Y')
     AS dob from users where type != ? AND Request = ? `;
     await pool.query(sql,["Admin", 1], (err, result) => {
      if (err) {
        console.log(err)
        return send_sqlError(res);
      }
      if (result.length) {
        result.map((item, index) => {
          item.user_id = EncryptedData(item.user_id);
        });
      }

      const obj = {
        res,
        status: true,
        code: OK_AND_COMPLETED,
        message: result?.length
          ? "Users Request List found successfully"
          : "No record found",
        data: {
        user_list: result,
        }
      };
      return send_response(obj);
    })

  } catch(err) {
    const obj = {
      res,
      status: false,
      code: INTERNAL_SERVER_ERROR,
      errors: ["Unable to fetch the users requests"],
    };
    return send_response(obj);
  }
}


const getVendorList = async (req, res) => {
  try{
     sql = `select *, DATE_FORMAT(dob,'%d/%m/%Y')
     AS dob from users where type = ? `;
     await pool.query(sql,["Vendor"], (err, result) => {
      if (err) {
        console.log(err)
        return send_sqlError(res);
      }
      if (result.length) {
        result.map((item, index) => {
          item.user_id = EncryptedData(item.user_id);
        });
      }

      const obj = {
        res,
        status: true,
        code: OK_AND_COMPLETED,
        message: result?.length
          ? "Users List found successfully"
          : "No record found",
          data: {
            user_list: result,
          }
      };
      return send_response(obj);
    })

  } catch(err) {
    const obj = {
      res,
      status: false,
      code: INTERNAL_SERVER_ERROR,
      errors: ["Unable to fetch the users list"],
    };
    return send_response(obj);
  }
}


const getCustomerById = async (req, res) => {
  try {
    await pool.query(
      `select customer_id,firstName,lastName,phone,email,address from wca_users where customer_id = ?`,
      [req.body.customer_id],
      (error, results, fields) => {
        if (error) {
          return send_sqlError(res);
          // return res.status(INTERNAL_SERVER_ERROR).json({
          //   status: false,
          //   code: INTERNAL_SERVER_ERROR,
          //   message: "",
          //   errors: ["Unable to fetch Customer details"],
          // });
        }
        if (results.length) {
          results[0].customer_id = req.body.customer_id;
        }

        const obj = {
          res,
          status: true,
          code: OK_AND_COMPLETED,
          message: results?.length
            ? "Customer details found successfully"
            : "No record found",
          data: results?.length ? results[0] : results,
        };
        return send_response(obj);
      }
    );
  } catch (err) {
    const obj = {
      res,
      status: false,
      code: INTERNAL_SERVER_ERROR,
      errors: ["Unable to fetch customer details"],
    };
    return send_response(obj);
  }
};

const deleteCustomerById = async (req, res) => {
  try {
    await pool.query(
      `update wca_users set is_deleted=? where customer_id = ?`,
      [1, req.body.customer_id],
      (error, results, fields) => {
        if (error) {
          return send_sqlError(res);
          // return res.status(INTERNAL_SERVER_ERROR).json({
          //   status: false,
          //   code: INTERNAL_SERVER_ERROR,
          //   message: "",
          //   errors: ["Unable to remove customer record"],
          // });
        }
        if (results.affectedRows) {
          const obj = {
            res,
            status: true,
            code: OK,
            message: "Customer record removed successfully",
          };
          return send_response(obj);
        } else {
          const obj = {
            res,
            status: false,
            code: BAD_REQUEST,
            errors: ["Customer record does not exist"],
          };
          return send_response(obj);
        }
      }
    );
  } catch (err) {
    const obj = {
      res,
      status: false,
      code: INTERNAL_SERVER_ERROR,
      errors: ["Unable to remove customer"],
    };
    return send_response(obj);
  }
};

module.exports = {
  creatingCustomer,
  getVendorRequests,
  getVendorList,
  getCustomerById,
  updateCustomer,
  deleteCustomerById,
};
