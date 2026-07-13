# EHMS Billing and Charge Setup Enhancement - Implementation Summary

## Overview
This document summarizes the complete implementation of patient-type-based billing configuration and automatic bill creation workflow for the EHMS system.

## Architecture Overview

### Database Design
- **New Table**: `patient_type_charges`
  - Stores default registration charges for each patient type (GENERAL, PAYING, INSURANCE)
  - Unique constraint on `patient_type` ensures one charge per type
  - Tracks creation and update timestamps for audit purposes

### Backend Components Created

#### 1. **Entity: PatientTypeCharge** (`entity/PatientTypeCharge.kt`)
- Represents patient type charge configuration in the database
- Fields: id, patientType (ENUM), amount (BigDecimal), enabled, createdAt, updatedAt
- Unique constraint on patientType column
- Precision: 12 digits, 2 decimal places for amount

#### 2. **Repository: PatientTypeChargeRepository** (`repository/PatientTypeChargeRepository.kt`)
- Extends JpaRepository<PatientTypeCharge, Long>
- Custom method: `findByPatientType(patientType: PatientType): PatientTypeCharge?`
- Used for retrieving charge configuration by patient type

#### 3. **DTOs: ChargeDtos** (`dto/charge/ChargeDtos.kt`)
- `PatientTypeChargeResponse`: Response DTO with id, patientType, amount, enabled
- `UpdatePatientTypeChargeRequest`: Request DTO for updating charges with validation
  - amount: NotNull, DecimalMin("0.00") - prevents negative charges
  - enabled: Boolean flag for toggling automatic billing
- `PatientRegistrationResponse`: Combined response with patient, bill (nullable), and message
  - Used for unified patient registration with automatic billing

#### 4. **Service: PatientTypeChargeService** (`service/PatientTypeChargeService.kt`)
- Methods:
  - `listAll()`: Returns all charges sorted by patient type
  - `getByPatientType()`: Retrieves specific charge configuration
  - `update()`: Updates charge with audit logging (tracks who made the change and old/new values)
  - `getChargeForPatientType()`: Retrieves active charge or throws BusinessValidationException if missing/disabled
  - `tryGetChargeForPatientType()`: Soft retrieval - returns null if disabled instead of exception
- Comprehensive logging for all operations
- Handles disabled charges gracefully

#### 5. **Controller: PatientTypeChargeController** (`controller/PatientTypeChargeController.kt`)
- Base path: `/api/setup/charges`
- All endpoints protected with `@PreAuthorize("hasRole('ADMIN')")`
- Endpoints:
  - `GET /api/setup/charges`: List all charges
  - `GET /api/setup/charges/{patientType}`: Get specific charge
  - `PUT /api/setup/charges/{patientType}`: Update charge (tracks actor via Authentication)

#### 6. **Updated Services**

##### PatientService (`service/PatientService.kt`)
- **New Method**: `createWithBilling(request, actor)`
  - Validates patient data
  - Saves patient to database
  - Attempts to create automatic registration bill
  - If charge is disabled, bill creation is skipped gracefully
  - If charge is missing, throws structured validation error
  - Returns PatientRegistrationResponse with combined data
  - Uses `@Transactional` for database consistency
- **Original Method**: `create()` remains unchanged for backward compatibility

#### 7. **Updated Controllers**

##### PatientController (`controller/PatientController.kt`)
- **New Endpoint**: `POST /api/patients/with-billing`
  - Protected with `@PreAuthorize("hasAnyRole('ADMIN','USER')")`
  - Uses the new `createWithBilling` service method
  - Returns PatientRegistrationResponse with bill details
  - Separate endpoint allows frontend to choose billing behavior

#### 8. **Updated Configuration**

##### DataInitializer (`config/DataInitializer.kt`)
- Seeded with default charges on application startup:
  - GENERAL: 200.00
  - PAYING: 500.00
  - INSURANCE: 100.00
- Only creates charges if table is empty (respects manual changes)
- Logs creation of each default charge configuration

#### 9. **Enum Updates** (`entity/Enums.kt`)
- **New Enum**: `BillType`
  - REGISTRATION: For patient registration bills
  - CONSULTATION: For consultation fees
  - PROCEDURE: For surgical/major procedures
  - MEDICINE: For medication charges
  - LABORATORY: For lab test charges
  - OTHER: For miscellaneous charges

