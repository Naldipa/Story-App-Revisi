export default class Camera {
  constructor({ video, canvas }) {
    this.video = video;
    this.canvas = canvas;
    this.stream = null;
    this.photoBlob = null;
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      this.video.srcObject = this.stream;
      await new Promise((resolve) => {
        this.video.onloadedmetadata = resolve;
      });

      // Start video playback
      await this.video.play();
      return true;
    } catch (error) {
      console.error("Camera error:", error);
      throw new Error(
        "Could not access camera. Please ensure permissions are granted."
      );
    }
  }

  async capture() {
    if (!this.stream) {
      throw new Error("Camera not started");
    }

    try {
      // Set canvas dimensions to match video stream
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;

      // Draw current video frame to canvas
      const context = this.canvas.getContext("2d");
      context.drawImage(
        this.video,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );

      // Convert canvas to blob
      return await new Promise((resolve) => {
        this.canvas.toBlob(
          (blob) => {
            this.photoBlob = blob;
            resolve(blob);
          },
          "image/jpeg",
          0.9
        );
      });
    } catch (error) {
      console.error("Capture error:", error);
      throw new Error("Failed to capture photo");
    }
  }

  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.video.srcObject = null;
      this.stream = null;
    }
  }

  getLastPhoto() {
    return this.photoBlob;
  }
}
