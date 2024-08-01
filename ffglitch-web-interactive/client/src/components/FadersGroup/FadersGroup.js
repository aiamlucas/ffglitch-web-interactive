import React from "react";
import Fader from "../Fader/Fader";

const FadersGroup = ({ faders, values, handleChange, handleToggle }) => {
  return (
    <>
      {faders.map((fader, index) => (
        <Fader
          key={fader.name}
          fader={fader}
          value={values[index]}
          onChange={(value) => handleChange(index, value)}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </>
  );
};

export default FadersGroup;
