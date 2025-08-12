import { Mode } from '../../mode.js';

export class ReadyMode extends Mode {
  constructor(context) {
    super(context);
    this.name = 'Ready';

    this.handEntity = null;
  }

  enter() {
    super.enter();
  }

  execute() {
    super.execute();
  }

  exit() {
    super.exit();

    this.handEntity = null;
  }

  handleGrabStart(handEntity) {
    let modeTo = this.context.modeManager.modes['Scale'];

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

  handleGrabEnd(handEntity) {
    let modeTo = this.context.modeManager.modes['Idle'];

    this.context.modeManager.transitTo(modeTo);
   }

  handlePinchStart(handEntity) { }

  handlePinchEnd(handEntity) { }

  handleLockStart(handEntity) { }

  handleLockEnd(handEntity) { }
}
