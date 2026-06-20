import { useNavigate } from "@tanstack/react-router";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar onSignIn={() => navigate({ to: "/auth/login" })} />
      <Hero />
    </>
  );
}

