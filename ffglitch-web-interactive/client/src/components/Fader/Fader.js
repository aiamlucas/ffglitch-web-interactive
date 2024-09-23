import React from "react";

const Fader = ({ fader, value, onChange, onToggle }) => {
  return (
    <div>
      <div className="fader-label-div" onClick={onToggle}>
        {/* {fader.name} */}
      </div>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        className="fader-range"
        onChange={(event) => onChange(parseFloat(event.target.value))}
      />
    </div>
  );
};

export default Fader;
