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
      'oz-run:compile': () => this.compile_file(false),
      'oz-run:run': () => this.run_file(true),
      'oz-run:compile_run': () => this.compile_run(),
      'oz-run:clear': () => this.clear_output(),
      'oz-run:insert': () => this.insert(),
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

  compile_file(run_after) {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      path = editor.getPath()
      filename_split = path.split('/');
      filename = filename_split[filename_split.length-1]
      ext_split = path.split('.');
      ext = ext_split[ext_split.length-1];
      if (ext == 'oz') {
        dir = path.split(filename)[0];

        view = this.ozRunView;
        view.clear();

        exec = require("child_process").exec
        child2 = exec("ozc -c " + filename, {cwd: dir})
        child2.stdout.on("data", (data) => {
          view.appendOutput(data);
        });
        child2.stderr.on("data", (data) => {
          view.appendOutput(data);
        });
        child2.on("close", (code) => {
          if (code == 0) {
            atom.notifications.addSuccess("Compiled '" + filename + "'");
            if (run_after) {
              this.run_file(false);
            }
          } else {
            atom.notifications.addError("Failed to compile '" + filename + "'");
          }
        });
      } else {
        atom.notifications.addError("'" + filename + "' is not an .oz file");
        return false;
      }
    }
  },

  run_file(clear_view) {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      path = editor.getPath()
      filename_split = path.split('/');
      filename = filename_split[filename_split.length-1]
      ext_split = path.split('.');
      ext = ext_split[ext_split.length-1];
      if (ext == 'oz' || ext == 'ozf') {
        dir = path.split(filename)[0];
        if (ext == 'oz') {
          filename += 'f';
        }

        view = this.ozRunView;
        if (clear_view) {
          view.clear();
        } else {
          view.newOutput();
        }

        exec = require("child_process").exec
        child2 = exec("ozengine " + filename, {cwd: dir})
        child2.stdout.on("data", (data) => {
          view.appendOutput(data);
        });
        child2.stderr.on("data", (data) => {
          view.appendOutput(data);
        });
        child2.on("close", (code) => {
          if (code == 0) {
            atom.notifications.addSuccess("Ran '" + filename + "'");
          } else {
            atom.notifications.addError("Failed to run '" + filename + "'");
          }
        });
      } else {
        atom.notifications.addError("'" + filename + "' is not an .oz or .ozf file");
        return false;
      }
    }
  },

  compile_run() {
    this.compile_file(true);
  },

  clear_output() {
    this.ozRunView.clear();
  },

  insert() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      editor.insertText(`functor
import
  Application(exit:Exit)
  System
define
  {System.showInfo ''}
  {Exit 0}
end`);
    }
  }

};
