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
  HasManyGetAssociationsMixin,
  HasManySetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyCountAssociationsMixin,
  InferCreationAttributes,
  InferAttributes,
  Model,
  NonAttribute,
  Sequelize,
} from "sequelize";
import type { Question } from "./Question";
import type { User } from "./User";

type QuizAssociations = "questions" | "users";

export class Quiz extends Model<
  InferAttributes<Quiz, { omit: QuizAssociations }>,
  InferCreationAttributes<Quiz, { omit: QuizAssociations }>
> {
  declare id: CreationOptional<string>;
  declare quizName: string;
  declare quizOwner: string;
  declare category: string;
  declare dateTime: Date;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Quiz hasMany Question
  declare questions?: NonAttribute<Question[]>;
  declare getQuestions: HasManyGetAssociationsMixin<Question>;
  declare setQuestions: HasManySetAssociationsMixin<Question, string>;
  declare addQuestion: HasManyAddAssociationMixin<Question, string>;
  declare addQuestions: HasManyAddAssociationsMixin<Question, string>;
  declare createQuestion: HasManyCreateAssociationMixin<Question>;
  declare removeQuestion: HasManyRemoveAssociationMixin<Question, string>;
  declare removeQuestions: HasManyRemoveAssociationsMixin<Question, string>;
  declare hasQuestion: HasManyHasAssociationMixin<Question, string>;
  declare hasQuestions: HasManyHasAssociationsMixin<Question, string>;
  declare countQuestions: HasManyCountAssociationsMixin;

  // Quiz belongsToMany User
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
    questions: Association<Quiz, Question>;
    users: Association<Quiz, User>;
  };

  static initModel(sequelize: Sequelize): typeof Quiz {
    Quiz.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          allowNull: false,
          unique: true,
          defaultValue: DataTypes.UUIDV4,
        },
        quizName: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        quizOwner: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        category: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        dateTime: {
          type: DataTypes.DATE,
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

    return Quiz;
  }
}
