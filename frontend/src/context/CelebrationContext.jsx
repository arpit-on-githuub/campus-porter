import { createContext, useContext, useState, useRef, useCallback } from 'react';
import SlingBurst from '../components/SlingBurst';

const CelebrationContext = createContext({ celebrate: () => {} });

export const CelebrationProvider = ({ children }) => {
  const [burst, setBurst] = useState(null);
  const timer = useRef(null);

  const celebrate = useCallback((opts = {}) => {
    if (timer.current) clearTimeout(timer.current);
    setBurst({
      id: Date.now(),
      title: opts.title || 'Slung!',
      subtitle: opts.subtitle || ''
    });
    timer.current = setTimeout(() => setBurst(null), opts.duration || 1900);
  }, []);

  return (
    <CelebrationContext.Provider value={{ celebrate }}>
      {children}
      {burst && <SlingBurst key={burst.id} title={burst.title} subtitle={burst.subtitle} />}
    </CelebrationContext.Provider>
  );
};

export const useCelebration = () => useContext(CelebrationContext);
