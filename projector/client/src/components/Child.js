import React, { useState, useEffect } from "react";
import useWindowWidth from "../hooks/useWindowWidth.js";

import SubChild from "./SubChild";
const Child = () => {
  const windowChecker = useWindowWidth();

  return (
    <div>
      <h2>
        Hello from a <strong>{`${windowChecker ? "small " : "large "}`}</strong>
        child component
      </h2>
      <SubChild />
    </div>
  );
};

export default Child;
