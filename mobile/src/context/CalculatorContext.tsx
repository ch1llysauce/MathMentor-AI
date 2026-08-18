import React, { createContext, useContext, useState } from 'react';

interface CalculatorContextType {
  fabDismissed: boolean;
  setFabDismissed: (dismissed: boolean) => void;
  openCalculator: () => void;
  restoreFab: () => void;
  calcVisible: boolean;
  setCalcVisible: (visible: boolean) => void;
  resetTrigger: number;
}

const CalculatorContext = createContext<CalculatorContextType>({
  fabDismissed: false,
  setFabDismissed: () => {},
  openCalculator: () => {},
  restoreFab: () => {},
  calcVisible: false,
  setCalcVisible: () => {},
  resetTrigger: 0,
});

export const useCalculatorContext = () => useContext(CalculatorContext);

export function CalculatorProvider({ children }: { children: React.ReactNode }) {
  const [fabDismissed, setFabDismissed] = useState(false);
  const [calcVisible, setCalcVisible] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);

  const openCalculator = () => setCalcVisible(true);
  const restoreFab = () => {
    setFabDismissed(false);
    setResetTrigger((prev) => prev + 1);
  };

  return (
    <CalculatorContext.Provider
      value={{
        fabDismissed,
        setFabDismissed,
        openCalculator,
        restoreFab,
        calcVisible,
        setCalcVisible,
        resetTrigger,
      }}
    >
      {children}
    </CalculatorContext.Provider>
  );
}
