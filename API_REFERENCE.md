# EHMS Billing API Reference

## Charge Management Endpoints

### List All Charges
```
GET /api/setup/charges
Authorization: Bearer {token}
Role: ADMIN

Response (200 OK):
[
  {
    "id": 1,
    "patientType": "GENERAL",
    "amount": 200.00,
    "enabled": true
  },
  {
    "id": 2,
    "patientType": "PAYING",
    "amount": 500.00,
    "enabled": true
  },
  {
    "id": 3,
    "patientType": "INSURANCE",
    "amount": 100.00,
    "enabled": true
  }
]
```

### Get Charge by Patient Type
```
GET /api/setup/charges/{patientType}
Authorization: Bearer {token}
Role: ADMIN
Path Parameter: patientType - GENERAL | PAYING | INSURANCE

Response (200 OK):
{
  "id": 1,
  "patientType": "GENERAL",
  "amount": 200.00,
  "enabled": true
}

Error (404 Not Found):
{
  "timestamp": "2026-07-12T21:26:23.569+09:00",
  "status": 404,
  "error": "Not Found",
  "message": "No charge configuration found for patient type GENERAL",
  "path": "/api/setup/charges/GENERAL"
}
```

### Update Charge Configuration
```
PUT /api/setup/charges/{patientType}
Authorization: Bearer {token}
Role: ADMIN
Content-Type: application/json
Path Parameter: patientType - GENERAL | PAYING | INSURANCE

Request Body:
{
  "amount": 250.00,
  "enabled": true
}

Response (200 OK):
{
  "id": 1,
  "patientType": "GENERAL",
  "amount": 250.00,
  "enabled": true
}

Error (400 Bad Request - Validation):
{
  "timestamp": "2026-07-12T21:26:23.569+09:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/setup/charges/GENERAL",
  "fieldErrors": {
    "amount": "Charge amount cannot be negative"
  }
}
```

## Patient Registration with Automatic Billing

### Register Patient with Automatic Bill Creation
```
POST /api/patients/with-billing
Authorization: Bearer {token}
Role: ADMIN | USER
Content-Type: application/json

Request Body:
{
  "fullName": "John Doe",
  "gender": "MALE",
  "dateOfBirth": "1990-05-15",
  "contactNumber": "+977 9841234567",
  "address": "123 Hospital Street",
  "patientType": "GENERAL",
  "insuranceDetail": null
}

Response (201 Created):
{
  "patient": {
    "id": 101,
    "fullName": "John Doe",
    "gender": "MALE",
    "dateOfBirth": "1990-05-15",
    "contactNumber": "+977 9841234567",
    "address": "123 Hospital Street",
    "patientType": "GENERAL",
    "registeredAt": "2026-07-12T21:26:23.569+09:00",
    "insuranceDetail": null
  },
  "bill": {
    "id": 501,
    "patientId": 101,
    "patientName": "John Doe",
    "amount": 200.00,
    "billDate": "2026-07-12",
    "paymentStatus": "PENDING",
    "billType": "REGISTRATION",
    "description": "Patient registration charge - GENERAL"
  },
  "message": "Patient registered and registration bill created successfully"
}

Error (400 Bad Request - Missing Charge):
{
  "timestamp": "2026-07-12T21:26:23.569+09:00",
  "status": 400,
  "error": "Bad Request",
  "message": "No registration charge is configured for patient type GENERAL",
  "path": "/api/patients/with-billing",
  "fieldErrors": {
    "patientType": "No registration charge is configured for patient type GENERAL"
  }
}

Response (201 Created - Charge Disabled):
{
  "patient": {
    "id": 101,
    "fullName": "John Doe",
    "gender": "MALE",
    "dateOfBirth": "1990-05-15",
    "contactNumber": "+977 9841234567",
    "address": "123 Hospital Street",
    "patientType": "GENERAL",
    "registeredAt": "2026-07-12T21:26:23.569+09:00",
    "insuranceDetail": null
  },
  "bill": null,
  "message": "Patient registered successfully. No registration bill was created because automatic billing is disabled."
}
```

### Register Insurance Patient
```
POST /api/patients/with-billing
Authorization: Bearer {token}
Role: ADMIN | USER
Content-Type: application/json

Request Body:
{
  "fullName": "Jane Smith",
  "gender": "FEMALE",
  "dateOfBirth": "1988-03-20",
  "contactNumber": "+977 9801234567",
  "address": "456 Medical Avenue",
  "patientType": "INSURANCE",
  "insuranceDetail": {
    "provider": "Nepal Health Insurance",
    "policyNumber": "NHI-2024-001234",
    "coverageAmount": 500000.00,
    "expiryDate": "2027-07-12"
  }
}

Response (201 Created):
{
  "patient": {
    "id": 102,
    "fullName": "Jane Smith",
    "gender": "FEMALE",
    "dateOfBirth": "1988-03-20",
    "contactNumber": "+977 9801234567",
    "address": "456 Medical Avenue",
    "patientType": "INSURANCE",
    "registeredAt": "2026-07-12T21:26:23.569+09:00",
    "insuranceDetail": {
      "id": 51,
      "provider": "Nepal Health Insurance",
      "policyNumber": "NHI-2024-001234",
      "coverageAmount": 500000.00,
      "expiryDate": "2027-07-12"
    }
  },
  "bill": {
    "id": 502,
    "patientId": 102,
    "patientName": "Jane Smith",
    "amount": 100.00,
    "billDate": "2026-07-12",
    "paymentStatus": "PENDING",
    "billType": "REGISTRATION",
    "description": "Patient registration charge - INSURANCE"
  },
  "message": "Patient registered and registration bill created successfully"
}
```

