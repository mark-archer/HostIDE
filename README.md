# HostIDE
A simple standalone IDE for Host language
    
This is built using electron.  

## Getting Started 
    git clone https://github.com/mark-archer/HostIDE
    cd HostIDE
    npm -g install electron 
    npm install
    
## To start IDE
    electron .

## hot keys
    alt+p
        parse code and show resulting AST
    alt+r
        run code
    ctrl+enter
        run selected text 
        or current line if no text is selected
    alt+shift+uparrow
        swap current line with line above
    alt+shift+downarrow
        swap current line with line below
    alt+c
        clear output pane
    ctrl+r
        restart IDE
        
        
## To build as standalone electron app     
    npm run dist
    ; for electron documentation see: https://github.com/electron-userland/electron-builder

## Todo

- syntax highlighting 
- code completion

## Notes

Building this in electron requires writing an entire editor/IDE from scratch.  I don't want to do all that work right now so I'm searching for an existing editor/IDE that I can just add language support for (code completion, and highlighting at least).

I tried to do this as an atom plugin but atom doesn't like the use of eval.  I'm working to try to prevent the language from relying on eval but for now it does so that makes atom a no-go.

VS Code might be a good option.