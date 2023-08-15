import {
  Association,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
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
  UUIDV4,
} from "sequelize";
import type { Answer } from "./Answer";
import type { Quiz } from "./Quiz";

type QuestionAssociations = "quiz" | "answers";

export class Question extends Model<
  InferAttributes<Question, { omit: QuestionAssociations }>,
  InferCreationAttributes<Question, { omit: QuestionAssociations }>
> {
  declare id: CreationOptional<string>;
  declare questionText: string;
  declare positionInQuiz: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Question belongsTo Quiz
  declare quiz?: NonAttribute<Quiz>;
  declare getQuiz: BelongsToGetAssociationMixin<Quiz>;
  declare setQuiz: BelongsToSetAssociationMixin<Quiz, string>;
  declare createQuiz: BelongsToCreateAssociationMixin<Quiz>;

  // Question hasMany Answer
  declare answers?: NonAttribute<Answer[]>;
  declare getAnswers: HasManyGetAssociationsMixin<Answer>;
  declare setAnswers: HasManySetAssociationsMixin<Answer, string>;
  declare addAnswer: HasManyAddAssociationMixin<Answer, string>;
  declare addAnswers: HasManyAddAssociationsMixin<Answer, string>;
  declare createAnswer: HasManyCreateAssociationMixin<Answer>;
  declare removeAnswer: HasManyRemoveAssociationMixin<Answer, string>;
  declare removeAnswers: HasManyRemoveAssociationsMixin<Answer, string>;
  declare hasAnswer: HasManyHasAssociationMixin<Answer, string>;
  declare hasAnswers: HasManyHasAssociationsMixin<Answer, string>;
  declare countAnswers: HasManyCountAssociationsMixin;

  declare static associations: {
    quiz: Association<Question, Quiz>;
    answers: Association<Question, Answer>;
  };

  static initModel(sequelize: Sequelize): typeof Question {
    Question.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          allowNull: false,
          unique: true,
          defaultValue: UUIDV4,
        },
        questionText: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        positionInQuiz: {
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

    return Question;
  }
}
