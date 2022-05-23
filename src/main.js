import sketch from 'sketch';
import fs from '@skpm/fs';
import dialog from '@skpm/dialog';
const parse = require('csv-parse/lib/sync');

// documentation: https://developer.sketchapp.com/reference/api/
export default function(context) {
}

//show user input window where the user can choose a language which should be displayed. Languages are taken from the input csv file.
export function setLanguage(context) {
  var document = sketch.Document.getSelectedDocument();
  if(sketch.Settings.documentSettingForKey(document, "isMultiLingual") == true) {
    var languages = sketch.Settings.documentSettingForKey(document, "languages");
    sketch.UI.getInputFromUser(
      "Select Language",
      {
        type: sketch.UI.INPUT_TYPE.selection,
        possibleValues: languages
      },
      (err, value) => {
        if (err) {
        return
      }
      else {
        sketch.Settings.setDocumentSettingForKey(document, 'currentLanguage', value);
        renderLanguage(document);
      }
    });
  }
}

//Function is called by menu action and sets a document as multi lingual. all original texts will be stored as user attributes and replaced with the refered values if existing.
export function setMultiLingual(context) {
  var document = sketch.Document.getSelectedDocument();
  if(sketch.Settings.documentSettingForKey(document, "isMultiLingual") != true) {
    sketch.Settings.setDocumentSettingForKey(document, 'delimeter', ";")
    var allTextLayers = sketch.find("Text", document);
    allTextLayers.forEach((layer, index) => {
      if(!sketch.Settings.layerSettingForKey(layer, 'originalText')) {
        sketch.Settings.setLayerSettingForKey(allTextLayers[index], 'originalText', layer.text);
      }
    });
    var allInstances = sketch.find("SymbolInstance", document);
    allInstances.forEach((instance, index) => {
      instance.overrides.forEach((override, i) => {
        if(override.property == "stringValue" && override.isDefault == false && !sketch.Settings.layerSettingForKey(allInstances[index], 'originalTextOverride-' + override.id)) {
          sketch.Settings.setLayerSettingForKey(allInstances[index], 'originalTextOverride-' + override.id, override.value);
        }
      });
    });
    loadTextFragments()
    sketch.UI.message("Successfully set Document as multi lingual. ")
  }
  else {
    sketch.UI.message("Current Document is already set as multi lingual. ")
  }
}

/*Function is called by menu action and opens a dialog where the user can choose the csv file with the text fragments. the csv must be structured as following:
1th Row Titles (id; Language 1 Name; Language 2 Name ...)
2th and following rows the unique key of the fragment and the language dependant strings
Example:
id;Germna;French;Italian;English
train;Zug;Train;Treno;Train
...
*/
export function loadTextFragments(context) {
  var document = sketch.Document.getSelectedDocument();
  var csvFile = dialog.showOpenDialogSync(
    {
      title: "Choose UTF8 CSV file",
      buttonLabel: "Load",
      filters: [{name: "CSV", extensions: ["csv"]}],
      properties: ["openFile"]
    }
  )
  if(csvFile.length == 0) return false
  var file = fs.readFileSync(csvFile[0], {encoding: "utf8"})
  sketch.UI.getInputFromUser(
    "Set Delimeter of your csv File. ",
    {
      type: sketch.UI.INPUT_TYPE.string,
      initialValue: sketch.Settings.documentSettingForKey(document, "delimeter"),
      numberOfLines: 1,
      description: "Enter exactly 1 character which is used as delimeter in your csv file. "
    },
    (err, value) => {
      if (err) {
      return
    }
    else {
      sketch.Settings.setDocumentSettingForKey(document, 'delimeter', value)    
      var csvData = parse(file, {
        delimiter: sketch.Settings.documentSettingForKey(document, "delimeter"),
        columns: true,
        skip_lines_with_error: true,
        bom: true
      }, (err, data) => {
        console.log(err)
      })
      sketch.Settings.setDocumentSettingForKey(document, "textFragments", csvData)
      var languages = Object.keys(csvData[0])
      languages.splice(0,1)
      sketch.Settings.setDocumentSettingForKey(document, "languages", languages)
      if(languages.indexOf(sketch.Settings.documentSettingForKey(document, "currentLanguage")) == -1) {
        sketch.Settings.setDocumentSettingForKey(document, "currentLanguage", languages[0])
      }
      sketch.Settings.setDocumentSettingForKey(document, "isMultiLingual", true)
      renderLanguage(document)
    }
  })
}

