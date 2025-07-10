import { Mode } from '../../mode.js';

export class IdleMode extends Mode {
  constructor(context) {
    super(context);
    this.name = 'Idle';
  }

  enter() {
    super.enter();
  }

  execute() {
    super.execute();
  }

  exit() {
    super.exit();
  }

  handleGrabStart(handEntity) {
    let modeTo = this.context.modeManager.modes['UniManual'];
    modeTo.handEntity = handEntity;

    this.context.modeManager.transitTo(modeTo);
  }

  handleGrabEnd(handEntity) { }

  handlePinchStart(handEntity) { }

  handlePinchEnd(handEntity) { }

  handleLockStart(handEntity) { }

  handleLockEnd(handEntity) { }
}
