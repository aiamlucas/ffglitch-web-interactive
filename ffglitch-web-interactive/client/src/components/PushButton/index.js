import React from "react";
import { usePushButtonStore } from "../../app/uiStore.js";

export default function PushButton({ button }) {
    const buttons = usePushButtonStore((state) => state.buttons);
    const setPressed = usePushButtonStore((state) => state.setPressed);

    const handleMouseDown = () => {
        setPressed(button, true);
    };

    const handleMouseUp = () => {
        setPressed(button, false);
    };

    const buttonObj = buttons.find((b) => b.id === button);

    return (
        <div>
            <button
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {buttonObj && buttonObj.isPressed ? "Pressed" : "Released"}
            </button>
        </div>
    );
}
