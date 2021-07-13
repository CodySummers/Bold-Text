app.beginUndoGroup("Text with bold words");

var comp = app.project.activeItem;

var text = "Lorem ipsum *dolor sit amet, consectetur adipiscing elit, sed* do eiusmod middle tempor incididunt ut labore et dolore magna aliqua.*";
var light = "MyriadPro-Regular";
var bold = "MyriadPro-Bold"

textWithBold(text, light, bold, 50);

/**
 * Text with bold words
 * -------------------
 * Makes point text layers with light or bold words.
 *
 * @param {string} text Text layer.
 * @param {string} lightFont Optional, Light font type. Default current font in AE.
 * @param {string} boldFont Bold font type.
 * @param {number} size Optional, Font size. Default current size in AE.
 * @param {number} leading Optional, Leading size. Default similar to auto, size * 1.2.
 * @param {number} x Optional, x position for first row of text. Default 20.
 * @param {number} y Optional, y position for first row of text. Default middle of comp.
 * @param {number} w Optional, width of text before starting a new line. Default width of comp - 10.
 * @param {string} delimiter Optional, character used to note if word(s) should be bold. Default *
 * @return nothing
*/
function textWithBold(text, lightFont, boldFont, size, leading, x, y, w, delimiter) {
    
    var textProp, textDocument, textLayer;
    var isBold = 0;
    var newX = x;

    x = x ? x : 20;
    y = y ? y : comp.height / 2;
    w = w ? w : comp.width - x - 20;
    delimiter = (delimiter) ? delimiter : "*";

    var regex = new RegExp("\\" + delimiter, "g");

    //Create text layer to pull defaults from
    textLayer = newText("", x, y);
    lightFont = lightFont ? lightFont : textDocument.font;
    size = size ? size : textDocument.fontSize;
    leading = leading ? leading : size * 1.2;
    var justify = ParagraphJustification.LEFT_JUSTIFY;
    textLayer.remove();

    for (var i = 0; i < text.split(" ").length; i++) {
        
        var word = text.split(" ")[i];
        isBold = (word.match(regex)) ? word.match(regex).length : isBold;

        if (i == 0) {
            textLayer = newText(word.replace(regex, ""), x, y);
            fontSize(size,leading, justify)
            if (isBold) {
                weight(boldFont);
            } else {
                weight(lightFont)
            }
            continue;
        }
        
        if (isBold > 0) {

            if (word.indexOf(delimiter) == 0) {
                newText(" " + word.replace(regex, ""), newX, y);
                weight(boldFont);
                fontSize(size, leading, justify)
            } else {
                appendText(word.replace(regex, ""));
            }

            if (word.lastIndexOf(delimiter) > 0) {
                isBold = -1;
            }

        } else if (isBold == -1) {
            newText(" " + word, newX, y);
            weight(lightFont);
            fontSize(size, leading, justify)
            isBold = 0;
        } else {
            appendText(word);
        }

        newX = textLayer.position.value[0] + textLayer.sourceRectAtTime(0, false).left + textLayer.sourceRectAtTime(0, false).width;

        if (newX > x + w) {
            removeWord();
            y = textLayer.position.value[1] + textDocument.leading
            newText(word.replace(regex, ""), x, y)
            fontSize(size, leading, justify)
            if (isBold) {
                weight(boldFont);
            } else {
                weight(lightFont)
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
    function weight(font) {
        textDocument.font = font;
        textProp.setValue(textDocument);
    }

    function fontSize(size, leading, justify) {
        textDocument.fontSize = size;
        textDocument.leading = leading;
        textDocument.justification = justify;
        textProp.setValue(textDocument);
    }
}

app.endUndoGroup();