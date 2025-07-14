AFRAME.registerComponent('manipulator', {
  schema: {
    target: { type: 'selector' },
  },

  init: function () {
    this.modeManager = new ModeManager(this);

    this.targetEntity = this.data.target;
    this.leftHandEntity = this.el.sceneEl.querySelector('[hand-tracking-controls="hand: left"]');
    this.rightHandEntity = this.el.sceneEl.querySelector('[hand-tracking-controls="hand: right"]');

    this.pinchStartHandler = this.onPinchStart.bind(this);
    this.pinchEndHandler = this.onPinchEnd.bind(this);

    if (this.leftHandEntity) {
      this.leftHandEntity.addEventListener('pinchstarted', this.pinchStartHandler);
      this.leftHandEntity.addEventListener('pinchended', this.pinchEndHandler);
    }
    if (this.rightHandEntity) {
      this.rightHandEntity.addEventListener('pinchstarted', this.pinchStartHandler);
      this.rightHandEntity.addEventListener('pinchended', this.pinchEndHandler);
    }
  },

  onPinchStart: function (evt) {
    this.modeManager.currentMode.handlePinchStart(evt.target);
  },

  onPinchEnd: function (evt) {
    this.modeManager.currentMode.handlePinchEnd(evt.target);
  },

  tick: function (time, deltaTime) {
    if (this.modeManager.currentMode) {
      this.modeManager.currentMode.execute();
    }
  },

  remove: function () {
    if (this.leftHandEntity) {
      this.leftHandEntity.removeEventListener('pinchstarted', this.pinchStartHandler);
      this.leftHandEntity.removeEventListener('pinchended', this.pinchEndHandler);
    }
    if (this.rightHandEntity) {
      this.rightHandEntity.removeEventListener('pinchstarted', this.pinchStartHandler);
      this.rightHandEntity.removeEventListener('pinchended', this.pinchEndHandler);
    }
  },
});

class ModeManager {
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

class Mode {
  constructor(context) {
    this.context = context;
  }

  enter() {
    // console.log(`Enter: ${this.constructor.name} Mode`);
  }
  execute() {
    // console.log(`Execute: ${this.constructor.name} Mode`);
  }
  exit() {
    // console.log(`Exit: ${this.constructor.name} Mode`);
  }
}

class IdleMode extends Mode {
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
    var modeTo = this.context.modeManager.modes['UniManual'];
    modeTo.handEntity = handEntity;

    this.context.modeManager.transitTo(modeTo);
  }
  handlePinchEnd(handEntity) { }
}

class UniManualMode extends Mode {
  constructor(context) {
    super(context);
    this.handEntity = null;
  }

  enter() {
    super.enter();

    if (!this.context.targetEntity) return;

    var handedness = this.handEntity.components['hand-tracking-controls'].data.hand;
    if (handedness == 'left') {
      this.context.targetEntity.setAttribute('color', '#0000FF');
    } else if (handedness == 'right') {
      this.context.targetEntity.setAttribute('color', '#FF0000');
    }
  }
  execute() {
    super.execute();
  }
  exit() {
    super.exit();

    this.handEntity = null;
  }

  handlePinchStart(handEntity) {
    var modeTo = this.context.modeManager.modes['BiManual'];

    var exHandedness = this.handEntity.components['hand-tracking-controls'].data.hand;
    var newHandedness = handEntity.components['hand-tracking-controls'].data.hand;
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
  handlePinchEnd(handEntity) {
    var modeTo = this.context.modeManager.modes['Idle'];

    this.context.modeManager.transitTo(modeTo);
  }
}

class BiManualMode extends Mode {
  constructor(context) {
    super(context);
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
    var modeTo = this.context.modeManager.modes['UniManual'];

    var handedness = handEntity.components['hand-tracking-controls'].data.hand;
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
