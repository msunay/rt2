"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParticipationAnswer = void 0;
const sequelize_1 = require("sequelize");
class ParticipationAnswer extends sequelize_1.Model {
    static initModel(sequelize) {
        ParticipationAnswer.init({
            id: {
                type: sequelize_1.DataTypes.UUID,
                primaryKey: true,
                allowNull: false,
                unique: true,
                defaultValue: sequelize_1.UUIDV4,
            },
            ParticipationId: {
                type: sequelize_1.DataTypes.UUID,
                allowNull: false,
            },
            AnswerId: {
                type: sequelize_1.DataTypes.UUID,
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
        return ParticipationAnswer;
    }
}
exports.ParticipationAnswer = ParticipationAnswer;
