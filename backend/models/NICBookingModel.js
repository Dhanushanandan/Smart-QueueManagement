class NICBookingModel {
  constructor() {
    this.collection = 'nic_bookings';
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

  // Validate personal information
  validatePersonalInfo(data) {
    const errors = [];
    
    if (!data.fullName || data.fullName.trim().length < 3) {
      errors.push('Full name is required (minimum 3 characters)');
    }
    
    if (!data.dob) {
      errors.push('Date of birth is required');
    } else {
      // Accept both DD/MM/YYYY and YYYY-MM-DD formats
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$|^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.dob)) {
        errors.push('Invalid date format. Use DD/MM/YYYY');
      } else {
        // Validate it's a real date
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
        
        // Check if date is not in future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date > today) {
          errors.push('Date of birth cannot be in the future');
        }
        
        // Check minimum age (e.g., 15 years)
        const minAge = 15;
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - minAge);
        if (date > minDate) {
          errors.push(`Applicant must be at least ${minAge} years old`);
        }
      }
    }
    
    if (!data.gender) {
      errors.push('Gender is required');
    }
    
    if (!data.mobile) {
      errors.push('Mobile number is required');
    } else {
      // Sri Lanka mobile format: +94 followed by exactly 9 digits
      const phoneRegex = /^\+94[0-9]{9}$/;
      if (!phoneRegex.test(data.mobile)) {
        errors.push('Mobile number must start with +94 followed by exactly 9 digits (e.g., +94771234567)');
      }
    }
    
    return errors;
  }

  // Validate verification info
  validateVerificationInfo(data) {
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
    
    if (!data.birthNo || data.birthNo.trim() === '') {
      errors.push('Birth certificate number is required');
    }
    
    if (!data.birthDate) {
      errors.push('Birth certificate issue date is required');
    } else {
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$|^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.birthDate)) {
        errors.push('Invalid date format for birth certificate. Use DD/MM/YYYY');
      } else {
        // Validate it's a real date
        let day, month, year;
        if (data.birthDate.includes('/')) {
          [day, month, year] = data.birthDate.split('/').map(Number);
        } else {
          [year, month, day] = data.birthDate.split('-').map(Number);
        }
        
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
          errors.push('Invalid birth certificate date - please enter a real date');
        }
        
        // Check if date is not in future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date > today) {
          errors.push('Birth certificate date cannot be in the future');
        }
      }
    }
    
    if (!data.citizenship) {
      errors.push('Citizenship status is required');
    }
    
    return errors;
  }

  // Validate renewal step 1
  validateRenewalStep1(data) {
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
        errors.push('Mobile number must start with +94 followed by exactly 9 digits');
      }
    }
    
    if (!data.oldNicNumber || data.oldNicNumber.trim() === '') {
      errors.push('Old NIC number is required');
    } else {
      // Sri Lanka NIC format: 9 digits + V or 12 digits
      const nicRegex = /^[0-9]{9}[vVxX]?$|^[0-9]{12}$/;
      if (!nicRegex.test(data.oldNicNumber)) {
        errors.push('Invalid NIC number format');
      }
    }
    
    if (!data.reason) {
      errors.push('Reason for renewal is required');
    }
    
    return errors;
  }

  // Validate renewal step 2 (Police Report)
  validateRenewalStep2(data) {
    const errors = [];
    
    if (!data.policeStation || data.policeStation.trim() === '') {
      errors.push('Police station is required');
    }
    
    if (!data.complaintNumber || data.complaintNumber.trim() === '') {
      errors.push('Complaint number is required');
    }
    
    if (!data.complaintDate) {
      errors.push('Complaint date is required');
    } else {
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$|^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.complaintDate)) {
        errors.push('Invalid date format. Use DD/MM/YYYY');
      }
    }
    
    return errors;
  }

  // Validate renewal step 3 (Address & Documents)
  validateRenewalStep3(data) {
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
    
    if (!data.birthNo || data.birthNo.trim() === '') {
      errors.push('Birth certificate number is required');
    }
    
    if (!data.birthDate) {
      errors.push('Birth certificate issue date is required');
    } else {
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$|^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.birthDate)) {
        errors.push('Invalid date format. Use DD/MM/YYYY');
      }
    }
    
    return errors;
  }

  // Format booking data for storage
  formatBookingData(userId, data, serviceType = 'registration') {
    const baseData = {
      userId,
      serviceType,
      bookingId: `NIC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      personalInfo: {
        fullName: data.fullName || '',
        fullNameLocal: data.fullNameLocal || '',
        dob: this.convertDateForStorage(data.dob),
        gender: data.gender || '',
        mobile: data.mobile || '',
      },
      verificationInfo: {
        address: data.address || '',
        district: data.district || '',
        dsDivision: data.ds || '',
        gnDivision: data.gn || '',
        birthCertificateNo: data.birthNo || '',
        birthCertificateDate: this.convertDateForStorage(data.birthDate),
        citizenship: data.citizenship || '',
      },
      appointmentInfo: {
        timeslot: data.timeslot || '',
        status: 'confirmed',
        confirmedAt: Date.now(),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Add renewal-specific fields
    if (serviceType === 'renewal') {
      baseData.renewalInfo = {
        oldNicNumber: data.oldNicNumber || '',
        oldNicIssueDate: this.convertDateForStorage(data.oldNicIssueDate),
        reason: data.reason || '',
        policeStation: data.policeStation || '',
        complaintNumber: data.complaintNumber || '',
        complaintDate: this.convertDateForStorage(data.complaintDate),
        remarks: data.remarks || '',
      };
    }

    return baseData;
  }
}

module.exports = NICBookingModel;