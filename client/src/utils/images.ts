import { ImageSource } from 'expo-image';

export const CATEGORY_IMAGES: {
  architecture: ImageSource;
  culture: ImageSource;
  environment: ImageSource;
  food: ImageSource;
  'general-knowledge': ImageSource;
  geography: ImageSource;
  history: ImageSource;
  music: ImageSource;
  nature: ImageSource;
  science: ImageSource;
  tech: ImageSource;
  [key: string]: ImageSource;
} = {
  architecture: require('../../assets/images/categories/architecture.png'),
  culture: require('../../assets/images/categories/culture.png'),
  environment: require('../../assets/images/categories/environment.png'),
  food: require('../../assets/images/categories/food.png'),
  'general-knowledge': require('../../assets/images/categories/general-knowledge.png'),
  geography: require('../../assets/images/categories/geography.png'),
  history: require('../../assets/images/categories/history.png'),
  music: require('../../assets/images/categories/music.png'),
  nature: require('../../assets/images/categories/nature.png'),
  science: require('../../assets/images/categories/science.png'),
  tech: require('../../assets/images/categories/tech.png'),
};

export const QUIZ_BACKGROUND = {
  background: require('../../assets/quiz-background.png'),
};

export const TILE_IMAGES = {
  createQuiz: require('../../assets/images/tiles/create-quiz-btn.png'),
  joinQuiz: require('../../assets/images/tiles/join-quiz-btn.png'),
  nextQuizBg: require('../../assets/images/tiles/play-next-quiz-bg.svg'),
  questionBubbles: require('../../assets/images/tiles/question-bubbles.png'),
};

export const LOGO = { logo: require('../../assets/logo.png') };

export const PROFILE_PLACEHOLDER = { icon: require('../../assets/images/blank-profile-picture.png')}
