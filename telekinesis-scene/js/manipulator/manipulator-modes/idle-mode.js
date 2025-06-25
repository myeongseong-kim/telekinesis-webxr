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
    let toMode = this.context.modeManager.modes['UniManual'];
    // let toMode = this.context.modeManager.modes['UniManipulate6Dof'];
    // let toMode = this.context.modeManager.modes['UniTranslate3Dof'];
    toMode.handEntity = handEntity;

    this.context.modeManager.transitTo(toMode);
  }

  handlePinchMove(handEntity) {}

  handlePinchEnd(handEntity) {}
}
