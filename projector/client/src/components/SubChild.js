import React, { useContext } from "react";
import { UserContext } from "../contexts/UserContext.js";
import useLocalStorageState from "../hooks/useLocalStorageState";

const SubChild = () => {
  const { user, setUser } = useContext(UserContext);
  const { name, location } = user;
  const [count, setCount] = useLocalStorageState("app-count", 0);

  console.log(name, location);

  const handleChange = () => {
    setUser({
      name: "Tolga",
      location: "Sparta",
    });
  };

  return (
    <div>
      <h3>
        {name}! Living a lie in {location}
      </h3>
      <button
        onClick={() => {
          setCount(0);
        }}
      >
        clear dis
      </button>
      <button
        onClick={() => {
          setCount(count + 1);
        }}
      >
        real high numbers: {count}
      </button>
    </div>
  );
};

export default SubChild;
