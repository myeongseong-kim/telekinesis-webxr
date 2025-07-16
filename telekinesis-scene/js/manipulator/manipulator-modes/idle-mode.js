import { Mode } from '../../mode.js';
import { LockPose } from '../../poses/lock-pose.js';

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

  handlePinchStart(handEntity) {
    const handPose = handEntity.components['hand-pose-controls'];

    if (LockPose.isSelected(handPose.currentPose)) {
      let modeTo = this.context.modeManager.modes['UniTranslate'];
      modeTo.handEntity = handEntity;

      this.context.modeManager.transitTo(modeTo);
    }
    else {
      let modeTo = this.context.modeManager.modes['UniManipulate'];
      modeTo.handEntity = handEntity;

      this.context.modeManager.transitTo(modeTo);
    }
  }

  handlePinchEnd(handEntity) { }

  handleLockStart(handEntity) { }

  handleLockEnd(handEntity) { }
}
