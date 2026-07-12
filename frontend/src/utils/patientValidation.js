export const emptyPatient = {
  fullName: '',
  gender: '',
  dateOfBirth: '',
  contactNumber: '',
  address: '',
  patientType: '',
  insuranceDetail: {
    provider: '',
    policyNumber: '',
    coverageAmount: '',
    expiryDate: '',
  },
}

export function normalizePatient(patient) {
  return {
    fullName: patient?.fullName || '',
    gender: patient?.gender || '',
    dateOfBirth: patient?.dateOfBirth || '',
    contactNumber: patient?.contactNumber || '',
    address: patient?.address || '',
    patientType: patient?.patientType || '',
    insuranceDetail: {
      provider: patient?.insuranceDetail?.provider || '',
      policyNumber: patient?.insuranceDetail?.policyNumber || '',
      coverageAmount: patient?.insuranceDetail?.coverageAmount ?? '',
      expiryDate: patient?.insuranceDetail?.expiryDate || '',
    },
  }
}

export function validatePatient(values) {
  const errors = {}
  const phonePattern = /^[0-9+()\-\s]{7,25}$/
  const today = new Date().toISOString().slice(0, 10)

  if (!values.fullName.trim()) errors.fullName = 'Full name is required'
  else if (values.fullName.trim().length < 2) errors.fullName = 'Full name must contain at least 2 characters'
  if (!values.gender) errors.gender = 'Gender is required'
  if (!values.dateOfBirth) errors.dateOfBirth = 'Date of birth is required'
  else if (values.dateOfBirth >= today) errors.dateOfBirth = 'Date of birth must be in the past'
  if (!values.contactNumber.trim()) errors.contactNumber = 'Contact number is required'
  else if (!phonePattern.test(values.contactNumber.trim())) errors.contactNumber = 'Contact number format is invalid'
  if (!values.address.trim()) errors.address = 'Address is required'
  if (!values.patientType) errors.patientType = 'Patient type is required'

  if (values.patientType === 'INSURANCE') {
    const insurance = values.insuranceDetail
    if (!insurance.provider.trim()) errors['insuranceDetail.provider'] = 'Provider is required'
    if (!insurance.policyNumber.trim()) errors['insuranceDetail.policyNumber'] = 'Policy number is required'
    if (!insurance.coverageAmount || Number(insurance.coverageAmount) <= 0) {
      errors['insuranceDetail.coverageAmount'] = 'Coverage amount must be greater than zero'
    }
    if (!insurance.expiryDate) errors['insuranceDetail.expiryDate'] = 'Expiry date is required'
    else if (insurance.expiryDate <= today) errors['insuranceDetail.expiryDate'] = 'Expiry date must be in the future'
  }
  return errors
}

export function toPatientPayload(values) {
  return {
    fullName: values.fullName.trim(),
    gender: values.gender,
    dateOfBirth: values.dateOfBirth,
    contactNumber: values.contactNumber.trim(),
    address: values.address.trim(),
    patientType: values.patientType,
    insuranceDetail: values.patientType === 'INSURANCE'
      ? {
          provider: values.insuranceDetail.provider.trim(),
          policyNumber: values.insuranceDetail.policyNumber.trim(),
          coverageAmount: Number(values.insuranceDetail.coverageAmount),
          expiryDate: values.insuranceDetail.expiryDate,
        }
      : null,
  }
}
