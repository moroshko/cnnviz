import { INPUT_TYPES, MAX_PADDING } from "../utils/constants";
import { filterChannels } from "../utils/shared";
import ImageInput from "./ImageInput";
import CameraInput from "./CameraInput";
import Dimensions from "./Dimensions";

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
      hasRedChannel,
      hasGreenChannel,
      hasBlueChannel,
      onUpdate
    } = this.props;
    let inputComponent;

    switch (inputType) {
      case INPUT_TYPES.IMAGE: {
        inputComponent = (
          <ImageInput
            displayWidth={displayWidth}
            displayHeight={displayHeight}
            padding={padding}
            scale={scale}
            src={inputImage.src}
            hasRedChannel={hasRedChannel}
            hasGreenChannel={hasGreenChannel}
            hasBlueChannel={hasBlueChannel}
            onUpdate={onUpdate}
            ref={this.inputRef}
          />
        );
        break;
      }

      case INPUT_TYPES.CAMERA: {
        inputComponent = (
          <CameraInput
            displayWidth={displayWidth}
            displayHeight={displayHeight}
            padding={padding}
            scale={scale}
            hasRedChannel={hasRedChannel}
            hasGreenChannel={hasGreenChannel}
            hasBlueChannel={hasBlueChannel}
            onUpdate={onUpdate}
            ref={this.inputRef}
          />
        );
        break;
      }
    }

    return (
      <div>
        {inputComponent}
        <div className="dimensions">
          <Dimensions
            width={displayWidth / scale - (padding << 1)}
            height={displayHeight / scale - (padding << 1)}
            padding={padding}
          />
        </div>
        <style jsx>{`
          .dimensions {
            margin-left: ${MAX_PADDING * scale}px;
          }
        `}</style>
      </div>
    );
  }
}
