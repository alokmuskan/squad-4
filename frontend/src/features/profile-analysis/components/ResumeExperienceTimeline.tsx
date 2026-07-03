interface ExperienceEntry {
  role: string;
  company: string;
  duration: string;
}

interface EducationEntry {
  degree: string;
  school: string;
  year: string;
}

interface Props {
  experience: ExperienceEntry[];
  education: EducationEntry[];
}

export default function ResumeExperienceTimeline({ experience, education }: Props) {
  return (
    <>
      {experience.length > 0 && (
        <div className="mt-4">
          <p className="text-white/70 mb-2 text-xs font-semibold">Experience</p>
          {experience.map((exp, i) => (
            <div key={i} className="bg-white/10 rounded-lg p-2 mb-1">
              <p className="font-semibold text-sm">{exp.role}</p>
              <p className="text-white/70 text-xs">
                {exp.company} • {exp.duration}
              </p>
            </div>
          ))}
        </div>
      )}

      {education.length > 0 && (
        <div className="mt-4">
          <p className="text-white/70 mb-2 text-xs font-semibold">Education</p>
          {education.map((edu, i) => (
            <div key={i} className="bg-white/10 rounded-lg p-2 mb-1">
              <p className="font-semibold text-sm">{edu.degree}</p>
              <p className="text-white/70 text-xs">
                {edu.school} • {edu.year}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
