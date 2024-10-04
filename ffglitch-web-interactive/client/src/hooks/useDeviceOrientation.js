import { useState, useEffect, useCallback } from "react";

export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState({
    alpha: null,
    beta: null,
    gamma: null,
  });
  const [error, setError] = useState(null);
  const [hasGyroscopeData, setHasGyroscopeData] = useState(false); // New state to track gyroscope data availability

  const handleOrientation = (event) => {
    // Check if valid orientation data is coming in
    if (event.alpha !== null || event.beta !== null || event.gamma !== null) {
      setHasGyroscopeData(true); // Gyroscope is providing data
    }

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
    setHasGyroscopeData(false); // Reset gyroscope availability
  }, []);

  useEffect(() => {
    return () => {
      revokeAccess(); // Clean up on unmount
    };
  }, [revokeAccess]);

  return {
    orientation,
    error,
    hasGyroscopeData, // Return gyroscope data state
    requestAccess,
    revokeAccess,
  };
};

// // src/hooks/useDeviceOrientation.js
// import { useState, useEffect, useCallback } from "react";

// export const useDeviceOrientation = () => {
//   const [orientation, setOrientation] = useState({
//     alpha: null,
//     beta: null,
//     gamma: null,
//   });
//   const [error, setError] = useState(null);

//   const handleOrientation = (event) => {
//     setOrientation({
//       alpha: event.alpha,
//       beta: event.beta,
//       gamma: event.gamma,
//     });
//   };

//   const requestAccess = useCallback(async () => {
//     if (typeof DeviceOrientationEvent.requestPermission === "function") {
//       try {
//         const permission = await DeviceOrientationEvent.requestPermission();
//         if (permission === "granted") {
//           window.addEventListener("deviceorientation", handleOrientation);
//           return true;
//         } else {
//           setError("Permission denied");
//           return false;
//         }
//       } catch (err) {
//         setError(err);
//         return false;
//       }
//     } else {
//       window.addEventListener("deviceorientation", handleOrientation);
//       return true;
//     }
//   }, []);

//   const revokeAccess = useCallback(() => {
//     window.removeEventListener("deviceorientation", handleOrientation);
//     setOrientation({
//       alpha: null,
//       beta: null,
//       gamma: null,
//     });
//   }, []);

//   useEffect(() => {
//     return () => {
//       revokeAccess(); // Clean up on unmount
//     };
//   }, [revokeAccess]);

//   return {
//     orientation,
//     error,
//     requestAccess,
//     revokeAccess,
//   };
// };
