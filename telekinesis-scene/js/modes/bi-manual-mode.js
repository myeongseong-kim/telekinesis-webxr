import { Mode } from './mode.js';

export class BiManualMode extends Mode {
  constructor(context) {
    super(context);
    this.leftHandEntity = null;
    this.rightHandEntity = null;
  }

  enter() {
    super.enter();

    if (!this.context.targetEntity) return;

    this.context.targetEntity.setAttribute('color', '#FF00FF');
  }

  execute() {
    super.execute();
  }

  exit() {
    super.exit();

    this.leftHandEntity = null;
    this.rightHandEntity = null;
  }

  handlePinchStart(handEntity) {
    super.handlePinchStart(handEntity);
  }

  handlePinchMove(handEntity) {
    super.handlePinchMove(handEntity);
  }

  handlePinchEnd(handEntity) {
    super.handlePinchEnd(handEntity);

    var toMode = this.context.modeManager.modes['UniManual'];

    var handedness = handEntity.components['hand-tracking-controls'].data.hand;
    if (handedness == 'left') {
      toMode.handEntity = this.rightHandEntity;
    } else if (handedness == 'right') {
      toMode.handEntity = this.leftHandEntity;
    } else {
      console.error('Hand Tracking Goes Wrong...');
    }

    this.context.modeManager.transitTo(toMode);
  }
}
