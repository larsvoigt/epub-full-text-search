//var mjAPI = require("./node_modules/MathJax-node/lib/mj-page.js");
//var typeset = mjAPI.typeset;
//mjAPI.config({"v1.0-compatible": false, SVG: {blacker: 1}});
//mjAPI.start();


// The intention of this module is/was to generate content with 
// mathjax engine that can be "displayed". This should close the cap 
// between client and sever side cfi path computing. The reason 
// that cap I found is:  mathjax injects elements with generated 
// svg data to display the beautiful math. 
// Unfortunately the engine will not run. Ideas?
// 
// Now the following hack is to be fill the cap.
exports.process = function ($, callback) {

    var mathNodes = $('mml\\:math, math').get();

    if (mathNodes.length > 0) {

        //processMath($);
        callback(true);
    }
};


//function processMath($) {
//    typeset({format: "MathML", html: $("*").html()}, function (data) {
//
//        console.log(data);
//    }
//};