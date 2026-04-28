import React from "react";

import { ChallengesProvider } from "@/contexts/ChallengesContext";
import { GoalsProvider } from "@/contexts/GoalsContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { UnitsProvider } from "@/contexts/UnitsContext";
import { WorkoutsProvider } from "@/contexts/WorkoutsContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <UnitsProvider>
        <GoalsProvider>
          <WorkoutsProvider>
            <ChallengesProvider>{children}</ChallengesProvider>
          </WorkoutsProvider>
        </GoalsProvider>
      </UnitsProvider>
    </ThemeProvider>
  );
}
