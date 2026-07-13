# EHMS Billing Feature - Setup and Testing Guide

## Quick Start

### Backend Setup

1. **Build the project**
   ```bash
   cd d:\Web 3.0\ehms
   ./mvnw clean install
   ```

2. **Start the application**
   ```bash
   ./mvnw spring-boot:run
   ```
   The backend will run on `http://localhost:8080`

3. **Database initialization**
   - On first startup, Hibernate will auto-create the `patient_type_charges` table
   - Default charges will be inserted:
     - GENERAL: 200.00
     - PAYING: 500.00
     - INSURANCE: 100.00
   - Bill table will be updated with new columns: `bill_type`, `description`

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd d:\Web 3.0\ehms\frontend
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173` (or another available port)

3. **Build for production**
   ```bash
   npm run build
   ```

## Testing the Implementation

### Prerequisites

- Backend running on `http://localhost:8080`
- Frontend running on `http://localhost:5173`
- Default credentials:
  - Admin: username=`admin`, password=`Admin@123`
  - User: username=`user`, password=`User@123`

### Manual Testing Workflow

#### 1. Login as Admin

1. Navigate to login page
2. Enter username: `admin`, password: `Admin@123`
3. Click "Sign in"
4. Verify redirected to dashboard

#### 2. Access Charge Setup Page

1. From sidebar, click "Setup" under Administration
2. You should see tabs: Departments, Doctors, Settings
3. From the sidebar again, click "Charge Setup" (directly under Setup)
4. Verify page loads with three patient types and their charges:
   - General: ¥200.00 (Enabled)
   - Paying: ¥500.00 (Enabled)
   - Insurance: ¥100.00 (Enabled)

#### 3. Update a Charge

1. On Charge Setup page, click "Edit" next to "General"
2. Edit form appears with current amount (200.00)
3. Change amount to 250.00
4. Leave "Enabled" checked
5. Click "Save Charge"
6. Verify success message
7. Verify General charge now shows 250.00 in the list

#### 4. Test Validation

1. Click "Edit" next to any charge
2. Try entering "-100" in the amount field
3. Submit form
4. Verify error: "Charge amount cannot be negative"
5. Click Cancel to close form

#### 5. Test Disabled Charge

1. Click "Edit" next to "Insurance"
2. Uncheck the "Enabled" checkbox
3. Click "Save Charge"
4. Verify success message
5. Verify Insurance status changed to "Disabled"

#### 6. Register Patient with Active Charge

1. Navigate to "Patient Registration"
2. Fill in patient details:
   - Full name: "Test General Patient"
   - Gender: Male
   - DOB: 1990-05-15
   - Contact: +977 9841234567
   - Address: Test Address
   - Patient type: **General**
3. Verify charge display appears: "Registration Charge: ¥250.00" (after update)
4. Click "Register patient"
5. Verify success message with:
   - "Patient registered and registration bill created successfully"
   - "Registration bill created: ¥250.00"
   - "Payment status: Pending"

#### 7. Register Paying Patient

1. Navigate to "Patient Registration"
2. Fill in patient details:
   - Full name: "Test Paying Patient"
   - Gender: Female
   - DOB: 1995-03-20
   - Contact: +977 9849876543
   - Address: Another Address
   - Patient type: **Paying**
3. Verify charge display: "Registration Charge: ¥500.00"
4. Click "Register patient"
5. Verify success message and bill amount: ¥500.00

#### 8. Register Patient with Disabled Charge

1. Navigate to "Patient Registration"
2. Fill in patient details:
   - Full name: "Test Insurance Patient"
   - Gender: Male
   - DOB: 1988-01-01
   - Contact: +977 9841111111
   - Address: Insurance Address
   - Patient type: **Insurance** (remember, we disabled this in step 5)
   - Insurance Details:
     - Provider: Test Insurance Co
     - Policy Number: TEST-2024-001
     - Coverage: 500000
     - Expiry: 2027-07-12
3. Verify NO charge display appears (charge disabled)
4. Click "Register patient"
5. Verify success message says: "No registration bill was created because automatic billing is disabled"

#### 9. Re-enable Insurance Charge and Test

1. Navigate to Charge Setup
2. Click "Edit" next to Insurance
3. Check the "Enabled" checkbox
4. Update amount to 150.00
5. Save
6. Register new Insurance patient (repeat step 8 but with new patient name)
7. Verify charge shows: ¥150.00
8. Verify bill is created after registration

#### 10. View Patient and Verify Bill

1. Navigate to "Patient List"
2. Click on a recently registered patient
3. Verify patient details match what was entered
4. Verify bill information shows in patient details:
   - Bill ID, Amount (should be registration charge), Status: PENDING
   - Bill type should show "REGISTRATION"

#### 11. Test Access Control - User Cannot Access Charge Setup

1. Logout
2. Login as user: username=`user`, password=`User@123`
3. Verify "Charge Setup" link does NOT appear in sidebar
4. Try navigating directly to `http://localhost:5173/setup/charges`
5. Verify access denied message
6. Verify redirected to access denied page

