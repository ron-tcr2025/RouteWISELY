
# RouteWISELY - Automatic Project Start Date Derivation

## Purpose
To streamline user setup and reduce manual data entry, RouteWISELY will automatically derive the **Actual Project Start Date** based on system activity. This value will feed into all mapping, navigation, and reporting features.

## Logic
- The **actual project start date** is defined as the timestamp of the earliest relevant activity associated with the project.
- Priority:
  1️⃣ **First driver activity timestamp** (e.g. first navigation started, first location logged, first route activated)
  2️⃣ If no driver activity: **First shape file upload timestamp**

## Technical Approach
The derived date will be computed dynamically within queries to the database or during analytics report generation.

### Example logic (pseudo code / query pattern)
```pseudo
// Derive actual start date from driver activity
actualStartDate = MIN(driver_activity.timestamp)
WHERE driver_activity.project_id == currentProjectId

// Fallback if no driver activity is found
IF actualStartDate IS NULL THEN
    actualStartDate = MIN(shape_file.uploaded_at)
    WHERE shape_file.project_id == currentProjectId
END IF
```

## Reporting
- The **Actual Start Date (System Derived)** will appear in:
  - Reporting dashboards
  - PDF exports
  - Analytics summaries
- It will be clearly labeled to distinguish it from manually entered dates:
  > _Actual Start Date (System Derived)_

## Implementation Notes
- This logic will be part of the analytics query layer and should not require user input.
- Ensure database indexing on `driver_activity.timestamp` and `shape_file.uploaded_at` for performance.
- Apply consistently across:
  - Mapping views (to show when a project truly began)
  - Navigation module (for operational tracking)
  - Reporting module (for internal and external reporting)
