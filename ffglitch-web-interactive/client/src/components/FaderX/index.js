import React from "react";
import { useFaderXStore } from "../../app/uiStore.js";
// import "./FaderX.css";

export default function FaderX({ indexFader, setMessage, sendMessage }) {
    const { faders, setFaderValue } = useFaderXStore();
    const fader = faders.find((f) => f.id === indexFader);

    const handleChange = (event) => {
        const newValue = parseFloat(event.target.value);
        setFaderValue(indexFader, newValue);
        setMessage(`fader${fader.id}ሴ${fader.value}`);
    };

    return (
        <div className="fader-container">
            <input
                type="range"
                min={0}
                max={1}
                step={0.0000000000000001}
                value={fader.value}
                onChange={(event) => {
                    handleChange(event);
                    sendMessage();
                }}
                className="fader-range"
            />
            <p>values:</p>
            <p>{fader.value} </p>
        </div>
    );
}

// import React from "react";
// import { useFaderXStore } from "../../app/uiStore.js";

// export default function FaderX({
//     indexFader,
//     message,
//     setMessage,
//     sendMessage,
// }) {
//     const { faders, setFaderValue } = useFaderXStore();
//     const fader = faders.find((f) => f.id === indexFader);

//     const handleChange = (event) => {
//         const newValue = parseFloat(event.target.value);
//         setFaderValue(indexFader, newValue);
//         setMessage(`fader${fader.id}ሴ${fader.value}`);
//         sendMessage();
//     };

//     return (
//         <div className="fader-container">
//             <input
//                 type="range"
//                 min={0}
//                 max={1}
//                 step={0.0000000000000001}
//                 value={fader.value}
//                 onChange={handleChange}
//                 className="fader-range"
//             />
//             <p>values:</p>
//             <p>{fader.value} </p>
//         </div>
//     );
// }

// import React from "react";
// import { useFaderXStore } from "../../app/uiStore.js";
// // import "./FaderX.css";

// export default function FaderX({
//     indexFader,
//     message,
//     setMessage,
//     sendMessage,
// }) {
//     const { faders, setFaderValue } = useFaderXStore();
//     const fader = faders.find((f) => f.id === indexFader);

//     const handleChange = (event) => {
//         const newValue = parseFloat(event.target.value);
//         setFaderValue(indexFader, newValue);
//         setMessage(`fader${fader.id}ሴ${fader.value}`);
//     };

//     return (
//         <div className="fader-container">
//             <input
//                 type="range"
//                 min={0}
//                 max={1}
//                 step={0.0000000000000001}
//                 value={fader.value}
//                 onChange={(event) => {
//                     handleChange(event);
//                     sendMessage();
//                 }}
//                 className="fader-range"
//             />
//             <p>values:</p>
//             <p>{fader.value} </p>
//         </div>
//     );
// }

// import React from "react";
// import { useFaderXStore } from "../../app/uiStore.js";
// // import "./FaderX.css";

// export default function FaderX({ indexFader, setMessage, sendMessage }) {
//     const { faders, setFaderValue } = useFaderXStore();
//     const fader = faders.find((f) => f.id === indexFader);

//     const handleChange = (event) => {
//         const newValue = parseFloat(event.target.value);
//         setFaderValue(indexFader, newValue);
//         setMessage(`fader${fader.id}ሴ${fader.value}`);
//     };

//     return (
//         <div className="fader-container">
//             <input
//                 type="range"
//                 min={0}
//                 max={1}
//                 step={0.0000000000000001}
//                 value={fader.value}
//                 onChange={(event) => {
//                     handleChange(event);
//                     sendMessage();
//                 }}
//                 className="fader-range"
//             />
//             <p>values:</p>
//             <p>{fader.value} </p>
//         </div>
//     );
// }
