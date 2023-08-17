"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Question = void 0;
const sequelize_1 = require("sequelize");
class Question extends sequelize_1.Model {
    static initModel(sequelize) {
        Question.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                unique: true,
                defaultValue: sequelize_1.UUIDV4,
            },
            questionText: {
                type: sequelize_1.DataTypes.STRING,
                allowNull: false,
            },
            positionInQuiz: {
                type: sequelize_1.DataTypes.INTEGER,
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
        return Question;
    }
}
exports.Question = Question;
