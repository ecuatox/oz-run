'use babel';

export default class OzRunView {

  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('oz-run');
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  appendText(text) {
    const message = document.createElement('div');
    message.textContent = text;
    message.classList.add('message');
    this.element.appendChild(message);
  }

  clear() {
    this.element.innerHTML = "";
  }

  createOutput() {
    const container = document.createElement('div');
    const output = document.createElement('code');
    output.setAttribute('id', 'oz-output');
    container.setAttribute('id', 'oz-output-container');
    container.appendChild(output);
    this.element.appendChild(container);
    return output;
  }

  appendOutput(output) {
    let message = document.getElementById('oz-output');
    if (!message) {
      message = this.createOutput();
    }
    message.textContent += output;
  }

  appendSpace() {
    const space = document.createElement('div');
    space.classList.add('space');
    this.element.appendChild(space);
  }

}
