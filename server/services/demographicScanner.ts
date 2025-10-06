/**
 * Demographic Field Scanner
 * 
 * Scans repositories for demographic data fields and generates comprehensive reports
 * Supports multiple naming conventions and patterns
 */

export interface DemographicField {
  category: string;
  fieldName: string;
  patterns: RegExp[];
  description: string;
  examples: string[];
}

export interface ScanResult {
  file: string;
  line: number;
  fieldType: string;
  matchedPattern: string;
  context: string;
}

export interface DemographicScanReport {
  summary: {
    totalFiles: number;
    totalMatches: number;
    fieldsFound: number;
    scanDate: string;
  };
  fieldResults: {
    [fieldName: string]: ScanResult[];
  };
  coverage: {
    foundFields: string[];
    missingFields: string[];
  };
}

export class DemographicScanner {
  private demographicFields: DemographicField[] = [
    // Name Fields
    {
      category: 'Name',
      fieldName: 'Embossed Name',
      patterns: [
        /emboss(ed)?[_\s-]?name/i,
        /card[_\s-]?emboss(ed)?[_\s-]?name/i,
        /emboss[_\s-]?first[_\s-]?name/i,
        /emboss[_\s-]?last[_\s-]?name/i
      ],
      description: 'Name as it appears embossed on card',
      examples: ['embossedName', 'embossed_name', 'cardEmbossedName']
    },
    {
      category: 'Name',
      fieldName: 'Embossed Company Name',
      patterns: [
        /emboss(ed)?[_\s-]?company[_\s-]?name/i,
        /emboss(ed)?[_\s-]?org(anization)?[_\s-]?name/i,
        /company[_\s-]?emboss(ed)?[_\s-]?name/i
      ],
      description: 'Company name embossed on card',
      examples: ['embossedCompanyName', 'embossed_company_name']
    },
    {
      category: 'Name',
      fieldName: 'Primary Name',
      patterns: [
        /primary[_\s-]?name/i,
        /first[_\s-]?name/i,
        /given[_\s-]?name/i,
        /fname/i
      ],
      description: 'Primary or first name of the individual',
      examples: ['primaryName', 'primary_name', 'firstName']
    },
    {
      category: 'Name',
      fieldName: 'Secondary Name',
      patterns: [
        /secondary[_\s-]?name/i,
        /last[_\s-]?name/i,
        /sur[_\s-]?name/i,
        /family[_\s-]?name/i,
        /lname/i
      ],
      description: 'Secondary or last name of the individual',
      examples: ['secondaryName', 'secondary_name', 'lastName']
    },
    {
      category: 'Name',
      fieldName: 'Legal Name',
      patterns: [
        /legal[_\s-]?name/i,
        /official[_\s-]?name/i,
        /full[_\s-]?legal[_\s-]?name/i
      ],
      description: 'Official legal name',
      examples: ['legalName', 'legal_name', 'officialName']
    },
    {
      category: 'Name',
      fieldName: 'DBA Name',
      patterns: [
        /dba[_\s-]?name/i,
        /doing[_\s-]?business[_\s-]?as/i,
        /trade[_\s-]?name/i
      ],
      description: 'Doing Business As name',
      examples: ['dbaName', 'dba_name', 'tradeName']
    },
    {
      category: 'Name',
      fieldName: 'Double Byte Name',
      patterns: [
        /double[_\s-]?byte[_\s-]?name/i,
        /dbcs[_\s-]?name/i,
        /unicode[_\s-]?name/i,
        /multi[_\s-]?byte[_\s-]?name/i,
        /kanji[_\s-]?name/i,
        /chinese[_\s-]?name/i
      ],
      description: 'Name in double-byte character set (DBCS)',
      examples: ['doubleByteName', 'double_byte_name', 'dbcsName']
    },

    // Personal Information
    {
      category: 'Personal',
      fieldName: 'Gender',
      patterns: [
        /\bgender\b/i,
        /\bsex\b/i,
        /gender[_\s-]?code/i,
        /gender[_\s-]?type/i
      ],
      description: 'Gender or sex identifier',
      examples: ['gender', 'genderCode', 'sex']
    },
    {
      category: 'Personal',
      fieldName: 'Date of Birth',
      patterns: [
        /\bdob\b/i,
        /date[_\s-]?of[_\s-]?birth/i,
        /birth[_\s-]?date/i,
        /birthdate/i,
        /birth_dt/i,
        /dob_date/i
      ],
      description: 'Date of birth',
      examples: ['dob', 'dateOfBirth', 'birthDate', 'birth_date']
    },
    {
      category: 'Personal',
      fieldName: 'Government IDs',
      patterns: [
        /gov(ernment)?[_\s-]?id/i,
        /ssn/i,
        /social[_\s-]?security[_\s-]?(number)?/i,
        /tax[_\s-]?id/i,
        /national[_\s-]?id/i,
        /passport[_\s-]?number/i,
        /drivers?[_\s-]?license/i,
        /identification[_\s-]?number/i
      ],
      description: 'Government-issued identification numbers',
      examples: ['govId', 'ssn', 'taxId', 'nationalId', 'passportNumber']
    },
    {
      category: 'Personal',
      fieldName: 'Member Since Date',
      patterns: [
        /member[_\s-]?since/i,
        /enrollment[_\s-]?date/i,
        /join[_\s-]?date/i,
        /registration[_\s-]?date/i,
        /account[_\s-]?open[_\s-]?date/i,
        /customer[_\s-]?since/i
      ],
      description: 'Date when customer became a member',
      examples: ['memberSince', 'member_since_date', 'enrollmentDate']
    },

    // Address Fields
    {
      category: 'Address',
      fieldName: 'Home Address',
      patterns: [
        /home[_\s-]?address/i,
        /residential[_\s-]?address/i,
        /primary[_\s-]?address/i,
        /home[_\s-]?addr/i
      ],
      description: 'Primary residential address',
      examples: ['homeAddress', 'home_address', 'residentialAddress']
    },
    {
      category: 'Address',
      fieldName: 'Business Address',
      patterns: [
        /business[_\s-]?address/i,
        /work[_\s-]?address/i,
        /office[_\s-]?address/i,
        /company[_\s-]?address/i,
        /business[_\s-]?addr/i
      ],
      description: 'Business or work address',
      examples: ['businessAddress', 'business_address', 'workAddress']
    },
    {
      category: 'Address',
      fieldName: 'Alternate Address',
      patterns: [
        /alternate[_\s-]?address/i,
        /alternative[_\s-]?address/i,
        /secondary[_\s-]?address/i,
        /alt[_\s-]?address/i,
        /other[_\s-]?address/i
      ],
      description: 'Alternative or secondary address',
      examples: ['alternateAddress', 'alternate_address', 'altAddress']
    },
    {
      category: 'Address',
      fieldName: 'Temporary Address',
      patterns: [
        /temp(orary)?[_\s-]?address/i,
        /seasonal[_\s-]?address/i,
        /vacation[_\s-]?address/i
      ],
      description: 'Temporary address',
      examples: ['temporaryAddress', 'temporary_address', 'tempAddress']
    },
    {
      category: 'Address',
      fieldName: 'Other Address',
      patterns: [
        /other[_\s-]?address/i,
        /additional[_\s-]?address/i,
        /misc[_\s-]?address/i
      ],
      description: 'Other miscellaneous address',
      examples: ['otherAddress', 'other_address', 'additionalAddress']
    },
    {
      category: 'Address',
      fieldName: 'Additional Addresses Array',
      patterns: [
        /address(es)?[_\s-]?(list|array)/i,
        /additional[_\s-]?addresses/i,
        /multiple[_\s-]?addresses/i,
        /address[_\s-]?collection/i,
        /List<.*Address>/,
        /Array<.*Address>/,
        /\[\].*address/i
      ],
      description: 'Collection or array of additional addresses',
      examples: ['addressList', 'addresses[]', 'List<Address>', 'additionalAddresses']
    },

    // Phone Fields
    {
      category: 'Phone',
      fieldName: 'Home Phone',
      patterns: [
        /home[_\s-]?phone/i,
        /home[_\s-]?telephone/i,
        /residence[_\s-]?phone/i,
        /home[_\s-]?number/i
      ],
      description: 'Home telephone number',
      examples: ['homePhone', 'home_phone', 'homeNumber']
    },
    {
      category: 'Phone',
      fieldName: 'Alternate Home Phone',
      patterns: [
        /alternate[_\s-]?home[_\s-]?phone/i,
        /alt[_\s-]?home[_\s-]?phone/i,
        /home[_\s-]?phone[_\s-]?2/i
      ],
      description: 'Alternate home phone number',
      examples: ['alternateHomePhone', 'alt_home_phone', 'homePhone2']
    },
    {
      category: 'Phone',
      fieldName: 'Business Phone',
      patterns: [
        /business[_\s-]?phone/i,
        /work[_\s-]?phone/i,
        /office[_\s-]?phone/i,
        /company[_\s-]?phone/i
      ],
      description: 'Business or work phone number',
      examples: ['businessPhone', 'business_phone', 'workPhone']
    },
    {
      category: 'Phone',
      fieldName: 'Alternate Business Phone',
      patterns: [
        /alternate[_\s-]?business[_\s-]?phone/i,
        /alt[_\s-]?work[_\s-]?phone/i,
        /business[_\s-]?phone[_\s-]?2/i
      ],
      description: 'Alternate business phone number',
      examples: ['alternateBusinessPhone', 'alt_business_phone']
    },
    {
      category: 'Phone',
      fieldName: 'Mobile Phone',
      patterns: [
        /mobile[_\s-]?phone/i,
        /cell[_\s-]?phone/i,
        /cellular/i,
        /mobile[_\s-]?number/i
      ],
      description: 'Mobile or cellular phone number',
      examples: ['mobilePhone', 'mobile_phone', 'cellPhone']
    },
    {
      category: 'Phone',
      fieldName: 'Alternate Mobile Phone',
      patterns: [
        /alternate[_\s-]?mobile[_\s-]?phone/i,
        /alt[_\s-]?cell[_\s-]?phone/i,
        /mobile[_\s-]?phone[_\s-]?2/i
      ],
      description: 'Alternate mobile phone number',
      examples: ['alternateMobilePhone', 'alt_mobile_phone']
    },
    {
      category: 'Phone',
      fieldName: 'Attorney Phone',
      patterns: [
        /attorney[_\s-]?phone/i,
        /lawyer[_\s-]?phone/i,
        /legal[_\s-]?phone/i
      ],
      description: 'Attorney or legal representative phone number',
      examples: ['attorneyPhone', 'attorney_phone', 'lawyerPhone']
    },
    {
      category: 'Phone',
      fieldName: 'Fax',
      patterns: [
        /\bfax\b/i,
        /fax[_\s-]?number/i,
        /facsimile/i,
        /fax[_\s-]?phone/i
      ],
      description: 'Fax number',
      examples: ['fax', 'faxNumber', 'facsimile']
    },
    {
      category: 'Phone',
      fieldName: 'ANI Phone',
      patterns: [
        /\bani\b/i,
        /ani[_\s-]?phone/i,
        /automatic[_\s-]?number[_\s-]?identification/i,
        /caller[_\s-]?id/i
      ],
      description: 'Automatic Number Identification phone',
      examples: ['ani', 'aniPhone', 'callerId']
    },
    {
      category: 'Phone',
      fieldName: 'Other Phone',
      patterns: [
        /other[_\s-]?phone/i,
        /additional[_\s-]?phone/i,
        /misc[_\s-]?phone/i
      ],
      description: 'Other miscellaneous phone number',
      examples: ['otherPhone', 'other_phone', 'additionalPhone']
    },
    {
      category: 'Phone',
      fieldName: 'Additional Phones Array',
      patterns: [
        /phone(s)?[_\s-]?(list|array)/i,
        /additional[_\s-]?phones/i,
        /multiple[_\s-]?phones/i,
        /phone[_\s-]?collection/i,
        /List<.*Phone>/,
        /Array<.*Phone>/,
        /\[\].*phone/i
      ],
      description: 'Collection or array of additional phone numbers',
      examples: ['phoneList', 'phones[]', 'List<Phone>', 'additionalPhones']
    },

    // Email Fields
    {
      category: 'Email',
      fieldName: 'Servicing Email',
      patterns: [
        /servicing[_\s-]?email/i,
        /service[_\s-]?email/i,
        /support[_\s-]?email/i
      ],
      description: 'Email for servicing communications',
      examples: ['servicingEmail', 'servicing_email', 'serviceEmail']
    },
    {
      category: 'Email',
      fieldName: 'E-Statement Email',
      patterns: [
        /e?[_\s-]?statement[_\s-]?email/i,
        /electronic[_\s-]?statement[_\s-]?email/i,
        /billing[_\s-]?email/i,
        /statement[_\s-]?delivery[_\s-]?email/i
      ],
      description: 'Email for electronic statements',
      examples: ['estatementEmail', 'estatement_email', 'billingEmail']
    },
    {
      category: 'Email',
      fieldName: 'Business Email',
      patterns: [
        /business[_\s-]?email/i,
        /work[_\s-]?email/i,
        /corporate[_\s-]?email/i,
        /company[_\s-]?email/i
      ],
      description: 'Business or work email address',
      examples: ['businessEmail', 'business_email', 'workEmail']
    },
    {
      category: 'Email',
      fieldName: 'Additional Emails Array',
      patterns: [
        /email(s)?[_\s-]?(list|array)/i,
        /additional[_\s-]?emails/i,
        /other[_\s-]?email[_\s-]?address(es)?/i,
        /multiple[_\s-]?emails/i,
        /email[_\s-]?collection/i,
        /List<.*Email>/,
        /Array<.*Email>/,
        /\[\].*email/i
      ],
      description: 'Collection or array of additional email addresses',
      examples: ['emailList', 'emails[]', 'List<Email>', 'additionalEmails']
    },

    // Preferences
    {
      category: 'Preference',
      fieldName: 'Preference Language Code',
      patterns: [
        /preference[_\s-]?language[_\s-]?code/i,
        /pref[_\s-]?lang(uage)?[_\s-]?cd/i,
        /language[_\s-]?preference/i,
        /preferred[_\s-]?language/i,
        /lang(uage)?[_\s-]?code/i,
        /locale[_\s-]?code/i
      ],
      description: 'Preferred language code',
      examples: ['preferenceLanguageCode', 'pref_lang_cd', 'languageCode', 'locale']
    }
  ];