#### 10. **Entity Updates** (`entity/Bill.kt`)
- Added fields:
  - `billType: BillType = BillType.OTHER`
  - `description: String? = null` (nullable for flexible descriptions)
- Maintains backward compatibility with existing bills

#### 11. **DTO Updates** (`dto/bill/BillDtos.kt`)
- Updated `BillResponse`:
  - Added billType field
  - Added description field
- Supports new bill type information in responses

### Frontend Components Created

#### 1. **ChargeSetupPage** (`pages/setup/ChargeSetupPage.jsx`)
- Admin-only page for managing patient type charges
- Features:
  - Displays all charges in a table format with patient type, amount, enabled status
  - Edit functionality for each charge with inline form
  - Client-side validation for charge amounts
  - Prevents negative amounts and ensures numeric input
  - Real-time form updates without page reload
  - Displays success/error messages with auto-dismiss
  - Loading states while fetching data
  - Responsive design for desktop, tablet, and mobile

### Frontend Components Modified

#### 1. **PatientForm** (`components/PatientForm.jsx`)
- Added props:
  - `onPatientTypeChange`: Callback when patient type is selected
  - `selectedCharge`: Currently selected charge information
  - `formatCurrency`: Currency formatting function
- New feature: Displays registration charge inline when patient type is selected
- Format: "Registration Charge: ¥XXX.XX"
- Visual feedback with blue info box

#### 2. **PatientRegistrationPage** (`pages/PatientRegistrationPage.jsx`)
- Updated to use new `createWithBilling` API endpoint
- Fetches available charges on component mount
- Displays selected charge to user in real-time
- Shows comprehensive success message after registration:
  - Patient ID and name confirmation
  - Bill amount created
  - Bill payment status (PENDING)
- Handles disabled charges gracefully with clear messaging

#### 3. **API Service** (`services/api.js`)
- Added `chargeApi` object:
  - `list()`: GET /setup/charges
  - `get(patientType)`: GET /setup/charges/{patientType}
  - `update(patientType, data)`: PUT /setup/charges/{patientType}
- Updated `patientApi`:
  - Added `createWithBilling(data)`: POST /patients/with-billing

#### 4. **App Router** (`App.jsx`)
- Added route: `/setup/charges` → ChargeSetupPage
- Protected with RoleRoute for ADMIN users only
- Route is under the ADMIN role guard

#### 5. **AppLayout Sidebar** (`components/AppLayout.jsx`)
- Added "Charge Setup" link under Administration section
- Link: `/setup/charges`
- Positioned after main "Setup" link as a sub-navigation item
- Uses `sub-nav-link` CSS class for visual hierarchy
- Only visible to admin users

## Key Implementation Features

### Security
- All charge endpoints require ADMIN role
- PatientRegistrationResponse endpoint requires ADMIN or USER role
- JWT token validation on all endpoints
- Backend validates all data independently (never trusts frontend calculations)

### Data Integrity
- Transaction management ensures patient and bill are created together or both rollback
- Unique constraint on patient_type prevents duplicate configurations
- Amount validation (DecimalMin 0.00) prevents negative charges
- Bill amount is saved at registration time (historical accuracy)

### Audit Trail
- All charge updates logged with:
  - Timestamp (automatic via createdAt/updatedAt)
  - Actor (admin username who made the change)
  - Old and new values
  - Patient type affected
- Patient registration logs include actor information

### Error Handling
- Structured errors with field-level validation
- Missing charge configuration returns 400 Bad Request with details
- Disabled charges are handled gracefully (skip billing instead of error)
- Global exception handler catches validation errors and returns consistent format

### Business Logic
1. Patient Registration Flow:
   - User selects patient type
   - Frontend displays configured charge (if enabled)
   - User submits registration
   - Backend retrieves current charge from database
   - Backend creates patient record
   - Backend creates bill with charge amount and BillType.REGISTRATION
   - Response includes patient details and bill information

2. Charge Disabled Flow:
   - If charge is disabled, registration succeeds
   - Bill is NOT created automatically
   - Response indicates billing was skipped
   - User sees clear message: "No registration bill was created because automatic billing is disabled"

