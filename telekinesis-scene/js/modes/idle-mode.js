import { Mode } from './mode.js';

export class IdleMode extends Mode {
  constructor(context) {
    super(context);
  }

  enter() {
    super.enter();

    if (!this.context.targetEntity) return;

    this.context.targetEntity.setAttribute('color', '#FFFFFF');
  }

  execute() {
    super.execute();
  }

  exit() {
    super.exit();
  }

  handlePinchStart(handEntity) {
    super.handlePinchStart(handEntity);

    var toMode = this.context.modeManager.modes['UniManual'];
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
