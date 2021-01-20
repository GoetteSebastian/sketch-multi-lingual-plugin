# Sketch Multi lingual Plugin

## Installation

- [Download](../../releases/latest/download/plugin.sketchplugin.zip) the latest release of the plugin
- Un-zip
- Double-click on plugin.sketchplugin

## Introduction
- The Plugin allowes the user to create a multi lingual sketch document. 
- The text informations in the different languages can be loaded as .csv file after at any given time. 

## Usage
### Set document as multi lingual
- After installing the plugin, open a sketch document. 
- go to the `Plugin` menu and under `Multi lingual` click `Set Document as multi lingual`. This enables the functionality needed to manage a multi lingual file. 
- After setting up the file, a dialog opens to choose a .csv file containing the text fragments in different languages. 

### Loading the text file
The .csv file must be structured as follows: 
```csv
id;English;German;Spanish
id.of.text.element;Hello world;Hallo Welt;Hola Mundo
next.text.element;Goodbye;Auf wiedersehen;Adiós
```
The .csv file should be formated as `utf-8`. The first collumnt must have the name `id`, the following collumns should be named after the languag it contains. 
The easiest way to get the correct file is to export an excel spreadsheet as csv. The Spreadsheet should be structured as follows: 

| id | English | German | Spanish |
| :--- | :--- | :--- | :---|
|id.of.text.element|Hello world|Hallo Welt|Hola Mundo|
|next.text.element|Goodbye|Auf wiedersehen|Adiós|

The .csv file and be loaded manually at any time. Go to the `Plugin` menu and under `Multi lingual`click `Load Text Fragments...`. Select the .csv file in the dialog and click `Load`. 

### Setting the current language
When a .csv file is loaded, the language titles from the first row are stored as availiable languages. You can select the current language my going to the `Plugin` menu and under `Multi lingual`by clicking on `Choose Language...`. 
In the opening dialog the language can be selected from the drop down menu and confirmed by clicking `Ok`. 

### Use the loaded text fragments
The loaded text fragments can be used by entering their `id`(text from the first row) in a text layer or an override field in a symbol instance. 
The `id` must be written in curly brackets `{id.of.text.element}`. 
When the layer is deselected, the plugin replaces the id elements with the given text in the current language. The original text is stored in the layer element and will reapear when selecting the layer again. 
In a single text layer or symbol instance override field multiple ids can be entered. 

Have fun using the plugin!

_This plugin was created using `skpm`. For a detailed explanation on how things work, checkout the [skpm Readme](https://github.com/skpm/skpm/blob/master/README.md)._
