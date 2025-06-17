export class Mode {
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

  handlePinchStart(handEntity) {}
  handlePinchMove(handEntity) {}
  handlePinchEnd(handEntity) {}
}
