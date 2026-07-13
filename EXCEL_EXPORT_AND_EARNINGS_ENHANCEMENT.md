# EHMS - Patient List Excel Export & Earnings Dashboard Enhancement

## Overview

This enhancement adds three major features to the Electronic Hospital Management System:

1. **Excel Export** - Patient list can be exported to Excel with full patient data including amount paid
2. **Amount Paid Tracking** - Shows total amount paid by each patient in the list and detail view
3. **Earnings Dashboard** - New dashboard widgets showing daily, monthly, and total earnings by patient type with visualizations

---

## Backend Changes

### 1. New DTOs for Earnings (EarningsDtos.kt)

```
src/main/kotlin/kcg/edu/ehms/dto/dashboard/EarningsDtos.kt
```

Defines data models for earnings:
- `EarningsByPatientType` - Earnings broken down by patient type
- `DailyEarningsResponse` - Today's earnings summary
- `MonthlyEarningsResponse` - Current month's earnings
- `TotalEarningsResponse` - All-time earnings with bill counts
- `EarningsOverviewResponse` - Complete earnings overview

### 2. Updated PatientResponse DTO

**File:** `src/main/kotlin/kcg/edu/ehms/dto/patient/PatientDtos.kt`

Added field:
```kotlin
val amountPaid: BigDecimal = BigDecimal.ZERO
```

This shows the total amount paid for each patient (sum of PAID bills).

### 3. Enhanced BillRepository

**File:** `src/main/kotlin/kcg/edu/ehms/repository/BillRepository.kt`

New methods added:
- `findAllByPaymentStatus()` - Get all bills by status
- `findByDateAndStatus()` - Bills for specific date with status
- `findByDateRangeAndStatus()` - Bills within date range with status
- `countByPaymentStatus()` - Count bills by status

### 4. Enhanced DashboardService

**File:** `src/main/kotlin/kcg/edu/ehms/service/DashboardService.kt`

New public method:
- `earningsOverview()` - Returns `EarningsOverviewResponse` with:
  - Today's earnings breakdown by patient type
  - Current month's earnings breakdown
  - All-time earnings breakdown
  - Paid and pending bill counts

Private helper methods:
- `calculateDailyEarnings()` - Calculates today's earnings
- `calculateMonthlyEarnings()` - Calculates current month earnings
- `calculateTotalEarnings()` - Calculates all-time earnings

### 5. Updated PatientService

**File:** `src/main/kotlin/kcg/edu/ehms/service/PatientService.kt`

Modified `toResponse()` function:
```kotlin
private fun Patient.toResponse(): PatientResponse {
    val amountPaid = bills
        .filter { it.paymentStatus == PaymentStatus.PAID }
        .fold(BigDecimal.ZERO) { acc, bill -> acc + bill.amount }
    // ... rest of response building
}
```

Calculates total paid amount for each patient automatically.

### 6. New DashboardController Endpoint

**File:** `src/main/kotlin/kcg/edu/ehms/controller/DashboardController.kt`

New endpoint:
```
GET /api/dashboard/earnings
```

Protected with `@PreAuthorize("hasRole('ADMIN')")` - Only admins can view earnings.

Returns `EarningsOverviewResponse` with all earnings data.

---

## Frontend Changes

### 1. Updated API Service (api.js)

**File:** `frontend/src/services/api.js`

**Dashboard API:**
```javascript
export const dashboardApi = {
  summary: () => apiFetch('/dashboard/summary'),
  earnings: () => apiFetch('/dashboard/earnings'),  // NEW
}
```

**Excel Export Utility:**
```javascript
export function exportPatientsToExcel(patients, filename = 'patients.xlsx')
```

Uses XLSX library to convert patient data to Excel format with:
- Patient ID, Name, Gender, DOB
- Contact, Address, Patient Type
- Amount Paid (¥)
- Registration date
- Insurance details (if applicable)
- Proper column widths for readability

### 2. Updated PatientListPage

