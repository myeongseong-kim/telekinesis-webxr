import { Mode } from '../../mode.js';
import { setWorldTransform } from '../manipulator.js';

export class BiManualMode extends Mode {
  constructor(context) {
    super(context);
    this.name = 'BiManual';

    this.leftHandEntity = null;
    this.rightHandEntity = null;
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

    this.leftHandEntity = null;
    this.rightHandEntity = null;
  }

  handlePinchStart(handEntity) { }

  handlePinchEnd(handEntity) {
    let modeTo = this.context.modeManager.modes['UniManual'];

    const handedness = handEntity.components['hand-tracking-controls'].data.hand;
    if (handedness == 'left') {
      modeTo.handEntity = this.rightHandEntity;
    } else if (handedness == 'right') {
      modeTo.handEntity = this.leftHandEntity;
    } else {
      console.error('Hand Tracking Goes Wrong...');
    }

    this.context.modeManager.transitTo(modeTo);
  }

  updatePlaneTransform() {
    const leftHandData = this.leftHandEntity.components['hand-tracking-controls'];
    const rightHandData = this.rightHandEntity.components['hand-tracking-controls'];

    let leftPinchPos = new THREE.Vector3().copy(leftHandData.pinchEventDetail.position);
    let leftPinchRot = new THREE.Quaternion().copy(leftHandData.pinchEventDetail.wristRotation);

    let rightPinchPos = new THREE.Vector3().copy(rightHandData.pinchEventDetail.position);
    let rightPinchRot = new THREE.Quaternion().copy(rightHandData.pinchEventDetail.wristRotation);

    let leftPinchRight = new THREE.Vector3();
    let leftPinchUp = new THREE.Vector3();
    let leftPinchForward = new THREE.Vector3();
    let leftPinchRotationMatrix = new THREE.Matrix4();
    leftPinchRotationMatrix.makeRotationFromQuaternion(leftPinchRot);
    leftPinchRotationMatrix.extractBasis(leftPinchRight, leftPinchUp, leftPinchForward);

    let rightPinchRight = new THREE.Vector3();
    let rightPinchUp = new THREE.Vector3();
    let rightPinchForward = new THREE.Vector3();
    let rightPinchRotationMatrix = new THREE.Matrix4();
    rightPinchRotationMatrix.makeRotationFromQuaternion(rightPinchRot);
    rightPinchRotationMatrix.extractBasis(rightPinchRight, rightPinchUp, rightPinchForward);

    // up
    let leftPlaneNormal = leftPinchRight.clone();
    let rightPlaneNormal = rightPinchRight.clone().negate();
    let planeUp = new THREE.Vector3().lerpVectors(leftPlaneNormal, rightPlaneNormal, 0.5).normalize();

    // forward
    let planeForward = new THREE.Vector3().lerpVectors(leftPinchForward, rightPinchForward, 0.5).normalize();
    planeForward.projectOnPlane(planeUp).normalize();

    // right
    let planeRight = new THREE.Vector3().crossVectors(planeUp, planeForward).normalize();

    let planeRotationMatrix = new THREE.Matrix4();
    planeRotationMatrix.makeBasis(planeRight, planeUp, planeForward);

    let pos = new THREE.Vector3().lerpVectors(leftPinchPos, rightPinchPos, 0.5);
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
