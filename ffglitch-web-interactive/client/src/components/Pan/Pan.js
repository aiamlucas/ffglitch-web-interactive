import React from "react";

const Pan = ({ pan, value, onChange, onToggle }) => {
  return (
    <div>
      <div className="fader-label-div" onClick={onToggle}>
        {pan.name}
      </div>
      <input
        type="range"
        min={-1}
        max={1}
        step={0.01}
        value={value}
        className="fader-range"
        onChange={(event) => onChange(parseFloat(event.target.value))}
      />
    </div>
  );
};

export default Pan;
