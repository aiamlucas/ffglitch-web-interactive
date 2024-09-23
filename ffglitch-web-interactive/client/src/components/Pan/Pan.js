import React from "react";

const Pan = ({ pan, value, onChange, onToggle }) => {
  // This function is called when the user double-clicks on the pan label
  const handleDoubleClick = (event) => {
    event.stopPropagation(); // Prevent the event from bubbling up
    onChange(0); // Reset the pan value to zero
  };

  return (
    <div>
      <div className="fader-label-div" onDoubleClick={onToggle}>
        {/* onDoubleClick ensures toggle is specific to pan */}
        {pan.name}
      </div>
      <input
        type="range"
        min={-1}
        max={1}
        step={0.01}
        value={value}
        className="pan-range"
        onChange={(event) => onChange(parseFloat(event.target.value))}
        onDoubleClick={handleDoubleClick}
        // Reset to 0 on double-click on the range input
      />
    </div>
  );
};

export default Pan;

// import React from "react";

// const Pan = ({ pan, value, onChange, onToggle }) => {
//   // This function is called when the user double-clicks on the pan label
//   const handleDoubleClick = (event) => {
//     event.stopPropagation(); // Prevent the event from bubbling up
//     onChange(0); // Reset the pan value to zero
//   };

//   return (
//     <div>
//       <div className="fader-label-div" onDoubleClick={onToggle}>
//         {/* onDoubleClick ensures toggle is specific to pan */}
//         {pan.name}
//       </div>
//       <input
//         type="range"
//         min={-1}
//         max={1}
//         step={0.01}
//         value={value}
//         className="fader-range"
//         onChange={(event) => onChange(parseFloat(event.target.value))}
//         onDoubleClick={handleDoubleClick}
//         // Reset to 0 on double-click on the range input
//       />
//     </div>
//   );
// };

// export default Pan;
