app.beginUndoGroup("Text with bold words");

var comp = app.project.activeItem;

var text = "*Lorem* ipsum dolor sit amet, consectetur adipiscing elit, sed *do eiusmod middle tempor* incididunt ut labore et dolore magna *aliqua.*";

// var textOptions = {
//     applyFill: false,
//     applyStroke: false,
//     fillColor: [1, 1, 1],
//     font: "MyriadPro-Regular",
//     fontSize: 60,
//     justification: ParagraphJustification.LEFT_JUSTIFY,
//     leading: 60 * 1.2, //fontSize * 1.2 = same as Auto
//     strokeColor: [1, 0, 0],
//     strokeOverFill: false,
//     strokeWidth: 5,
//     tracking: 0,
// }

var bold = "MyriadPro-Bold"

textWithBold(text, bold);

/**
 * Text with bold words
 * -------------------
 * Makes point text layers with light or bold words.
 *
 * @param {string} text Text layer.
 * @param {string} boldFont Bold font type.
 * @param {object} textOptions Optional change character settings such as font, fontSize, colour etc (Only left justify currently supported)
 * @param {number} x Optional, x position for first row of text. Default 20.
 * @param {number} y Optional, y position for first row of text. Default middle of comp.
 * @param {number} w Optional, width of text before starting a new line. Default width of comp - 10.
 * @param {string} delimiter Optional, character used to note if word(s) should be bold. Default *
 * @return nothing
*/
function textWithBold(text, boldFont, textOptions, x, y, w, delimiter) {

    var textProp, textDocument, textLayer;
    var isBold = 0;
    var newX = x;
    

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
        fillColor: textOptions.fillColor == undefined ? (textDocument.applyFill ? textDocument.fillColor : [0,0,0]) : textOptions.fillColor, //Even if applyFill/applyStroke is false fillColor/fillStroke expects an array.
        font: textOptions.font == undefined ? textDocument.font : textOptions.font,
        fontSize: textOptions.fontSize == undefined ? textDocument.fontSize : textOptions.fontSize,
        justification: textOptions.justification == undefined ? ParagraphJustification.LEFT_JUSTIFY : ParagraphJustification.LEFT_JUSTIFY, //Only left justify currently supported
        leading: textOptions.leading == undefined ? textDocument.leading : textOptions.leading,
        strokeColor: textOptions.strokeColor == undefined ? (textDocument.applyStroke ? textDocument.strokeColor : [0,0,0]) : textOptions.strokeColor,
        strokeOverFill: textOptions.strokeOverFill == undefined ? textDocument.strokeOverFill : textOptions.strokeOverFill,
        strokeWidth: textOptions.strokeWidth == undefined ? textDocument.strokeWidth : textOptions.strokeWidth,
        tracking: textOptions.tracking == undefined ? textDocument.tracking : textOptions.tracking
    };
    textLayer.remove();

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
            removeWord();
            y = textLayer.position.value[1] + textOptions.leading;
            newText(word.replace(regex, ""), x, y)
            applyOptions()
            newX = textLayer.position.value[0] + textLayer.sourceRectAtTime(0, false).left + textLayer.sourceRectAtTime(0, false).width;
            if (isBold) {
                applyOptions(boldFont);
            } else {
                applyOptions();
            }
        }


    }
    function newText(word, x, y) {
        textLayer = comp.layers.addText(word);
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
        textDocument.justification = textOptions.justification;
        textDocument.leading = textOptions.leading;
        textDocument.strokeColor = textOptions.strokeColor;
        textDocument.strokeOverFill = textOptions.strokeOverFill;
        textDocument.strokeWidth = textOptions.strokeWidth;
        textDocument.tracking = textOptions.tracking;
        textProp.setValue(textDocument);
    }
}

app.endUndoGroup();