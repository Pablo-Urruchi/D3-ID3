import React, { Component } from 'react';
import { ipcRenderer } from 'electron';

const path = require('path');
const fs = require('fs');

export default class TextEditor extends Component {
  constructor(props) {
    super();
    this.state = {
      url: path.resolve(__dirname, 'src/components/temp/temp.html'),
    }
  }

  componentDidMount() {
    let amdRequire = global.require('monaco-editor/min/vs/loader.js').require;

    function uriFromPath(_path) {
      let pathName = path.resolve(_path).replace(/\\/g, '/');
      if (pathName.length > 0 && pathName.charAt(0) !== '/') {
        pathName = '/' + pathName;
      }
      return encodeURI('file://' + pathName);
    }

    // uriFromPath needs to take in a path including the main folder
    // __dirname doesn't reach ID3-React
    amdRequire.config({
      baseUrl: uriFromPath(path.resolve(__dirname, 'node_modules/monaco-editor/min/'))
    });

    // workaround monaco-css not understanding the environment
    self.module = undefined;
    // workaround monaco-typescript not understanding the environment
    self.process.browser = true;
    var editor;

    amdRequire(['vs/editor/editor.main'], () => {
      editor = monaco.editor.create(document.getElementById('editor'), {
        value: [
					'//code here'
				].join('\n'),
        language: 'html',
        theme: "vs-dark",
        wrappingColumn: 0,
        scrollBeyondLastLine: false,
        wrappingIndent: "indent",
      });

      window.onresize = () => {
        editor.layout();
      }

      // import files into text-editor
      let importBtn = document.getElementById('import-btn');
      let fileUpLoadBtn = document.getElementById('upload-file');
      fileUpLoadBtn.setAttribute("accept", ".html,.csv,.tsv,.js,.txt");

      function openFile() {
        fileUpLoadBtn.click();
      }

      fileUpLoadBtn.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function(event) {

          editor.setValue(event.target.result)

        };
        reader.readAsText(file);
      })

      importBtn.addEventListener('click', (event) => {
        openFile();
      });


      // setInterval(function(){
      //   fs.writeFile(path.resolve(__dirname, 'src/components/temp/temp.html'), editor.getValue(), (err) => {
      //     if (err) throw err;
      //     // console.log('The file has been saved!');
      //   })
      // }, 300);
      //
      // setInterval(function(){
      //   const webview = document.querySelector('webview');
      //   webview.reload();
      // }, 300);


      // document.getElementById("editor").onkeyup = () => {

      //   fs.writeFile(path.resolve(__dirname, 'src/components/temp/temp.html'), startHtml + editor.getValue() + endHtml, (err) => {

      //   // fs.writeFile(path.resolve(__dirname, 'src/components/temp/temp.html'), editor.getValue(), (err) => {

      //     if (err) throw err;
      //     console.log('The file has been saved!');
      //   })
      // }

      window.addEventListener('keypress', function(event) {
        if (event.ctrlKey && event.which === 19) {
            fs.writeFile(path.resolve(__dirname, 'src/components/temp/temp.html'), editor.getValue(), (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
          })
          const webview = document.querySelector('webview')
          webview.reload();
        }
      })

      let scatterPlot_button = document.querySelector('#scatter-plot');
      scatterPlot_button.addEventListener('click', function(e){
        console.log('---ok you are calling a second method on click')
        var scatterPlot_code = fs.readFileSync(path.resolve(__dirname, 'src/templates/ScatterPlot.html'), 'utf8');
        editor.setValue(scatterPlot_code);
        fs.writeFile(path.resolve(__dirname, 'src/components/temp/temp.html'), editor.getValue(), (err) => {
            if (err) throw err;
          })
        document.querySelector('webview').reload();

      });

    });
  }

  render() {
    return (
      <div className="pane">
        <webview id="render-window" src={this.state.url}></webview>
        <div id="editor"></div>
      </div>
    );
  }
}