  /**
   * Scan repository files for demographic field patterns
   */
  async scanRepository(files: { path: string; content: string }[]): Promise<DemographicScanReport> {
    const results: { [fieldName: string]: ScanResult[] } = {};
    const foundFieldsSet = new Set<string>();

    for (const file of files) {
      for (const field of this.demographicFields) {
        const fileResults = this.scanFileForField(file.path, file.content, field);
        if (fileResults.length > 0) {
          foundFieldsSet.add(field.fieldName);
          if (!results[field.fieldName]) {
            results[field.fieldName] = [];
          }
          results[field.fieldName].push(...fileResults);
        }
      }
    }

    const totalMatches = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
    const foundFields = Array.from(foundFieldsSet);
    const allFieldNames = this.demographicFields.map(f => f.fieldName);
    const missingFields = allFieldNames.filter(f => !foundFieldsSet.has(f));

    return {
      summary: {
        totalFiles: files.length,
        totalMatches,
        fieldsFound: foundFields.length,
        scanDate: new Date().toISOString()
      },
      fieldResults: results,
      coverage: {
        foundFields,
        missingFields
      }
    };
  }

  /**
   * Scan a single file for a specific demographic field
   */
  private scanFileForField(filePath: string, content: string, field: DemographicField): ScanResult[] {
    const results: ScanResult[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const pattern of field.patterns) {
        const match = line.match(pattern);
        if (match) {
          results.push({
            file: filePath,
            line: i + 1,
            fieldType: field.fieldName,
            matchedPattern: pattern.source,
            context: line.trim()
          });
        }
      }
    }

