import { ModeManager } from '../mode-manager.js';
import { IdleMode } from './manipulator-modes/idle-mode.js';
import { UniManualMode } from './manipulator-modes/uni-manual-mode.js';
import { BiManualMode } from './manipulator-modes/bi-manual-mode.js';

AFRAME.registerComponent('manipulator', {
  schema: {
    target: { type: 'selector' },
    plane: { type: 'selector', default: '#manipulationPlane' },
  },

  init: function () {
    this.modeManager = new ModeManager(this);
    this.modeManager.add(new IdleMode(this));
    this.modeManager.add(new UniManualMode(this));
    this.modeManager.add(new BiManualMode(this));
    this.modeManager.initTo(this.modeManager.modes['Idle']);

    this.leftHandEntity = this.el.sceneEl.querySelector('[hand-tracking-controls="hand: left"]');
    this.rightHandEntity = this.el.sceneEl.querySelector('[hand-tracking-controls="hand: right"]');

    this.targetEntity = this.data.target;
    this.planeEntity = this.data.plane;

    this.pinchStartHandler = this.onPinchStart.bind(this);
    this.pinchMoveHandler = this.onPinchMove.bind(this);
    this.pinchEndHandler = this.onPinchEnd.bind(this);

    if (this.leftHandEntity) {
      this.leftHandEntity.addEventListener('pinchstarted', this.pinchStartHandler);
      this.leftHandEntity.addEventListener('pinchmoved', this.pinchMoveHandler);
      this.leftHandEntity.addEventListener('pinchended', this.pinchEndHandler);
    }
    if (this.rightHandEntity) {
      this.rightHandEntity.addEventListener('pinchstarted', this.pinchStartHandler);
      this.rightHandEntity.addEventListener('pinchmoved', this.pinchMoveHandler);
      this.rightHandEntity.addEventListener('pinchended', this.pinchEndHandler);
    }

    console.log('Manipulator Initialized.');
  },

  onPinchStart: function (evt) {
    this.modeManager.currentMode.handlePinchStart(evt.target);
  },

  onPinchMove: function (evt) {
    this.modeManager.currentMode.handlePinchMove(evt.target);
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
      this.leftHandEntity.removeEventListener('pinchmoved', this.pinchMoveHandler);
      this.leftHandEntity.removeEventListener('pinchended', this.pinchEndHandler);
    }
    if (this.rightHandEntity) {
      this.rightHandEntity.removeEventListener('pinchstarted', this.pinchStartHandler);
      this.rightHandEntity.removeEventListener('pinchmoved', this.pinchMoveHandler);
      this.rightHandEntity.removeEventListener('pinchended', this.pinchEndHandler);
    }
  },
});
