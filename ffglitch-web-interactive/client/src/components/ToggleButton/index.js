import React from "react";
import { useToggleStore } from "../../app/uiStore.js";

export default function ToggleButton({ button, setMessage, sendMessage }) {
    const buttons = useToggleStore((state) => state.buttons);
    const toggleButton = useToggleStore((state) => state.toggleButton);

    // console.log("buttons ", buttons);

    const handleClick = () => {
        const buttonObj = buttons.find((b) => b.id === button);
        if (buttonObj) {
            toggleButton(buttonObj.id);
            console.log("isToggled: ", buttonObj.isToggled);
            setMessage(
                `toggle${buttonObj.id}ሴ${buttonObj.isToggled === true ? 0 : 1}`
            );
        }
    };

    const buttonObj = buttons.find((b) => b.id === button);

    return (
        <button
            onClick={(event) => {
                handleClick(event);
                sendMessage();
            }}
        >
            {buttonObj && buttonObj.isToggled ? "OFF" : "ON"}
        </button>
    );
}
