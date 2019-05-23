import React, { Component } from "react";
import { StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import {PixelRatio, Dimensions} from 'react-native';

import katexStyle from "./katex-style";
import katexScript from "./katex-script";
import { bool, func, object, string, array } from "prop-types";



function px2dp(height) {
    let pixelSize = PixelRatio.getPixelSizeForLayoutSize(Dimensions.get("window").height)/Dimensions.get("window").height;
    return height; // /pixelSize; //PixelRatio.get();
}

function getContent({ inlineStyle, expressions = [], text = "", ...options }) {
  var res = `<!DOCTYPE html>
<html>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<head>
<style>
${katexStyle}
${inlineStyle}
</style>
<script>
window.onerror = e => document.write(e);
window.onload = () => {`;

expressions.forEach( (expr, idx) => {
  let add = ",\\;\\;";
  if (idx == expressions.length -1)
     add = "";
  res += `
  katex.render(${JSON.stringify(expr+add)}, document.getElementById("id${idx}"), 
  ${JSON.stringify(options)});
  `;
});

res += `
setTimeout(() => window.ReactNativeWebView.postMessage(
Math.max(document.documentElement.clientHeight, document.documentElement.scrollHeight, document.body.clientHeight, document.body.scrollHeight)
//  document.getElementById("main").scrollHeight
), 100);
}
${katexScript}
</script>
</head>
<body><div id="main" class="main"><p id="text" class="text">${text}</p>`;

expressions.forEach( (expr, idx) => {
  res += `<div id="id${idx}"></div>`;
})

res += `</div></body></html>`;
return res;
}

const defaultStyle = StyleSheet.create({
  root: {
    height: 40
  }
});

const defaultInlineStyle = `
html, body {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  height: 100%;
  margin: 0;
  padding: 0;
}
.katex {
  margin: 0;
  display: flex;
}
`;

export default class Katex extends Component {
  static propTypes = {
    expressions: array,
    displayMode: bool,
    throwOnError: bool,
    errorColor: string,
    inlineStyle: string,
    macros: object,
    colorIsTextColor: bool,
    onLoad: func,
    onError: func
  };

  static defaultProps = {
    expressions: [],
    displayMode: false,
    throwOnError: false,
    errorColor: "#f00",
    inlineStyle: defaultInlineStyle,
    style: defaultStyle,
    macros: {},
    colorIsTextColor: false,
    onLoad: () => {},
    onError: () => {}
  };

  constructor(props) {
    super(props);
    this.state = { webHeight: 100 };
  }

  render() {
    const { style, onLoad, onError, ...options } = this.props;

    return (
      <WebView
        style={{...style, height: this.state.webHeight, flex: 0}}
        source={{ html: getContent(options) }}
        onLoad={onLoad}
        onError={onError}
        renderError={onError}
        onMessage={event => { 
          let new_height = px2dp(parseInt(event.nativeEvent.data));
          this.setState({webHeight: new_height});
          if (this.props.onHeightChanged != undefined)
            this.props.onHeightChanged(new_height);
        }}
      />
    );
  }
}