//Function is called when the selection is changed. Newly selected elements will show the original text with the key words {key}, newly deselected elements will show the given text fragments in the current language.
export function onSelectionChanged(context) {
  var document = sketch.Document.getSelectedDocument();
  if(sketch.Settings.documentSettingForKey(document, 'isMultiLingual') == true) {
    var oldSelection = context.actionContext.oldSelection;
    var newSelection = context.actionContext.newSelection;
    oldSelection.forEach((item, key)  => {
      var currentLayer = sketch.find('[id="' + item.objectID() + '"]', document)[0];
      if(currentLayer.type == "Text") {
        sketch.Settings.setLayerSettingForKey(currentLayer, "originalText", currentLayer.text);
        currentLayer.text = setLanguageTexts(document, currentLayer.text);
      }
      else if(currentLayer.type == "SymbolInstance") {
        currentLayer.overrides.forEach((override, index) => {
          if(override.property == "stringValue" && override.isDefault == false) {
            sketch.Settings.setLayerSettingForKey(currentLayer, 'originalTextOverride-' + override.id, override.value);
            currentLayer.overrides[index].value = setLanguageTexts(document, override.value);
          }
        });
      }
    });

    newSelection.forEach((item, key)  => {
      var currentLayer = sketch.find('[id="' + item.objectID() + '"]', document)[0];
      if(currentLayer.type == "Text" && sketch.Settings.layerSettingForKey(currentLayer, 'originalText')) {
        currentLayer.text = sketch.Settings.layerSettingForKey(currentLayer, 'originalText');
      }
      else if(currentLayer.type == "SymbolInstance") {
        currentLayer.overrides.forEach((override, index) => {
          if(override.property == "stringValue" && override.isDefault == false && sketch.Settings.layerSettingForKey(currentLayer, 'originalTextOverride-' + override.id)) {
            currentLayer.overrides[index].value = sketch.Settings.layerSettingForKey(currentLayer, 'originalTextOverride-' + override.id);
          }
        });
      }
    });
  }
}

//Function to call to replace the {key} elements with language specific strings. Function will return the modified text.
function setLanguageTexts(document, originalText) {
  var textFragments = sketch.Settings.documentSettingForKey(document, "textFragments");
  var currentLanguage = sketch.Settings.documentSettingForKey(document, "currentLanguage");
  var result = originalText.replace(/{(.*?)}/gm, (value) => {
    var string = value;
    textFragments.forEach((item, index) => {
      if(item.id == value.substring(1, value.length -1)) {
        string = item[currentLanguage];
      }
    });
    return string;
  });
  return result;
}

//function iterates through all text and SymbolInstance elements and triggers the setLanguageTexts function for each of them.
function renderLanguage(document) {
  var allTextLayers = sketch.find("Text", document);
  allTextLayers.forEach((layer, index) => {
    if(sketch.Settings.layerSettingForKey(layer, 'originalText')) {
      allTextLayers[index].text = setLanguageTexts(document, sketch.Settings.layerSettingForKey(layer, 'originalText'));
    }
  });
  var allInstances = sketch.find("SymbolInstance", document);
  allInstances.forEach((instance, index) => {
    instance.overrides.forEach((override, i) => {
      if(override.property == "stringValue" && override.isDefault == false && sketch.Settings.layerSettingForKey(allInstances[index], 'originalTextOverride-' + override.id)) {
        allInstances[index].overrides[i].value = setLanguageTexts(document, sketch.Settings.layerSettingForKey(allInstances[index], 'originalTextOverride-' + override.id));
      }
    });
  });
}
