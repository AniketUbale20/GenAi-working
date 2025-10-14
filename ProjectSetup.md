Part 1: Software Installation

Install VS Code: Go to https://code.visualstudio.com

Install Node.js: Go to https://nodejs.org (download the LTS version).

Install Git: Go to https://git-scm.com/downloads

## Part 2: Project Setup

Extract the project's zip file.

Open the folder until you see the frontend and backend folders.

Right-click on the empty space in that folder and select "Open with Code".

## Part 3: Code Fixes in VS Code

Open file: backend/tsconfig.json

Change "noUnusedLocals": true to "noUnusedLocals": false.

Change "noUnusedParameters": true to "noUnusedParameters": false.

Save the file (Ctrl + S).

Open file: frontend/src/pages/CodeGeneratorPage.tsx

Find the line: import { Monaco } from '@monaco-editor/react'

Replace it with: import Editor from '@monaco-editor/react'

Find <Monaco and change it to <Editor.

Save the file (Ctrl + S).

## Part 4: Terminal Commands

In VS Code, open a new terminal (Terminal > New Terminal).

If the terminal shows PS, switch it to Command Prompt.

Type the command: npm run install:all and press Enter.

After it finishes, type the command: npm run dev and press Enter.

## Part 5: View the Result

Open your web browser.

Go to the URL shown in the terminal (e.g., http://localhost:3000 or http://localhost:5173).
