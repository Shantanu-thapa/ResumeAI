const { PDFParse } = require("pdf-parse");

const extractTextFromPDF = async (buffer) => {
    const parser = new PDFParse({ data: buffer });

    const result = await parser.getText();

    await parser.destroy();

    return result.text;
};

module.exports = extractTextFromPDF;