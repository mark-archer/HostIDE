# HostIDE
A simple standalone IDE for Host language
    
This is built using electron.  It probably makes more sense to do this as an atom plugin but this is what it is for now.

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
    ctrl+r
        reload idea
    ctrl+enter
        run selected text 
        or current line if no text is selected
    alt+shift+uparrow
        swap current line with line above
    alt+shift+downarrow
        swap current line with line below
    alt+c
        clear output pane
        
## To build as standalone electron app     
    npm run dist
    ; for electron documentation see: https://github.com/electron-userland/electron-builder

## todo
- syntax highlighting 
- code completion