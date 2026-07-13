# EHMS Patient Type-Based Billing System Implementation

## Overview

This implementation adds a complete patient-type-based billing configuration and automatic bill creation workflow to the Electronic Hospital Management System (EHMS). It allows administrators to configure default registration charges for each patient type (GENERAL, PAYING, INSURANCE) and automatically creates bills when patients are registered.

## Quick Links

- 📋 **Quick Start**: See `QUICK_REFERENCE.md`
- 🏗️ **Architecture**: See `IMPLEMENTATION_SUMMARY.md`
- 🔌 **API Docs**: See `API_REFERENCE.md`
- 🧪 **Setup & Testing**: See `SETUP_AND_TESTING.md`
- ✅ **Verification**: See `IMPLEMENTATION_CHECKLIST.md`

## Features

### For Administrators
- ✅ View all patient type charges
- ✅ Edit charge amounts per patient type
- ✅ Enable/disable automatic billing for each type
- ✅ Audit trail of all charge modifications
- ✅ Admin-only access with role-based security

### For Users/Clinicians
- ✅ See registration charge when selecting patient type
- ✅ Automatic bill creation on patient registration
- ✅ Clear confirmation of bill creation
- ✅ Graceful handling when billing is disabled

### System Features
- ✅ Transactional consistency (patient + bill together)
- ✅ Historical bill preservation (amounts don't change retroactively)
- ✅ Comprehensive error handling and validation
- ✅ RESTful API for all operations
- ✅ Responsive web interface
- ✅ Complete audit logging

## What's Included

### Backend Components (Kotlin/Spring Boot)

1. **Entity**: `PatientTypeCharge` - Stores charge configurations
2. **Repository**: `PatientTypeChargeRepository` - Database access
3. **Service**: `PatientTypeChargeService` - Business logic
4. **Controller**: `PatientTypeChargeController` - REST endpoints
5. **Updated Services**: Enhanced `PatientService` with automatic billing
6. **Updated Controllers**: New `/api/patients/with-billing` endpoint

### Frontend Components (React/Vite)

1. **ChargeSetupPage**: Admin interface for managing charges
2. **Enhanced PatientForm**: Shows charges during registration
3. **Updated PatientRegistrationPage**: Uses automatic billing
4. **Enhanced API Service**: New charge and billing endpoints

### Database

1. **New Table**: `patient_type_charges` - Charge configurations
2. **Updated Table**: `bills` - Added `bill_type` and `description`
3. **Auto-seeded Data**: Default charges (GENERAL: 200, PAYING: 500, INSURANCE: 100)

## Installation

### Prerequisites
- Java 17 or later
- Node.js 16 or later
- Maven 3.6 or later
- MySQL 5.7 or later

### Backend Setup

```bash
cd d:\Web 3.0\ehms

# Build
./mvnw clean install

# Run
./mvnw spring-boot:run
```

Backend will be available at: `http://localhost:8080`

### Frontend Setup

```bash
cd d:\Web 3.0\ehms\frontend

# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build
```

Frontend will be available at: `http://localhost:5173`

## Usage

### For Administrators

1. Login with admin credentials
2. Navigate to **Setup → Charge Setup**
3. View all patient type charges
4. Click **Edit** on any charge to modify
5. Update amount and/or enabled status
6. Click **Save Charge**
7. Changes apply to future registrations immediately

### For Users/Clinicians

1. Navigate to **Patient Registration**
2. Fill in patient details
3. Select patient type (charge will display if enabled)
4. Submit registration
5. Confirmation shows bill created with charge amount
6. Verify in patient details later

## API Endpoints

### Charge Management (Admin Only)

```
GET    /api/setup/charges               - List all charges
GET    /api/setup/charges/{patientType} - Get specific charge
PUT    /api/setup/charges/{patientType} - Update charge
```

### Patient Registration

```
POST   /api/patients/with-billing       - Register with automatic billing
POST   /api/patients                    - Register without automatic billing
```

For detailed API documentation, see `API_REFERENCE.md`.

## Default Charges

On first application startup, these default charges are automatically created:

| Patient Type | Amount | Enabled |
|--------------|--------|---------|
| GENERAL      | ¥200   | Yes     |
| PAYING       | ¥500   | Yes     |
| INSURANCE    | ¥100   | Yes     |

## Security

- **Role-Based Access Control**: Only ADMIN can manage charges
- **JWT Authentication**: All endpoints require valid token
- **Backend Validation**: All data validated server-side (never trusts frontend)
- **Transactional Safety**: Patient and bill creation atomic
- **Audit Logging**: All operations logged with actor information

## Testing

### Quick Test

1. Login as admin (admin/Admin@123)
2. Go to Setup → Charge Setup
3. Edit a charge
4. Register a patient and verify bill created
5. Logout and login as user
6. Verify cannot access Charge Setup

For comprehensive testing guide, see `SETUP_AND_TESTING.md`.

## File Structure

```
ehms/
├── src/main/kotlin/kcg/edu/ehms/
│   ├── entity/
│   │   ├── PatientTypeCharge.kt (NEW)
│   │   ├── Bill.kt (MODIFIED)
│   │   └── Enums.kt (MODIFIED)
│   ├── repository/
│   │   └── PatientTypeChargeRepository.kt (NEW)
│   ├── service/
│   │   ├── PatientTypeChargeService.kt (NEW)
│   │   └── PatientService.kt (MODIFIED)
│   ├── controller/
│   │   ├── PatientTypeChargeController.kt (NEW)
│   │   └── PatientController.kt (MODIFIED)
│   ├── dto/charge/
│   │   └── ChargeDtos.kt (NEW)
│   ├── dto/bill/
│   │   └── BillDtos.kt (MODIFIED)
│   └── config/
│       └── DataInitializer.kt (MODIFIED)
├── frontend/src/
│   ├── pages/setup/
│   │   └── ChargeSetupPage.jsx (NEW)
│   ├── pages/
│   │   └── PatientRegistrationPage.jsx (MODIFIED)
│   ├── components/
│   │   ├── PatientForm.jsx (MODIFIED)
│   │   └── AppLayout.jsx (MODIFIED)
│   ├── services/
│   │   └── api.js (MODIFIED)
│   └── App.jsx (MODIFIED)
└── Documentation/
    ├── IMPLEMENTATION_SUMMARY.md (NEW)
    ├── API_REFERENCE.md (NEW)
    ├── SETUP_AND_TESTING.md (NEW)
    ├── IMPLEMENTATION_CHECKLIST.md (NEW)
    ├── QUICK_REFERENCE.md (NEW)
    └── README.md (THIS FILE)
```

## Key Concepts

### Automatic Billing Workflow

1. User selects patient type during registration
2. Backend retrieves charge configuration for that type
3. Patient is created and saved to database
4. Bill is created with the configured charge amount
5. Both operations happen in a single transaction
6. If charge is disabled, bill creation is skipped
7. If charge is missing, registration fails with error

### Bill Preservation

Bills preserve the charge amount at the time of registration:
- If charge was ¥200 when patient registered, bill shows ¥200
- Later changing charge to ¥250 doesn't affect existing bill
- New patients after change will have ¥250 bill

### Access Control

**ADMIN Only**:
- View Charge Setup page
- Modify charges
- View charge history

**ADMIN + USER**:
- Register patients
- Trigger automatic billing
- View generated bills

## Troubleshooting

### Backend Won't Start
1. Ensure Java 17+ is installed: `java -version`
2. Set JAVA_HOME environment variable
3. Clean build: `./mvnw clean install`

### Charges Not Displaying
1. Check backend is running: `curl http://localhost:8080/api/setup/charges`
2. Verify JWT token in request
3. Check user has ADMIN role

### Bills Not Creating
1. Verify charge exists: Check database or API
2. Verify charge is enabled
3. Check application logs for exceptions
4. Ensure transaction is not rolled back

### Access Denied Errors
1. Verify JWT token is valid
2. Verify user has required role (ADMIN for charges)
3. Check Authorization header format: `Bearer [TOKEN]`

## Performance Considerations

- Charges are retrieved from database on each registration
- For high-volume systems, consider implementing caching
- Database indexes are configured on patient_type
- All operations use parameterized queries (SQL injection safe)

## Future Enhancements

- [ ] Caching layer for charge lookups
- [ ] Charge history/audit log viewer
- [ ] Bulk charge management
- [ ] Charge templates by department
- [ ] Time-based charge scheduling
- [ ] Payment gateway integration
- [ ] Refund management
- [ ] Invoice generation

## Support

For detailed information, please refer to:

1. **Getting Started**: `QUICK_REFERENCE.md`
2. **Architecture Details**: `IMPLEMENTATION_SUMMARY.md`
3. **API Documentation**: `API_REFERENCE.md`
4. **Testing Guide**: `SETUP_AND_TESTING.md`
5. **Implementation Checklist**: `IMPLEMENTATION_CHECKLIST.md`

## Deployment

This implementation is ready for deployment:

- ✅ All components implemented and tested
- ✅ No breaking changes to existing code
- ✅ Backward compatible with existing functionality
- ✅ Database migrations handled by Hibernate
- ✅ Security controls in place
- ✅ Comprehensive documentation

### Deployment Steps

1. Build backend: `./mvnw clean install`
2. Build frontend: `npm run build`
3. Deploy backend WAR/JAR to server
4. Deploy frontend static files to web server
5. Restart application
6. Verify Charge Setup page is accessible (admin only)
7. Test patient registration with automatic billing

## License & Attribution

Implementation completed as per requirements for EHMS system enhancement.

## Version Information

- **Implementation Version**: 1.0
- **Release Date**: 2026-07-12
- **Backend Framework**: Spring Boot 3.x
- **Frontend Framework**: React 18+ with Vite
- **Database**: MySQL 5.7+
- **Java Version**: 17+
- **Status**: ✅ Production Ready

---

**Thank you for using EHMS Billing System!**

For questions or issues, please refer to the documentation or contact the development team.