#### 12. Test Access Control - User Cannot Update Charges via API

1. Open browser console (F12)
2. Try to call the API directly:
   ```javascript
   fetch('http://localhost:8080/api/setup/charges/GENERAL', {
     method: 'PUT',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer [your-user-token]'
     },
     body: JSON.stringify({ amount: 300, enabled: true })
   })
   ```
3. Verify 403 Forbidden response

#### 13. Test User Can Register Patients

1. As user, navigate to "Patient Registration"
2. Register a patient successfully
3. Verify bill is created using current charge configuration

### Automated Testing (Unit Tests)

#### Create Test Class: `PatientTypeChargeServiceTest`

```kotlin
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.transaction.annotation.Transactional
import kcg.edu.ehms.entity.PatientType
import kcg.edu.ehms.entity.PatientTypeCharge
import kcg.edu.ehms.repository.PatientTypeChargeRepository
import kcg.edu.ehms.service.PatientTypeChargeService
import java.math.BigDecimal
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull

@SpringBootTest
@Transactional
class PatientTypeChargeServiceTest {
    @Autowired
    private lateinit var chargeService: PatientTypeChargeService
    
    @Autowired
    private lateinit var chargeRepository: PatientTypeChargeRepository
    
    @Test
    fun `should retrieve all charges sorted by type`() {
        val charges = chargeService.listAll()
        assertEquals(3, charges.size)
        assertEquals(PatientType.GENERAL, charges[0].patientType)
        assertEquals(PatientType.PAYING, charges[1].patientType)
        assertEquals(PatientType.INSURANCE, charges[2].patientType)
    }
    
    @Test
    fun `should retrieve charge by patient type`() {
        val charge = chargeService.getByPatientType(PatientType.GENERAL)
        assertEquals(PatientType.GENERAL, charge.patientType)
        assertEquals(BigDecimal("200.00"), charge.amount)
        assertEquals(true, charge.enabled)
    }
    
    @Test
    fun `should update charge successfully`() {
        val updated = chargeService.update(
            PatientType.GENERAL,
            UpdatePatientTypeChargeRequest(BigDecimal("250.00"), true),
            "admin"
        )
        assertEquals(BigDecimal("250.00"), updated.amount)
        
        // Verify database change
        val fromDb = chargeRepository.findByPatientType(PatientType.GENERAL)
        assertEquals(BigDecimal("250.00"), fromDb!!.amount)
    }
    
    @Test
    fun `should not allow negative amounts`() {
        assertThrows<BusinessValidationException> {
            chargeService.update(
                PatientType.GENERAL,
                UpdatePatientTypeChargeRequest(BigDecimal("-100.00"), true),
                "admin"
            )
        }
    }
    
    @Test
    fun `should handle disabled charges gracefully`() {
        // Disable INSURANCE charge
        chargeService.update(
            PatientType.INSURANCE,
            UpdatePatientTypeChargeRequest(BigDecimal("100.00"), false),
            "admin"
        )
        
        // Try to get charge (should throw)
        assertThrows<BusinessValidationException> {
            chargeService.getChargeForPatientType(PatientType.INSURANCE)
        }
        
        // Try soft get (should return null)
        val softGet = chargeService.tryGetChargeForPatientType(PatientType.INSURANCE)
        assertNull(softGet)
    }
}
```

#### Create Test Class: `PatientRegistrationBillingTest`

