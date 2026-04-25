class LicenseBookingModel {
  constructor() {
    this.collection = 'license_bookings';
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
  validateStep1(data, serviceType) {
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
        
        // Check minimum age based on service type
        const minAge = serviceType === 'new' ? 18 : 17;
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - minAge);
        if (date > minDate) {
          errors.push(`Applicant must be at least ${minAge} years old for this license type`);
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
    
    // Previous license validation (if applicable)
    if (data.previousLicense === 'Yes') {
      if (!data.previousLicenseNo || data.previousLicenseNo.trim() === '') {
        errors.push('Previous license number is required');
      }
      
      if (!data.previousIssueDate) {
        errors.push('Previous license issue date is required');
      }
      
      if (!data.previousExpiryDate) {
        errors.push('Previous license expiry date is required');
      }
    }
    
    return errors;
  }

  // Validate step 3 - Medical & Address Information
  validateStep3(data, serviceType) {
    const errors = [];
    
    // Medical certificate required for new and upgrade applications
    if (serviceType !== 'renewal' && serviceType !== 'international') {
      if (!data.medicalCertificate || data.medicalCertificate.trim() === '') {
        errors.push('Medical certificate number is required');
      }
      
      if (!data.medicalIssueDate) {
        errors.push('Medical certificate issue date is required');
      } else {
        const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$|^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(data.medicalIssueDate)) {
          errors.push('Invalid date format for medical certificate. Use DD/MM/YYYY');
        } else {
          let day, month, year;
          if (data.medicalIssueDate.includes('/')) {
            [day, month, year] = data.medicalIssueDate.split('/').map(Number);
          } else {
            [year, month, day] = data.medicalIssueDate.split('-').map(Number);
          }
          
          const date = new Date(year, month - 1, day);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          // Medical certificate should not be older than 6 months
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          
          if (date < sixMonthsAgo) {
            errors.push('Medical certificate must be issued within the last 6 months');
          }
          
          if (date > today) {
            errors.push('Medical certificate issue date cannot be in the future');
          }
        }
      }
    }
    
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
    
    return errors;
  }

  // Validate step 4 - License & Emergency Details
  validateStep4(data, serviceType) {
    const errors = [];
    
    if (serviceType === 'new' || serviceType === 'upgrade') {
      if (!data.vehicleCategories || data.vehicleCategories.length === 0) {
        errors.push('Please select at least one vehicle category');
      }
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
    
    return errors;
  }

  // Format booking data for storage
  formatBookingData(userId, data, serviceType = 'new') {
    const baseData = {
      userId,
      serviceType,
      bookingId: `DL-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      personalInfo: {
        fullName: data.fullName || '',
        fullNameLocal: data.fullNameLocal || '',
        dob: this.convertDateForStorage(data.dob),
        gender: data.gender || '',
        mobile: data.mobile || '',
        bloodGroup: data.bloodGroup || '',
      },
      identityInfo: {
        nicNumber: data.nicNumber || '',
        nicIssueDate: this.convertDateForStorage(data.nicIssueDate),
        previousLicense: data.previousLicense || 'No',
        previousLicenseNo: data.previousLicenseNo || '',
        previousIssueDate: this.convertDateForStorage(data.previousIssueDate),
        previousExpiryDate: this.convertDateForStorage(data.previousExpiryDate),
      },
      medicalInfo: {
        medicalCertificate: data.medicalCertificate || '',
        medicalIssueDate: this.convertDateForStorage(data.medicalIssueDate),
        medicalExpiryDate: this.convertDateForStorage(data.medicalExpiryDate),
      },
      addressInfo: {
        address: data.address || '',
        district: data.district || '',
        dsDivision: data.ds || '',
        gnDivision: data.gn || '',
      },
      drivingSchool: {
        name: data.drivingSchool || '',
        instructorName: data.instructorName || '',
      },
      licenseDetails: {
        licenseType: serviceType,
        vehicleCategories: data.vehicleCategories || [],
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

module.exports = LicenseBookingModel;