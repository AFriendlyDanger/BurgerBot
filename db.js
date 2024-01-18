const mysql = require('mysql');
require('dotenv').config();
const parseDbUrl = require('parse-database-url');
const { execute } = require('./commands/burger');
let USING_DB = true;


let dbConfig = parseDbUrl(process.env.DATABASE_URL)

//dbConfig[connectionLimit] = 10;

const pool = mysql.createPool(dbConfig);

if (dbConfig == null || dbConfig == undefined || process.env.USE_DB != true){
  USING_DB = false;
}

exports.USING_DB = USING_DB;

const StoredProc = {
  sp_Insert_Serving : "sp_Insert_Serving",
  sp_Insert_Scheduled : "sp_Insert_Scheduled",
  sp_Get_Schedule : "sp_Get_Schedule"
}
const spDict = {
  sp_Insert_Serving : "sp_Insert_Serving(?,?)",
  sp_Insert_Scheduled : "sp_Insert_Schedule(?,?,?,?)",
  sp_Get_Schedule : "sp_Get_Schedule(?)"
};

exports.StoredProc =StoredProc;

const executeQuery = function (sql, args){
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

exports.executeStoredProcedure = function(sp, args){
  return new Promise(function(resolve,reject){
    if (sp in spDict){
      sql = "Call " + spDict[sp];
      return executeQuery(sql, args)
      .then(rows => {
                resolve(rows)
            })
            .catch(err =>{
                console.error(err)
                reject(`SP failed [${err.code}]`)
            })
    }
    else{
      return reject(new Error("SP not found"))
    }
  }) 
}

exports.executeQuery = executeQuery;

// exports.add_serving = function(guild_id,channel_id){
//   let sql = `INSERT INTO servings (guild_id, channel_id, burgers)` + 
//           ` values ('${guild_id}', '${channel_id}', 0)` + 
//           ` ON DUPLICATE KEY UPDATE burgers = burgers + 1;`;
//   exports.executeQuery(sql)
//       .catch(err => console.log(err));
// }
