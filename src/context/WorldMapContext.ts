import * as React from 'react';
import { useContext } from 'react';


interface WorldMapContextType {
    username: string;
  }

const WorldMapContext = React.createContext<WorldMapContextType | null>(null);

const useWorldMap = () => {
    const currentContext = useContext(WorldMapContext);

    if (!currentContext) {
        throw new Error(
        "useWorldMap has to be used within <WorldMapContext.Provider>"
        );
    }

    return currentContext;
};

export { WorldMapContext, useWorldMap };
