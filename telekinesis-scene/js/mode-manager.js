export class ModeManager {
  constructor(context) {
    this.context = context;
    this.currentMode = null;
    this.modes = {};
  }

  add(mode) {
    let name = mode.name;
    this.modes[name] = mode;
  }

  initTo(mode) {
    this.currentMode = mode;
    this.currentMode.enter();
  }

  transitTo(mode) {
    if (this.currentMode != null) {
      this.currentMode.exit();
    }
    this.currentMode = mode;
    this.currentMode.enter();
  }
}
