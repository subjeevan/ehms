# EHMS Billing Feature - Quick Reference Guide

## What Was Implemented

A complete patient-type-based billing configuration and automatic bill creation workflow for the EHMS system with:
- Admin-only charge management interface
- Automatic bill generation during patient registration
- Support for enabling/disabling charges per patient type
- Historical bill preservation (bills keep the charge amount from registration time)

## Quick Start for Developers

### Get the Code Running

1. **Backend Setup**
   ```bash
   cd d:\Web 3.0\ehms
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```
   Backend runs on: http://localhost:8080

2. **Frontend Setup**
   ```bash
   cd d:\Web 3.0\ehms\frontend
   npm install
   npm run dev
   ```
   Frontend runs on: http://localhost:5173

### Access the Feature

1. **Login**: admin / Admin@123
2. **Manage Charges**: Setup → Charge Setup (from sidebar)
3. **Register Patients**: Patient Registration (shows automatic charges)

## Key Files

### Backend

| File | Purpose |
|------|---------|
| `entity/PatientTypeCharge.kt` | Charge configuration entity |
| `repository/PatientTypeChargeRepository.kt` | Database access for charges |
| `service/PatientTypeChargeService.kt` | Charge business logic |
| `controller/PatientTypeChargeController.kt` | Charge REST endpoints |
| `service/PatientService.kt` | NEW: createWithBilling() method |
| `controller/PatientController.kt` | NEW: POST /api/patients/with-billing |
| `config/DataInitializer.kt` | Seeds default charges |

### Frontend

| File | Purpose |
|------|---------|
| `pages/setup/ChargeSetupPage.jsx` | Admin charge management UI |
| `components/PatientForm.jsx` | Shows charge when type selected |
| `pages/PatientRegistrationPage.jsx` | Uses createWithBilling endpoint |
| `services/api.js` | chargeApi + updated patientApi |

## API Endpoints

### Charge Management (Admin Only)

```
GET    /api/setup/charges              # List all charges
GET    /api/setup/charges/{type}       # Get specific charge
PUT    /api/setup/charges/{type}       # Update charge
```

### Patient Registration

```
POST   /api/patients/with-billing      # Register + auto-bill
POST   /api/patients                   # Register without billing
```

## Database

### New Table: patient_type_charges

```sql
CREATE TABLE patient_type_charges (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  patient_type VARCHAR(20) NOT NULL UNIQUE,
  amount DECIMAL(12,2) NOT NULL,
  enabled BOOLEAN NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);
```

### Updated Table: bills

```sql
ALTER TABLE bills ADD COLUMN bill_type VARCHAR(20);
ALTER TABLE bills ADD COLUMN description VARCHAR(500);
```

## Default Charges (Auto-Seeded)

| Patient Type | Amount | Enabled |
|--------------|--------|---------|
| GENERAL      | 200.00 | Yes     |
| PAYING       | 500.00 | Yes     |
| INSURANCE    | 100.00 | Yes     |

## Key Features

✓ **Admin-Only Access**: Only admins can view/modify charges  
✓ **Automatic Billing**: Bills created automatically during patient registration  
✓ **Graceful Disabling**: Charges can be disabled to skip automatic billing  
✓ **Error Handling**: Missing charges return clear error messages  
✓ **Audit Trail**: All charge updates logged with actor info  
✓ **Historical Accuracy**: Bills save the charge amount from registration time  
✓ **Transactional Safety**: Patient and bill created together or both rolled back  
✓ **Responsive UI**: Works on desktop, tablet, and mobile  

## Workflow

### Admin Updates Charges

1. Navigate to Setup → Charge Setup
2. Click Edit on any charge
3. Update amount or toggle enabled status
4. Save
5. Change applies to future registrations only
6. Existing bills unchanged

### User Registers Patient

1. Navigate to Patient Registration
2. Fill in patient details
3. Select patient type
4. See registration charge displayed
5. Submit form
6. Bill automatically created with that charge amount
7. Confirmation shows bill details

## Security & Access Control

- **Admin Only**: Can modify charges and access Charge Setup page
- **Admin/User**: Can register patients and trigger automatic billing
- **Protection**: All endpoints validated with JWT + role checks
- **Data Integrity**: Backend never trusts frontend calculations

## Testing Checklist

- [ ] Login as admin
- [ ] Navigate to Charge Setup
- [ ] View all three charges
- [ ] Edit a charge (e.g., change 200 to 250)
- [ ] See success message
- [ ] Register a patient of that type
- [ ] Verify bill created with new amount
- [ ] Disable a charge
- [ ] Register patient of disabled type
- [ ] Verify no bill created, message shown
- [ ] Login as regular user
- [ ] Verify cannot access Charge Setup
- [ ] Verify can still register patients

## Common Tasks

### Update a Charge
```bash
curl -X PUT http://localhost:8080/api/setup/charges/GENERAL \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"amount": 250, "enabled": true}'
```

### Register Patient with Billing
```bash
curl -X POST http://localhost:8080/api/patients/with-billing \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "gender": "MALE",
    "dateOfBirth": "1990-05-15",
    "contactNumber": "+977 9841234567",
    "address": "123 Main St",
    "patientType": "GENERAL"
  }'
```

## Error Responses

### Missing Charge Configuration
```json
{
  "status": 400,
  "message": "No registration charge is configured for patient type GENERAL",
  "fieldErrors": {
    "patientType": "No registration charge is configured for patient type GENERAL"
  }
}
```

### Validation Error (Negative Amount)
```json
{
  "status": 400,
  "message": "Validation failed",
  "fieldErrors": {
    "amount": "Charge amount cannot be negative"
  }
}
```

### Access Denied
```json
{
  "status": 403,
  "message": "Access Denied"
}
```

## Documentation Files

| File | Contents |
|------|----------|
| `IMPLEMENTATION_SUMMARY.md` | Detailed architecture and component breakdown |
| `API_REFERENCE.md` | Complete API documentation with examples |
| `SETUP_AND_TESTING.md` | Step-by-step setup and testing procedures |
| `IMPLEMENTATION_CHECKLIST.md` | Verification checklist before deployment |

## Troubleshooting

**Q: Charge Setup page shows blank?**  
A: Check browser console for errors, verify token is valid, check user is admin

**Q: Bill not created after registration?**  
A: Verify charge exists and is enabled for that patient type

**Q: Application won't start?**  
A: Ensure Java 17+ installed, set JAVA_HOME, run `./mvnw clean install` first

**Q: Can't access Charge Setup as user?**  
A: This is correct - only admins can access it. Login as admin

## Next Steps

1. ✅ Implementation complete
2. ✅ Documentation provided
3. 🔄 Ready for testing
4. 🔄 Ready for deployment
5. 📋 Future: Add charge templates, bulk updates, payment integration

## Support & Questions

For questions about:
- **API**: See `API_REFERENCE.md`
- **Setup**: See `SETUP_AND_TESTING.md`
- **Architecture**: See `IMPLEMENTATION_SUMMARY.md`
- **Testing**: See `SETUP_AND_TESTING.md`
- **Verification**: See `IMPLEMENTATION_CHECKLIST.md`

## Version Info

- **Implementation Version**: 1.0
- **Date**: 2026-07-12
- **Status**: Complete and Ready
- **Backend Stack**: Spring Boot, Kotlin, JPA, MySQL
- **Frontend Stack**: React, Vite, Fetch API

---

**Happy Billing!** 🎉

For detailed information, please consult the comprehensive documentation files included with this implementation.
