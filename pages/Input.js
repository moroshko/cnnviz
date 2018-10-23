import { INPUT_TYPES } from "../utils/constants";
import ImageInput from "./ImageInput";
import CameraInput from "./CameraInput";

export default class Input extends React.Component {
  inputRef = input => {
    if (input != null) {
      this.input = input;
    }
  };

  getData() {
    return this.input.getData();
  }

  render() {
    const {
      inputType,
      displayWidth,
      displayHeight,
      padding,
      scale,
      inputImage,
      onUpdate
    } = this.props;

    switch (inputType) {
      case INPUT_TYPES.IMAGE: {
        return (
          <ImageInput
            displayWidth={displayWidth}
            displayHeight={displayHeight}
            padding={padding}
            scale={scale}
            src={inputImage.src}
            onUpdate={onUpdate}
            ref={this.inputRef}
          />
        );
      }

      case INPUT_TYPES.CAMERA: {
        return (
          <CameraInput
            displayWidth={displayWidth}
            displayHeight={displayHeight}
            padding={padding}
            scale={scale}
            onUpdate={onUpdate}
            ref={this.inputRef}
          />
        );
      }
    }
  }
}
