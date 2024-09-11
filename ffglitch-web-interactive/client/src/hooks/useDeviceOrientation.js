// src/hooks/useDeviceOrientation.js
import { useState, useEffect, useCallback } from "react";

export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState({
    alpha: null,
    beta: null,
    gamma: null,
  });
  const [error, setError] = useState(null);

  // Event handler for device orientation
  const handleOrientation = (event) => {
    setOrientation({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
    });
  };

  // Request permission for iOS and listen for device orientation
  const requestAccess = async () => {
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === "granted") {
          window.addEventListener("deviceorientation", handleOrientation);
        } else {
          setError(new Error("Permission denied to access device orientation"));
        }
      } catch (err) {
        setError(err);
      }
    } else {
      window.addEventListener("deviceorientation", handleOrientation);
    }
  };

  // Remove event listener on unmount or when permission is revoked
  const revokeAccess = () => {
    window.removeEventListener("deviceorientation", handleOrientation);
    setOrientation({ alpha: null, beta: null, gamma: null });
  };

  // Automatically revoke access when the component unmounts
  useEffect(() => {
    return () => revokeAccess();
  }, []);

  return {
    orientation,
    requestAccess,
    revokeAccess,
    error,
  };
};
