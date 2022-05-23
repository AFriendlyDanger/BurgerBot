const mysql = require('mysql');
require('dotenv').config();
const parseDbUrl = require('parse-database-url');

let dbConfig = parseDbUrl(process.env.DATABASE_URL)

//dbConfig[connectionLimit] = 10;

const pool = mysql.createPool(dbConfig);

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

exports.add_serving = function(guild_id,channel_id){
  let sql = `INSERT INTO servings (guild_id, channel_id, burgers)` + 
          ` values ('${guild_id}', '${channel_id}', 0)` + 
          ` ON DUPLICATE KEY UPDATE burgers = burgers + 1;`;
  exports.executeQuery(sql)
      .catch(err => console.log(err));
}
