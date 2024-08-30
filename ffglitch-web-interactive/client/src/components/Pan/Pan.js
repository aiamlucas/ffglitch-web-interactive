import React from "react";

const Pan = ({ pan, value, onChange, onToggle }) => {
  // This function is called when the user double-clicks on the pan label
  const handleDoubleClick = () => {
    event.stopPropagation();
    onChange(0);
  };
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
        onDoubleClick={handleDoubleClick}
      />
    </div>
  );
};

export default Pan;
