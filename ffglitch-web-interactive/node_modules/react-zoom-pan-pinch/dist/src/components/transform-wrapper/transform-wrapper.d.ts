import React from "react";
import { ZoomPanPinch } from "../../core/instance.core";
import { ReactZoomPanPinchContentRef, ReactZoomPanPinchProps } from "../../models";
export declare const Context: React.Context<ZoomPanPinch>;
export declare const TransformWrapper: React.ForwardRefExoticComponent<Omit<ReactZoomPanPinchProps, "ref"> & React.RefAttributes<ReactZoomPanPinchContentRef>>;
