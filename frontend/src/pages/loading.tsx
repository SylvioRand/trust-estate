import React from "react";

const LoadingPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center
			w-full h-screen"
    >
      <div className="font-icon animate-spin
				text-background
				text-[100px] [animation-duration:2s]
				select-none
				origin-center"
      >
        󱥸
      </div>
    </div>
  );
}

export default LoadingPage;