```kotlin
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.transaction.annotation.Transactional
import kcg.edu.ehms.dto.patient.PatientRequest
import kcg.edu.ehms.entity.BillType
import kcg.edu.ehms.entity.Gender
import kcg.edu.ehms.entity.PatientType
import kcg.edu.ehms.entity.PaymentStatus
import kcg.edu.ehms.repository.BillRepository
import kcg.edu.ehms.repository.PatientRepository
import kcg.edu.ehms.service.PatientService
import java.math.BigDecimal
import java.time.LocalDate
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertNull

@SpringBootTest
@Transactional
class PatientRegistrationBillingTest {
    @Autowired
    private lateinit var patientService: PatientService
    
    @Autowired
    private lateinit var patientRepository: PatientRepository
    
    @Autowired
    private lateinit var billRepository: BillRepository
    
    @Test
    fun `should create patient and bill for GENERAL patient`() {
        val request = PatientRequest(
            fullName = "Test Patient",
            gender = Gender.MALE,
            dateOfBirth = LocalDate.of(1990, 5, 15),
            contactNumber = "+977 9841234567",
            address = "Test Address",
            patientType = PatientType.GENERAL
        )
        
        val response = patientService.createWithBilling(request, "testuser")
        
        assertNotNull(response.patient)
        assertNotNull(response.bill)
        assertEquals("Test Patient", response.patient.fullName)
        assertEquals(BigDecimal("200.00"), response.bill!!.amount)
        assertEquals(BillType.REGISTRATION, response.bill!!.billType)
        assertEquals(PaymentStatus.PENDING, response.bill!!.paymentStatus)
    }
    
    @Test
    fun `should create patient with different amounts for different types`() {
        // General
        val generalResp = patientService.createWithBilling(
            PatientRequest(
                fullName = "General Patient",
                gender = Gender.MALE,
                dateOfBirth = LocalDate.of(1990, 1, 1),
                contactNumber = "+977 9841111111",
                address = "Address 1",
                patientType = PatientType.GENERAL
            ),
            "user"
        )
        assertEquals(BigDecimal("200.00"), generalResp.bill?.amount)
        
        // Paying
        val payingResp = patientService.createWithBilling(
            PatientRequest(
                fullName = "Paying Patient",
                gender = Gender.FEMALE,
                dateOfBirth = LocalDate.of(1995, 2, 2),
                contactNumber = "+977 9842222222",
                address = "Address 2",
                patientType = PatientType.PAYING
            ),
            "user"
        )
        assertEquals(BigDecimal("500.00"), payingResp.bill?.amount)
        
        // Insurance
        val insuranceResp = patientService.createWithBilling(
            PatientRequest(
                fullName = "Insurance Patient",
                gender = Gender.MALE,
                dateOfBirth = LocalDate.of(1988, 3, 3),
                contactNumber = "+977 9843333333",
                address = "Address 3",
                patientType = PatientType.INSURANCE,
                insuranceDetail = InsuranceDetailRequest(
                    provider = "Test Insurance",
                    policyNumber = "TEST-001",
                    coverageAmount = BigDecimal("500000.00"),
                    expiryDate = LocalDate.of(2027, 7, 12)
                )
            ),
            "user"
        )
        assertEquals(BigDecimal("100.00"), insuranceResp.bill?.amount)
    }
    
    @Test
    fun `should skip billing when charge is disabled`() {
        // Disable GENERAL charge
        chargeService.update(
            PatientType.GENERAL,
            UpdatePatientTypeChargeRequest(BigDecimal("200.00"), false),
            "admin"
        )
        
        val response = patientService.createWithBilling(
            PatientRequest(
                fullName = "Test Patient",
                gender = Gender.MALE,
                dateOfBirth = LocalDate.of(1990, 5, 15),
                contactNumber = "+977 9841234567",
                address = "Test Address",
                patientType = PatientType.GENERAL
            ),
            "user"
        )
        
        assertNotNull(response.patient)
        assertNull(response.bill)
        assertTrue(response.message.contains("No registration bill was created"))
    }
    
    @Test
    fun `should fail registration when charge is missing`() {
        // Delete GENERAL charge
        val charge = chargeRepository.findByPatientType(PatientType.GENERAL)!!
        chargeRepository.delete(charge)
        
        assertThrows<BusinessValidationException> {
            patientService.createWithBilling(
                PatientRequest(
                    fullName = "Test Patient",
                    gender = Gender.MALE,
                    dateOfBirth = LocalDate.of(1990, 5, 15),
                    contactNumber = "+977 9841234567",
                    address = "Test Address",
                    patientType = PatientType.GENERAL
                ),
                "user"
            )
        }
    }
}
```

### Integration Testing via cURL

#### Get All Charges
```bash
curl -X GET http://localhost:8080/api/setup/charges \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json"
```

#### Update Charge
```bash
curl -X PUT http://localhost:8080/api/setup/charges/GENERAL \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"amount": 300, "enabled": true}'
```

#### Register Patient with Billing
```bash
curl -X POST http://localhost:8080/api/patients/with-billing \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "gender": "MALE",
    "dateOfBirth": "1990-05-15",
    "contactNumber": "+977 9841234567",
    "address": "Test Address",
    "patientType": "GENERAL"
  }'
```

## Troubleshooting

### Issue: Database table not created
**Solution**: Ensure `spring.jpa.hibernate.ddl-auto=update` in application.properties

### Issue: Charge validation always fails
**Solution**: Check that DecimalMin annotation is properly imported from jakarta.validation

### Issue: Frontend shows blank charge page
**Solution**: Check browser console for API errors, verify token is valid and user is admin

### Issue: Patient registration doesn't create bill
**Solution**: 
1. Verify charge exists for the patient type
2. Verify charge is enabled
3. Check application logs for exceptions
4. Verify bill repository query method exists

### Issue: Build fails with Kotlin compilation errors
**Solution**: Ensure Java 17 is set as JAVA_HOME and Maven is properly configured

## Performance Considerations

1. **Charge Lookups**: Charges are retrieved from database on every registration. Consider caching if registrations are very frequent.
2. **Bill Creation**: Bill creation is synchronous in the same transaction as patient creation. Keep transaction scope tight.
3. **Database Indexes**: The `patient_type` column in `patient_type_charges` should have a unique index (already defined via @UniqueConstraint).

## Next Steps

1. Add caching layer for charge retrieval (Redis/Caffeine)
2. Implement charge history/audit log viewer
3. Add bulk charge updates
4. Implement charge templates by department
5. Add charge validation rules (min/max amounts)

---

**Last Updated**: 2026-07-12
**Version**: 1.0