**File:** `frontend/src/pages/PatientListPage.jsx`

Changes:
- Added "Amount Paid (¥)" column to table
- Displays formatted currency for each patient
- Export button in toolbar ("📥 Export to Excel")
- `handleExport()` function:
  - Fetches all patients (paginated)
  - Calls `exportPatientsToExcel()` utility
  - Generates filename with date (e.g., `patients_2026-07-12.xlsx`)
- Loading state while exporting
- Error handling

### 3. Updated PatientDetailModal

**File:** `frontend/src/components/PatientDetailModal.jsx`

Changes:
- Added "Amount Paid" field to detail view
- Shows formatted currency with green color
- Displays in detail grid with other patient info
- Updates automatically when patient data changes

### 4. Enhanced DashboardPage

**File:** `frontend/src/pages/DashboardPage.jsx`

New sections:
- **Daily Earnings Card** - Shows today's earnings
  - Total amount and breakdown by patient type
- **Monthly Earnings Card** - Shows current month's earnings
  - Total amount and breakdown by patient type
- **Total Earnings Card** - Shows all-time earnings
  - Total amount
  - Count of paid bills
  - Count of pending bills
  - Breakdown by patient type
- **Earnings Chart** - Bar chart visualization
  - Shows total earnings by patient type
  - Color-coded bars

Features:
- Loads both patient summary and earnings data
- Proper error handling
- Currency formatting (Japanese Yen ¥)
- Responsive grid layout

### 5. HTML Updates (index.html)

**File:** `frontend/index.html`

Added XLSX library CDN:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.min.js"></script>
```

This enables client-side Excel file generation.

### 6. CSS Styling (styles.css)

**File:** `frontend/src/styles.css`

New styles added:
- `.earnings-grid` - Three-column grid for earnings cards
- `.earnings-card` - Individual earnings card styling
- `.earnings-total` - Large earnings amount display
- `.earnings-breakdown` - List of earnings by type
- `.earnings-item` - Individual earning line item
- `.earnings-stats` - Statistics grid for paid/pending
- `.stat-item` - Individual statistic item

Responsive breakpoints for mobile/tablet:
- Tablets: 2-column grid with last card spanning
- Mobile: 1-column layout

---

## Data Flow

### Viewing Patient List with Amounts
1. User opens Patient List page
2. Patient list loaded from `/api/patients` endpoint
3. Each patient includes `amountPaid` field (calculated from PAID bills)
4. Table displays amount paid in new column
5. User can click View to see detailed amount in modal
6. User can click "Export to Excel" to download spreadsheet

### Dashboard Earnings Overview
1. User opens Dashboard
2. Two API calls:
   - `/api/dashboard/summary` - Patient counts
   - `/api/dashboard/earnings` - Earnings data (NEW)
3. Earnings data shows:
   - Today's total and breakdown
   - Month's total and breakdown
   - All-time total and breakdown
4. Chart visualizes all-time earnings by type

### Excel Export Process
1. User clicks "Export to Excel" button
2. Frontend fetches all patient records (in batches of 100)
3. Data formatted for Excel (ID, Name, Type, Amount Paid, etc.)
4. XLSX library generates Excel file
5. File automatically downloaded with timestamp filename

---

## Amount Paid Calculation

The `amountPaid` field is calculated as:
```kotlin
bills
    .filter { it.paymentStatus == PaymentStatus.PAID }
    .fold(BigDecimal.ZERO) { acc, bill -> acc + bill.amount }
