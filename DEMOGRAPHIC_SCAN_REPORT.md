# Demographic Field Scanning Report

## Executive Summary

This report provides comprehensive documentation of demographic field patterns that can be scanned across code repositories. The scanner identifies 39 different demographic data fields across 5 categories using advanced regular expression matching.

**Report Generated:** ${new Date().toISOString()}

---

## Field Categories

1. **Name Fields** (7 fields)
2. **Personal Information** (4 fields)
3. **Address Fields** (6 fields)
4. **Phone Fields** (11 fields)
5. **Email Fields** (4 fields)
6. **Preference Fields** (1 field)

---

## 1. Name Fields

### 1.1 Embossed Name
**Description:** Name as it appears embossed on card

**Regular Expression Patterns:**
- `/emboss(ed)?[_\s-]?name/i`
- `/card[_\s-]?emboss(ed)?[_\s-]?name/i`
- `/emboss[_\s-]?first[_\s-]?name/i`
- `/emboss[_\s-]?last[_\s-]?name/i`

**Examples:**
- `embossedName`
- `embossed_name`
- `cardEmbossedName`

---

### 1.2 Embossed Company Name
**Description:** Company name embossed on card

**Regular Expression Patterns:**
- `/emboss(ed)?[_\s-]?company[_\s-]?name/i`
- `/emboss(ed)?[_\s-]?org(anization)?[_\s-]?name/i`
- `/company[_\s-]?emboss(ed)?[_\s-]?name/i`

**Examples:**
- `embossedCompanyName`
- `embossed_company_name`

---

### 1.3 Primary Name
**Description:** Primary or first name of the individual

**Regular Expression Patterns:**
- `/primary[_\s-]?name/i`
- `/first[_\s-]?name/i`
- `/given[_\s-]?name/i`
- `/fname/i`

**Examples:**
- `primaryName`
- `primary_name`
- `firstName`

---

### 1.4 Secondary Name
**Description:** Secondary or last name of the individual

**Regular Expression Patterns:**
- `/secondary[_\s-]?name/i`
- `/last[_\s-]?name/i`
- `/sur[_\s-]?name/i`
- `/family[_\s-]?name/i`
- `/lname/i`

**Examples:**
- `secondaryName`
- `secondary_name`
- `lastName`

---

### 1.5 Legal Name
**Description:** Official legal name

**Regular Expression Patterns:**
- `/legal[_\s-]?name/i`
- `/official[_\s-]?name/i`
- `/full[_\s-]?legal[_\s-]?name/i`

**Examples:**
- `legalName`
- `legal_name`
- `officialName`

---

### 1.6 DBA Name
**Description:** Doing Business As name

**Regular Expression Patterns:**
- `/dba[_\s-]?name/i`
- `/doing[_\s-]?business[_\s-]?as/i`
- `/trade[_\s-]?name/i`

**Examples:**
- `dbaName`
- `dba_name`
- `tradeName`

---

### 1.7 Double Byte Name
**Description:** Name in double-byte character set (DBCS)

**Regular Expression Patterns:**
- `/double[_\s-]?byte[_\s-]?name/i`
- `/dbcs[_\s-]?name/i`
- `/unicode[_\s-]?name/i`
- `/multi[_\s-]?byte[_\s-]?name/i`
- `/kanji[_\s-]?name/i`
- `/chinese[_\s-]?name/i`

**Examples:**
- `doubleByteName`
- `double_byte_name`
- `dbcsName`

---

## 2. Personal Information Fields

### 2.1 Gender
**Description:** Gender or sex identifier

**Regular Expression Patterns:**
- `/\bgender\b/i`
- `/\bsex\b/i`
- `/gender[_\s-]?code/i`
- `/gender[_\s-]?type/i`

**Examples:**
- `gender`
- `genderCode`
- `sex`

---

### 2.2 Date of Birth
**Description:** Date of birth

**Regular Expression Patterns:**
- `/\bdob\b/i`
- `/date[_\s-]?of[_\s-]?birth/i`
- `/birth[_\s-]?date/i`
- `/birthdate/i`
- `/birth_dt/i`
- `/dob_date/i`

