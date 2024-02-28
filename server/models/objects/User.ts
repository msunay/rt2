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
import type { Quiz } from "./Quiz";

type UserAssociations = "quizzes";

export class User extends Model<
  InferAttributes<User, { omit: UserAssociations }>,
  InferCreationAttributes<User, { omit: UserAssociations }>
> {
  declare id: CreationOptional<string>;
  declare email: string;
  declare username: string;
  declare password: string;
  declare isPremiumMember: CreationOptional<boolean>;
  declare pointsWon: CreationOptional<number>;
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

  declare static associations: {
    quizzes: Association<User, Quiz>;
  };

  static initModel(sequelize: Sequelize): typeof User {
    User.init(
      {
        id: {
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
          defaultValue: false,
        },
        pointsWon: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
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
