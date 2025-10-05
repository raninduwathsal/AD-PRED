
export interface Card {
  id: string; // Use a temporary client-side ID
  video_url: string;
  question: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  correct_answer: string;
  chapter: string;
  difficulty: number;
}