    return results;
  }

  /**
   * Get all demographic field definitions
   */
  getFieldDefinitions(): DemographicField[] {
    return this.demographicFields;
  }

  /**
   * Get regex patterns for a specific field
   */
  getFieldPatterns(fieldName: string): string[] | null {
    const field = this.demographicFields.find(f => f.fieldName === fieldName);
    return field ? field.patterns.map(p => p.source) : null;
  }

  /**
   * Generate comprehensive regex pattern documentation
   */
  generatePatternDocumentation(): string {
    let doc = '# Demographic Field Pattern Documentation\n\n';
    doc += `Generated: ${new Date().toISOString()}\n\n`;
    doc += `Total Fields: ${this.demographicFields.length}\n\n`;

    const categories = [...new Set(this.demographicFields.map(f => f.category))];

    for (const category of categories) {
      doc += `## ${category} Fields\n\n`;
      const categoryFields = this.demographicFields.filter(f => f.category === category);

      for (const field of categoryFields) {
        doc += `### ${field.fieldName}\n\n`;
        doc += `**Description:** ${field.description}\n\n`;
        doc += `**Regular Expression Patterns:**\n\n`;
        
        field.patterns.forEach((pattern, index) => {
          doc += `${index + 1}. \`${pattern.source}\`\n`;
          doc += `   - Flags: ${pattern.flags}\n`;
        });
        
        doc += `\n**Examples:**\n\n`;
        field.examples.forEach(example => {
          doc += `- \`${example}\`\n`;
        });
        doc += '\n---\n\n';
      }
    }

    return doc;
  }
}

export const demographicScanner = new DemographicScanner();