```

- Only PAID bills are included
- PENDING bills are not counted
- Uses BigDecimal for precision
- Recalculated each time patient response is generated

---

## Earnings Calculation

### Daily Earnings
- Sums all bills from today with PAID status
- Groups by patient type

### Monthly Earnings
- Sums all bills from 1st of month to today with PAID status
- Groups by patient type

### Total Earnings
- Sums all bills with PAID status
- Groups by patient type
- Also counts PAID vs PENDING bills

---

## API Endpoints

### New Endpoint

**GET /api/dashboard/earnings**
- Permission: `ADMIN` only
- Response: `EarningsOverviewResponse`
- Example:
```json
{
  "today": {
    "date": "2026-07-12",
    "earnings": [
      {"patientType": "GENERAL", "amount": 600.00},
      {"patientType": "PAYING", "amount": 1000.00}
    ],
    "total": 1600.00
  },
  "thisMonth": {
    "month": "2026-07",
    "earnings": [...],
    "total": 45000.00
  },
  "total": {
    "earnings": [...],
    "total": 850000.00,
    "paidCount": 1245,
    "pendingCount": 87
  }
}
```

### Updated Endpoints

**GET /api/patients**
- Now includes `amountPaid` field in each patient response
- Field is calculated automatically from bills

---

## Security

- Excel export available to all authenticated users
- Earnings endpoint protected with `@PreAuthorize("hasRole('ADMIN')")`
- Only admins can view financial data
- All data validated server-side
- Patient data only includes non-sensitive info in export

---

## Browser Compatibility

- Excel export uses XLSX library (supported in all modern browsers)
- Chart.js for visualizations
- CSS Grid and Flexbox for responsive layout
- Currency formatting using Intl.NumberFormat

---

## Performance Considerations

### Amount Paid Calculation
- Calculated in memory from bill objects
- No additional database queries
- Occurs only when patient response is generated

### Earnings Dashboard
- Two separate API calls (both cached appropriately)
- Earnings calculation uses database queries with proper filters
- Results suitable for caching if needed

### Excel Export
- Uses pagination to fetch all records (max 100 at a time)
- Converts to Excel on client-side (no server impact)
- File generation is instant for typical data sizes

---

## Testing Recommendations

1. **Amount Paid Calculation:**
   - Register patients with different types
   - Create and mark bills as PAID
   - Verify amountPaid matches sum of PAID bills
   - Verify PENDING bills are not counted

2. **Excel Export:**
   - Export patient list
   - Verify all columns present
   - Check currency formatting
   - Test with various data sizes (10, 100, 1000 patients)

3. **Earnings Dashboard:**
   - Verify daily earnings show only today's PAID bills
   - Verify monthly earnings show current month only
   - Verify total earnings sum all PAID bills
   - Check chart displays correct values
   - Test with no earnings data

4. **Security:**
   - Verify non-admin users cannot access /api/dashboard/earnings
   - Verify export works for all users
   - Verify data is accurate and not revealing sensitive info

---

## Files Changed

### Backend
- `src/main/kotlin/kcg/edu/ehms/dto/dashboard/EarningsDtos.kt` (NEW)
- `src/main/kotlin/kcg/edu/ehms/dto/patient/PatientDtos.kt` (MODIFIED)
- `src/main/kotlin/kcg/edu/ehms/repository/BillRepository.kt` (MODIFIED)
- `src/main/kotlin/kcg/edu/ehms/service/DashboardService.kt` (MODIFIED)
- `src/main/kotlin/kcg/edu/ehms/service/PatientService.kt` (MODIFIED)
- `src/main/kotlin/kcg/edu/ehms/controller/DashboardController.kt` (MODIFIED)

### Frontend
- `frontend/src/services/api.js` (MODIFIED)
- `frontend/src/pages/PatientListPage.jsx` (MODIFIED)
- `frontend/src/components/PatientDetailModal.jsx` (MODIFIED)
- `frontend/src/pages/DashboardPage.jsx` (MODIFIED)
- `frontend/index.html` (MODIFIED)
- `frontend/src/styles.css` (MODIFIED)

---

## Migration Notes

- No database migrations needed
- New fields are calculated from existing data
- Existing functionality remains unchanged
- Backward compatible with existing API clients

---

## Next Steps

1. Deploy backend with new endpoints
2. Deploy frontend with new components
3. Test Excel export functionality
4. Verify earnings calculations
5. Monitor performance with production data
6. Collect user feedback

---

End of Enhancement Documentation
