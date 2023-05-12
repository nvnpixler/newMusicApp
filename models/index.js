
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
console.log(env)
const config = require(__dirname + '/../config/config.json')[env];
const db = {};
const videoDetailsModel = require('../models/video_detailsModel.js')

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}
sequelize.authenticate().then(() => {
  console.log("connected")
  // return videoDetailsModel.sync();
})
  .catch(err => {
    console.log("Error", err.message)
  })

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Database synced successfully.");
// }).catch((err) => {
//   console.error("Error syncing database: ", err);
// });

db.video_details = require('./video_detailsModel.js')(sequelize, Sequelize.DataTypes)

module.exports = db;
