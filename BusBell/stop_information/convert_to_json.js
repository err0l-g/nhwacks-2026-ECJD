// convert-text-to-json.js
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');


// Folder where your text files are
const inputFolder = path.join(__dirname, 'stops'); // change to your folder
// Folder to output JSON
const outputFolder = path.join(path.join(__dirname, ".."), '/src/stop_data');

// Make sure output folder exists
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
}

// Read all .txt files in the folder
const files = fs.readdirSync(inputFolder).filter(file => file.endsWith('.txt'));

files.forEach(file => {
    const filePath = path.join(inputFolder, file);
    const content = fs.readFileSync(filePath, 'utf8');

    if(file.includes("stop_times"))
    {
        return //Skip the big file
    }

    const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });


    // Save as JSON
    const outputFileName = file.replace(/\.txt$/, '.json');
    const outputPath = path.join(outputFolder, outputFileName);
    fs.writeFileSync(outputPath, JSON.stringify(records, null, 2));

    console.log(`Converted ${file} -> ${outputFileName}`);
});

console.log('All files converted!');
