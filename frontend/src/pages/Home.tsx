
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

interface HomeProps {
  onStart: () => void;
  onSignIn: () => void;
}

export default function Home({
  onStart,
  onSignIn,
}: HomeProps) {
  return (
    <>
      <Navbar onSignIn={onSignIn} />
      <Hero onStart={onStart} />
    </>
  );
}
