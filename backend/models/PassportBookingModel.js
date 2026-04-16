class PassportBookingModel {
  constructor() {
    this.collection = 'passport_bookings';
  }

  // Helper to convert DD/MM/YYYY to YYYY-MM-DD for storage
  convertDateForStorage(dateStr) {
    if (!dateStr) return '';
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        return `${year}-${month}-${day}`;
      }
    }
    return dateStr;
  }

  // Helper to convert YYYY-MM-DD to DD/MM/YYYY for display
  convertDateForDisplay(dateStr) {
    if (!dateStr) return '';
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-');
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  }

  // Validate step 1 - Personal Information
  validateStep1(data) {
    const errors = [];
    
    if (!data.fullName || data.fullName.trim().length < 3) {
      errors.push('Full name is required (minimum 3 characters)');
    }
    
    if (!data.dob) {
      errors.push('Date of birth is required');
    } else {
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$|^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.dob)) {
        errors.push('Invalid date format. Use DD/MM/YYYY');
      } else {
        let day, month, year;
        if (data.dob.includes('/')) {
          [day, month, year] = data.dob.split('/').map(Number);
        } else {
          [year, month, day] = data.dob.split('-').map(Number);
        }
        
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
          errors.push('Invalid date - please enter a real date');
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date > today) {
          errors.push('Date of birth cannot be in the future');
        }
        
        // Check minimum age for passport (16 years)
        const minAge = 16;
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - minAge);
        if (date > minDate) {
          errors.push(`Applicant must be at least ${minAge} years old for passport`);
        }
      }
    }
    
    if (!data.gender) {
      errors.push('Gender is required');
    }
    
    if (!data.mobile) {
      errors.push('Mobile number is required');
    } else {
      const phoneRegex = /^\+94[0-9]{9}$/;
      if (!phoneRegex.test(data.mobile)) {
        errors.push('Mobile number must start with +94 followed by exactly 9 digits (e.g., +94771234567)');
      }
    }
    
    if (!data.birthplace || data.birthplace.trim() === '') {
      errors.push('Place of birth is required');
    }
    
    return errors;
  }

  // Validate step 2 - Identity Information
  validateStep2(data) {
    const errors = [];
    
    if (!data.nicNumber || data.nicNumber.trim() === '') {
      errors.push('NIC number is required');
    } else {
      const nicRegex = /^[0-9]{9}[vVxX]?$|^[0-9]{12}$/;
      if (!nicRegex.test(data.nicNumber)) {
        errors.push('Invalid NIC number format (9 digits + V/X or 12 digits)');
      }
    }
    
    if (!data.nicIssueDate) {
      errors.push('NIC issue date is required');
    } else {
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$|^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.nicIssueDate)) {
        errors.push('Invalid date format for NIC issue date. Use DD/MM/YYYY');
      } else {
        let day, month, year;
        if (data.nicIssueDate.includes('/')) {
          [day, month, year] = data.nicIssueDate.split('/').map(Number);
        } else {
          [year, month, day] = data.nicIssueDate.split('-').map(Number);
        }
        
        const date = new Date(year, month - 1, day);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date > today) {
          errors.push('NIC issue date cannot be in the future');
        }
      }
    }
    
    // Previous passport validation (if applicable)
    if (data.previousPassport === 'Yes') {
      if (!data.previousPassportNo || data.previousPassportNo.trim() === '') {
        errors.push('Previous passport number is required');
      }
      
      if (!data.previousIssueDate) {
        errors.push('Previous passport issue date is required');
      }
      
      if (!data.previousExpiryDate) {
        errors.push('Previous passport expiry date is required');
      }
    }
    
    return errors;
  }

  // Validate step 3 - Family & Address Information
  validateStep3(data) {
    const errors = [];
    
    if (!data.address || data.address.trim().length < 5) {
      errors.push('Address is required (minimum 5 characters)');
    }
    
    if (!data.district || data.district.trim() === '') {
      errors.push('District is required');
    }
    
    if (!data.ds || data.ds.trim() === '') {
      errors.push('DS Division is required');
    }
    
    if (!data.gn || data.gn.trim() === '') {
      errors.push('GN Division is required');
    }
    
    if (!data.fatherName || data.fatherName.trim() === '') {
      errors.push('Father\'s full name is required');
    }
    
    if (!data.motherName || data.motherName.trim() === '') {
      errors.push('Mother\'s full name is required');
    }
    
    return errors;
  }

  // Validate step 4 - Passport & Emergency Details
  validateStep4(data) {
    const errors = [];
    
    if (!data.profession || data.profession.trim() === '') {
      errors.push('Profession/Occupation is required');
    }
    
    if (!data.emergencyContact || data.emergencyContact.trim() === '') {
      errors.push('Emergency contact name is required');
    }
    
    if (!data.emergencyMobile || data.emergencyMobile.trim() === '') {
      errors.push('Emergency mobile number is required');
    }
    
    if (!data.emergencyRelation || data.emergencyRelation.trim() === '') {
      errors.push('Relationship to emergency contact is required');
    }
    
    if (!data.passportType) {
      errors.push('Passport type is required');
    }
    
    if (!data.validityPeriod) {
      errors.push('Validity period is required');
    }
    
    if (!data.pages) {
      errors.push('Number of pages is required');
    }
    
    return errors;
  }

  // Format booking data for storage
  formatBookingData(userId, data, serviceType = 'new') {
    const baseData = {
      userId,
      serviceType,
      bookingId: `PPT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      personalInfo: {
        fullName: data.fullName || '',
        fullNameLocal: data.fullNameLocal || '',
        dob: this.convertDateForStorage(data.dob),
        gender: data.gender || '',
        mobile: data.mobile || '',
        birthplace: data.birthplace || '',
      },
      identityInfo: {
        nicNumber: data.nicNumber || '',
        nicIssueDate: this.convertDateForStorage(data.nicIssueDate),
        previousPassport: data.previousPassport || 'No',
        previousPassportNo: data.previousPassportNo || '',
        previousIssueDate: this.convertDateForStorage(data.previousIssueDate),
        previousExpiryDate: this.convertDateForStorage(data.previousExpiryDate),
      },
      familyInfo: {
        fatherName: data.fatherName || '',
        motherName: data.motherName || '',
        spouseName: data.spouseName || '',
      },
      addressInfo: {
        address: data.address || '',
        district: data.district || '',
        dsDivision: data.ds || '',
        gnDivision: data.gn || '',
      },
      passportDetails: {
        passportType: data.passportType || 'Ordinary',
        validityPeriod: data.validityPeriod || '10 Years',
        pages: data.pages || '36 Pages',
        profession: data.profession || '',
        educationalQualification: data.educationalQualification || '',
      },
      emergencyContact: {
        name: data.emergencyContact || '',
        mobile: data.emergencyMobile || '',
        relation: data.emergencyRelation || '',
      },
      appointmentInfo: {
        timeslot: data.timeslot || '',
        status: 'confirmed',
        confirmedAt: Date.now(),
      },
      documents: data.documents || [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    return baseData;
  }
}

module.exports = PassportBookingModel;