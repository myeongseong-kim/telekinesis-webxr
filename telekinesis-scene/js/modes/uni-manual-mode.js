import { Mode } from './mode.js';

export class UniManualMode extends Mode {
  constructor(context) {
    super(context);
    this.handEntity = null;
  }

  enter() {
    super.enter();

    if (!this.context.targetEntity) return;

    var handedness = this.handEntity.components['hand-tracking-controls'].data.hand;
    if (handedness == 'left') {
      this.context.targetEntity.setAttribute('color', '#0000FF');
    } else if (handedness == 'right') {
      this.context.targetEntity.setAttribute('color', '#FF0000');
    }
  }

  execute() {
    super.execute();
  }

  exit() {
    super.exit();

    this.handEntity = null;
  }

  handlePinchStart(handEntity) {
    super.handlePinchStart(handEntity);

    var toMode = this.context.modeManager.modes['BiManual'];

    var exHandedness = this.handEntity.components['hand-tracking-controls'].data.hand;
    var newHandedness = handEntity.components['hand-tracking-controls'].data.hand;

    if (exHandedness == 'left' && newHandedness == 'right') {
      toMode.leftHandEntity = this.handEntity;
      toMode.rightHandEntity = handEntity;
    } else if (exHandedness == 'right' && newHandedness == 'left') {
      toMode.leftHandEntity = handEntity;
      toMode.rightHandEntity = this.handEntity;
    } else {
      console.error('Hand Tracking Goes Wrong...');
    }

    this.context.modeManager.transitTo(toMode);
  }

  handlePinchMove(handEntity) {
    super.handlePinchMove(handEntity);
  }

  handlePinchEnd(handEntity) {
    super.handlePinchEnd(handEntity);

    var toMode = this.context.modeManager.modes['Idle'];

    this.context.modeManager.transitTo(toMode);
  }
}
