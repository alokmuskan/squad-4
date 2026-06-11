interface ResumeDetailsProps {
  onBack: () => void;
}

export default function ResumeDetails({
  onBack,
}: ResumeDetailsProps) { 
  return (
    <div className="min-h-screen bg-[#F8F6E8] p-8">

      <button
  onClick={onBack}
  className="mb-6 px-4 py-2 bg-white rounded-xl shadow"
>
  ← Dashboard
</button>


      <div className="bg-gradient-to-r from-[#171C4A] to-[#2E3678] rounded-[40px] p-8 text-white shadow-2xl">

  <p className="text-white/60">
    AI Resume Intelligence
  </p>

  <h1 className="text-4xl font-black mt-1">
    Your Career Snapshot..
  </h1>

  <p className="mt-4 text-white/80 max-w-2xl">
    We analyzed your resume and identified strengths,
    missing skills, ATS improvements and career growth opportunities.
  </p>

</div>  
 






      <p className="text-gray-500 mt-2">
        AI generated analysis based on your uploaded resume
      </p>

      {/* Overview */}
      <div className="mt-8 bg-white rounded-3xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-[#171C4A]">
          Resume Overview
        </h2>

        <div className="mt-6 grid md:grid-cols-4 gap-4">

          <div className="bg-[#F8F6E8] p-4 rounded-2xl">
            <p className="text-gray-500">Role</p>
            <h3 className="font-bold">Full Stack Developer</h3>
          </div>

          <div className="bg-[#F8F6E8] p-4 rounded-2xl">
            <p className="text-gray-500">Experience</p>
            <h3 className="font-bold">2 Years</h3>
          </div>

          <div className="bg-[#F8F6E8] p-4 rounded-2xl">
            <p className="text-gray-500">Projects</p>
            <h3 className="font-bold">8</h3>
          </div>

          <div className="bg-[#F8F6E8] p-4 rounded-2xl">
            <p className="text-gray-500">ATS Score</p>
            <h3 className="font-bold">91%</h3>
          </div>

        </div>
      </div>

      {/* Strengths */}
      <div className="mt-8 bg-green-100 rounded-3xl p-8">
        <h2 className="text-2xl font-bold">
          ..Strengths
        </h2>

        <ul className="mt-4 space-y-2">
          <li>Strong React Skills</li>
          <li>Good GitHub Portfolio</li>
          <li>Clean Resume Structure</li>
          <li>Good Project Experience</li>
        </ul>
      </div>


      {/* Improvements */}
      <div className="mt-8 bg-yellow-100 rounded-3xl p-8">
        <h2 className="text-2xl font-bold">
          ⚠ Areas To Improve
        </h2>

        <ul className="mt-4 space-y-2">
          <li>Add Docker Experience</li>
          <li>Add AWS Projects</li>
          <li>Improve System Design Skills</li>
          <li>Add Quantifiable Results</li>
        </ul>
      </div>





      <div className="mt-8 bg-white/10 rounded-3xl p-5">

  <h3 className="font-bold text-lg">
    Extracted Skills
  </h3>

  <div className="flex flex-wrap gap-2 mt-4">

    {[
      "React",
      "TypeScript",
      "Node.js",
      "MongoDB",
      "Tailwind",
      "Git"
    ].map(skill => (
      <span
        key={skill}
        className="px-3 py-1 bg-white text-[#171C4A] rounded-full"
      >
        {skill}
      </span>
    ))}

  </div>

</div>



      {/* Missing Skills */}
      <div className="mt-8 bg-white rounded-3xl p-8 shadow-xl">

        <h2 className="text-2xl font-bold text-[#171C4A]">
          Missing Skills
        </h2>

        <div className="flex gap-3 flex-wrap mt-4">
          <span className="px-4 py-2 bg-yellow-200 rounded-full">
            Docker
          </span>

          <span className="px-4 py-2 bg-yellow-200 rounded-full">
            AWS
          </span>

          <span className="px-4 py-2 bg-yellow-200 rounded-full">
            Kubernetes
          </span>

          <span className="px-4 py-2 bg-yellow-200 rounded-full">
            CI/CD
          </span>
        </div>

      </div>

    </div>
  );
}

