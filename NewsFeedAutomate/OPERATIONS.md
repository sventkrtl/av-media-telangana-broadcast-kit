# NewsFeedAutomate — Operations Manual (v1.0.0)

**Deployment, Execution, Triggers, Operations & Maintenance**

---

## 1. Initial Installation & Deployment

1. **Clone repository locally**:
   ```bash
   git clone <repository-url>
   cd av-media-telangana-broadcast-kit/NewsFeedAutomate
   ```
2. **Authenticate with Clasp**:
   ```bash
   clasp login
   ```
3. **Link to Apps Script project & push code**:
   ```bash
   clasp push
   ```
4. **Configure Script Property**:
   Set `GEMINI_API_KEY` in Project Settings.

---

## 2. Execution & Trigger Management

### **Manual Pipeline Execution**:
Open `Code.js` in Apps Script Editor and select:
- `runEditorialPipeline()`: Executes full 11-stage production pipeline.
- `testPipeline()`: Test runner returning execution summary object.

### **Automated Hourly Trigger Setup**:
To start automated hourly runs:
1. Open `scheduler.js` in Apps Script Editor.
2. Run function `createHourlyTrigger()`.
3. Verify trigger created under **Triggers** tab (clock icon on left menu).

### **Trigger Deletion / Pause**:
To stop automated execution:
1. Run function `deleteHourlyTriggers()` in `scheduler.js`.

---

## 3. Production Monitoring & Logs

### **Viewing Execution Logs**:
1. Open Google Apps Script Editor -> Click **Executions** menu (left panel).
2. Select any execution to view stage transition telemetry logs:
   - `[STAGE 1]` Collector metrics
   - `[STAGE 2]` Normalizer metrics
   - `[STAGE 3]` Validator metrics
   - `[STAGE 4]` Duplicate Engine metrics
   - `[STAGE 5A-5E]` Gemini API & Normalizer/Sanitizer metrics
   - `[STAGE 6]` Output Validator status
   - `[STAGE 7]` Google Sheets Atomic Write status

---

## 4. Recovery & Rollback Procedures

### **Recovery Procedure (On Failure Notification)**:
1. Check **Executions** logs for failure stage tag (`[ERROR]` or `[FATAL]`).
2. If `Stage 5B: Gemini API call failed`:
   - Verify `GEMINI_API_KEY` script property validity.
   - Check Google Cloud console quota status.
3. If `Stage 7: Sheet Write Failed`:
   - Verify target Google Spreadsheet ID & tab permissions.
   - Ensure `PRIMARY_HEADLINES` and `SECONDARY_PLAYLIST` tab names exist.

### **Rollback Procedure**:
To rollback to a previous release tag:
```bash
git checkout v1.0.0
clasp push
```
