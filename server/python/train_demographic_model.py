#!/usr/bin/env python3
"""
Training Script for Demographic Field Neural Network Model
Generates training data from demographic patterns and trains the model offline
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from tensorflow_field_model import NeuralFieldEmbedding
from typing import List, Tuple
import random

def generate_demographic_training_data() -> Tuple[List[Tuple[str, str]], List[Tuple[str, str]]]:
    """
    Generate training data from known demographic field patterns
    
    Returns:
        (similar_pairs, dissimilar_pairs)
    """
    
    # Demographic field categories with variations
    demographic_fields = {
        'name': [
            'embossedName', 'embossed_name', 'EMBOSSED_NAME',
            'firstName', 'first_name', 'FIRST_NAME', 'fname', 'givenName',
            'lastName', 'last_name', 'LAST_NAME', 'lname', 'surname', 'familyName',
            'middleName', 'middle_name', 'MIDDLE_NAME', 'mname',
            'fullName', 'full_name', 'FULL_NAME', 'completeName',
            'cardEmbossedName', 'card_embossed_name', 'embossedCompanyName'
        ],
        'ssn': [
            'ssn', 'SSN', 'social_security_number', 'socialSecurityNumber',
            'SOCIAL_SECURITY_NUMBER', 'tax_id', 'taxId', 'TAX_ID',
            'nationalId', 'national_id', 'NATIONAL_ID'
        ],
        'dob': [
            'dob', 'DOB', 'dateOfBirth', 'date_of_birth', 'DATE_OF_BIRTH',
            'birthDate', 'birth_date', 'BIRTH_DATE', 'birthdate',
            'customerDOB', 'customer_dob', 'clientBirthDate'
        ],
        'gender': [
            'gender', 'GENDER', 'sex', 'SEX',
            'genderCode', 'gender_code', 'GENDER_CODE',
            'sexCode', 'sex_code'
        ],
        'race': [
            'race', 'RACE', 'ethnicity', 'ETHNICITY',
            'raceCode', 'race_code', 'RACE_CODE',
            'ethnicityCode', 'ethnicity_code'
        ],
        'marital_status': [
            'maritalStatus', 'marital_status', 'MARITAL_STATUS',
            'marriageStatus', 'marriage_status',
            'maritalStatusCode', 'marital_status_code'
        ],
        'address': [
            'address', 'ADDRESS', 'streetAddress', 'street_address',
            'addressLine1', 'address_line_1', 'addr1',
            'homeAddress', 'home_address', 'residentialAddress',
            'mailingAddress', 'mailing_address'
        ],
        'city': [
            'city', 'CITY', 'cityName', 'city_name',
            'municipality', 'townCity', 'town_city'
        ],
        'state': [
            'state', 'STATE', 'stateCode', 'state_code',
            'province', 'PROVINCE', 'region', 'REGION'
        ],
        'zip': [
            'zip', 'ZIP', 'zipCode', 'zip_code', 'ZIP_CODE',
            'postalCode', 'postal_code', 'POSTAL_CODE',
            'postcode', 'pincode', 'PIN_CODE'
        ],
        'phone': [
            'phone', 'PHONE', 'phoneNumber', 'phone_number', 'PHONE_NUMBER',
            'mobileNumber', 'mobile_number', 'cellPhone', 'cell_phone',
            'homePhone', 'home_phone', 'workPhone', 'work_phone',
            'telephoneNumber', 'telephone_number'
        ],
        'email': [
            'email', 'EMAIL', 'emailAddress', 'email_address', 'EMAIL_ADDRESS',
            'emailAddr', 'email_addr', 'e_mail', 'eMail'
        ],
        'income': [
            'income', 'INCOME', 'annualIncome', 'annual_income',
            'salary', 'SALARY', 'wages', 'earnings',
            'totalIncome', 'total_income', 'householdIncome'
        ],
        'account': [
            'accountNumber', 'account_number', 'ACCOUNT_NUMBER', 'acctNum',
            'accountId', 'account_id', 'ACCOUNT_ID',
            'bankAccount', 'bank_account'
        ],
        'card': [
            'cardNumber', 'card_number', 'CARD_NUMBER', 'creditCardNumber',
            'cardId', 'card_id', 'panNumber', 'pan_number',
            'debitCardNumber', 'debit_card_number'
        ],
        'license': [
            'driversLicense', 'drivers_license', 'DRIVERS_LICENSE',
            'licenseNumber', 'license_number', 'dlNumber', 'dl_number',
            'drivingLicense', 'driving_license'
        ],
        'passport': [
            'passport', 'PASSPORT', 'passportNumber', 'passport_number',
            'PASSPORT_NUMBER', 'passportId', 'passport_id'
        ],
        'citizen': [
            'citizenship', 'CITIZENSHIP', 'citizenshipStatus',
            'nationality', 'NATIONALITY', 'countryOfCitizenship'
        ],
        'disability': [
            'disability', 'DISABILITY', 'disabilityStatus',
            'disabilityCode', 'disability_code', 'handicap'
        ],
        'veteran': [
            'veteran', 'VETERAN', 'veteranStatus', 'veteran_status',
            'militaryService', 'military_service'
        ]
    }
    
    # Non-demographic fields (for negative examples)
    non_demographic_fields = [
        'transactionId', 'transaction_id', 'orderId', 'order_id',
        'productCode', 'product_code', 'itemNumber', 'item_number',
        'quantity', 'price', 'amount', 'total', 'subtotal',
        'createdDate', 'created_date', 'updatedDate', 'updated_date',
        'status', 'statusCode', 'active', 'enabled', 'deleted',
        'description', 'notes', 'comments', 'remarks',
        'category', 'type', 'kind', 'class', 'group',
        'version', 'revision', 'sequence', 'index', 'position',
        'url', 'link', 'path', 'file', 'filename',
        'hash', 'token', 'key', 'secret', 'password',
        'metadata', 'config', 'settings', 'preferences'
    ]
    
    similar_pairs = []
    dissimilar_pairs = []
    
    # Generate similar pairs (same category)
    for category, fields in demographic_fields.items():
        for i in range(len(fields)):
            for j in range(i + 1, len(fields)):
                similar_pairs.append((fields[i], fields[j]))
    
    print(f"Generated {len(similar_pairs)} similar pairs from demographic fields")
    
    # Generate dissimilar pairs (different categories)
    all_demographic = []
    for fields in demographic_fields.values():
        all_demographic.extend(fields)
    
    # Demographic vs Non-demographic
    for demo_field in all_demographic[:50]:  # Sample subset
        for non_demo_field in non_demographic_fields[:30]:
            dissimilar_pairs.append((demo_field, non_demo_field))
    
    # Cross-category demographic fields
    categories = list(demographic_fields.keys())
    for i in range(len(categories)):
        for j in range(i + 1, len(categories)):
            cat1_fields = demographic_fields[categories[i]]
            cat2_fields = demographic_fields[categories[j]]
            
            # Sample a few pairs from each category combination
            for _ in range(min(3, len(cat1_fields), len(cat2_fields))):
                f1 = random.choice(cat1_fields)
                f2 = random.choice(cat2_fields)
                dissimilar_pairs.append((f1, f2))
    
    print(f"Generated {len(dissimilar_pairs)} dissimilar pairs")
    
    # Shuffle
    random.shuffle(similar_pairs)
    random.shuffle(dissimilar_pairs)
    
    return similar_pairs, dissimilar_pairs


def main():
    """Main training script"""
    print("=" * 60)
    print("TensorFlow-Style Neural Network Model Training")
    print("Code Lens ML [TensorFlow Custom Model]")
    print("Offline Demographic Field Matching")
    print("=" * 60)
    print()
    
    # Generate training data
    print("Step 1: Generating training data...")
    similar_pairs, dissimilar_pairs = generate_demographic_training_data()
    print()
    
    # Initialize model
    print("Step 2: Initializing neural network...")
    model = NeuralFieldEmbedding(input_dim=100, embedding_dim=32)
    print(f"Network architecture: Input(100) → Dense(128) → ReLU → Dense(64) → ReLU → Dense(32)")
    print()
    
    # Train model (use subset for faster training)
    print("Step 3: Training model with contrastive learning...")
    # Use subset of data for faster training
    similar_subset = similar_pairs[:300]  # First 300 pairs
    dissimilar_subset = dissimilar_pairs[:400]  # First 400 pairs
    
    model.train_on_pairs(
        similar_pairs=similar_subset,
        dissimilar_pairs=dissimilar_subset,
        epochs=50,  # Reduced from 100
        learning_rate=0.02  # Slightly higher for faster convergence
    )
    print()
    
    # Test model
    print("Step 4: Testing model predictions...")
    test_cases = [
        ('firstName', 'first_name'),  # Should be similar
        ('ssn', 'social_security_number'),  # Should be similar
        ('firstName', 'accountNumber'),  # Should be dissimilar
        ('email', 'emailAddress'),  # Should be similar
        ('dob', 'transactionId'),  # Should be dissimilar
    ]
    
    print("\nTest Results:")
    for field1, field2 in test_cases:
        similarity = model.calculate_similarity(field1, field2)
        print(f"  {field1:30s} <-> {field2:30s} : {similarity:.3f}")
    print()
    
    # Save model
    print("Step 5: Saving trained model...")
    model_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(model_dir, exist_ok=True)
    model_path = os.path.join(model_dir, 'demographic_field_model.pkl')
    model.save_model(model_path)
    print()
    
    print("=" * 60)
    print("✓ Training completed successfully!")
    print(f"✓ Model saved to: {model_path}")
    print("✓ Model is ready for offline inference")
    print("=" * 60)

if __name__ == "__main__":
    main()
