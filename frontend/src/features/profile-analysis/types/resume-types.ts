export interface ResumeData {
  skills: string[];
  softSkills?: string[];
  experience: { role: string; company: string; duration: string }[];
  education: { degree: string; school: string; year: string }[];
  summary?: string;
  resumeScore?: number;
  strengths?: string[];
  improvements?: string[];
  atsTips?: string[];
  careerFit?: { score: number; summary: string };
}
