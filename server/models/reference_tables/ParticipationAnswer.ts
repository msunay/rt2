import {
  CreationOptional,
  DataTypes,
  InferCreationAttributes,
  InferAttributes,
  Model,
  Sequelize,
  UUIDV4,
} from "sequelize";

export class ParticipationAnswer extends Model<
  InferAttributes<ParticipationAnswer>,
  InferCreationAttributes<ParticipationAnswer>
> {
  declare id: CreationOptional<string>;
  declare ParticipationId: string;
  declare AnswerId: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  static initModel(sequelize: Sequelize): typeof ParticipationAnswer {
    ParticipationAnswer.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          allowNull: false,
          unique: true,
          defaultValue: UUIDV4,
        },
        ParticipationId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        AnswerId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
        },
        updatedAt: {
          type: DataTypes.DATE,
        },
      },
      {
        sequelize,
      }
    );

    return ParticipationAnswer;
  }
}
