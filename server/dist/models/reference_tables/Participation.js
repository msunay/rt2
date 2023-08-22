"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Participation = void 0;
const sequelize_1 = require("sequelize");
class Participation extends sequelize_1.Model {
    static initModel(sequelize) {
        Participation.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                unique: true,
                defaultValue: sequelize_1.DataTypes.UUIDV4,
            },
            UserId: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
            },
            QuizId: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
            },
            isPaid: {
                type: sequelize_1.DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
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
        return Participation;
    }
}
exports.Participation = Participation;
