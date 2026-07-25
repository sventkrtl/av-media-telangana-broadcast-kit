/**
 * ============================================================
 * AV Media Telangana
 * Editorial Pipeline Scheduler
 * ============================================================
 */

/**
 * Create Hourly Trigger
 *
 * Safe:
 * Existing pipeline triggers are removed first.
 */
function createHourlyTrigger() {

  deletePipelineTriggers_();

  ScriptApp
    .newTrigger("runEditorialPipeline")
    .timeBased()
    .everyHours(
      CONFIG.SCHEDULER.RUN_INTERVAL_HOURS
    )
    .create();

  Logger.log(
    "[SCHEDULER] Hourly trigger created."
  );

}


/**
 * Delete all Editorial Pipeline triggers.
 */
function deletePipelineTriggers_() {

  var triggers =
    ScriptApp.getProjectTriggers();

  triggers.forEach(function(trigger){

    if (
      trigger.getHandlerFunction() ===
      "runEditorialPipeline"
    ) {

      ScriptApp.deleteTrigger(trigger);

    }

  });

}


/**
 * Show installed pipeline triggers.
 */
function listPipelineTriggers() {

  var triggers =
    ScriptApp.getProjectTriggers();

  Logger.log(
    "=============================="
  );

  Logger.log(
    "Editorial Pipeline Triggers"
  );

  Logger.log(
    "=============================="
  );

  triggers.forEach(function(trigger){

    if (
      trigger.getHandlerFunction() ===
      "runEditorialPipeline"
    ) {

      Logger.log(
        trigger.getHandlerFunction()
      );

    }

  });

}