**Examples:**
- `dob`
- `dateOfBirth`
- `birthDate`
- `birth_date`

---

### 2.3 Government IDs
**Description:** Government-issued identification numbers

**Regular Expression Patterns:**
- `/gov(ernment)?[_\s-]?id/i`
- `/ssn/i`
- `/social[_\s-]?security[_\s-]?(number)?/i`
- `/tax[_\s-]?id/i`
- `/national[_\s-]?id/i`
- `/passport[_\s-]?number/i`
- `/drivers?[_\s-]?license/i`
- `/identification[_\s-]?number/i`

**Examples:**
- `govId`
- `ssn`
- `taxId`
- `nationalId`
- `passportNumber`

---

### 2.4 Member Since Date
**Description:** Date when customer became a member

**Regular Expression Patterns:**
- `/member[_\s-]?since/i`
- `/enrollment[_\s-]?date/i`
- `/join[_\s-]?date/i`
- `/registration[_\s-]?date/i`
- `/account[_\s-]?open[_\s-]?date/i`
- `/customer[_\s-]?since/i`

**Examples:**
- `memberSince`
- `member_since_date`
- `enrollmentDate`

---

## 3. Address Fields

### 3.1 Home Address
**Description:** Primary residential address

**Regular Expression Patterns:**
- `/home[_\s-]?address/i`
- `/residential[_\s-]?address/i`
- `/primary[_\s-]?address/i`
- `/home[_\s-]?addr/i`

**Examples:**
- `homeAddress`
- `home_address`
- `residentialAddress`

---

### 3.2 Business Address
**Description:** Business or work address

**Regular Expression Patterns:**
- `/business[_\s-]?address/i`
- `/work[_\s-]?address/i`
- `/office[_\s-]?address/i`
- `/company[_\s-]?address/i`
- `/business[_\s-]?addr/i`

**Examples:**
- `businessAddress`
- `business_address`
- `workAddress`

---

### 3.3 Alternate Address
**Description:** Alternative or secondary address

**Regular Expression Patterns:**
- `/alternate[_\s-]?address/i`
- `/alternative[_\s-]?address/i`
- `/secondary[_\s-]?address/i`
- `/alt[_\s-]?address/i`
- `/other[_\s-]?address/i`

**Examples:**
- `alternateAddress`
- `alternate_address`
- `altAddress`

---

### 3.4 Temporary Address
**Description:** Temporary address

**Regular Expression Patterns:**
- `/temp(orary)?[_\s-]?address/i`
- `/seasonal[_\s-]?address/i`
- `/vacation[_\s-]?address/i`

**Examples:**
- `temporaryAddress`
- `temporary_address`
- `tempAddress`

---

### 3.5 Other Address
**Description:** Other miscellaneous address

**Regular Expression Patterns:**
- `/other[_\s-]?address/i`
- `/additional[_\s-]?address/i`
- `/misc[_\s-]?address/i`

**Examples:**
- `otherAddress`
- `other_address`
- `additionalAddress`

---

### 3.6 Additional Addresses Array
**Description:** Collection or array of additional addresses

**Regular Expression Patterns:**
- `/address(es)?[_\s-]?(list|array)/i`
- `/additional[_\s-]?addresses/i`
- `/multiple[_\s-]?addresses/i`
- `/address[_\s-]?collection/i`
- `/List<.*Address>/`
- `/Array<.*Address>/`
- `/\[\].*address/i`

**Examples:**
- `addressList`
- `addresses[]`
- `List<Address>`
- `additionalAddresses`

---

## 4. Phone Fields

### 4.1 Home Phone
**Description:** Home telephone number

**Regular Expression Patterns:**
- `/home[_\s-]?phone/i`
- `/home[_\s-]?telephone/i`
- `/residence[_\s-]?phone/i`
- `/home[_\s-]?number/i`

**Examples:**
- `homePhone`
- `home_phone`
- `homeNumber`

---

### 4.2 Alternate Home Phone
**Description:** Alternate home phone number

