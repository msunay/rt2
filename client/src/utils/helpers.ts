// Helper for adding button on press colors
export const btnPressStyle = (
  pressed: boolean,
  [color1, color2]: string[],
  style: any
) => [
  {
    backgroundColor: pressed ? color1 : color2,
  },
  style, // adds the rest of the btn stlyes
];
export const inputDisabledStyle = (
  pressed: boolean,
  [color1, color2]: string[],
  style: { [key: string]: any }
) => [
  style, // adds the rest of the btn stlyes
  {
    backgroundColor: pressed ? color1 : color2,
  },
];
