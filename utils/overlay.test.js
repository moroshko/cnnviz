const { getGridPosition } = require('./overlay');

describe('getGridPosition', () => {
  describe('filterSize = 1', () => {
    describe('stride = 1', () => {
      it('top left corner', () => {
        expect(
          getGridPosition({
            inputWidth: 13,
            inputHeight: 8,
            filterSize: 1,
            stride: 1,
            inputX: 0,
            inputY: 0,
          })
        ).toMatchObject({
          inputOverlayGridX: 0,
          inputOverlayGridY: 0,
          outputOverlayGridX: 0,
          outputOverlayGridY: 0,
        });
      });

      it('bottom right corner', () => {
        expect(
          getGridPosition({
            inputWidth: 13,
            inputHeight: 8,
            filterSize: 1,
            stride: 1,
            inputX: 12,
            inputY: 7,
          })
        ).toMatchObject({
          inputOverlayGridX: 12,
          inputOverlayGridY: 7,
          outputOverlayGridX: 12,
          outputOverlayGridY: 7,
        });
      });

      it('somewhere in the middle', () => {
        expect(
          getGridPosition({
            inputWidth: 13,
            inputHeight: 8,
            filterSize: 1,
            stride: 1,
            inputX: 8,
            inputY: 4,
          })
        ).toMatchObject({
          inputOverlayGridX: 8,
          inputOverlayGridY: 4,
          outputOverlayGridX: 8,
          outputOverlayGridY: 4,
        });
      });
    });
  });

  describe('filterSize = 3', () => {
    describe('stride = 1', () => {
      it('left clamp', () => {
        expect(
          getGridPosition({
            inputWidth: 13,
            inputHeight: 8,
            filterSize: 3,
            stride: 1,
            inputX: 0,
            inputY: 0,
          })
        ).toMatchObject({
          inputOverlayGridX: 0,
          inputOverlayGridY: 0,
          outputOverlayGridX: 0,
          outputOverlayGridY: 0,
        });
      });

      it('right clamp', () => {
        expect(
          getGridPosition({
            inputWidth: 13,
            inputHeight: 8,
            filterSize: 3,
            stride: 1,
            inputX: 12,
            inputY: 7,
          })
        ).toMatchObject({
          inputOverlayGridX: 10,
          inputOverlayGridY: 5,
          outputOverlayGridX: 10,
          outputOverlayGridY: 5,
        });
      });

      it('no clamp', () => {
        expect(
          getGridPosition({
            inputWidth: 13,
            inputHeight: 8,
            filterSize: 3,
            stride: 1,
            inputX: 8,
            inputY: 4,
          })
        ).toMatchObject({
          inputOverlayGridX: 7,
          inputOverlayGridY: 3,
          outputOverlayGridX: 7,
          outputOverlayGridY: 3,
        });
      });
    });

    describe('stride = 2', () => {
      it('left clamp', () => {
        expect(
          getGridPosition({
            inputWidth: 13,
            inputHeight: 8,
            filterSize: 3,
            stride: 2,
            inputX: 0,
            inputY: 0,
          })
        ).toMatchObject({
          inputOverlayGridX: 0,
          inputOverlayGridY: 0,
          outputOverlayGridX: 0,
          outputOverlayGridY: 0,
        });
      });

      it('right clamp', () => {
        expect(
          getGridPosition({
            inputWidth: 13,
            inputHeight: 8,
            filterSize: 3,
            stride: 2,
            inputX: 12,
            inputY: 7,
          })
        ).toMatchObject({
          inputOverlayGridX: 10,
          inputOverlayGridY: 4,
          outputOverlayGridX: 5,
          outputOverlayGridY: 2,
        });
      });

      it('no clamp', () => {
        expect(
          getGridPosition({
            inputWidth: 13,
            inputHeight: 8,
            filterSize: 3,
            stride: 2,
            inputX: 8,
            inputY: 4,
          })
        ).toMatchObject({
          inputOverlayGridX: 6,
          inputOverlayGridY: 2,
          outputOverlayGridX: 3,
          outputOverlayGridY: 1,
        });
      });
    });

    describe('stride = 3', () => {
      it('left clamp', () => {
        expect(
          getGridPosition({
            inputWidth: 13,
            inputHeight: 8,
            filterSize: 3,
            stride: 3,
            inputX: 0,
            inputY: 0,
          })
        ).toMatchObject({
          inputOverlayGridX: 0,
          inputOverlayGridY: 0,
          outputOverlayGridX: 0,
          outputOverlayGridY: 0,
        });
      });

      it('right clamp', () => {
        expect(
          getGridPosition({
            inputWidth: 13,
            inputHeight: 8,
            filterSize: 3,
            stride: 3,
            inputX: 12,
            inputY: 7,
          })
        ).toMatchObject({
          inputOverlayGridX: 9,
          inputOverlayGridY: 3,
          outputOverlayGridX: 3,
          outputOverlayGridY: 1,
        });
      });

      it('no clamp', () => {
        expect(
          getGridPosition({
            inputWidth: 13,
            inputHeight: 8,
            filterSize: 3,
            stride: 3,
            inputX: 8,
            inputY: 4,
          })
        ).toMatchObject({
          inputOverlayGridX: 6,
          inputOverlayGridY: 3,
          outputOverlayGridX: 2,
          outputOverlayGridY: 1,
        });
      });
    });
  });

  describe('filterSize = 5', () => {
    describe('stride = 1', () => {
      it('left clamp', () => {
        expect(
          getGridPosition({
            inputWidth: 13,
            inputHeight: 8,
            filterSize: 5,
            stride: 1,
            inputX: 0,
            inputY: 0,
          })
        ).toMatchObject({
          inputOverlayGridX: 0,
          inputOverlayGridY: 0,
          outputOverlayGridX: 0,
          outputOverlayGridY: 0,
        });
      });

      it('right clamp', () => {
        expect(
          getGridPosition({
            inputWidth: 13,
            inputHeight: 8,
            filterSize: 5,
            stride: 1,
            inputX: 12,
            inputY: 7,
          })
        ).toMatchObject({
          inputOverlayGridX: 8,
          inputOverlayGridY: 3,
          outputOverlayGridX: 8,
          outputOverlayGridY: 3,
        });
      });

      it('no clamp', () => {
        expect(
          getGridPosition({
            inputWidth: 13,
            inputHeight: 8,
            filterSize: 5,
            stride: 1,
            inputX: 8,
            inputY: 4,
          })
        ).toMatchObject({
          inputOverlayGridX: 6,
          inputOverlayGridY: 2,
          outputOverlayGridX: 6,
          outputOverlayGridY: 2,
        });
      });
    });

    describe('stride = 4', () => {
      it('left clamp', () => {
        expect(
          getGridPosition({
            inputWidth: 13,
            inputHeight: 8,
            filterSize: 5,
            stride: 4,
            inputX: 0,
            inputY: 0,
          })
        ).toMatchObject({
          inputOverlayGridX: 0,
          inputOverlayGridY: 0,
          outputOverlayGridX: 0,
          outputOverlayGridY: 0,
        });
      });

      it('right clamp', () => {
        expect(
          getGridPosition({
            inputWidth: 13,
            inputHeight: 8,
            filterSize: 5,
            stride: 4,
            inputX: 12,
            inputY: 7,
          })
        ).toMatchObject({
          inputOverlayGridX: 8,
          inputOverlayGridY: 0,
          outputOverlayGridX: 2,
          outputOverlayGridY: 0,
        });
      });

      it('no clamp', () => {
        expect(
          getGridPosition({
            inputWidth: 13,
            inputHeight: 8,
            filterSize: 5,
            stride: 4,
            inputX: 8,
            inputY: 4,
          })
        ).toMatchObject({
          inputOverlayGridX: 4,
          inputOverlayGridY: 0,
          outputOverlayGridX: 1,
          outputOverlayGridY: 0,
        });
      });
    });
  });

  describe('filterSize = 7', () => {
    describe('stride = 2', () => {
      it('left clamp', () => {
        expect(
          getGridPosition({
            inputWidth: 13,
            inputHeight: 8,
            filterSize: 7,
            stride: 2,
            inputX: 0,
            inputY: 0,
          })
        ).toMatchObject({
          inputOverlayGridX: 0,
          inputOverlayGridY: 0,
          outputOverlayGridX: 0,
          outputOverlayGridY: 0,
        });
      });

      it('right clamp', () => {
        expect(
          getGridPosition({
            inputWidth: 13,
            inputHeight: 8,
            filterSize: 7,
            stride: 2,
            inputX: 12,
            inputY: 7,
          })
        ).toMatchObject({
          inputOverlayGridX: 6,
          inputOverlayGridY: 0,
          outputOverlayGridX: 3,
          outputOverlayGridY: 0,
        });
      });

      it('no clamp', () => {
        expect(
          getGridPosition({
            inputWidth: 13,
            inputHeight: 8,
            filterSize: 7,
            stride: 2,
            inputX: 8,
            inputY: 4,
          })
        ).toMatchObject({
          inputOverlayGridX: 4,
          inputOverlayGridY: 0,
          outputOverlayGridX: 2,
          outputOverlayGridY: 0,
        });
      });
    });
  });
});
