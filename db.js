const mysql = require('mysql');
require('dotenv').config();
const parseDbUrl = require('parse-database-url');

let dbConfig = parseDbUrl(process.env.DATABASE_URL)

//dbConfig[connectionLimit] = 10;

const pool = mysql.createPool(dbConfig);


/*
  con.connect(function(err) {
    if (err) throw err;
    console.log("MySQL DB Connected");
    //var sql = 'show tables'
    
  });

module.exports = con;
*/
//module.exports = pool;
/*executeQuery= function(query,callback){
  pool.getConnection(function(err,connection){
    if (err) {
      connection.release();
      throw err;
    }   
    connection.query(query,function(err,rows){
      connection.release();
      if(!err) {
        callback(null, rows);
      }           
    });
      
    connection.on('error', function(err) { 
      if (err.code != 'PROTOCOL_CONNECTION_LOST')    
        console.log(err);
      return;     
    });
  });
}
  */
exports.executeQuery = function(sql, args){
  return new Promise(function(resolve,reject){
    pool.getConnection(function(err,connection){
      if (err) {
        connection.release();
        return reject(err);
      }
      connection.query(sql, args,function(err,rows){
        connection.release();
        if (!err) {
          return resolve(rows);
        }
        return reject(err);
      })
    })
  })
}

