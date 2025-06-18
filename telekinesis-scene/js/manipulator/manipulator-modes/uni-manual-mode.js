import { Mode } from '../../mode.js';
import { setWorldTransform } from '../manipulator.js';

export class UniManualMode extends Mode {
  constructor(context) {
    super(context);
    this.name = 'UniManual';

    this.handEntity = null;
  }

  enter() {
    super.enter();

    this.context.planeEntity.setAttribute('visible', 'true');

    this.updatePlaneTransform();
  }

  execute() {
    super.execute();

    this.updatePlaneTransform();
  }

  exit() {
    super.exit();

    this.context.planeEntity.setAttribute('visible', 'false');
    const planeObj = this.context.planeEntity.object3D;
    planeObj.position.set(0, 0, 0);
    planeObj.rotation.set(0, 0, 0);
    planeObj.updateMatrixWorld(true);

    this.handEntity = null;
  }

  handlePinchStart(handEntity) {
    let modeTo = this.context.modeManager.modes['BiManual'];

    const exHandedness = this.handEntity.components['hand-tracking-controls'].data.hand;
    const newHandedness = handEntity.components['hand-tracking-controls'].data.hand;

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
    let modeTo = this.context.modeManager.modes['Idle'];

    this.context.modeManager.transitTo(modeTo);
  }

  updatePlaneTransform() {
    const handData = this.handEntity.components['hand-tracking-controls'];
    const handedness = handData.data.hand;

    let pinchPos = new THREE.Vector3().copy(handData.pinchEventDetail.position);
    let pinchRot = new THREE.Quaternion().copy(handData.pinchEventDetail.wristRotation);

    let pinchUp = new THREE.Vector3();
    let pinchRight = new THREE.Vector3();
    let pinchForward = new THREE.Vector3();
    let pinchRotationMatrix = new THREE.Matrix4();
    pinchRotationMatrix.makeRotationFromQuaternion(pinchRot);
    pinchRotationMatrix.extractBasis(pinchRight, pinchUp, pinchForward);

    // up
    let planeUp;
    if (handedness == 'left') {
      planeUp = pinchRight.clone();
    } else {
      planeUp = pinchRight.clone().negate();
    }

    // forward
    let planeForward = pinchForward.clone();

    // right
    let planeRight = new THREE.Vector3().crossVectors(planeUp, planeForward);

    let planeRotationMatrix = new THREE.Matrix4();
    planeRotationMatrix.makeBasis(planeRight, planeUp, planeForward);

    let pos = new THREE.Vector3().copy(pinchPos);
    let rot = new THREE.Quaternion().setFromRotationMatrix(planeRotationMatrix);
    let scl = new THREE.Vector3();

    const planeObj = this.context.planeEntity.object3D;
    planeObj.getWorldScale(scl);

    setWorldTransform(
      planeObj,
      pos,
      rot,
      scl
    );
  }
}
