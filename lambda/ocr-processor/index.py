import json
import boto3
import tempfile
import os
import zipfile
from urllib.parse import unquote_plus
import re

# Initialize AWS clients
s3_client = boto3.client('s3')
textract_client = boto3.client('textract')

def lambda_handler(event, context):
    """
    Lambda function to process images with OCR using AWS Textract
    Extracts decision options from UEFA decision images
    """
    
    try:
        # Get input from Step Functions
        source_bucket = event['source_bucket']
        source_key = event['source_key']
        content_structure = event['content_structure']
        processing_id = event['processing_id']
        
        print(f"Processing OCR for: s3://{source_bucket}/{source_key}")
        
        # Download ZIP file
        with tempfile.NamedTemporaryFile(suffix='.zip', delete=False) as temp_file:
            s3_client.download_fileobj(source_bucket, source_key, temp_file)
            temp_zip_path = temp_file.name
        
        # Process OCR for each category
        enhanced_structure = process_ocr_for_categories(temp_zip_path, content_structure)
        
        # Clean up
        os.unlink(temp_zip_path)
        
        return {
            'statusCode': 200,
            'source_bucket': source_bucket,
            'source_key': source_key,
            'content_structure': enhanced_structure,
            'processing_id': processing_id,
            'ocr_results': {
                'categories_processed': len(enhanced_structure['categories']),
                'total_decisions_extracted': sum(
                    len(cat.get('dictionary_options', [])) 
                    for cat in enhanced_structure['categories'] 
                    if cat.get('type') == 'dictionary'
                )
            }
        }
        
    except Exception as e:
        print(f"Error in OCR processing: {str(e)}")
        return {
            'statusCode': 500,
            'error': str(e),
            'message': 'OCR processing failed'
        }

def process_ocr_for_categories(zip_path, content_structure):
    """
    Process OCR for all categories that have decision images
    """
    
    enhanced_structure = content_structure.copy()
    
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        for category in enhanced_structure['categories']:
            if category.get('type') == 'dictionary' and category.get('decisions'):
                print(f"Processing OCR for category {category['letter']}")
                
                # Process each decision image
                decision_options = []
                
                for decision in category['decisions']:
                    try:
                        # Extract image from ZIP
                        image_data = zip_ref.read(decision['path'])
                        
                        # Process with Textract
                        options = extract_text_from_image(image_data, category['letter'])
                        
                        if options:
                            decision_options.extend(options)
                            decision['ocr_extracted'] = options
                        else:
                            decision['ocr_extracted'] = []
                            
                    except Exception as e:
                        print(f"Error processing {decision['path']}: {str(e)}")
                        decision['ocr_extracted'] = []
                
                # Remove duplicates and clean up options
                unique_options = list(set(decision_options))
                cleaned_options = [clean_decision_text(opt) for opt in unique_options if opt.strip()]
                
                # Store the dictionary options for this category
                category['dictionary_options'] = cleaned_options
                category['ocr_status'] = 'completed'
                
                print(f"Extracted {len(cleaned_options)} decision options for category {category['letter']}")
            
            else:
                # For non-dictionary categories, mark as not applicable
                category['dictionary_options'] = []
                category['ocr_status'] = 'not_applicable'
    
    return enhanced_structure

def extract_text_from_image(image_data, category_letter):
    """
    Use AWS Textract to extract text from decision image
    """
    
    try:
        # Call Textract
        response = textract_client.detect_document_text(
            Document={'Bytes': image_data}
        )
        
        # Extract text blocks
        text_blocks = []
        for block in response.get('Blocks', []):
            if block['BlockType'] == 'LINE':
                text = block.get('Text', '').strip()
                if text:
                    text_blocks.append(text)
        
        # Process text blocks to identify decision options
        decision_options = parse_decision_options(text_blocks, category_letter)
        
        return decision_options
        
    except Exception as e:
        print(f"Textract error: {str(e)}")
        return []

