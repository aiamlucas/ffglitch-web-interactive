import React from "react";
import Pan from "../Pan/Pan";

const PanGroup = ({ pans, values, handleChange, handleToggle }) => {
  return (
    <div>
      {pans.map((pan, index) => (
        <Pan
          key={pan.name}
          pan={pan}
          value={values[index]}
          onChange={(value) => handleChange(index, value)}
          onToggle={handleToggle} // Pass the handleToggle function directly
        />
      ))}
    </div>
  );
};

export default PanGroup;
