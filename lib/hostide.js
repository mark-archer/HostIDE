'use babel';

import HostideView from './hostide-view';
import { CompositeDisposable } from 'atom';
import host from 'hostlang';
import {allowUnsafeEval, allowUnsafeNewFunction} from 'loophole';
console.log(host)
var ctx = {}

export default {

  hostideView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.hostideView = new HostideView(state.hostideViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.hostideView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'hostide:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.hostideView.destroy();
  },

  serialize() {
    return {
      hostideViewState: this.hostideView.serialize()
    };
  },

  toggle() {
    console.log('toggle called')
    //   let editor
    //   if (editor = atom.workspace.getActiveTextEditor()) {
    //     let selection = editor.getSelectedText()
    //     let reversed = selection.split('').reverse().join('')
    //     editor.insertText(reversed)
    //   }
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
        console.log(editor)
        var code = editor.getText()
        console.log(code)
        allowUnsafeEval(()=> {
            host.parse(code, ctx, rslt => {
                console.log(rslt)
            })
        })
    }
  },

  parse(){
      console.log('parse')
      let editor
      if (editor = atom.workspace.getActiveTextEditor()) {
          console.log(editor)
          var code = editor.getText()
          console.log(code)
          host.parse(code, ctx, rslt => {
              console.log(rslt)
          })
      }
  }

};
