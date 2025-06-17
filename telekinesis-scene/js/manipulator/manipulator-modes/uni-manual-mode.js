import { Mode } from '../../mode.js';

export class UniManualMode extends Mode {
  constructor(context) {
    super(context);
    this.name = 'UniManual';

    this.handEntity = null;
  }

  enter() {
    super.enter();

    if (!this.context.targetEntity) return;

    const handedness = this.handEntity.components['hand-tracking-controls'].data.hand;
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
    let modeTo = this.context.modeManager.modes['BiManual'];

    const exHandedness = this.handEntity.components['hand-tracking-controls'].data.hand;
    const newHandedness = handEntity.components['hand-tracking-controls'].data.hand;

    if (exHandedness == 'left' && newHandedness == 'right') {
      modeTo.leftHandEntity = this.handEntity;
      modeTo.rightHandEntity = handEntity;
    } else if (exHandedness == 'right' && newHandedness == 'left') {
      modeTo.leftHandEntity = handEntity;
      modeTo.rightHandEntity = this.handEntity;
    } else {
      console.error('Hand Tracking Goes Wrong...');
    }

    this.context.modeManager.transitTo(modeTo);
  }

  handlePinchEnd(handEntity) {
    let modeTo = this.context.modeManager.modes['Idle'];

    this.context.modeManager.transitTo(modeTo);
  }
}
