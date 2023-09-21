const { createPool } = require("mysql");

const dbConnectionInfo = {
  host: "127.0.0.1",
  port: "3306",
  user: "root",
  password: "",
  connectionLimit: 10, //mysql connection pool length
  database: "test",
};

//create mysql connection pool
var dbconnection = createPool(dbConnectionInfo);


// Attempt to catch disconnects
dbconnection.on("connection", (connection) => {
  console.log("DB Connection established");

  connection.on("error",  (err) => {
    console.error(new Date(), "MySQL error", err.code);
  });
  connection.on("close", (err) => {
    console.error(new Date(), "MySQL close", err);
  });
});

module.exports = dbconnection;
