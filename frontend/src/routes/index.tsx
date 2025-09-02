import { Button } from "@/components/ui/button";
import type React from "react";
import { useState } from "react";

export const Index: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="flex h-dvh place-content-center place-items-center">
      <button
        className="w-8 border"
        onClick={() => setCount((count) => count - 1)}
      >
        -1
      </button>
      <span className="grid w-8 place-items-center">{count}</span>
      <button
        className="w-8 border"
        onClick={() => setCount((count) => count + 1)}
      >
        +1
      </button>
      <Button>aba</Button>
    </div>
  );
};
