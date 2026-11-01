// src/context/AbilityContext.tsx
import { createContext, useContext, ReactNode } from 'react';
import { Ability } from '@casl/ability';
import { defineAbilitiesFor } from '@/utils/ablity';

const AbilityContext = createContext<Ability | null>(null);

export function AbilityProvider({ children, role }: { children: ReactNode; role: string }) {
  const ability = defineAbilitiesFor(role);
  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

export function useAbility() {
  const ability = useContext(AbilityContext);
  if (!ability) throw new Error('useAbility must be used within an AbilityProvider');
  return ability;
}
