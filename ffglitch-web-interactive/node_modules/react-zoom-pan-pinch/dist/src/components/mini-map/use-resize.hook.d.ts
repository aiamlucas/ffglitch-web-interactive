export type NonNullableKeys<T> = {
    [P in keyof T]-?: NonNullable<T[P]>;
};
export type Nullable<T> = T | null;
export type ElementRect = Omit<DOMRect, "toJSON">;
type ResizeHandler<T extends HTMLElement> = (elementRect: ElementRect, element: T) => void;
export declare const useResize: <T extends HTMLElement>(ref: Nullable<T>, onResize: ResizeHandler<T>, dependencies: any[]) => void;
export {};
