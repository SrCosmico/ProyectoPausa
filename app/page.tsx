"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import SplashScreen from "../components/SplashScreen";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/bienvenida.2");
    }, 3500);

    return () => clearTimeout(timer);
  }, [router]);

  return <SplashScreen />;
}
