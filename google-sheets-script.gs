/**
 * Receives form reports from index.html and appends them to a Google Sheet.
 *
 * Setup:
 *  1. In the Google Sheet: Extensions > Apps Script, paste this file's contents.
 *  2. Deploy > New deployment > type "Web app".
 *     Execute as: Me. Who has access: Anyone.
 *  3. Copy the web app URL into "sheetUrl" in form.config.json
 *     (and in the embedded config in index.html).
 *  4. After editing this script, use Deploy > Manage deployments > Edit
 *     and create a new version, or the old code keeps running.
 *
 * Expected JSON body from the page:
 *   { time, labels: [...], values: [...], photo: "data:image/jpeg;base64,..." }
 */
function doPost(e) {
  var d = JSON.parse(e.postData.contents);
  var sh = SpreadsheetApp.getActiveSheet();

  // Write a header row the first time.
  if (sh.getLastRow() === 0) {
    sh.appendRow(["Submitted"].concat(d.labels, ["Photo"]));
  }

  // Save the photo to Google Drive and keep a link in the sheet.
  var link = "";
  if (d.photo) {
    var bytes = Utilities.base64Decode(d.photo.split(",")[1]);
    var blob = Utilities.newBlob(bytes, "image/jpeg", "report-" + Date.now() + ".jpg");
    link = DriveApp.createFile(blob).getUrl();
  }

  sh.appendRow([d.time].concat(d.values, [link]));
  return ContentService.createTextOutput("ok");
}
