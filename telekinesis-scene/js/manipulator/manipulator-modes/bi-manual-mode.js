import { Mode } from '../../mode.js';

export class BiManualMode extends Mode {
  constructor(context) {
    super(context);
    this.name = 'BiManual';

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

  handlePinchStart(handEntity) { }

  handlePinchEnd(handEntity) {
    let modeTo = this.context.modeManager.modes['UniManual'];

    const handedness = handEntity.components['hand-tracking-controls'].data.hand;
    if (handedness == 'left') {
      modeTo.handEntity = this.rightHandEntity;
    } else if (handedness == 'right') {
      modeTo.handEntity = this.leftHandEntity;
    } else {
      console.error('Hand Tracking Goes Wrong...');
    }

    this.context.modeManager.transitTo(modeTo);
  }
}
