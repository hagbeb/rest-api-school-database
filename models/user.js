'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // one-to-many association with course.js
      User.hasMany(models.Course, {
        // the foreignKey will be the primary key of source (User)
        foreignKey: {
          // customise foreign key name
          fieldName: 'userId'
        }
      });
    }
  }
  User.init({
    // firstName and lastName cannot be NULL or empty
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
            msg: 'Please provide a value for firstName',
          },
      },
    },
    lastName:  {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
            msg: 'Please provide a value for lastName',
          },
      },
    },
    emailAddress:  {
      type: DataTypes.STRING,
      allowNull: false,
      // make sure email is unique
      unique: {
          msg: 'The email you entered already exists.',
      },
      validate: {
        notEmpty: {
            msg: 'Please provide an email address.',
          },
        // also use built-in isEmail validator to ensure it's valid email address
        isEmail: {
          msg: 'Please provide a valid email address',
        },
      },
    },
    password:  {
      type: DataTypes.STRING,
      allowNull: false,
      // password cannot be empty. Password length check is done in route handler...
      // ...as Sequelize validation was checking the hash, not the original
      validate: {
        notEmpty: {
            msg: 'Please provide a password.',
        },
      },
    },
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};