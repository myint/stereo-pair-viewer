# Stereo Pair Viewer - WebXR

A Three.js application for viewing stereo image pairs in virtual reality using WebXR.

## Features

- **WebXR Support**: View stereo images in VR headsets
- **Adjustable Disparity**: Real-time slider to adjust horizontal offset between left and right images
- **Distance Control**: Adjust how far the image plane appears from the viewer
- **Image Upload**: Load your own stereo image pairs
- **Layer-based Rendering**: Each eye sees only its corresponding image

## Usage

### Running the Application

1. Serve the files using a local web server (required for WebXR):
   ```bash
   python3 -m http.server 8000
   # or
   npx serve
   ```

2. Open your browser to `http://localhost:8000`

3. Load your stereo images:
   - Click "Choose File" for Left Image
   - Click "Choose File" for Right Image

4. Adjust settings:
   - **Disparity**: Controls horizontal separation (-2 to 2)
   - **Distance**: Controls depth of image plane (0.5m to 10m)

5. Click "Enter VR" to view in your VR headset

### Creating Stereo Image Pairs

You can create stereo pairs by:
1. Taking two photos from slightly different positions (left and right)
2. Using 3D rendering software to generate left and right eye views
3. Using existing stereo photography or 3D content

## Technical Details

### How It Works

- **Layer-based Rendering**: The app uses Three.js layers to control what each eye sees
  - Layer 1: Left eye content
  - Layer 2: Right eye content

- **WebXR Stereo Rendering**: The WebXR API automatically handles rendering separate views for each eye

- **Disparity Control**: Adjusts horizontal positioning to control perceived depth

### Browser Requirements

- WebXR-compatible browser (Chrome, Edge, Firefox)
- HTTPS or localhost (required for WebXR)
- VR headset with WebXR support (Meta Quest, etc.)

## Files

- `index.html`: Main HTML structure and UI
- `app.js`: Three.js application and WebXR logic
- `README.md`: This file

## Dependencies

- Three.js (loaded from CDN)
- VRButton module from Three.js examples

## Tips

- Start with disparity at 0 and adjust based on your preference
- Positive disparity makes images appear further away
- Negative disparity makes images appear closer
- Distance slider moves the entire image plane forward/backward
