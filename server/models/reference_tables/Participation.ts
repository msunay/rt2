import {
  Association,
  BelongsToManyGetAssociationsMixin,
  BelongsToManySetAssociationsMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyAddAssociationsMixin,
  BelongsToManyCreateAssociationMixin,
  BelongsToManyRemoveAssociationMixin,
  BelongsToManyRemoveAssociationsMixin,
  BelongsToManyHasAssociationMixin,
  BelongsToManyHasAssociationsMixin,
  BelongsToManyCountAssociationsMixin,
  CreationOptional,
  DataTypes,
  InferCreationAttributes,
  InferAttributes,
  Model,
  NonAttribute,
  Sequelize,
} from "sequelize";
import { Quiz, User } from "../associations";
import type { Answer } from "../objects/Answer";

type ParticipationAssociations = "answers";

export class Participation extends Model<
  InferAttributes<Participation>,
  InferCreationAttributes<Participation>
> {
  declare id: CreationOptional<string>;
  declare UserId: string;
  declare QuizId: string;
  declare isPaid: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Participation belongsToMany Answer
  declare answers?: NonAttribute<Answer[]>;
  declare getAnswers: BelongsToManyGetAssociationsMixin<Answer>;
  declare setAnswers: BelongsToManySetAssociationsMixin<Answer, string>;
  declare addAnswer: BelongsToManyAddAssociationMixin<Answer, string>;
  declare addAnswers: BelongsToManyAddAssociationsMixin<Answer, string>;
  declare createAnswer: BelongsToManyCreateAssociationMixin<Answer>;
  declare removeAnswer: BelongsToManyRemoveAssociationMixin<Answer, string>;
  declare removeAnswers: BelongsToManyRemoveAssociationsMixin<Answer, string>;
  declare hasAnswer: BelongsToManyHasAssociationMixin<Answer, string>;
  declare hasAnswers: BelongsToManyHasAssociationsMixin<Answer, string>;
  declare countAnswers: BelongsToManyCountAssociationsMixin;

  declare static associations: {
    answers: Association<Participation, Answer>;
  };

  static initModel(sequelize: Sequelize): typeof Participation {
    Participation.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          allowNull: false,
          unique: true,
          defaultValue: DataTypes.UUIDV4,
        },
        UserId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        QuizId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        isPaid: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true,
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

    return Participation;
  }
}
