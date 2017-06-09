'use babel';

import HostlangAtomView from './hostlang-atom-view';
import { CompositeDisposable } from 'atom';

export default {

  hostlangAtomView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.hostlangAtomView = new HostlangAtomView(state.hostlangAtomViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.hostlangAtomView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'hostlang-atom:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.hostlangAtomView.destroy();
  },

  serialize() {
    return {
      hostlangAtomViewState: this.hostlangAtomView.serialize()
    };
  },

  toggle() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      let selection = editor.getSelectedText()
      let reversed = selection.split('').reverse().join('')
      editor.insertText(reversed)
    }
  }

};
