
export interface Question {
  id: string;
  subject: string;
  question_text: string;
  options?: any;
  correct_answer: string;
  question_type: string;
  marks: number;
  negative_marks: number;
  explanation?: string;
  question_image?: string;
  explanation_image?: string;
}

export interface FormData {
  subject: string;
  question_text: string;
  question_type: string;
  marks: number;
  negative_marks: number;
  correct_answer: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_a_image: string;
  option_b_image: string;
  option_c_image: string;
  option_d_image: string;
  explanation: string;
  question_image: string;
  explanation_image: string;
}
