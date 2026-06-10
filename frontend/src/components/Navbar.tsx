interface NavbarProps {
  onSignIn: () => void;
}

export default function Navbar({
  onSignIn,
}: NavbarProps) {
  return (
    <header className="flex justify-between items-center px-12 py-5">
      <h1 className="font-black text-3xl text-[#171C4A]">
        LearnFlow.
      </h1>

      <nav className="hidden md:flex gap-12 text-gray-500 font-medium">
        <a href="#">AI Learning</a>
        <a href="#">Progress Tracker</a>
        <a href="#">Resume + GitHub</a>
        <a href="#">Roadmap</a>
        <a href="#">Profile</a>
      </nav>

      <button
        onClick={onSignIn}
        className="bg-[#F2DD85] text-[#171C4A] px-6 py-3 rounded-full font-semibold hover:opacity-90 transition"
      >
        Sign In
      </button>
    </header>
  );
}