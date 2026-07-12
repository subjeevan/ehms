package kcg.edu.ehms.repository

import kcg.edu.ehms.entity.Doctor
import org.springframework.data.jpa.repository.JpaRepository

interface DoctorRepository : JpaRepository<Doctor, Long>
