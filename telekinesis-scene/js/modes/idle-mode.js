import { Mode } from './mode.js';

export class IdleMode extends Mode {
  constructor(context) {
    super(context);
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
    super.handlePinchStart(handEntity);

    let toMode = this.context.modeManager.modes['UniManual'];
    toMode.handEntity = handEntity;

    this.context.modeManager.transitTo(toMode);
  }

  handlePinchMove(handEntity) {
    super.handlePinchMove(handEntity);
  }

  handlePinchEnd(handEntity) {
    super.handlePinchEnd(handEntity);
  }
}
