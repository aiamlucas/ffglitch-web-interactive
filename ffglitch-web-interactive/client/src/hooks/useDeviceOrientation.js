// // src/hooks/useDeviceOrientation.js
import { useState, useEffect, useCallback } from "react";

export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState({
    alpha: null,
    beta: null,
    gamma: null,
  });
  const [error, setError] = useState(null);

  const handleOrientation = (event) => {
    setOrientation({
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
    });
  };

  const requestAccess = useCallback(async () => {
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === "granted") {
          window.addEventListener("deviceorientation", handleOrientation);
          return true;
        } else {
          setError("Permission denied");
          return false;
        }
      } catch (err) {
        setError(err);
        return false;
      }
    } else {
      window.addEventListener("deviceorientation", handleOrientation);
      return true;
    }
  }, []);

  const revokeAccess = useCallback(() => {
    window.removeEventListener("deviceorientation", handleOrientation);
    setOrientation({
      alpha: null,
      beta: null,
      gamma: null,
    });
  }, []);

  useEffect(() => {
    return () => {
      revokeAccess(); // Clean up on unmount
    };
  }, [revokeAccess]);

  return {
    orientation,
    error,
    requestAccess,
    revokeAccess,
  };
};
