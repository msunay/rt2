import type { Quiz } from "@/types/Types";

export const inputDisabledStyle = (
  pressed: boolean,
  [color1, color2]: string[],
  style: { [key: string]: number | string }
) => [
  style, // adds the rest of the btn stlyes
  {
    backgroundColor: pressed ? color1 : color2,
  },
];

export const sortQuizzes = (quizzes: Quiz[]) => {
  return quizzes.sort(
    (quizA, quizB) =>
      new Date(quizA.dateTime).getTime() - new Date(quizB.dateTime).getTime(), // Sort by ascending date and time.
  );
};