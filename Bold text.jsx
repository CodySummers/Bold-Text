var myComp = app.project.activeItem;

var text = "*Lorem* ipsum dolor sit amet, consectetur adipiscing elit, sed *do eiusmod middle tempor* incididunt ut labore et dolore magna *aliqua.*";

var textOptions = {
    applyFill: true,
    applyStroke: true,
    fillColor: [1, 1, 1],
    font: "ArialMT",
    fontSize: 60,
    justification: ParagraphJustification.RIGHT_JUSTIFY,
    leading: 60 * 1.2, //fontSize * 1.2 = same as Auto
    strokeColor: [1, 0, 0],
    strokeOverFill: false,
    strokeWidth: 5,
    tracking: 0,
}

var bold = "Arial-BoldMT"

textWithBold(myComp, text, bold, textOptions);



/**
 * Text with bold words
 * -------------------
 * Makes point text layers with light or bold words.
 *
 * @param {item object} comp Comp to add text to.
 * @param {string} text Text string.
 * @param {string} boldFont Bold font type.
 * @param {object} textOptions Optional, change character settings such as font, fontSize, colour, justification etc (Full justify not supported, if selected will default to left justify)
 * @param {number} x Optional, x position for first row of text. Default 20.
 * @param {number} y Optional, y position for first row of text. Default middle of comp.
 * @param {number} w Optional, width of text before starting a new line. Default width of comp - 10.
 * @param {string} delimiter Optional, character used to note if word(s) should be bold. Default *
 * @return {array} Returns a 2D array of text layers, first array for line second for words
*/
function textWithBold(comp, text, boldFont, textOptions, x, y, w, delimiter) {
    app.beginUndoGroup("Text with bold words");

    var textProp, textDocument, textLayer;
    var isBold = 0;
    var newX = x;
    var lines = 0;
    var textLayerArr = [[]];

    //Default Settings
    x = x ? x : 20;
    y = y ? y : comp.height / 2;
    w = w ? w : comp.width - x - 20;
    delimiter = delimiter ? delimiter : "*";
    textOptions = textOptions ? textOptions : {};

    var regex = new RegExp("\\" + delimiter, "g");

    //Create text layer to pull defaults from
    textLayer = newText("", x, y);
    textOptions = {
        applyFill: textOptions.applyFill == undefined ? textDocument.applyFill : textOptions.applyFill,
        applyStroke: textOptions.applyStroke == undefined ? textDocument.applyStroke : textOptions.applyStroke,
        fillColor: textOptions.fillColor == undefined ? (textDocument.applyFill ? textDocument.fillColor : [0, 0, 0]) : textOptions.fillColor, //Even if applyFill/applyStroke is false fillColor/fillStroke expects an array.
        font: textOptions.font == undefined ? textDocument.font : textOptions.font,
        fontSize: textOptions.fontSize == undefined ? textDocument.fontSize : textOptions.fontSize,
        justification: textOptions.justification == undefined ? textDocument.justification : textOptions.justification,
        leading: textOptions.leading == undefined ? textDocument.leading : textOptions.leading,
        strokeColor: textOptions.strokeColor == undefined ? (textDocument.applyStroke ? textDocument.strokeColor : [0, 0, 0]) : textOptions.strokeColor,
        strokeOverFill: textOptions.strokeOverFill == undefined ? textDocument.strokeOverFill : textOptions.strokeOverFill,
        strokeWidth: textOptions.strokeWidth == undefined ? textDocument.strokeWidth : textOptions.strokeWidth,
        tracking: textOptions.tracking == undefined ? textDocument.tracking : textOptions.tracking
    };
    textLayer.remove();
    textLayerArr[lines].splice(textLayerArr[lines].length - 1)

    //Loop through words
    for (var i = 0; i < text.split(" ").length; i++) {

        var word = text.split(" ")[i];
        isBold = (word.match(regex)) ? word.match(regex).length : isBold;

        if (i == 0) {
            newText(word.replace(regex, ""), x, y);
            applyOptions()
            if (isBold) {
                applyOptions(boldFont);
                if (word.lastIndexOf(delimiter) > 0) {
                    isBold = -1;
                }
            }
            newX = textLayer.position.value[0] + textLayer.sourceRectAtTime(0, false).left + textLayer.sourceRectAtTime(0, false).width;
            continue;
        }

        if (isBold > 0) {

            if (word.indexOf(delimiter) == 0) {
                newText(" " + word.replace(regex, ""), newX, y);
                applyOptions(boldFont);
            } else {
                appendText(word.replace(regex, ""));
            }

            if (word.lastIndexOf(delimiter) > 0) {
                isBold = -1;
            }

        } else if (isBold == -1) {
            newText(" " + word, newX, y);
            applyOptions();
            isBold = 0;
        } else {
            appendText(word);
        }

        newX = textLayer.position.value[0] + textLayer.sourceRectAtTime(0, false).left + textLayer.sourceRectAtTime(0, false).width;

        if (newX > x + w) {
            y = textLayer.position.value[1] + textOptions.leading;
            removeWord();
            newText(word.replace(regex, ""), x, y)
            applyOptions()
            if (isBold) {
                applyOptions(boldFont);
            } else {
                applyOptions();
            }
            newX = textLayer.position.value[0] + textLayer.sourceRectAtTime(0, false).left + textLayer.sourceRectAtTime(0, false).width;
        }


    }
    function newText(word, x, y) {
        textLayer = comp.layers.addText(word)
        textLayerArr[lines].push(textLayer);
        //textLayer = textLayerArr[lines][textLayerArr[lines].length-1];
        textLayer.position.setValue([x, y])
        textProp = textLayer.property("Source Text");
        textDocument = textProp.value;
        return textLayer;
    }

    function appendText(word) {
        textDocument.text += " " + word;
        textProp.setValue(textDocument);
    }

    function removeWord() {
        var lastIndex = textDocument.text.lastIndexOf(" ");
        textDocument.text = textDocument.text.substring(0, lastIndex);
        textProp.setValue(textDocument);

        textLayerArr.push([]);
        if (textLayer.sourceRectAtTime(0, false).width == 0) {
            textLayerArr[lines].splice(textLayerArr[lines].length - 1);
            textLayer.remove();
        }
        lines++;
    }

    function applyOptions(bold) {
        if (bold) {
            textDocument.font = bold;
        } else {
            textDocument.font = textOptions.font;
        }
        textDocument.applyFill = textOptions.applyFill;
        textDocument.applyStroke = textOptions.applyStroke;
        textDocument.fillColor = textOptions.fillColor;
        textDocument.fontSize = textOptions.fontSize;
        textDocument.justification = ParagraphJustification.LEFT_JUSTIFY;
        textDocument.leading = textOptions.leading;
        textDocument.strokeColor = textOptions.strokeColor;
        textDocument.strokeOverFill = textOptions.strokeOverFill;
        textDocument.strokeWidth = textOptions.strokeWidth;
        textDocument.tracking = textOptions.tracking;
        textProp.setValue(textDocument);
    }

    if (textOptions.justification == ParagraphJustification.CENTER_JUSTIFY || textOptions.justification == ParagraphJustification.RIGHT_JUSTIFY) {
        for (var i = 0; i < textLayerArr.length; i++) {
            var allWidth = 0;
            for (var j = 0; j < textLayerArr[i].length; j++) {
                allWidth += textLayerArr[i][j].sourceRectAtTime(0, false).left + textLayerArr[i][j].sourceRectAtTime(0, false).width;
            }
            var layerWidth = 0;
            for (var j = 0; j < textLayerArr[i].length; j++) {
                if (textOptions.justification == ParagraphJustification.CENTER_JUSTIFY) newX = (w / 2) - (allWidth / 2) + layerWidth + x;
                if (textOptions.justification == ParagraphJustification.RIGHT_JUSTIFY) newX = w - allWidth + layerWidth + x;
                layerWidth += textLayerArr[i][j].sourceRectAtTime(0, false).left + textLayerArr[i][j].sourceRectAtTime(0, false).width;
                textLayerArr[i][j].position.setValue([newX, textLayerArr[i][j].position.value[1]])
            }
        }
    }

    app.endUndoGroup();
    return textLayerArr;
}