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
import type { Answer } from "./Answer";
import type { Quiz } from "./Quiz";

type UserAssociations = "quizzes" | "answers";

export class User extends Model<
  InferAttributes<User, { omit: UserAssociations }>,
  InferCreationAttributes<User, { omit: UserAssociations }>
> {
  declare userId: CreationOptional<string>;
  declare email: string;
  declare username: string;
  declare password: string;
  declare isPremiumMember: boolean;
  declare pointsWon: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // User belongsToMany Quiz
  declare quizzes?: NonAttribute<Quiz[]>;
  declare getQuizzes: BelongsToManyGetAssociationsMixin<Quiz>;
  declare setQuizzes: BelongsToManySetAssociationsMixin<Quiz, string>;
  declare addQuiz: BelongsToManyAddAssociationMixin<Quiz, string>;
  declare addQuizzes: BelongsToManyAddAssociationsMixin<Quiz, string>;
  declare createQuiz: BelongsToManyCreateAssociationMixin<Quiz>;
  declare removeQuiz: BelongsToManyRemoveAssociationMixin<Quiz, string>;
  declare removeQuizzes: BelongsToManyRemoveAssociationsMixin<Quiz, string>;
  declare hasQuiz: BelongsToManyHasAssociationMixin<Quiz, string>;
  declare hasQuizzes: BelongsToManyHasAssociationsMixin<Quiz, string>;
  declare countQuizzes: BelongsToManyCountAssociationsMixin;

  // User belongsToMany Answer
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
    quizzes: Association<User, Quiz>;
    answers: Association<User, Answer>;
  };

  static initModel(sequelize: Sequelize): typeof User {
    User.init(
      {
        userId: {
          type: DataTypes.UUID,
          primaryKey: true,
          allowNull: false,
          unique: true,
          defaultValue: DataTypes.UUIDV4,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        username: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        isPremiumMember: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        pointsWon: {
          type: DataTypes.INTEGER,
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

    return User;
  }
}
