# Plugin

## Installation

- [Download](../../releases/latest/download/plugin.sketchplugin.zip) the latest release of the plugin
- Un-zip
- Double-click on plugin.sketchplugin

## Introduction
- The Plugin allowes the user to create a multi lingual sketch document. 
- The text informations in the different languages can be loaded as .csv file after at any given time. 

## Usage
- After installing the plugin, open a sketch document. 
- go to the `plugin` menu and under `Multi lingual` click `Set Document as multi lingual`. This enables the functionality needed to manage a multi lingual file. 
- After setting up the file, a dialog opens to choose a .csv file containing the text fragments in different languages. The .csv file must be structured as follows: 
```csv
id;English;German;Spanish
id.of.text.element;Hello world;Hallo welt;Hola Mundo
next.text.element;Goodbye;Auf wiedersehen;Adiós
```
The .csv file should be formated as `utf-8`. The first collumnt must have the name `id`, the following collumns should be named after the languag it contains. 

_This plugin was created using `skpm`. For a detailed explanation on how things work, checkout the [skpm Readme](https://github.com/skpm/skpm/blob/master/README.md)._
