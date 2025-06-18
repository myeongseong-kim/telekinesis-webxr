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

  handlePinchStart(handEntity) {
    let modeTo = this.context.modeManager.modes['UniManual'];
    modeTo.handEntity = handEntity;

    this.context.modeManager.transitTo(modeTo);
  }

  handlePinchEnd(handEntity) { }
}
