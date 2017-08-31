'use babel';

import OzRunView from './oz-run-view';
import { CompositeDisposable } from 'atom';

export default {

  ozRunView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.ozRunView = new OzRunView(state.ozRunViewState);
    this.modalPanel = atom.workspace.addBottomPanel({
      item: this.ozRunView.getElement(),
      visible: true
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'oz-run:compile': () => this.compile_file(),
      'oz-run:run': () => this.run_file(),
      'oz-run:compile_run': () => this.compile_run(),
      'oz-run:clear': () => this.clear_output(),
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.ozRunView.destroy();
  },

  serialize() {
    return {
      ozRunViewState: this.ozRunView.serialize()
    };
  },

  compile_file() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      path = editor.getPath()
      filename_split = path.split('/');
      filename = filename_split[filename_split.length-1]
      ext_split = path.split('.');
      ext = ext_split[ext_split.length-1];
      if (ext == 'oz') {
        // TODO: Compile file
        atom.notifications.addSuccess("Compiled '" + filename + "'");
        return true;
      } else {
        atom.notifications.addError("'" + filename + "' is not an .oz file");
        return false;
      }
    }
  },

  run_file() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      path = editor.getPath()
      filename_split = path.split('/');
      filename = filename_split[filename_split.length-1]
      ext_split = path.split('.');
      ext = ext_split[ext_split.length-1];
      if (ext == 'oz' || ext == 'ozf') {
        if (ext == 'oz') {
          filename += 'f';
        }
        // TODO: Run file
        view = this.ozRunView;
        view.clear();
        view.appendSpace();
        view.appendText(" Result of running '" + filename + "':");
        view.appendOutput(path);
        view.appendSpace();
        return true;
      } else {
        atom.notifications.addError("'" + filename + "' is not an .oz or .ozf file");
        return false;
      }
    }
  },

  compile_run() {
    if (this.compile_file()) {
      this.run_file();
    }
  },

  clear_output() {
    this.ozRunView.clear();
  }

};
