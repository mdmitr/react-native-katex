import React, { Component } from "react";
import { StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

import katexStyle from "./katex-style";
import katexScript from "./katex-script";
import { bool, func, object, string, array } from "prop-types";

function getContent({ inlineStyle, expressions = [], ...options }) {
  var res = `<!DOCTYPE html>
<html>
<head>
<style>
${katexStyle}
${inlineStyle}
</style>
<script>
window.onerror = e => document.write(e);
window.onload = () => {`;

expressions.forEach( (expr, idx) => {
  res += `
  katex.render(${JSON.stringify(expr)}, document.getElementById("id${idx}"), 
  ${JSON.stringify(options)});
  `;
});

res += `}
${katexScript}
</script>
</head>
<body>`;

expressions.forEach( (expr, idx) => {
  res += `<div id="id${idx}"></div>`;
})

res += `</body></html>`;
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

  render() {
    const { style, onLoad, onError, ...options } = this.props;

    return (
      <WebView
        style={style}
        source={{ html: getContent(options) }}
        onLoad={onLoad}
        onError={onError}
        renderError={onError}
      />
    );
  }
}