**Regular Expression Patterns:**
- `/alternate[_\s-]?home[_\s-]?phone/i`
- `/alt[_\s-]?home[_\s-]?phone/i`
- `/home[_\s-]?phone[_\s-]?2/i`

**Examples:**
- `alternateHomePhone`
- `alt_home_phone`
- `homePhone2`

---

### 4.3 Business Phone
**Description:** Business or work phone number

**Regular Expression Patterns:**
- `/business[_\s-]?phone/i`
- `/work[_\s-]?phone/i`
- `/office[_\s-]?phone/i`
- `/company[_\s-]?phone/i`

**Examples:**
- `businessPhone`
- `business_phone`
- `workPhone`

---

### 4.4 Alternate Business Phone
**Description:** Alternate business phone number

**Regular Expression Patterns:**
- `/alternate[_\s-]?business[_\s-]?phone/i`
- `/alt[_\s-]?work[_\s-]?phone/i`
- `/business[_\s-]?phone[_\s-]?2/i`

**Examples:**
- `alternateBusinessPhone`
- `alt_business_phone`

---

### 4.5 Mobile Phone
**Description:** Mobile or cellular phone number

**Regular Expression Patterns:**
- `/mobile[_\s-]?phone/i`
- `/cell[_\s-]?phone/i`
- `/cellular/i`
- `/mobile[_\s-]?number/i`

**Examples:**
- `mobilePhone`
- `mobile_phone`
- `cellPhone`

---

### 4.6 Alternate Mobile Phone
**Description:** Alternate mobile phone number

**Regular Expression Patterns:**
- `/alternate[_\s-]?mobile[_\s-]?phone/i`
- `/alt[_\s-]?cell[_\s-]?phone/i`
- `/mobile[_\s-]?phone[_\s-]?2/i`

**Examples:**
- `alternateMobilePhone`
- `alt_mobile_phone`

---

### 4.7 Attorney Phone
**Description:** Attorney or legal representative phone number

**Regular Expression Patterns:**
- `/attorney[_\s-]?phone/i`
- `/lawyer[_\s-]?phone/i`
- `/legal[_\s-]?phone/i`

**Examples:**
- `attorneyPhone`
- `attorney_phone`
- `lawyerPhone`

---

### 4.8 Fax
**Description:** Fax number

**Regular Expression Patterns:**
- `/\bfax\b/i`
- `/fax[_\s-]?number/i`
- `/facsimile/i`
- `/fax[_\s-]?phone/i`

**Examples:**
- `fax`
- `faxNumber`
- `facsimile`

---

### 4.9 ANI Phone
**Description:** Automatic Number Identification phone

**Regular Expression Patterns:**
- `/\bani\b/i`
- `/ani[_\s-]?phone/i`
- `/automatic[_\s-]?number[_\s-]?identification/i`
- `/caller[_\s-]?id/i`

**Examples:**
- `ani`
- `aniPhone`
- `callerId`

---

### 4.10 Other Phone
**Description:** Other miscellaneous phone number

**Regular Expression Patterns:**
- `/other[_\s-]?phone/i`
- `/additional[_\s-]?phone/i`
- `/misc[_\s-]?phone/i`

**Examples:**
- `otherPhone`
- `other_phone`
- `additionalPhone`

---

### 4.11 Additional Phones Array
**Description:** Collection or array of additional phone numbers

**Regular Expression Patterns:**
- `/phone(s)?[_\s-]?(list|array)/i`
- `/additional[_\s-]?phones/i`
- `/multiple[_\s-]?phones/i`
- `/phone[_\s-]?collection/i`
- `/List<.*Phone>/`
- `/Array<.*Phone>/`
- `/\[\].*phone/i`

**Examples:**
- `phoneList`
- `phones[]`
- `List<Phone>`
- `additionalPhones`

---

## 5. Email Fields

### 5.1 Servicing Email
**Description:** Email for servicing communications

**Regular Expression Patterns:**
- `/servicing[_\s-]?email/i`
- `/service[_\s-]?email/i`
- `/support[_\s-]?email/i`

