import { IdleMode } from './modes/idle-mode.js';
import { UniManualMode } from './modes/uni-manual-mode.js';
import { BiManualMode } from './modes/bi-manual-mode.js';

export class ModeManager {
  constructor(context) {
    this.context = context;
    this.currentMode = null;
    this.modes = {
      Idle: new IdleMode(this.context),
      UniManual: new UniManualMode(this.context),
      BiManual: new BiManualMode(this.context),
    };
    this.transitTo(this.modes['Idle']);
  }

  transitTo(mode) {
    if (this.currentMode != null) {
      this.currentMode.exit();
    }
    this.currentMode = mode;
    this.currentMode.enter();
  }
}
