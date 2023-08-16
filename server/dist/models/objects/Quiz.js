"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Quiz = void 0;
const sequelize_1 = require("sequelize");
class Quiz extends sequelize_1.Model {
    static initModel(sequelize) {
        Quiz.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                unique: true,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
            },
            quizName: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            quizOwner: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
            },
            category: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            dateTime: {
                type: sequelize_1.DataTypes.DATE,
                allowNull: false,
            },
            createdAt: {
                type: sequelize_1.DataTypes.DATE,
            },
            updatedAt: {
                type: sequelize_1.DataTypes.DATE,
            },
        }, {
            sequelize,
        });
        return Quiz;
    }
}
exports.Quiz = Quiz;