**Examples:**
- `servicingEmail`
- `servicing_email`
- `serviceEmail`

---

### 5.2 E-Statement Email
**Description:** Email for electronic statements

**Regular Expression Patterns:**
- `/e?[_\s-]?statement[_\s-]?email/i`
- `/electronic[_\s-]?statement[_\s-]?email/i`
- `/billing[_\s-]?email/i`
- `/statement[_\s-]?delivery[_\s-]?email/i`

**Examples:**
- `estatementEmail`
- `estatement_email`
- `billingEmail`

---

### 5.3 Business Email
**Description:** Business or work email address

**Regular Expression Patterns:**
- `/business[_\s-]?email/i`
- `/work[_\s-]?email/i`
- `/corporate[_\s-]?email/i`
- `/company[_\s-]?email/i`

**Examples:**
- `businessEmail`
- `business_email`
- `workEmail`

---

### 5.4 Additional Emails Array
**Description:** Collection or array of additional email addresses

**Regular Expression Patterns:**
- `/email(s)?[_\s-]?(list|array)/i`
- `/additional[_\s-]?emails/i`
- `/other[_\s-]?email[_\s-]?address(es)?/i`
- `/multiple[_\s-]?emails/i`
- `/email[_\s-]?collection/i`
- `/List<.*Email>/`
- `/Array<.*Email>/`
- `/\[\].*email/i`

**Examples:**
- `emailList`
- `emails[]`
- `List<Email>`
- `additionalEmails`

---

## 6. Preference Fields

### 6.1 Preference Language Code
**Description:** Preferred language code

**Regular Expression Patterns:**
- `/preference[_\s-]?language[_\s-]?code/i`
- `/pref[_\s-]?lang(uage)?[_\s-]?cd/i`
- `/language[_\s-]?preference/i`
- `/preferred[_\s-]?language/i`
- `/lang(uage)?[_\s-]?code/i`
- `/locale[_\s-]?code/i`

**Examples:**
- `preferenceLanguageCode`
- `pref_lang_cd`
- `languageCode`
- `locale`

---

## Usage Instructions

### API Endpoints

1. **Get All Field Patterns**
   ```
   GET /api/demographic/patterns
   ```
   Returns all 39 field definitions with patterns and examples.

2. **Scan Project for Demographic Fields**
   ```
   POST /api/projects/:id/scan-demographics
   ```
   Scans a specific project and returns detailed matches.

### Sample Scan Report

```json
{
  "success": true,
  "projectId": "abc-123",
  "projectName": "Customer Management System",
  "report": {
    "summary": {
      "totalFiles": 45,
      "totalMatches": 123,
      "fieldsFound": 28,
      "scanDate": "2025-01-06T..."
    },
    "fieldResults": {
      "Primary Name": [
        {
          "file": "com/example/Customer.java",
          "line": 15,
          "fieldType": "Primary Name",
          "matchedPattern": "first[_\\s-]?name",
          "context": "private String firstName;"
        }
      ],
      "Home Address": [
        {
          "file": "com/example/Address.java",
          "line": 8,
          "fieldType": "Home Address",
          "matchedPattern": "home[_\\s-]?address",
          "context": "private String homeAddress;"
        }
      ]
    },
    "coverage": {
      "foundFields": ["Primary Name", "Secondary Name", "Home Address", ...],
      "missingFields": ["Embossed Name", "DBA Name", ...]
    }
  }
}
```

---

## Recommendations

1. **Privacy & Compliance**
   - Ensure demographic data is properly encrypted at rest and in transit
   - Implement field-level access controls
   - Maintain audit logs for all demographic data access

2. **Data Quality**
   - Validate all demographic fields with appropriate formats
   - Implement data normalization for addresses and phone numbers
   - Use standardized codes (ISO) for language preferences

3. **Integration**
   - Map demographic fields to C360 customer data model
   - Implement data transformation rules for legacy system integration
   - Create data quality reports for demographic field completeness

---

## Contact

For questions about demographic field scanning, contact the development team or refer to the API documentation.