def parse_decision_options(text_blocks, category_letter):
    """
    Parse text blocks to extract decision options
    Based on UEFA RAP structure patterns
    """
    
    decision_options = []
    
    # Category-specific parsing patterns
    category_patterns = {
        'A': [  # Challenges
            r'no offence',
            r'indirect free kick',
            r'direct free kick', 
            r'penalty kick',
            r'careless',
            r'reckless',
            r'violent conduct',
            r'serious foul play'
        ],
        'B': [  # DOGSO-SPA
            r'denying.*goal.*obvious.*goal-scoring.*opportunity',
            r'DOGSO',
            r'other',
            r'reckless challenge',
            r'stopping.*promising attack',
            r'attempting.*play.*ball'
        ],
        'C': [  # Handball
            r'offence',
            r'no offence',
            r'ball movement.*hand',
            r'ball.*short distance',
            r'hand.*natural position',
            r'hand.*unnatural position',
            r'hand.*body.*bigger',
            r'deliberate.*handball'
        ],
        'D': [  # Holding
            r'no offence',
            r'indirect free kick',
            r'direct free kick',
            r'penalty kick',
            r'promising attack stopped',
            r'lack of respect',
            r'reckless challenge'
        ],
        'E': [  # Illegal Use of Arms
            r'no offence',
            r'indirect free kick',
            r'direct free kick',
            r'penalty kick',
            r'careless',
            r'reckless',
            r'violent conduct'
        ],
        'F': [  # Penalty Area Decisions
            r'no offence',
            r'indirect free kick',
            r'direct free kick',
            r'penalty kick',
            r'careless',
            r'reckless',
            r'violent conduct',
            r'promising attack',
            r'DOGSO',
            r'unsporting'
        ],
        'G': [  # Simulation
            r'no offence',
            r'indirect free kick',
            r'direct free kick',
            r'penalty kick',
            r'deceiving.*referee',
            r'slight contact',
            r'anticipating contact',
            r'initiating contact'
        ],
        'L': [  # Offside
            r'not offside',
            r'offside offence',
            r'interfering.*opponent',
            r'obstructing.*line.*vision',
            r'challenging.*opponent',
            r'attempting.*play.*ball',
            r'impact.*opponent'
        ]
    }
    
    # Get patterns for this category
    patterns = category_patterns.get(category_letter, [])
    
    # Join all text blocks into one string for analysis
    full_text = ' '.join(text_blocks).lower()
    
    # Look for decision options using patterns
    for pattern in patterns:
        matches = re.findall(pattern, full_text, re.IGNORECASE)
        for match in matches:
            if isinstance(match, str) and len(match.strip()) > 3:
                decision_options.append(match.strip())
    
    # Also extract text blocks that look like decision options
    for block in text_blocks:
        block_lower = block.lower().strip()
        
        # Skip very short text or page numbers
        if len(block_lower) < 3 or block_lower.isdigit():
            continue
            
        # Look for common decision patterns
        if any(keyword in block_lower for keyword in [
            'offence', 'free kick', 'penalty', 'careless', 'reckless', 
            'violent', 'contact', 'challenge', 'attempt', 'ball',
            'hand', 'arm', 'position', 'deliberate', 'natural',
            'offside', 'interfering', 'obstructing', 'advantage',
            'control', 'dissent', 'respect', 'simulation', 'deceiv'
        ]):
            decision_options.append(block.strip())
    
    return decision_options

def clean_decision_text(text):
    """
    Clean and normalize decision text
    """
    
    # Remove extra whitespace
    text = ' '.join(text.split())
    
    # Remove common OCR artifacts
    text = re.sub(r'[^\w\s\-\/\(\)\.\'\"]+', '', text)
    
    # Fix common OCR mistakes
    replacements = {
        'oﬀence': 'offence',
        'oﬀside': 'offside',
        '0ffence': 'offence',
        'D0GS0': 'DOGSO',
        'reck1ess': 'reckless',
        'vio1ent': 'violent',
        'chaienge': 'challenge',
        'attemp†': 'attempt'
    }
    
    for old, new in replacements.items():
        text = text.replace(old, new)
    
    # Capitalize first letter
    if text:
        text = text[0].upper() + text[1:].lower()
    
    return text.strip()
