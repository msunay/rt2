"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Answer = void 0;
const sequelize_1 = require("sequelize");
class Answer extends sequelize_1.Model {
    static initModel(sequelize) {
        Answer.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                unique: true,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
            },
            answerText: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            isCorrect: {
                type: sequelize_1.DataTypes.BOOLEAN,
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
        return Answer;
    }
}
exports.Answer = Answer;
