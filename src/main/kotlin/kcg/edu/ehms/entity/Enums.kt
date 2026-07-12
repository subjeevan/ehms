package kcg.edu.ehms.entity

/**
 * Enum classes for common entity types used throughout the EHMS system.
 * Gender: Male or Female classification for patients.
 * PatientType: General, Paying, or Insurance patient types.
 * PaymentStatus: Paid or Pending status for bills.
 * BillType: Type of bill (Registration, Consultation, Procedure, Medicine, Laboratory, Other).
 */
enum class Gender { MALE, FEMALE }
enum class PatientType { GENERAL, PAYING, INSURANCE }
enum class PaymentStatus { PAID, PENDING }
enum class BillType { REGISTRATION, CONSULTATION, PROCEDURE, MEDICINE, LABORATORY, OTHER }
