// Definir el ID del libro de Google Sheets
var spreadsheetId = '10xNzALbdWNheP4_mAIgOp50gmLin-5TN1oFOycia2y8';

// Función para manejar las solicitudes GET
function doGet(e) {
  return handleRequest(e);
}

// Función para manejar las solicitudes POST
function doPost(e) {
  return handleRequest(e);
}

// Función para manejar todas las solicitudes
function handleRequest(e) {
  var action = e.parameter.action || (e.postData ? JSON.parse(e.postData.contents).action : null);

  if (!action) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Parámetro 'action' faltante" })).setMimeType(ContentService.MimeType.JSON);
  }

  var spreadsheet = SpreadsheetApp.openById(spreadsheetId);

  switch (action) {
    case "create":
      return handleCreate(e, spreadsheet);
    case "read":
      return handleRead(e, spreadsheet);
    case "update":
      return handleUpdate(e, spreadsheet);
    case "delete":
      return handleDelete(e, spreadsheet);
    default:
      return ContentService.createTextOutput(JSON.stringify({ error: "Acción no válida" })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Función para manejar la acción 'create'
function handleCreate(e, spreadsheet) {
  var data = JSON.parse(e.postData.contents);
  var nombre = data.nombre.toString();
  var numero = data.numero.toString();
  var sheet = spreadsheet.getSheetByName("Registros");
  var lastRow = sheet.getLastRow() + 1;
  sheet.appendRow([lastRow.toString(), nombre, numero]);
  return ContentService.createTextOutput(JSON.stringify({ ID: lastRow, Nombre: nombre, Numero: numero })).setMimeType(ContentService.MimeType.JSON);
}

// Función para manejar la acción 'read'
function handleRead(e, spreadsheet) {
  var data = e.parameter || JSON.parse(e.postData.contents);
  var columnName = data.columnName;
  var searchValue = data.searchValue;
  var sheet = spreadsheet.getSheetByName("Registros");
  var dataRange = sheet.getDataRange().getValues();
  var records = dataRange.slice(1).filter(row => row[dataRange[0].indexOf(columnName)] == searchValue);
  if (records.length !== 0) {
    var responseObject = { informacion: records.map(row => ({ ID: row[0], Nombre: row[1], Numero: row[2] })) };
    return ContentService.createTextOutput(JSON.stringify(responseObject)).setMimeType(ContentService.MimeType.JSON);
  } else {
    return ContentService.createTextOutput(JSON.stringify({ message: "No se encontraron registros para el valor especificado" })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Función para manejar la acción 'update'
function handleUpdate(e, spreadsheet) {
  var data = JSON.parse(e.postData.contents);
  var id = data.id.toString();
  var updatedNombre = data.updatedNombre.toString();
  var updatedNumero = data.updatedNumero.toString();
  var sheet = spreadsheet.getSheetByName("Registros");
  var dataRange = sheet.getDataRange().getValues();
  var recordIndex = dataRange.findIndex(row => row[0] == id);
  if (recordIndex !== -1) {
    sheet.getRange(recordIndex + 1, 2).setValue(updatedNombre);
    sheet.getRange(recordIndex + 1, 3).setValue(updatedNumero);
    return ContentService.createTextOutput(JSON.stringify({ message: "Registro actualizado" })).setMimeType(ContentService.MimeType.JSON);
  } else {
    return ContentService.createTextOutput(JSON.stringify({ message: "Registro no encontrado" })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Función para manejar la acción 'delete'
function handleDelete(e, spreadsheet) {
  var data = JSON.parse(e.postData.contents);
  var idToDelete = data.id.toString();
  var sheet = spreadsheet.getSheetByName("Registros");
  var dataRange = sheet.getDataRange().getValues();
  var recordIndex = dataRange.findIndex(row => row[0] == idToDelete);
  if (recordIndex !== -1) {
    sheet.deleteRow(recordIndex + 1);
    return ContentService.createTextOutput(JSON.stringify({ message: "Registro eliminado" })).setMimeType(ContentService.MimeType.JSON);
  } else {
    return ContentService.createTextOutput(JSON.stringify({ message: "Registro no encontrado" })).setMimeType(ContentService.MimeType.JSON);
  }
}
