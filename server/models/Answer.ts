import {
  Association,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
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
import type { Question } from "./Question";
import type { User } from "./User";

type AnswerAssociations = "question" | "users";

export class Answer extends Model<
  InferAttributes<Answer, { omit: AnswerAssociations }>,
  InferCreationAttributes<Answer, { omit: AnswerAssociations }>
> {
  declare answerId: CreationOptional<string>;
  declare answer: string;
  declare isCorrect: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Answer belongsTo Question
  declare question?: NonAttribute<Question>;
  declare getQuestion: BelongsToGetAssociationMixin<Question>;
  declare setQuestion: BelongsToSetAssociationMixin<Question, string>;
  declare createQuestion: BelongsToCreateAssociationMixin<Question>;

  // Answer belongsToMany User
  declare users?: NonAttribute<User[]>;
  declare getUsers: BelongsToManyGetAssociationsMixin<User>;
  declare setUsers: BelongsToManySetAssociationsMixin<User, string>;
  declare addUser: BelongsToManyAddAssociationMixin<User, string>;
  declare addUsers: BelongsToManyAddAssociationsMixin<User, string>;
  declare createUser: BelongsToManyCreateAssociationMixin<User>;
  declare removeUser: BelongsToManyRemoveAssociationMixin<User, string>;
  declare removeUsers: BelongsToManyRemoveAssociationsMixin<User, string>;
  declare hasUser: BelongsToManyHasAssociationMixin<User, string>;
  declare hasUsers: BelongsToManyHasAssociationsMixin<User, string>;
  declare countUsers: BelongsToManyCountAssociationsMixin;

  declare static associations: {
    question: Association<Answer, Question>;
    users: Association<Answer, User>;
  };

  static initModel(sequelize: Sequelize): typeof Answer {
    Answer.init(
      {
        answerId: {
          type: DataTypes.UUID,
          primaryKey: true,
          allowNull: false,
          unique: true,
          defaultValue: DataTypes.UUIDV4,
        },
        answer: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        isCorrect: {
          type: DataTypes.BOOLEAN,
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

    return Answer;
  }
}
