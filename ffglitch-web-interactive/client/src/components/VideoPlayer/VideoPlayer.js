// src/components/VideoPlayer/VideoPlayer.js
import React, { useEffect, useRef } from "react";

const VideoPlayer = ({ src }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error("Error attempting to play video:", error);
        });
      }
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      autoPlay
      muted
      loop
      style={{ width: "100%", height: "auto" }}
    >
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoPlayer;
