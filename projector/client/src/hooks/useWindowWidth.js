import React, { useState, useEffect } from "react";

const useWindowWidth = () => {
  const [screenSize, setScreenSize] = useState(false);

  let checkScreenSize = () => {
    setScreenSize(window.innerWidth < 700);
  };

  useEffect(() => {
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
  }, []);

  return screenSize;
};

export default useWindowWidth;
