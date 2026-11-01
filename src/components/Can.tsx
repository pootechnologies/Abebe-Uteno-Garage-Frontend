// src/components/Can.tsx (enhanced version)
import { useAbility } from "@/context/AbilityContext";
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function Can({
  I,
  this: subject,
  children,
}: {
  I: string;
  this: string;
  children: ReactNode;
}) {
  const ability = useAbility();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!ability || !ability.can(I, subject)) {
      navigate("/");
    }
    setIsChecking(false);
  }, [ability, I, subject, navigate]);

  if (isChecking) {
    return null; // Or a loading spinner
  }

  return ability?.can(I, subject) ? <>{children}</> : null;
}