## Data Models

### PatientType Enum
```
GENERAL
PAYING
INSURANCE
```

### BillType Enum
```
REGISTRATION      // Patient registration charge
CONSULTATION      // Consultation fee
PROCEDURE         // Surgical or major procedure
MEDICINE          // Medication charges
LABORATORY        // Lab test charges
OTHER             // Miscellaneous charges
```

### PaymentStatus Enum
```
PENDING           // Bill not yet paid
PAID              // Bill has been paid
```

### PatientTypeChargeResponse
```
{
  "id": Long,                    // Database ID
  "patientType": PatientType,    // GENERAL, PAYING, INSURANCE
  "amount": BigDecimal,          // Charge amount (e.g., 200.00)
  "enabled": Boolean             // Is automatic billing enabled?
}
```

### UpdatePatientTypeChargeRequest
```
{
  "amount": BigDecimal,          // Required, >= 0.00
  "enabled": Boolean             // Optional, defaults to true
}
```

### PatientRegistrationResponse
```
{
  "patient": PatientResponse,    // Full patient details
  "bill": BillResponse | null,   // Bill if created, null if disabled
  "message": String              // Human-readable status message
}
```

### BillResponse (Updated)
```
{
  "id": Long,
  "patientId": Long,
  "patientName": String,
  "amount": BigDecimal,
  "billDate": LocalDate,
  "paymentStatus": PaymentStatus,
  "billType": BillType,          // NEW: e.g., REGISTRATION
  "description": String          // NEW: e.g., "Patient registration charge - GENERAL"
}
```

## Error Response Format

### Standard Error Response
```
{
  "timestamp": "2026-07-12T21:26:23.569+09:00",
  "status": 400,                 // HTTP status code
  "error": "Bad Request",        // HTTP error name
  "message": "...",              // User-friendly error message
  "path": "/api/setup/charges",  // Request path
  "fieldErrors": {               // Optional: field-level validation errors
    "amount": "Charge amount cannot be negative",
    "enabled": "..."
  }
}
```

## Authentication

All endpoints require Bearer token authentication:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token obtained from:
```
POST /api/auth/login
{
  "username": "admin",
  "password": "Admin@123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin"
  }
}
```

## Frontend API Usage Examples

### Fetch All Charges
```javascript
import { chargeApi } from '../services/api'

const charges = await chargeApi.list()
```

### Update Charge
```javascript
const updated = await chargeApi.update('GENERAL', {
  amount: 250,
  enabled: true
})
```

### Register Patient with Billing
```javascript
import { patientApi } from '../services/api'

const response = await patientApi.createWithBilling({
  fullName: "John Doe",
  gender: "MALE",
  dateOfBirth: "1990-05-15",
  contactNumber: "+977 9841234567",
  address: "123 Hospital Street",
  patientType: "GENERAL"
})

console.log(response.patient.id)    // Patient ID
console.log(response.bill?.amount)  // Bill amount (if created)
console.log(response.message)       // Success message
```

## Default Charges (Initialization)

On first application startup, these default charges are created:

| Patient Type | Amount | Enabled |
|--------------|--------|---------|
| GENERAL      | 200.00 | true    |
| PAYING       | 500.00 | true    |
| INSURANCE    | 100.00 | true    |

These values are only created if the table is empty. Existing charges are never overwritten.

## Audit Trail

All charge updates are logged with:
- Timestamp (automatic)
- Actor (username who made the change)
- Old amount
- New amount
- Enabled status change

Log format:
```
Charge for patient type GENERAL updated from 200.00 to 250.00 by admin (enabled: true)
```

## Common Use Cases

### 1. Admin Updates GENERAL Charge from 200 to 250
```
PUT /api/setup/charges/GENERAL
{
  "amount": 250.00,
  "enabled": true
}
```

### 2. Admin Disables Billing for INSURANCE Patients
```
PUT /api/setup/charges/INSURANCE
{
  "amount": 100.00,
  "enabled": false
}
```

### 3. Register General Patient and Create Bill
```
POST /api/patients/with-billing
{
  "fullName": "Patient Name",
  "gender": "MALE",
  "dateOfBirth": "1990-01-01",
  "contactNumber": "+977 9841234567",
  "address": "Address",
  "patientType": "GENERAL"
}

Returns 201 with Patient + Bill + Message
```

### 4. Register Patient Without Bill (Charge Disabled)
```
POST /api/patients/with-billing
{
  "fullName": "Patient Name",
  "gender": "FEMALE",
  "dateOfBirth": "1995-06-15",
  "contactNumber": "+977 9849876543",
  "address": "Address",
  "patientType": "INSURANCE"
}

(Assuming INSURANCE charge is disabled)

Returns 201 with Patient + null Bill + "No registration bill was created..." message
```

---

**API Version**: 1.0
**Last Updated**: 2026-07-12
