import { create } from "zustand";

export const useToggleStore = create((set) => ({
    buttons: [
        { id: 1, isToggled: false },
        { id: 2, isToggled: false },
        { id: 3, isToggled: false },
    ],
    toggleButton: (id) => {
        set((state) => {
            const newButtons = state.buttons.map((button) => {
                if (button.id === id) {
                    return { ...button, isToggled: !button.isToggled };
                }
                return button;
            });
            return { buttons: newButtons };
        });
    },
}));

export const usePushButtonStore = create((set) => ({
    buttons: [
        { id: 1, isPressed: false },
        { id: 2, isPressed: false },
        { id: 3, isPressed: false },
    ],
    setPressed: (id, isPressed) => {
        set((state) => {
            const newButtons = state.buttons.map((button) => {
                if (button.id === id) {
                    return { ...button, isPressed };
                }
                return button;
            });
            return { buttons: newButtons };
        });
    },
}));

export const useFaderXStore = create((set) => ({
    faders: [
        { id: 1, value: 0 },
        { id: 2, value: 0 },
        { id: 3, value: 0 },
        { id: 4, value: 0 },
        { id: 5, value: 0 },
    ],
    setFaderValue: (id, value) => {
        set((state) => {
            const newFaders = state.faders.map((fader) => {
                if (fader.id === id) {
                    return { ...fader, value };
                }
                return fader;
            });
            return { faders: newFaders };
        });
    },
}));