3. Charge Missing Flow:
   - If no charge configuration exists for patient type
   - Registration fails with 400 Bad Request
   - Error message: "No registration charge is configured for patient type GENERAL"
   - User cannot proceed until charge is configured

### Database Migrations
- Uses Spring Boot `ddl-auto=update` (assumed in application properties)
- Automatically creates `patient_type_charges` table on first startup
- Adds new columns to `bills` table (billType, description)
- No downtime required - schema changes are incremental

## Testing Recommendations

### Backend Tests
1. Default charges are initialized correctly (200, 500, 100)
2. Existing charges are not overwritten on restart
3. Admin can retrieve all charges
4. Admin can retrieve specific charge by type
5. Admin can update charge amount and enabled status
6. User receives 403 Forbidden when attempting charge modification
7. Negative amounts are rejected with 400 Bad Request
8. Missing charge configuration returns 400 Bad Request
9. Patient registration creates bill with correct amount
10. Different patient types create bills with correct amounts
11. Updating charge does not affect existing bills
12. Patient and bill are both created or both rolled back on error
13. Disabled charges skip bill creation gracefully

### Frontend Tests
1. Charge Setup page loads and displays all charges
2. Edit form validates negative amounts
3. Edit form validates empty amounts
4. Edit form validates non-numeric input
5. Edit form allows toggling enabled/disabled status
6. Patient Registration shows charge when type is selected
7. Patient Registration displays billing success message
8. Patient Registration handles disabled charges gracefully
9. Patient Registration displays error when charge is missing
10. Charge Setup is only accessible to admin users
11. Navigation menu shows Charge Setup only for admins

## File Summary

### Backend Files Created
1. `src/main/kotlin/kcg/edu/ehms/entity/PatientTypeCharge.kt`
2. `src/main/kotlin/kcg/edu/ehms/repository/PatientTypeChargeRepository.kt`
3. `src/main/kotlin/kcg/edu/ehms/dto/charge/ChargeDtos.kt`
4. `src/main/kotlin/kcg/edu/ehms/service/PatientTypeChargeService.kt`
5. `src/main/kotlin/kcg/edu/ehms/controller/PatientTypeChargeController.kt`

### Backend Files Modified
1. `src/main/kotlin/kcg/edu/ehms/entity/Enums.kt` - Added BillType enum
2. `src/main/kotlin/kcg/edu/ehms/entity/Bill.kt` - Added billType, description
3. `src/main/kotlin/kcg/edu/ehms/service/PatientService.kt` - Added createWithBilling
4. `src/main/kotlin/kcg/edu/ehms/controller/PatientController.kt` - Added billing endpoint
5. `src/main/kotlin/kcg/edu/ehms/config/DataInitializer.kt` - Seed charge data
6. `src/main/kotlin/kcg/edu/ehms/dto/bill/BillDtos.kt` - Updated BillResponse

### Frontend Files Created
1. `frontend/src/pages/setup/ChargeSetupPage.jsx`

### Frontend Files Modified
1. `frontend/src/components/PatientForm.jsx` - Added charge display
2. `frontend/src/pages/PatientRegistrationPage.jsx` - Use createWithBilling
3. `frontend/src/services/api.js` - Add chargeApi, update patientApi
4. `frontend/src/App.jsx` - Add ChargeSetupPage route
5. `frontend/src/components/AppLayout.jsx` - Add Charge Setup navigation

## Deployment Notes

1. **Database Migration**: No manual SQL migration needed - Hibernate will auto-create the table
2. **Dependencies**: No new dependencies added - uses existing Spring/Kotlin stack
3. **Configuration**: No new configuration needed - uses existing patterns
4. **Backward Compatibility**: Fully backward compatible - new endpoints are additions only
5. **Testing**: Run full test suite before deploying to ensure no regressions

## Future Enhancements

1. Bulk charge management
2. Charge history/audit log viewer
3. Charge templates by hospital department
4. Recurring/subscription billing
5. Charge adjustment for specific patients
6. Integration with payment gateway
7. Refund management
8. Invoice generation and distribution

---

**Implementation Status**: Complete
**Last Updated**: 2026-07-12
**Version**: 1.0
