'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // one-to-many association with user.js
      Course.belongsTo(models.User, {
        // foreignKey is the primary key of user.js
        foreignKey: {
          // use the same fieldName as in User
          fieldName: 'userId'
        }
      });
    }
  }
  // provide msg properties for both notNull & notEmpty, so we have custom messages...
  // ...for both
  Course.init({
    // title and description cannot be NULL or empty
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
            msg: 'Please provide a title.',
        },
        notNull: {
            msg: 'Please provide a title.',
        },
      },
    },
    description:{
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
            msg: 'Please provide a description.',
        },
        notNull: {
            msg: 'Please provide a description.',
        },
      },
    },
    estimatedTime: DataTypes.STRING,
    materialsNeeded: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Course',
  });
  return Course;
};