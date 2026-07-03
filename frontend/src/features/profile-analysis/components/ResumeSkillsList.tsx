interface Props {
  skills: string[];
  softSkills?: string[];
}

export default function ResumeSkillsList({ skills, softSkills }: Props) {
  return (
    <>
      <div>
        <p className="text-white/70 mb-2 text-xs font-semibold">Technical Skills</p>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 bg-yellow-300 text-[#171C4A] rounded-full text-xs font-semibold"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {softSkills && softSkills.length > 0 && (
        <div className="mt-4">
          <p className="text-white/70 mb-2 text-xs font-semibold">Soft Skills</p>
          <div className="flex flex-wrap gap-2">
            {softSkills.map((skill) => (
              <span key={skill} className="px-2 py-1 bg-white/20 rounded-full text-xs">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
