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
import type { Participation } from "./Participation";
import type { Question } from "./Question";

type AnswerAssociations = "question" | "participations";

export class Answer extends Model<
  InferAttributes<Answer, { omit: AnswerAssociations }>,
  InferCreationAttributes<Answer, { omit: AnswerAssociations }>
> {
  declare id: CreationOptional<string>;
  declare answerText: string;
  declare isCorrect: boolean;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Answer belongsTo Question
  declare question?: NonAttribute<Question>;
  declare getQuestion: BelongsToGetAssociationMixin<Question>;
  declare setQuestion: BelongsToSetAssociationMixin<Question, string>;
  declare createQuestion: BelongsToCreateAssociationMixin<Question>;

  // Answer belongsToMany Participation
  declare participations?: NonAttribute<Participation[]>;
  declare getParticipations: BelongsToManyGetAssociationsMixin<Participation>;
  declare setParticipations: BelongsToManySetAssociationsMixin<
    Participation,
    string
  >;
  declare addParticipation: BelongsToManyAddAssociationMixin<
    Participation,
    string
  >;
  declare addParticipations: BelongsToManyAddAssociationsMixin<
    Participation,
    string
  >;
  declare createParticipation: BelongsToManyCreateAssociationMixin<Participation>;
  declare removeParticipation: BelongsToManyRemoveAssociationMixin<
    Participation,
    string
  >;
  declare removeParticipations: BelongsToManyRemoveAssociationsMixin<
    Participation,
    string
  >;
  declare hasParticipation: BelongsToManyHasAssociationMixin<
    Participation,
    string
  >;
  declare hasParticipations: BelongsToManyHasAssociationsMixin<
    Participation,
    string
  >;
  declare countParticipations: BelongsToManyCountAssociationsMixin;

  declare static associations: {
    question: Association<Answer, Question>;
    participations: Association<Answer, Participation>;
  };

  static initModel(sequelize: Sequelize): typeof Answer {
    Answer.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          allowNull: false,
          unique: true,
          defaultValue: DataTypes.UUIDV4,
        },
        answerText: {
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
