import React from "react";
export type MiniMapProps = {
    children: React.ReactNode;
    width?: number;
    height?: number;
    borderColor?: string;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
export declare const MiniMap: React.FC<MiniMapProps>;
